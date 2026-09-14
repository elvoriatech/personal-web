import { requireAdmin } from "@/lib/campaigns/guard";
import { IMAGE_MAX_UPLOAD_BYTES, ImagesNotConfiguredError, storeImage } from "@/lib/blog/images";

/** Multipart upload from the post editor: field "file". Returns the public URL. */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "No file received." }, { status: 400 });
    if (file.size > IMAGE_MAX_UPLOAD_BYTES) {
      return Response.json(
        { error: `That image is ${Math.round(file.size / 1024 / 1024)} MB — the limit is ${IMAGE_MAX_UPLOAD_BYTES / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }
    const stored = await storeImage(Buffer.from(await file.arrayBuffer()), file.type);
    return Response.json(stored);
  } catch (err) {
    const status = err instanceof ImagesNotConfiguredError ? 503 : 400;
    return Response.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status }
    );
  }
}
