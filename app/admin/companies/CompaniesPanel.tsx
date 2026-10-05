"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import type { Recipient, RecipientInput } from "@/lib/campaigns/types";
import { AddRecipients, CompanyFields } from "../campaigns/_components/AddRecipients";
import { api, type Stats } from "../campaigns/_components/api";
import { RecipientsTable } from "../campaigns/_components/RecipientsTable";
import { useRecipientList, type RecipientPage } from "../campaigns/_components/useRecipientList";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export function CompaniesPanel({
  configured,
  initialPage,
  initialStats,
}: {
  configured: boolean;
  initialPage: RecipientPage;
  initialStats: Stats;
}) {
  const list = useRecipientList({ configured, initialPage, initialStats });
  const [editing, setEditing] = useState<Recipient | null>(null);

  if (!configured) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
        The company list needs Postgres. Set <code>DATABASE_URL</code> and apply{" "}
        <code>lib/db/schema.sql</code>, then reload.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {list.notice && (
        <p
          role="status"
          className={`rounded-xl px-4 py-2.5 text-[13px] ${
            list.notice.tone === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
          }`}
        >
          {list.notice.text}
        </p>
      )}

      {editing ? (
        <EditCompany
          key={editing.id}
          company={editing}
          onCancel={() => setEditing(null)}
          onSaved={async (name) => {
            setEditing(null);
            list.setNotice({ tone: "ok", text: `Saved ${name}.` });
            await list.refresh();
          }}
          onDeleted={async (name) => {
            setEditing(null);
            list.setNotice({ tone: "ok", text: `Deleted ${name}.` });
            await list.refresh();
          }}
        />
      ) : (
        <AddRecipients busy={list.busy} onImport={list.importRecipients} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
        <p className="text-[12.5px] text-body">
          Check that each email domain has a mail server before you write — a bounce hurts every
          later send.
        </p>
        <button
          type="button"
          onClick={list.audit}
          disabled={list.busy}
          className="min-h-[36px] rounded-pill border border-line px-4 text-[12px] font-semibold text-body hover:border-accent hover:text-accent-deep disabled:opacity-50"
        >
          Check email domains
        </button>
      </div>

      <RecipientsTable
        title="Your companies"
        emptyHint="No companies yet. Add the first one above."
        rows={list.page.rows}
        total={list.page.total}
        query={list.query}
        stats={list.stats}
        selected={list.selected}
        busy={list.busy}
        onQuery={list.updateQuery}
        onToggle={list.toggle}
        onSelectPage={list.selectPage}
        onClearSelection={() => list.setSelected(new Set())}
        onBulk={list.bulk}
        onEdit={setEditing}
        onDelete={list.removeOne}
      />
    </div>
  );
}

function EditCompany({
  company,
  onCancel,
  onSaved,
  onDeleted,
}: {
  company: Recipient;
  onCancel: () => void;
  onSaved: (name: string) => Promise<void>;
  onDeleted: (name: string) => Promise<void>;
}) {
  const [form, setForm] = useState<RecipientInput>({
    email: company.email,
    companyName: company.companyName,
    contactName: company.contactName,
    website: company.website,
    industry: company.industry,
    notes: company.notes,
  });
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [error, setError] = useState("");
  const sectionRef = useRef<HTMLElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Bring the form to the person who clicked Edit far down the table.
  useEffect(() => {
    sectionRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    firstFieldRef.current?.focus({ preventScroll: true });
  }, []);

  const emailValid = EMAIL_RE.test(form.email.trim());
  const set = (k: keyof RecipientInput) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const label = company.companyName || company.email;

  async function remove() {
    setDeleting(true);
    setDeleteError("");
    try {
      await api("/api/admin/campaigns/recipients", {
        method: "POST",
        body: JSON.stringify({ action: "delete", ids: [company.id] }),
      });
      await onDeleted(label);
    } catch (err) {
      // Stay in the dialog so the admin sees why and can retry or cancel.
      setDeleteError(err instanceof Error ? err.message : "Could not delete the company.");
      setDeleting(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!emailValid) return;
    setSaving(true);
    setError("");
    try {
      await api("/api/admin/campaigns/recipients", {
        method: "POST",
        body: JSON.stringify({ action: "update", id: company.id, recipient: form }),
      });
      await onSaved(form.companyName?.trim() || form.email.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the company.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section ref={sectionRef} className="card-surface scroll-mt-6 p-6" aria-labelledby="edit-company-title">
      <h2 id="edit-company-title" className="mb-4 font-display text-[14px] font-semibold text-ink">
        Edit {company.companyName || company.email}
      </h2>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <CompanyFields
          form={form}
          set={set}
          emailError={touched && !emailValid ? "That doesn't look like a valid email address." : ""}
          onEmailBlur={() => setTouched(true)}
          firstFieldRef={firstFieldRef}
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="accent-gradient min-h-[42px] rounded-pill px-6 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[42px] rounded-pill border border-line px-5 text-[12.5px] font-semibold text-body hover:border-accent hover:text-accent-deep"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="min-h-[42px] rounded-pill border border-red-200 px-5 text-[12.5px] font-semibold text-red-700 hover:bg-red-50 sm:ml-auto"
          >
            Delete company
          </button>
          {error && (
            <p role="alert" className="text-[13px] text-red-600">
              {error}
            </p>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${label}?`}
        busy={deleting}
        error={deleteError}
        onCancel={() => {
          setConfirmDelete(false);
          setDeleteError("");
        }}
        onConfirm={remove}
      >
        {company.email} is removed from your list permanently. Emails already sent stay in the send
        log. This cannot be undone.
      </ConfirmDialog>
    </section>
  );
}
