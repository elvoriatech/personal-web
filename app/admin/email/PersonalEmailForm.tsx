"use client";

import { useCallback, useState } from "react";
import { EmailPreviewDialog } from "@/components/admin/EmailPreviewDialog";
import { Card, Field, SmallButton, TextArea } from "@/components/admin/Fields";
import { ThemePicker } from "@/components/admin/ThemePicker";
import {
  ATTACHMENT_OPTIONS,
  attachmentFilename,
  type AttachmentId,
} from "@/lib/campaigns/attachments";
import { FormatPicker } from "@/components/admin/FormatPicker";
import {
  DEFAULT_DOCUMENT_FORMAT,
  DOCUMENT_FORMAT_LABELS,
  type DocumentFormat,
} from "@/lib/documents/types";
import { DEFAULT_EMAIL_THEME, type EmailTheme } from "@/lib/campaigns/themes";
import { TransportPicker } from "@/components/admin/TransportPicker";
import type { MailStatus, MailTransport } from "@/lib/mail/transports";

const SAMPLE_BODY =
  "Hi there,\n\nThis is how your message will look. Write your email in the box on the left and open the preview again.\n\nBest regards,\nZahoor Ahmed";

export function PersonalEmailForm({
  mail,
  defaultAttachment = "resume_ats",
}: {
  mail: MailStatus;
  /** Follows the template chosen in the résumé admin. */
  defaultAttachment?: AttachmentId;
}) {
  const mailReady = mail.available.length > 0;
  const [via, setVia] = useState<MailTransport | null>(mail.personalDefault);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [theme, setTheme] = useState<EmailTheme>(DEFAULT_EMAIL_THEME);
  const [attachments, setAttachments] = useState<AttachmentId[]>([defaultAttachment]);
  const [attachmentFormat, setAttachmentFormat] =
    useState<DocumentFormat>(DEFAULT_DOCUMENT_FORMAT);
  const [ccSelf, setCcSelf] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [check, setCheck] = useState<{ ok: boolean; text: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  async function testConnection() {
    setChecking(true);
    setCheck(null);
    try {
      const res = await fetch("/api/admin/campaigns/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ via: via ?? "auto" }),
      });
      const data = (await res.json()) as { ok: boolean; detail: string; from: string };
      setCheck({ ok: data.ok, text: data.ok ? `${data.detail} Sending as ${data.from}.` : data.detail });
    } catch (err) {
      setCheck({ ok: false, text: err instanceof Error ? err.message : "Could not reach the server." });
    } finally {
      setChecking(false);
    }
  }

  const toggle = (id: AttachmentId) =>
    setAttachments((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));

  // Personal mail has no opt-out line, so the preview asks for none either.
  const loadPreview = useCallback(
    async (t: EmailTheme) => {
      const res = await fetch("/api/admin/campaigns/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject || "Your subject line",
          bodyHtml: body.trim() || SAMPLE_BODY,
          theme: t,
          showOptOut: false,
        }),
      });
      if (!res.ok) throw new Error(`Preview failed (${res.status})`);
      return res.text();
    },
    [subject, body]
  );

  async function send() {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/campaigns/personal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject,
          body,
          attachments,
          attachmentFormat,
          ccSelf,
          theme,
          via: via ?? "auto",
        }),
      });
      const data = (await res.json()) as { ok: true; attached: string[] } | { ok: false; error: string };

      if (data.ok) {
        setResult({
          ok: true,
          text: data.attached.length ? `Sent to ${to} with ${data.attached.join(", ")}.` : `Sent to ${to}.`,
        });
        setTo("");
        setSubject("");
        setBody("");
      } else {
        setResult({ ok: false, text: data.error });
      }
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : "Could not send." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card
        title="Compose"
        action={
          <div className="flex flex-wrap gap-2">
            <SmallButton onClick={testConnection} disabled={checking}>
              {checking ? "Testing…" : "Test connection"}
            </SmallButton>
            <SmallButton onClick={() => setPreviewOpen(true)}>Preview email</SmallButton>
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
        <TransportPicker available={mail.available} value={via} onChange={setVia} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="To" value={to} onChange={setTo} type="email" />
          <Field label="Subject" value={subject} onChange={setSubject} />
        </div>
        <TextArea
          label="Message"
          rows={12}
          value={body}
          onChange={setBody}
          hint='Plain text. Blank line between paragraphs; "- " starts a bullet. Your signature block is added by the theme, so end with your name only.'
        />
        <ThemePicker value={theme} onChange={setTheme} />
      </Card>

      <Card title="Attachments">
        <p className="text-[12.5px] text-body">
          Documents are generated fresh at send time, so they always match what is currently
          in the admin.
        </p>
        <ul className="space-y-2.5">
          {ATTACHMENT_OPTIONS.map((option) => (
            <li key={option.id}>
              <label className="flex flex-wrap items-center gap-2.5 text-[13.5px] text-body">
                <input
                  type="checkbox"
                  checked={attachments.includes(option.id)}
                  onChange={() => toggle(option.id)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                {option.label}
                <span className="text-[11.5px] text-muted">
                  ({attachmentFilename(option.id, attachmentFormat)})
                </span>
              </label>
            </li>
          ))}
        </ul>
        <div className="border-t border-line pt-3.5">
          <FormatPicker
            value={attachmentFormat}
            onChange={setAttachmentFormat}
            disabled={attachments.length === 0}
          />
          {attachments.length > 0 && (
            <p className="mt-2 text-[11.5px] text-muted">
              {attachments.length === 1 ? "One document" : `${attachments.length} documents`} will be
              attached as {DOCUMENT_FORMAT_LABELS[attachmentFormat]}.
            </p>
          )}
        </div>
        <label className="flex items-center gap-2.5 border-t border-line pt-3 text-[13.5px] text-body">
          <input
            type="checkbox"
            checked={ccSelf}
            onChange={(e) => setCcSelf(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
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
          <p role="status" className={`text-[13px] ${result.ok ? "text-green-700" : "text-red-600"}`}>
            {result.text}
          </p>
        )}
      </div>

      <EmailPreviewDialog
        open={previewOpen}
        title={subject || "Personal email"}
        theme={theme}
        onClose={() => setPreviewOpen(false)}
        load={loadPreview}
      />
    </div>
  );
}
