"use client";

import { useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";

export type UploadedImage = { url: string; width: number; height: number; bytes: number };

/** Sends one file to the admin upload route and returns its public URL. */
export async function uploadBlogImage(file: File): Promise<UploadedImage> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/blog/images", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as Partial<UploadedImage> & { error?: string };
  if (!res.ok || data.error || !data.url) throw new Error(data.error ?? `Upload failed (${res.status})`);
  return data as UploadedImage;
}

const isImageFile = (f: File) => f.type.startsWith("image/");
const altFromName = (name: string) => name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();

/**
 * Tiptap-based editor for post bodies. Produces HTML, which the save action
 * and the public page both pass through the sanitiser in lib/blog/html.ts.
 *
 * Images: toolbar button, drag-and-drop onto the text, or paste from the
 * clipboard. Each goes through /api/admin/blog/images (resized, WebP, stored
 * in Postgres) and is inserted at the drop point once the upload finishes.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [uploads, setUploads] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    // Required with the App Router: the first render happens on the server.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "post-body tiptap-editor min-h-[440px] px-5 py-4 outline-none",
        "aria-label": "Post body",
      },
      handleDrop: (view, event) => {
        const files = [...(event.dataTransfer?.files ?? [])].filter(isImageFile);
        if (!files.length) return false;
        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        void insertFiles(files, pos);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = [...(event.clipboardData?.files ?? [])].filter(isImageFile);
        if (!files.length) return false;
        event.preventDefault();
        void insertFiles(files);
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // v3 no longer re-renders on every transaction; derive toolbar state explicitly.
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            strike: e.isActive("strike"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            code: e.isActive("codeBlock"),
            link: e.isActive("link"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  async function insertFiles(files: File[], at?: number) {
    if (!editor) return;
    setError("");
    for (const file of files) {
      setUploads((n) => n + 1);
      try {
        const img = await uploadBlogImage(file);
        const node = {
          type: "image",
          attrs: { src: img.url, alt: altFromName(file.name), width: img.width, height: img.height },
        };
        const chain = editor.chain().focus();
        (at !== undefined ? chain.insertContentAt(at, node) : chain.insertContent(node)).run();
      } catch (err) {
        setError(err instanceof Error ? err.message : `Could not upload ${file.name}.`);
      } finally {
        setUploads((n) => n - 1);
      }
    }
  }

  function setLink() {
    if (!editor) return;
    const previous = (editor.getAttributes("link").href as string | undefined) ?? "";
    const href = window.prompt("Link address (leave empty to remove)", previous || "https://");
    if (href === null) return;
    const trimmed = href.trim();
    if (!trimmed || trimmed === "https://") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  }

  return (
    <div className="rounded-xl border border-line bg-surface focus-within:border-accent">
      <div
        role="toolbar"
        aria-label="Formatting"
        className="flex flex-wrap items-center gap-1 border-b border-line bg-bg-tint/70 px-2 py-1.5"
      >
        <Tool label="Heading" active={state?.h2} onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Tool>
        <Tool label="Subheading" active={state?.h3} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Tool>
        <Divider />
        <Tool label="Bold" active={state?.bold} onClick={() => editor?.chain().focus().toggleBold().run()}><b>B</b></Tool>
        <Tool label="Italic" active={state?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}><i>I</i></Tool>
        <Tool label="Strikethrough" active={state?.strike} onClick={() => editor?.chain().focus().toggleStrike().run()}><s>S</s></Tool>
        <Tool label="Link" active={state?.link} onClick={setLink}>Link</Tool>
        <Divider />
        <Tool label="Bulleted list" active={state?.bullet} onClick={() => editor?.chain().focus().toggleBulletList().run()}>• List</Tool>
        <Tool label="Numbered list" active={state?.ordered} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>1. List</Tool>
        <Tool label="Quote" active={state?.quote} onClick={() => editor?.chain().focus().toggleBlockquote().run()}>Quote</Tool>
        <Tool label="Code block" active={state?.code} onClick={() => editor?.chain().focus().toggleCodeBlock().run()}>Code</Tool>
        <Divider />
        <Tool label="Insert image" onClick={() => fileRef.current?.click()} accent>
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="12" height="10" rx="1.5" />
            <circle cx="6" cy="7" r="1.2" />
            <path d="m3 12 3.5-3.5 2.5 2.5 2-2L14 12" />
          </svg>
          Image
        </Tool>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            const files = [...(e.target.files ?? [])].filter(isImageFile);
            if (files.length) void insertFiles(files);
            e.target.value = "";
          }}
        />
        <span className="ml-auto flex items-center gap-1">
          <Tool label="Undo" disabled={!state?.canUndo} onClick={() => editor?.chain().focus().undo().run()}>↶</Tool>
          <Tool label="Redo" disabled={!state?.canRedo} onClick={() => editor?.chain().focus().redo().run()}>↷</Tool>
        </span>
      </div>

      <EditorContent editor={editor} />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2 text-[11.5px] text-muted">
        <span>
          Drop or paste images anywhere in the text. Type <kbd className="rounded bg-bg-tint px-1">##</kbd> then a space for a heading,{" "}
          <kbd className="rounded bg-bg-tint px-1">-</kbd> for a list.
        </span>
        {uploads > 0 && (
          <span role="status" className="font-semibold text-accent-deep">
            Uploading {uploads} image{uploads === 1 ? "" : "s"}…
          </span>
        )}
        {error && (
          <span role="alert" className="text-red-600">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}

function Tool({
  children,
  label,
  onClick,
  active = false,
  disabled = false,
  accent = false,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      className={`inline-flex min-h-[30px] items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold transition-colors disabled:opacity-40 ${
        accent
          ? "bg-accent text-white hover:bg-accent-deep"
          : active
            ? "bg-bg-violet text-accent-deep"
            : "text-body hover:bg-surface hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />;
}

export type { Editor };
