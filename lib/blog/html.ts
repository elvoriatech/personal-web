import sanitizeHtml from "sanitize-html";
import { renderPostBody } from "./types";

/**
 * Post bodies are HTML written by the Tiptap editor. Everything that reaches
 * the page goes through this allowlist — on save AND on render — so a stored
 * body can never carry a script, an event handler or an off-site tracker,
 * even if the database were edited directly.
 */
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const OWN_IMAGE = /^\/api\/blog\/images\/[a-f0-9]{16,64}$/;

function isAllowedImageSrc(src: string): boolean {
  return OWN_IMAGE.test(src) || /^https:\/\//i.test(src);
}

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "h2", "h3",
    "strong", "em", "u", "s", "code", "mark",
    "a",
    "ul", "ol", "li",
    "blockquote", "pre",
    "img", "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    code: ["class"],
    pre: ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["https", "http"] },
  // Our own uploads are served from a relative path.
  allowProtocolRelative: false,
  allowedClasses: { code: ["language-*"], pre: ["language-*"] },
  transformTags: {
    a: (tagName, attribs) => {
      const out: Record<string, string> = {};
      if (attribs.href) out.href = attribs.href;
      if (attribs.title) out.title = attribs.title;
      const external =
        /^https?:\/\//i.test(out.href ?? "") && !(SITE_ORIGIN && out.href!.startsWith(SITE_ORIGIN));
      if (external) {
        out.target = "_blank";
        out.rel = "noopener noreferrer";
      }
      return { tagName, attribs: out };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
  exclusiveFilter: (frame) =>
    // Drop images that are neither ours nor https, and empty paragraphs
    // Tiptap leaves behind.
    (frame.tag === "img" && !isAllowedImageSrc(frame.attribs.src ?? "")) ||
    (frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren.length),
};

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS).trim();
}

/** True once a body has been saved from the editor; legacy posts are plain text. */
export function isHtmlBody(body: string): boolean {
  return /^\s*</.test(body);
}

/**
 * Posts written before the editor existed use a tiny plain-text markup
 * ("## heading", "- item", blank-line paragraphs). Convert them so they open
 * in the editor and render through the same path as new posts.
 */
export function legacyBodyToHtml(body: string): string {
  return renderPostBody(body)
    .map((block) => {
      if (block.kind === "heading") return `<h2>${escape(block.text)}</h2>`;
      if (block.kind === "list") return `<ul>${block.items.map((i) => `<li><p>${escape(i)}</p></li>`).join("")}</ul>`;
      return `<p>${escape(block.text)}</p>`;
    })
    .join("");
}

/** The body as safe HTML, whichever format it was stored in. */
export function postBodyHtml(body: string): string {
  return sanitizePostHtml(isHtmlBody(body) ? body : legacyBodyToHtml(body));
}

/** Visible text only — for reading time and fallback excerpts. */
export function postPlainText(body: string): string {
  const html = isHtmlBody(body) ? body : legacyBodyToHtml(body);
  return decodeEntities(sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }))
    .replace(/\s+/g, " ")
    .trim();
}

/** sanitize-html leaves text entity-encoded; plain text wants the characters back. */
function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function escape(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
