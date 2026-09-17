import { requireAdmin } from "@/lib/campaigns/guard";
import {
  buildCoverLetterBuffer,
  buildResumeBuffer,
  coverLetterFilename,
  resumeFilename,
} from "@/lib/documents/build";
import { getDocuments } from "@/lib/documents/store";
import {
  DOCUMENT_CONTENT_TYPES,
  RESUME_VARIANTS,
  coerceDocumentFormat,
  type CoverLetterDoc,
  type DocumentFormat,
  type ResumeDoc,
  type ResumeVariant,
} from "@/lib/documents/types";

/**
 * GET  — the saved document. Public: the /resume and /cover-letter pages and
 *        the hero's "Download CV" link point here.
 * POST — admin only. Builds from the document posted in `payload`, so the
 *        editor can download exactly what it shows without saving first.
 *
 * `?format=docx` switches to Word; without it a PDF is served, which is what
 * a recruiter or client expects to receive.
 *
 * Params are Promises in Next 16.
 */
export async function GET(request: Request, { params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const bundle = await getDocuments();
  const search = new URL(request.url).searchParams;
  const format = coerceDocumentFormat(search.get("format"));
  // Explicit ?variant wins; without one, serve the template chosen in the admin.
  const variant = pickVariant(search.get("variant"), bundle.resume.preferredVariant);

  if (doc === "resume") {
    return send(await buildResumeBuffer(bundle.resume, variant, format), resumeFilename(variant, format), format);
  }
  if (doc === "cover-letter") {
    return send(
      await buildCoverLetterBuffer(bundle.coverLetter, format),
      coverLetterFilename(bundle.coverLetter, format),
      format
    );
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

  const format = coerceDocumentFormat(form.get("format"));

  if (doc === "resume") {
    const resume = payload as ResumeDoc;
    const variant = pickVariant(String(form.get("variant") ?? ""), resume.preferredVariant);
    return send(await buildResumeBuffer(resume, variant, format), resumeFilename(variant, format), format);
  }
  if (doc === "cover-letter") {
    const letter = payload as CoverLetterDoc;
    return send(await buildCoverLetterBuffer(letter, format), coverLetterFilename(letter, format), format);
  }
  return new Response("Unknown document", { status: 404 });
}

function pickVariant(requested: string | null, preferred: ResumeVariant | undefined): ResumeVariant {
  return RESUME_VARIANTS.includes(requested as ResumeVariant) ? (requested as ResumeVariant) : (preferred ?? "ats");
}

function send(buffer: Buffer, filename: string, format: DocumentFormat): Response {
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": DOCUMENT_CONTENT_TYPES[format],
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
