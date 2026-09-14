"use client";

import { useId, useRef, useState, type FormEvent, type Ref } from "react";
import type { RecipientInput } from "@/lib/campaigns/types";

type Mode = "single" | "bulk";

type ParsedRow = RecipientInput & {
  line: number;
  problem: "" | "no_email" | "bad_email" | "duplicate";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

/* ------------------------------ CSV parsing ------------------------------ */

/** Picks the delimiter that appears most in the first non-empty line. */
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim()) ?? "";
  const counts: [string, number][] = [
    [",", (firstLine.match(/,/g) ?? []).length],
    [";", (firstLine.match(/;/g) ?? []).length],
    ["\t", (firstLine.match(/\t/g) ?? []).length],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

/** Minimal RFC 4180 reader: quoted fields, doubled quotes, any of , ; tab. */
function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows.map((r) => r.map((c) => c.trim()));
}

type Column = keyof RecipientInput;

const HEADER_ALIASES: Record<Column, string[]> = {
  email: ["email", "e-mail", "mail", "e_mail", "emailaddress", "email address"],
  companyName: ["company", "company name", "companyname", "firma", "unternehmen", "organisation", "organization", "business"],
  contactName: ["name", "contact", "contact name", "contactname", "ansprechpartner", "person", "first name", "full name"],
  industry: ["industry", "branche", "sector", "category", "kategorie"],
  notes: ["notes", "note", "notizen", "comment", "comments", "bemerkung"],
};

function headerMap(cells: string[]): Partial<Record<Column, number>> | null {
  const map: Partial<Record<Column, number>> = {};
  cells.forEach((cell, i) => {
    const key = cell.toLowerCase().trim();
    for (const [col, aliases] of Object.entries(HEADER_ALIASES) as [Column, string[]][]) {
      if (aliases.includes(key) && map[col] === undefined) map[col] = i;
    }
  });
  return map.email !== undefined ? map : null;
}

export function parseRecipientList(input: string): { rows: ParsedRow[]; columns: string; hadHeader: boolean } {
  // Excel writes a byte-order mark; left in, it would glue itself to the first header cell.
  const text = input.replace(/^\uFEFF/, "");
  const delimiter = detectDelimiter(text);
  const table = parseCsv(text, delimiter);
  if (!table.length) return { rows: [], columns: "", hadHeader: false };

  const header = headerMap(table[0]);
  const body = header ? table.slice(1) : table;
  const seen = new Set<string>();
  const rows: ParsedRow[] = [];

  body.forEach((cells, idx) => {
    const line = idx + (header ? 2 : 1);
    let email = "";
    let contactName = "";
    let companyName = "";
    let industry = "";
    let notes = "";

    if (header) {
      email = cells[header.email!] ?? "";
      companyName = header.companyName !== undefined ? cells[header.companyName] ?? "" : "";
      contactName = header.contactName !== undefined ? cells[header.contactName] ?? "" : "";
      industry = header.industry !== undefined ? cells[header.industry] ?? "" : "";
      notes = header.notes !== undefined ? cells[header.notes] ?? "" : "";
    } else {
      // Positional: the email can sit anywhere; the rest follow the documented
      // order "email, contact name, company, industry".
      const emailIdx = cells.findIndex((c) => c.includes("@"));
      email = emailIdx >= 0 ? cells[emailIdx] : "";
      const rest = cells.filter((_, i) => i !== emailIdx);
      [contactName = "", companyName = "", industry = ""] = rest;
      // Without a header the order is a convention. If the cell in the
      // "contact" slot is plainly a company name and the "company" slot is
      // not, the sheet was company-first — swap rather than mis-file it.
      if (looksLikeCompany(contactName) && !looksLikeCompany(companyName)) {
        [contactName, companyName] = [companyName, contactName];
      }
    }

    email = email.toLowerCase();
    let problem: ParsedRow["problem"] = "";
    if (!email) problem = "no_email";
    else if (!EMAIL_RE.test(email)) problem = "bad_email";
    else if (seen.has(email)) problem = "duplicate";
    if (!problem) seen.add(email);

    rows.push({ line, email, contactName, companyName, industry, notes, problem });
  });

  const columns = header
    ? (Object.keys(header) as Column[]).map(labelFor).join(", ")
    : "email, contact name, company, industry (by position)";
  return { rows, columns, hadHeader: Boolean(header) };
}

const COMPANY_RE = /\b(gmbh|ag|kg|ug|e\.?k\.?|ohg|se|ltd|limited|inc|llc|plc|s\.?a\.?|b\.?v\.?|oy|ab|co\.?|corp|corporation|group|holding|solutions|systems|software|studio|agency|consulting|partners|logistik|logistics|technologies|technik)\b|&/i;
function looksLikeCompany(value: string): boolean {
  return COMPANY_RE.test(value.trim());
}

function labelFor(c: Column): string {
  return { email: "email", companyName: "company", contactName: "contact name", industry: "industry", notes: "notes" }[c];
}

/* -------------------------------- component ------------------------------- */

