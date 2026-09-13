import { resolveResumePhoto } from "@/lib/documents/photo";
import { getDocuments } from "@/lib/documents/store";

/**
 * The photo currently used by the two-column résumé, so the admin can show
 * "this is what is in the document right now" without duplicating the
 * resolution rules. Not secret — it is embedded in a document that gets
 * emailed — but never cached, so a change shows immediately.
 */
export async function GET() {
  const { resume } = await getDocuments();
  const photo = await resolveResumePhoto(resume);
  if (!photo) return new Response(null, { status: 204 });

  return new Response(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "no-store",
    },
  });
}
