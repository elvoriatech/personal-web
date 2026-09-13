"use client";

import { useId, useRef, useState } from "react";
import { Card } from "@/components/admin/Fields";
import type { ResumeVariant } from "@/lib/documents/types";

const VARIANTS: { id: ResumeVariant; label: string; description: string; bestFor: string }[] = [
  {
    id: "ats",
    label: "Single column",
    description: "No tables, no images, standard headings. Parses cleanly.",
    bestFor: "Job portals and any upload an applicant tracking system reads.",
  },
  {
    id: "design",
    label: "Two column with photo",
    description: "Sidebar with your photo and contact details, purple accents.",
    bestFor: "Emailing a person directly — a photo is still conventional in Germany.",
  },
];

/** Square-crop, downscale and re-encode in the browser so the stored value stays small. */
async function processPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file (JPEG or PNG).");
  if (file.size > 15 * 1024 * 1024) throw new Error("That image is over 15 MB — pick a smaller one.");

  // createImageBitmap honours EXIF orientation, so phone photos come out upright.
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  const out = 512;

  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not process the image.");
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, out, out);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.86);
}

function kb(dataUrl: string): string {
  return `${Math.round((dataUrl.length * 3) / 4 / 1024)} KB`;
}

export function PresentationCard({
  variant,
  photoDataUrl,
  onVariant,
  onPhoto,
}: {
  variant: ResumeVariant;
  /** undefined = bundled portrait, "" = no photo, otherwise an uploaded data URL. */
  photoDataUrl: string | undefined;
  onVariant: (v: ResumeVariant) => void;
  onPhoto: (dataUrl: string | undefined) => void;
}) {
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const radioName = useId();

  const usingBundled = photoDataUrl === undefined;
  const noPhoto = photoDataUrl === "";
  // Cache-bust the bundled portrait so a "use site portrait" reset shows at once.
  const previewSrc = usingBundled ? "/api/documents/photo" : photoDataUrl;

  async function pick(file: File | undefined) {
    if (!file) return;
    setError("");
    setWorking(true);
    try {
      onPhoto(await processPhoto(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read that image.");
    } finally {
      setWorking(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <Card title="Template & photo">
      <p className="-mt-2 text-[12.5px] leading-[1.6] text-body">
        Both templates are built from the content below. The one you pick here becomes the
        default download on the public résumé page and the default attachment when you send an
        email; the other is always available too.
      </p>

      {/* ------------------------------ template ------------------------------ */}
      <fieldset>
        <legend className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">
          Default template
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {VARIANTS.map((v) => {
            const active = v.id === variant;
            return (
              <label
                key={v.id}
                className={`relative flex cursor-pointer gap-3.5 rounded-xl border p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40 ${
                  active ? "border-accent bg-bg-violet" : "border-line bg-surface hover:border-accent/50"
                }`}
              >
                <input
                  type="radio"
                  name={radioName}
                  value={v.id}
                  checked={active}
                  onChange={() => onVariant(v.id)}
                  className="sr-only"
                />
                <VariantSwatch variant={v.id} active={active} />
                <span className="min-w-0">
                  <span className="block font-display text-[13px] font-semibold text-ink">{v.label}</span>
                  <span className="mt-0.5 block text-[12px] leading-[1.5] text-body">{v.description}</span>
                  <span className="mt-1 block text-[11.5px] leading-[1.5] text-muted">{v.bestFor}</span>
                </span>
                {active && (
                  <span className="absolute top-3 right-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                    <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                      <path d="M2.5 6.2 5 8.6l4.6-5.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* -------------------------------- photo ------------------------------- */}
      <div>
        <p className="mb-1.5 block font-display text-[10.5px] font-semibold uppercase tracking-[0.12em] text-body">
          Photo for the two-column template
        </p>
        <div className="flex flex-wrap items-start gap-5 rounded-xl border border-line bg-bg-tint/60 p-4">
          <div className="relative h-[112px] w-[112px] shrink-0 overflow-hidden rounded-xl border border-line bg-surface">
            {noPhoto ? (
              <span className="flex h-full w-full items-center justify-center text-center text-[11px] leading-[1.4] text-muted">
                No photo
              </span>
            ) : (
              /* Data URLs and a no-store API route: next/image adds nothing here. */
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewSrc} alt="Current résumé photo" className="h-full w-full object-cover" />
            )}
            {working && (
              <span className="absolute inset-0 flex items-center justify-center bg-surface/70 text-[11px] font-semibold text-ink">
                Processing…
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-[12.5px] leading-[1.6] text-body">
              {noPhoto
                ? "The two-column template will be built without a photo."
                : usingBundled
                  ? "Using the portrait bundled with the website."
                  : `Using your uploaded photo (${kb(photoDataUrl)}, stored with the résumé).`}
              <span className="block text-[11.5px] text-muted">
                Uploads are cropped to a square and resized to 512 px in your browser before saving.
                Use a well-lit head-and-shoulders shot on a plain background.
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex min-h-[36px] cursor-pointer items-center rounded-pill border border-accent bg-accent px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-accent-deep has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/40">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="sr-only"
                  onChange={(e) => void pick(e.target.files?.[0])}
                />
                {usingBundled && !noPhoto ? "Upload a photo" : "Replace photo"}
              </label>
              {!usingBundled && (
                <button
                  type="button"
                  onClick={() => onPhoto(undefined)}
                  className="inline-flex min-h-[36px] items-center rounded-pill border border-line bg-surface px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
                >
                  Use the site portrait
                </button>
              )}
              {!noPhoto && (
                <button
                  type="button"
                  onClick={() => onPhoto("")}
                  className="inline-flex min-h-[36px] items-center rounded-pill border border-line bg-surface px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
                >
                  No photo
                </button>
              )}
            </div>
            {error && (
              <p role="alert" className="text-[12.5px] text-red-600">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------ downloads ----------------------------- */}
      {/* Plain anchors on purpose: these are file downloads from route handlers.
          <Link> would attempt a client-side RSC navigation and prefetch a .docx. */}
      {/* eslint-disable @next/next/no-html-link-for-pages */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <span className="mr-1 text-[12px] text-muted">Download the last saved version:</span>
        <a
          href="/api/documents/resume?variant=ats"
          className="inline-flex min-h-[36px] items-center rounded-pill border border-line bg-surface px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
        >
          Single column .docx
        </a>
        <a
          href="/api/documents/resume?variant=design"
          className="inline-flex min-h-[36px] items-center rounded-pill border border-line bg-surface px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
        >
          Two column .docx
        </a>
        <a
          href="/resume"
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-[36px] items-center rounded-pill border border-line bg-surface px-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-body hover:border-accent hover:text-accent-deep"
        >
          Public page ↗
        </a>
      </div>
      {/* eslint-enable @next/next/no-html-link-for-pages */}
    </Card>
  );
}

/** Two tiny page thumbnails drawn with boxes — no image request needed. */
function VariantSwatch({ variant, active }: { variant: ResumeVariant; active: boolean }) {
  const line = active ? "bg-accent/25" : "bg-line";
  return (
    <span
      aria-hidden="true"
      className={`flex h-[64px] w-[50px] shrink-0 overflow-hidden rounded-md border bg-surface ${
        active ? "border-accent/40" : "border-line"
      }`}
    >
      {variant === "ats" ? (
        <span className="flex w-full flex-col gap-[3px] p-1.5">
          <span className={`h-[4px] w-[70%] rounded ${line}`} />
          <span className={`mt-1 h-[2px] w-full rounded ${line}`} />
          <span className={`h-[2px] w-[90%] rounded ${line}`} />
          <span className={`h-[2px] w-[95%] rounded ${line}`} />
          <span className={`mt-1 h-[2px] w-full rounded ${line}`} />
          <span className={`h-[2px] w-[85%] rounded ${line}`} />
          <span className={`h-[2px] w-[92%] rounded ${line}`} />
        </span>
      ) : (
        <>
          <span className="flex w-[38%] flex-col items-center gap-[3px] bg-bg-violet p-1">
            <span className="mt-0.5 h-[12px] w-[12px] rounded-full bg-accent/60" />
            <span className={`h-[2px] w-full rounded ${line}`} />
            <span className={`h-[2px] w-[80%] rounded ${line}`} />
            <span className={`h-[2px] w-[90%] rounded ${line}`} />
          </span>
          <span className="flex flex-1 flex-col gap-[3px] p-1.5">
            <span className={`h-[3px] w-[80%] rounded ${line}`} />
            <span className={`mt-1 h-[2px] w-full rounded ${line}`} />
            <span className={`h-[2px] w-[90%] rounded ${line}`} />
            <span className={`h-[2px] w-[95%] rounded ${line}`} />
            <span className={`h-[2px] w-[85%] rounded ${line}`} />
          </span>
        </>
      )}
    </span>
  );
}
