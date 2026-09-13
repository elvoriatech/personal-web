import { getDocuments } from "@/lib/documents/store";
import {
  buildCoverLetterDocx,
  buildResumeDesignDocx,
  buildResumeDocx,
} from "@/lib/documents/docx";

/** Params are Promises in Next 16. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ doc: string }> }
) {
  const { doc } = await params;
  const variant =
    new URL(request.url).searchParams.get("variant") === "design"
      ? "design"
      : "ats";
  const bundle = await getDocuments();

  let buffer: Buffer;
  let filename: string;

  if (doc === "resume") {
    if (variant === "design") {
      buffer = await buildResumeDesignDocx(bundle.resume);
      filename = "Zahoor_Ahmed_Resume_TwoColumn.docx";
    } else {
      buffer = await buildResumeDocx(bundle.resume);
      filename = "Zahoor_Ahmed_Resume_ATS.docx";
    }
  } else if (doc === "cover-letter") {
    buffer = await buildCoverLetterDocx(bundle.coverLetter);
    filename = "Zahoor_Ahmed_Cover_Letter.docx";
  } else {
    return new Response("Unknown document", { status: 404 });
  }

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