export function AddRecipients({
  busy,
  onImport,
}: {
  busy: boolean;
  onImport: (recipients: RecipientInput[]) => Promise<{ inserted: number; updated: number; skipped: number }>;
}) {
  const [mode, setMode] = useState<Mode>("single");
  return (
    <section className="card-surface p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[14px] font-semibold text-ink">Add companies</h2>
        <div role="tablist" aria-label="How to add" className="inline-flex rounded-pill border border-line bg-bg-tint p-0.5">
          {(
            [
              ["single", "Add one"],
              ["bulk", "Import a list"],
            ] as [Mode, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => setMode(id)}
              className={`min-h-[32px] rounded-pill px-3.5 text-[12px] font-semibold transition-colors ${
                mode === id ? "bg-surface text-ink shadow-sm" : "text-body hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {mode === "single" ? (
        <SingleForm busy={busy} onImport={onImport} />
      ) : (
        <BulkImport busy={busy} onImport={onImport} />
      )}
    </section>
  );
}

/* -------------------------------- add one -------------------------------- */

function SingleForm({
  busy,
  onImport,
}: {
  busy: boolean;
  onImport: AddRecipientsProps["onImport"];
}) {
  const [form, setForm] = useState<RecipientInput>({ email: "", companyName: "", contactName: "", industry: "", notes: "" });
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const emailValid = EMAIL_RE.test(form.email.trim());
  const emailError = touched && form.email && !emailValid ? "That doesn't look like a valid email address." : "";

  const set = (k: keyof RecipientInput) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!emailValid) return;
    setResult(null);
    try {
      const res = await onImport([{ ...form, email: form.email.trim().toLowerCase() }]);
      const who = form.companyName?.trim() || form.email.trim();
      setResult({
        tone: "ok",
        text: res.inserted
          ? `Added ${who}.`
          : res.updated
            ? `${who} was already in the list — details updated.`
            : `Skipped ${who}.`,
      });
      setForm({ email: "", companyName: "", contactName: "", industry: "", notes: "" });
      setTouched(false);
      firstFieldRef.current?.focus();
    } catch (err) {
      setResult({ tone: "error", text: err instanceof Error ? err.message : "Could not add the recipient." });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input ref={firstFieldRef} label="Company" value={form.companyName ?? ""} onChange={set("companyName")} placeholder="Nordlicht Logistik GmbH" autoComplete="organization" />
        <Input label="Contact name" value={form.contactName ?? ""} onChange={set("contactName")} placeholder="Lena Fischer" hint="First name is used in the greeting." autoComplete="off" />
        <Input
          label="Email"
          required
          type="email"
          value={form.email}
          onChange={set("email")}
          onBlur={() => setTouched(true)}
          placeholder="lena.fischer@nordlicht-logistik.de"
          error={emailError}
          autoComplete="off"
        />
        <Input label="Industry" value={form.industry ?? ""} onChange={set("industry")} placeholder="logistics" hint='Fills {{industry}} — lower case reads best mid-sentence.' autoComplete="off" />
      </div>
      <Input label="Notes" value={form.notes ?? ""} onChange={set("notes")} placeholder="Where you found them, anything worth remembering" autoComplete="off" />
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={busy || !form.email.trim()}
          className="accent-gradient min-h-[42px] rounded-pill px-6 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
        >
          {busy ? "Adding…" : "Add company"}
        </button>
        {result && (
          <p role="status" className={`text-[13px] ${result.tone === "ok" ? "text-green-700" : "text-red-600"}`}>
            {result.text}
          </p>
        )}
      </div>
    </form>
  );
}

type AddRecipientsProps = Parameters<typeof AddRecipients>[0];

/* ------------------------------ bulk import ------------------------------ */

function BulkImport({
  busy,
  onImport,
}: {
  busy: boolean;
  onImport: AddRecipientsProps["onImport"];
}) {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textId = useId();

  const parsed = text.trim() ? parseRecipientList(text) : null;
  const valid = parsed?.rows.filter((r) => !r.problem) ?? [];
  const problems = parsed?.rows.filter((r) => r.problem) ?? [];
  const PREVIEW_LIMIT = 8;

  async function readFile(file: File) {
    setFileName(file.name);
    setText(await file.text());
  }

  async function submit() {
    if (!valid.length) return;
    setResult(null);
    try {
      const res = await onImport(
        valid.map((r) => ({
          email: r.email,
          companyName: r.companyName,
          contactName: r.contactName,
          industry: r.industry,
          notes: r.notes,
        }))
      );
      setResult({
        tone: "ok",
        text: `${res.inserted} added, ${res.updated} already existed and were updated${
          res.skipped ? `, ${res.skipped} skipped` : ""
        }.`,
      });
      setText("");
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      setResult({ tone: "error", text: err instanceof Error ? err.message : "Import failed." });
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div>
          <label htmlFor={textId} className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">
            Paste rows
          </label>
          <textarea
            id={textId}
            rows={6}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFileName("");
            }}
            placeholder={"email, contact name, company, industry\nlena@nordlicht-logistik.de, Lena Fischer, Nordlicht Logistik GmbH, logistics"}
            className="w-full resize-y rounded-xl border border-line bg-surface px-3.5 py-2.5 font-mono text-[12.5px] leading-[1.6] text-ink placeholder:text-muted focus:border-accent"
          />
          <p className="mt-1 text-[11.5px] text-muted">
            One company per line. Comma, semicolon or tab separated. A header row like
            <code className="mx-1 rounded bg-bg-tint px-1">email, company, name, industry</code>
            is detected and used for the column order.{" "}
            <a
              href="/samples/companies-sample.csv"
              download
              className="font-semibold text-accent-deep underline-offset-2 hover:underline"
            >
              Download the sample CSV
            </a>{" "}
            — open it in Excel or Google Sheets, replace the rows, save as CSV, upload.
          </p>
        </div>
        <div>
          <p className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">
            Or upload a file
          </p>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) void readFile(file);
            }}
            className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line bg-bg-tint px-4 text-center text-[12.5px] text-body transition-colors hover:border-accent hover:bg-bg-violet has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void readFile(file);
              }}
            />
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 text-accent">
              <path d="M12 16V5m0 0-4 4m4-4 4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-ink">{fileName || "Choose a .csv or .txt"}</span>
            <span className="text-[11.5px] text-muted">or drop it here — exported from Excel, Sheets or your CRM</span>
          </label>
        </div>
      </div>

      {/* ------------------------------ preview ----------------------------- */}
      {parsed && parsed.rows.length > 0 && (
        <div className="rounded-xl border border-line bg-bg-tint/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[12.5px] text-body">
              Detected columns: <span className="font-medium text-ink">{parsed.columns}</span>
              {parsed.hadHeader && <span className="text-muted"> · header row skipped</span>}
            </p>
            <p className="text-[12.5px]">
              <span className="font-semibold text-green-700">{valid.length} ready</span>
              {problems.length > 0 && (
                <span className="ml-2 font-semibold text-amber-700">{problems.length} will be skipped</span>
              )}
            </p>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[12px]">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.1em] text-muted">
                  <th className="py-1.5 pr-3">Line</th>
                  <th className="py-1.5 pr-3">Company</th>
                  <th className="py-1.5 pr-3">Contact</th>
                  <th className="py-1.5 pr-3">Email</th>
                  <th className="py-1.5 pr-3">Industry</th>
                  <th className="py-1.5">Check</th>
                </tr>
              </thead>
              <tbody>
                {[...problems, ...valid].slice(0, PREVIEW_LIMIT).map((r) => (
                  <tr key={r.line} className="border-t border-line/60">
                    <td className="py-1.5 pr-3 text-muted tabular-nums">{r.line}</td>
                    <td className="py-1.5 pr-3 text-ink">{r.companyName || <span className="text-muted">—</span>}</td>
                    <td className="py-1.5 pr-3 text-body">{r.contactName || <span className="text-muted">—</span>}</td>
                    <td className="py-1.5 pr-3 break-all text-body">{r.email || <span className="text-muted">—</span>}</td>
                    <td className="py-1.5 pr-3 text-body">{r.industry || <span className="text-muted">—</span>}</td>
                    <td className="py-1.5">
                      {r.problem === "" && <span className="text-green-700">ok</span>}
                      {r.problem === "no_email" && <span className="text-amber-700">no email</span>}
                      {r.problem === "bad_email" && <span className="text-amber-700">invalid email</span>}
                      {r.problem === "duplicate" && <span className="text-amber-700">duplicate in list</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parsed.rows.length > PREVIEW_LIMIT && (
              <p className="mt-2 text-[11.5px] text-muted">
                …and {parsed.rows.length - PREVIEW_LIMIT} more. Problem rows are listed first.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={busy || valid.length === 0}
          onClick={submit}
          className="accent-gradient min-h-[42px] rounded-pill px-6 font-display text-[12.5px] font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50"
        >
          {busy ? "Importing…" : valid.length ? `Import ${valid.length} ${valid.length === 1 ? "company" : "companies"}` : "Import"}
        </button>
        <p className="text-[12px] text-muted">
          Existing addresses are updated, never duplicated. Send history is kept.
        </p>
        {result && (
          <p role="status" className={`w-full text-[13px] ${result.tone === "ok" ? "text-green-700" : "text-red-600"}`}>
            {result.text}
          </p>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- input --------------------------------- */

function Input({
  ref,
  label,
  value,
  onChange,
  onBlur,
  hint,
  error,
  placeholder,
  type = "text",
  required = false,
  autoComplete,
}: {
  ref?: Ref<HTMLInputElement>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">
        {label}
        {required && <span className="ml-1 text-accent-deep" aria-hidden="true">*</span>}
      </label>
      <input
        ref={ref}
        id={id}
        type={type}
        value={value}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-muted focus:border-accent ${
          error ? "border-red-400" : "border-line"
        }`}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-[11.5px] text-red-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-[11.5px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
