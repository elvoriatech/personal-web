export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /**
   * HTML from the editor, sanitised on save and on render (lib/blog/html.ts).
   * Posts written before the editor used a tiny plain-text markup; see
   * renderPostBody, which now only serves to convert those.
   */
  body: string;
  /** URL of an optional cover image ("" when none). */
  coverImage: string;
  tags: string[];
  /** ISO date (YYYY-MM-DD). */
  publishedAt: string;
  draft: boolean;
  /** Set when archived: hidden from the public blog and the working list, but kept. */
  archivedAt?: string | null;
};

export type PostBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

/**
 * Parses a post body into blocks.
 *
 * Deliberately NOT a markdown engine, and it never emits HTML: the blocks are
 * rendered as React text nodes, so a post cannot inject markup into the page.
 * Supported: "## heading", "- list item", blank-line-separated paragraphs.
 */
export function renderPostBody(body: string): PostBlock[] {
  const blocks: PostBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ kind: "list", items: list });
      list = [];
    }
  };

  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();

    if (line === "") {
      flushParagraph();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "heading", text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("- ")) {
      flushParagraph();
      list.push(line.slice(2).trim());
      continue;
    }
    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || `post-${Date.now()}`;
}

export function readingMinutes(body: string): number {
  const words = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
