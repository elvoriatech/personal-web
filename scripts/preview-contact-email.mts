/**
 * Renders the contact-form notification email with sample data.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/preview-contact-email.mts
 *
 * Writes contact-preview.html to OUT (default: .data/contact-preview.html).
 * Set SEND=1 to also deliver it via Resend to CONTACT_TO_EMAIL, so you can
 * check the real rendering in your inbox. Needs RESEND_API_KEY in the env.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Resend } from "resend";
import { site } from "@/content/site";
import { buildContactNotification } from "@/lib/email/contactNotification";

const out = process.env.OUT ?? ".data/contact-preview.html";

const n = buildContactNotification({
  name: "Zahoor Ahmed",
  email: "zdev1989@gmail.com",
  message:
    "Hi Zahoor,\n\nWe're a Berlin logistics company looking to rebuild our dispatcher dashboard (Angular, ~40 internal users) and add an LLM assistant that answers questions over our shipment history.\n\nCould you share availability for a 30-minute call next week and a rough budget range?\n\nBest,\nZahoor",
});

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, n.html);
console.log("subject:", n.subject);
console.log("wrote:", out, `(${n.html.length} bytes)`);
console.log("\n--- text version ---\n" + n.text + "\n---");

if (process.env.SEND === "1") {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("SEND=1 needs RESEND_API_KEY");
  const resend = new Resend(key);
  const r = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
    to: process.env.CONTACT_TO_EMAIL || site.email,
    replyTo: "zdev1989@gmail.com",
    subject: n.subject,
    text: n.text,
    html: n.html,
  });
  console.log("resend:", JSON.stringify(r));
}
