import { getImage } from "@/lib/blog/images";

/**
 * Public image bytes. The id is a content hash, so the response can be cached
 * indefinitely by browsers and Vercel's edge.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-f0-9]{16,64}$/.test(id)) return new Response("Not found", { status: 404 });

  const image = await getImage(id);
  if (!image) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(image.data.length),
    },
  });
}
