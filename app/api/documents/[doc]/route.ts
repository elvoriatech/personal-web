import { requireAdmin } from "@/lib/campaigns/guard";
import {
  buildCoverLetterDocx,
  buildResumeDesignDocx,
  buildResumeDocx,
} from "@/lib/documents/docx";
import { getDocuments } from "@/lib/documents/store";
import type { CoverLetterDoc, ResumeDoc, ResumeVariant } from "@/lib/documents/types";

const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/**
 * GET  — the saved document. Public: the /resume and /cover-letter pages and
 *        the hero's "Download CV" link point here.
 * POST — admin only. Builds from the document posted in `payload`, so the
 *        editor can download exactly what it shows without saving first.
 *
 * Params are Promises in Next 16.
 */
export async function GET(request: Request, { params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const bundle = await getDocuments();
  const requested = new URL(request.url).searchParams.get("variant");
  // Explicit ?variant wins; without one, serve the template chosen in the admin.
  const variant = pickVariant(requested, bundle.resume.preferredVariant);

  if (doc === "resume") return send(await buildResume(bundle.resume, variant), resumeFilename(variant));
  if (doc === "cover-letter") {
    return send(await buildCoverLetterDocx(bundle.coverLetter), coverLetterFilename(bundle.coverLetter));
  }
  return new Response("Unknown document", { status: 404 });
}

export async function POST(request: Request, { params }: { params: Promise<{ doc: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { doc } = await params;
  const form = await request.formData();
  let payload: unknown;
  try {
    payload = JSON.parse(String(form.get("payload") ?? ""));
  } catch {
    return new Response("Malformed payload", { status: 400 });
  }
  if (!payload || typeof payload !== "object") return new Response("Malformed payload", { status: 400 });

  if (doc === "resume") {
    const resume = payload as ResumeDoc;
    const variant = pickVariant(String(form.get("variant") ?? ""), resume.preferredVariant);
    return send(await buildResume(resume, variant), resumeFilename(variant));
  }
  if (doc === "cover-letter") {
    const letter = payload as CoverLetterDoc;
    return send(await buildCoverLetterDocx(letter), coverLetterFilename(letter));
  }
  return new Response("Unknown document", { status: 404 });
}

function pickVariant(requested: string | null, preferred: ResumeVariant | undefined): ResumeVariant {
  return requested === "design" || requested === "ats" ? requested : (preferred ?? "ats");
}

function buildResume(resume: ResumeDoc, variant: ResumeVariant): Promise<Buffer> {
  return variant === "design" ? buildResumeDesignDocx(resume) : buildResumeDocx(resume);
}

function resumeFilename(variant: ResumeVariant): string {
  return variant === "design" ? "Zahoor_Ahmed_Resume_TwoColumn.docx" : "Zahoor_Ahmed_Resume_ATS.docx";
}

/** Adds the target company so downloads for different applications do not overwrite each other. */
function coverLetterFilename(letter: CoverLetterDoc): string {
  const company = letter.targetCompany
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return company ? `Zahoor_Ahmed_Cover_Letter_${company}.docx` : "Zahoor_Ahmed_Cover_Letter.docx";
}

function send(buffer: Buffer, filename: string): Response {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": DOCX_TYPE,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
