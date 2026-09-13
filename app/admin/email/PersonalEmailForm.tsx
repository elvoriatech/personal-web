"use client";

import { useState } from "react";
import { Card, Field, SmallButton, TextArea } from "@/components/admin/Fields";
import { ATTACHMENT_OPTIONS, type AttachmentId } from "@/lib/campaigns/attachments";

export function PersonalEmailForm({ mailReady }: { mailReady: boolean }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<AttachmentId[]>(["resume_ats"]);
  const [ccSelf, setCcSelf] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [check, setCheck] = useState<{ ok: boolean; text: string } | null>(null);

  async function testConnection() {
    setChecking(true);
    setCheck(null);
    try {
      const res = await fetch("/api/admin/campaigns/verify", { method: "POST" });
      const data = (await res.json()) as {
        ok: boolean;
        detail: string;
        mode: string;
        from: string;
      };
      setCheck({
        ok: data.ok,
        text: data.ok
          ? `${data.mode.toUpperCase()} OK — sending as ${data.from}`
          : data.detail,
      });
    } catch (err) {
      setCheck({
        ok: false,
        text: err instanceof Error ? err.message : "Could not reach the server.",
      });
    } finally {
      setChecking(false);
    }
  }

  const toggle = (id: AttachmentId) =>
    setAttachments((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );

  async function send() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/campaigns/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body, attachments, ccSelf }),
      });
      const data = (await res.json()) as
        | { ok: true; attached: string[] }
        | { ok: false; error: string };

      if (data.ok) {
        setResult({
          ok: true,
          text: data.attached.length
            ? `Sent to ${to} with ${data.attached.join(", ")}.`
            : `Sent to ${to}.`,
        });
        setTo("");
        setSubject("");
        setBody("");
      } else {
        setResult({ ok: false, text: data.error });
      }
    } catch (err) {
      setResult({
        ok: false,
        text: err instanceof Error ? err.message : "Could not send.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-5">
      {!mailReady && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12.5px] text-red-800">
          No mail credentials. Set <code>EMAIL_USER</code> and <code>EMAIL_PASS</code>{" "}
          (an app password from your mail provider) before sending.
        </p>
      )}

      <Card
        title="Compose"
        action={
          <div className="flex gap-2">
            <SmallButton onClick={testConnection}>
              {checking ? "Testing…" : "Test connection"}
            </SmallButton>
            <SmallButton onClick={() => window.open("/resume", "_blank")}>
              Preview résumé
            </SmallButton>
          </div>
        }
      >
        {check && (
          <p
            role="status"
            className={`rounded-xl px-4 py-2.5 text-[12.5px] leading-[1.6] ${
              check.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {check.text}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="To" value={to} onChange={setTo} type="email" />
          <Field label="Subject" value={subject} onChange={setSubject} />
        </div>
        <TextArea
          label="Message"
          rows={12}
          value={body}
          onChange={setBody}
          hint='Plain text. Blank line between paragraphs; "- " for a bullet. It is wrapped in your branded email template on send.'
        />
      </Card>

      <Card title="Attachments">
        <p className="text-[12.5px] text-body">
          Documents are generated fresh at send time, so they always match what is
          currently in the admin.
        </p>
        <ul className="space-y-2.5">
          {ATTACHMENT_OPTIONS.map((option) => (
            <li key={option.id}>
              <label className="flex items-center gap-2.5 text-[13.5px] text-body">
                <input
                  type="checkbox"
                  checked={attachments.includes(option.id)}
                  onChange={() => toggle(option.id)}
                  className="h-4 w-4"
                />
                {option.label}
                <span className="text-[11.5px] text-muted">({option.filename})</span>
              </label>
            </li>
          ))}
        </ul>
        <label className="flex items-center gap-2.5 border-t border-line pt-3 text-[13.5px] text-body">
          <input
            type="checkbox"
            checked={ccSelf}
            onChange={(e) => setCcSelf(e.target.checked)}
            className="h-4 w-4"
          />
          Blind-copy myself
        </label>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={sending || !mailReady || !to || !subject || !body}
          onClick={send}
          className="accent-gradient min-h-[44px] rounded-pill px-7 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send email"}
        </button>
        {result && (
          <p
            role="status"
            className={`text-[13px] ${result.ok ? "text-green-700" : "text-red-600"}`}
          >
            {result.text}
          </p>
        )}
      </div>
    </div>
  );
}
