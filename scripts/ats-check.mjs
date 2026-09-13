/**
 * Static ATS risk check for a .docx résumé.
 *
 *   node scripts/ats-check.mjs <file.docx> [more.docx ...]
 *
 * Applicant tracking systems read a linear run of paragraphs. Anything that
 * hides text inside a layout construct — tables, text boxes, shapes, columns,
 * headers/footers — is commonly dropped or reordered. Images carry no text at
 * all. This reports those, plus whether the standard sections and contact
 * details are actually findable, and how well the keywords cover the two
 * target job families.
 */
import { execFileSync } from "node:child_process";

const REQUIRED_SECTIONS = [
  "summary|profile",
  "skills|competenc",
  "experience|employment",
  "education",
];

const KEYWORDS = {
  "Full Stack": [
    "full stack", "frontend", "backend", "rest api", "graphql", "microservice",
    "typescript", "react", "angular", "node.js", "postgresql", "ci/cd",
    "agile", "scrum", "test-driven", "docker", "kubernetes", "aws",
  ],
  "AI Engineer": [
    "llm", "large language model", "rag", "retrieval-augmented", "vector",
    "embedding", "prompt engineering", "agent", "langchain", "langgraph",
    "openai", "semantic search", "python", "fine", "model evaluation",
  ],
};

function unzipEntry(file, entry) {
  try {
    return execFileSync("unzip", ["-p", file, entry], {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch {
    return "";
  }
}

function listEntries(file) {
  try {
    return execFileSync("unzip", ["-Z1", file], { encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function plainText(xml) {
  const paras = xml.split("</w:p>").map((p) => {
    const runs = [...p.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((m) => m[1]);
    return runs.join("").replace(/\s+/g, " ").trim();
  });
  return paras.filter(Boolean);
}

function check(file) {
  const entries = listEntries(file);
  if (entries.length === 0) {
    console.log(`\n${file}\n  ERROR: not a readable .docx`);
    return 1;
  }

  const xml = unzipEntry(file, "word/document.xml");
  const paras = plainText(xml);
  const text = paras.join("\n");
  const lower = text.toLowerCase();

  const issues = [];
  const notes = [];

  const tables = (xml.match(/<w:tbl>/g) || []).length;
  if (tables > 0) issues.push(`${tables} table(s) — text inside tables is frequently mis-ordered`);

  const media = entries.filter((e) => e.startsWith("word/media/"));
  if (media.length > 0) issues.push(`${media.length} embedded image(s) — carry no machine-readable text`);

  if (/<w:txbxContent>/.test(xml)) issues.push("text box(es) — content is often skipped entirely");
  if (/<w:cols\s[^>]*w:num="[2-9]"/.test(xml)) issues.push("multi-column section — reading order is unreliable");
  if (/<w:drawing>|<v:shape/.test(xml)) notes.push("drawing/shape markup present");

  for (const entry of entries.filter((e) => /word\/(header|footer)\d*\.xml/.test(e))) {
    const t = plainText(unzipEntry(file, entry)).join(" ").trim();
    if (t) issues.push(`content in ${entry.split("/")[1]} — usually ignored by parsers`);
  }

  // Contact details must survive as plain text.
  const email = /[\w.+-]+@[\w-]+\.[\w.]+/.exec(text);
  const phone = /(\+?\d[\d ()\-]{7,})/.exec(text);
  if (!email) issues.push("no email address found as plain text");
  if (!phone) issues.push("no phone number found as plain text");

  const missingSections = REQUIRED_SECTIONS.filter((re) => !new RegExp(re, "i").test(lower));
  if (missingSections.length) {
    issues.push(`missing standard heading(s): ${missingSections.join(", ").replace(/\|/g, " / ")}`);
  }

  const bullets = /<w:numPr>/.test(xml);
  if (!bullets) notes.push("no real list bullets found — literal characters parse worse");

  const words = text.split(/\s+/).filter(Boolean).length;

  console.log(`\n${file}`);
  console.log(`  paragraphs: ${paras.length}   words: ${words}   real bullets: ${bullets ? "yes" : "no"}`);

  for (const [family, terms] of Object.entries(KEYWORDS)) {
    const hit = terms.filter((t) => lower.includes(t));
    const pct = Math.round((hit.length / terms.length) * 100);
    const miss = terms.filter((t) => !lower.includes(t));
    console.log(`  ${family.padEnd(11)} keyword coverage: ${pct}% (${hit.length}/${terms.length})`);
    if (miss.length) console.log(`               missing: ${miss.join(", ")}`);
  }

  if (issues.length === 0) {
    console.log("  ATS: PASS — no blocking structures found");
  } else {
    console.log("  ATS: RISKS");
    issues.forEach((i) => console.log(`    - ${i}`));
  }
  notes.forEach((n) => console.log(`    note: ${n}`));

  return issues.length;
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("usage: node scripts/ats-check.mjs <file.docx> ...");
  process.exit(2);
}
files.forEach(check);
