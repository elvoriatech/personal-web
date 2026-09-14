import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { site } from "@/content/site";
import { getPool } from "@/lib/db/client";
import { decryptSecret, encryptSecret } from "./crypto";

/**
 * Sending through a personal Hotmail/Outlook mailbox.
 *
 * Microsoft no longer accepts passwords (Basic Auth) for SMTP on personal
 * accounts, so the site signs the admin in once with OAuth2 and then uses
 * XOAUTH2 against smtp-mail.outlook.com. Mail leaves the real mailbox — it
 * shows in Sent, replies thread normally — and refresh tokens keep it working
 * without further sign-ins. Requires an Azure app registration (free) with
 * "personal Microsoft accounts" enabled; see .env.example.
 */

const AUTHORITY = "https://login.microsoftonline.com/common/oauth2/v2.0";
const SCOPES = ["offline_access", "openid", "email", "profile", "https://outlook.office.com/SMTP.Send"];
const STATE_COOKIE = "zpw_ms_state";
const PROVIDER = "microsoft";

export function isMicrosoftConfigured(): boolean {
  return Boolean(process.env.MS_CLIENT_ID && process.env.MS_CLIENT_SECRET);
}

/** The site's public hosts: the configured one and its www / non-www twin. */
export function publicOrigins(): string[] {
  const base = new URL(site.url);
  const host = base.hostname.replace(/^www\./, "");
  return [`${base.protocol}//${host}`, `${base.protocol}//www.${host}`];
}

/**
 * Where Microsoft sends the browser back. Cookies are per host, so the
 * callback must land on the SAME host the admin is signed in on — the request
 * origin — as long as that is one of the site's public hosts (never a
 * *.vercel.app deployment URL). Register every value of `redirectUris()` in
 * Azure.
 */
export function redirectUri(request: Request): string {
  if (process.env.MS_REDIRECT_URI) return process.env.MS_REDIRECT_URI;
  const origin = new URL(request.url).origin;
  const allowed = process.env.NODE_ENV !== "production" || publicOrigins().includes(origin);
  return `${allowed ? origin : site.url.replace(/\/$/, "")}/api/admin/microsoft/callback`;
}

/** Every callback URL that may be used, for the Azure registration. */
export function redirectUris(): string[] {
  if (process.env.MS_REDIRECT_URI) return [process.env.MS_REDIRECT_URI];
  return publicOrigins().map((o) => `${o}/api/admin/microsoft/callback`);
}

/* --------------------------------- state --------------------------------- */

function stateSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function signState(nonce: string): string {
  return createHmac("sha256", stateSecret()).update(`ms-state:${nonce}`).digest("hex");
}

export const STATE_COOKIE_NAME = STATE_COOKIE;

/** A signed nonce that binds the callback to the browser that started the sign-in. */
export function newState(): string {
  const nonce = randomBytes(16).toString("hex");
  return `${nonce}.${signState(nonce)}`;
}

/**
 * Attaches the state cookie to the redirect response itself. Setting it via
 * cookies() and then throwing redirect() can lose the cookie in a route
 * handler, which makes the callback reject a perfectly good sign-in.
 */
export function attachStateCookie(response: NextResponse, state: string): NextResponse {
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return response;
}

export async function consumeState(received: string): Promise<boolean> {
  const store = await cookies();
  const expected = store.get(STATE_COOKIE)?.value ?? "";
  store.delete(STATE_COOKIE);
  const [nonce, sig] = received.split(".");
  if (!nonce || !sig || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const good = Buffer.from(signState(nonce));
  const given = Buffer.from(sig);
  return good.length === given.length && timingSafeEqual(good, given);
}

/* ---------------------------------- OAuth --------------------------------- */

export function authorizeUrl(state: string, redirect: string): string {
  const params = new URLSearchParams({
    client_id: process.env.MS_CLIENT_ID ?? "",
    response_type: "code",
    redirect_uri: redirect,
    response_mode: "query",
    scope: SCOPES.join(" "),
    state,
    prompt: "select_account",
  });
  return `${AUTHORITY}/authorize?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(`${AUTHORITY}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID ?? "",
      client_secret: process.env.MS_CLIENT_SECRET ?? "",
      ...body,
    }),
    cache: "no-store",
  });
  const data = (await res.json()) as TokenResponse;
  if (!res.ok || data.error) {
    throw new Error(data.error_description ?? data.error ?? `Token request failed (${res.status})`);
  }
  return data;
}

/** The signed-in account's address, from the id_token this exchange just returned over TLS. */
function emailFromIdToken(idToken: string | undefined): string {
  if (!idToken) return "";
  try {
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString("utf8")) as {
      email?: string;
      preferred_username?: string;
    };
    return (payload.email ?? payload.preferred_username ?? "").toLowerCase();
  } catch {
    return "";
  }
}

export async function completeConnection(code: string, redirect: string): Promise<{ accountEmail: string }> {
  const token = await tokenRequest({ grant_type: "authorization_code", code, redirect_uri: redirect, scope: SCOPES.join(" ") });
  if (!token.refresh_token) throw new Error("Microsoft did not return a refresh token — was offline_access granted?");
  const accountEmail = emailFromIdToken(token.id_token);
  if (!accountEmail) throw new Error("Could not read the signed-in account's email address.");
  await saveConnection({
    accountEmail,
    refreshToken: token.refresh_token,
    accessToken: token.access_token,
    expiresAt: new Date(Date.now() + token.expires_in * 1000),
    scope: token.scope ?? "",
  });
  return { accountEmail };
}

/* --------------------------------- storage -------------------------------- */

type ConnectionRow = {
  account_email: string;
  refresh_token: string;
  access_token: string;
  expires_at: Date | null;
  scope: string;
};

export type MicrosoftConnection = { accountEmail: string; scope: string; expiresAt: Date | null };

function db() {
  const pool = getPool();
  if (!pool) throw new Error("Connecting a mailbox needs a database (DATABASE_URL).");
  return pool;
}

async function saveConnection(c: {
  accountEmail: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: Date;
  scope: string;
}): Promise<void> {
  await db().query(
    `INSERT INTO mail_connections (provider, account_email, refresh_token, access_token, expires_at, scope, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (provider) DO UPDATE SET
       account_email = EXCLUDED.account_email,
       refresh_token = EXCLUDED.refresh_token,
       access_token  = EXCLUDED.access_token,
       expires_at    = EXCLUDED.expires_at,
       scope         = EXCLUDED.scope,
       updated_at    = now()`,
    [PROVIDER, c.accountEmail, encryptSecret(c.refreshToken), encryptSecret(c.accessToken), c.expiresAt, c.scope]
  );
}

async function loadRow(): Promise<ConnectionRow | null> {
  const pool = getPool();
  if (!pool) return null;
  try {
    const { rows } = await pool.query<ConnectionRow>(
      "SELECT account_email, refresh_token, access_token, expires_at, scope FROM mail_connections WHERE provider = $1",
      [PROVIDER]
    );
    return rows[0] ?? null;
  } catch (err) {
    console.error("[mail] could not read the Microsoft connection:", err);
    return null;
  }
}

/** Connection summary for the admin UI — never includes tokens. */
export async function getMicrosoftConnection(): Promise<MicrosoftConnection | null> {
  const row = await loadRow();
  return row ? { accountEmail: row.account_email, scope: row.scope, expiresAt: row.expires_at } : null;
}

export async function disconnectMicrosoft(): Promise<void> {
  const pool = getPool();
  if (pool) await pool.query("DELETE FROM mail_connections WHERE provider = $1", [PROVIDER]);
}

/** A valid access token, refreshed when within a minute of expiry. */
async function accessToken(): Promise<{ token: string; accountEmail: string }> {
  const row = await loadRow();
  if (!row) throw new Error("Hotmail is not connected. Connect it under Send an email.");

  const fresh = row.expires_at && row.expires_at.getTime() - Date.now() > 60_000;
  if (fresh && row.access_token) {
    return { token: decryptSecret(row.access_token), accountEmail: row.account_email };
  }

  const refreshed = await tokenRequest({
    grant_type: "refresh_token",
    refresh_token: decryptSecret(row.refresh_token),
    scope: SCOPES.join(" "),
  });
  await saveConnection({
    accountEmail: row.account_email,
    // Microsoft may rotate the refresh token; keep the newest one.
    refreshToken: refreshed.refresh_token ?? decryptSecret(row.refresh_token),
    accessToken: refreshed.access_token,
    expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
    scope: refreshed.scope ?? row.scope,
  });
  return { token: refreshed.access_token, accountEmail: row.account_email };
}

/* --------------------------------- sending -------------------------------- */

export async function microsoftTransporter() {
  const { token, accountEmail } = await accessToken();
  return {
    accountEmail,
    transporter: nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { type: "OAuth2", user: accountEmail, accessToken: token },
    }),
  };
}

/** Logs in over SMTP without sending — proves the token and mailbox work. */
export async function verifyMicrosoft(): Promise<{ ok: boolean; detail: string; accountEmail: string }> {
  try {
    const { transporter, accountEmail } = await microsoftTransporter();
    await transporter.verify();
    return { ok: true, detail: `Signed in to Outlook SMTP as ${accountEmail}.`, accountEmail };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : String(err), accountEmail: "" };
  }
}
