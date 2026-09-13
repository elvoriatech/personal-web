"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { site } from "@/content/site";
import { rateLimit } from "@/lib/rateLimit";
import type { ContactState, ContactValues } from "@/lib/contactState";
import { contactSchema, escapeHtml } from "@/lib/validation";

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const submitted: ContactValues = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = contactSchema.safeParse({
    ...submitted,
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten().fieldErrors;

    /* A filled honeypot is a bot. Report success so it learns nothing. */
    if (flat.company) return { status: "success", message: "Thanks — your message is on its way." };

    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors: {
        name: flat.name?.[0],
        email: flat.email?.[0],
        message: flat.message?.[0],
      },
      values: submitted,
    };
  }

  const { name, email, message } = parsed.data;

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headerList.get("x-real-ip") ??
    "unknown";

  const limit = rateLimit(ip);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Too many messages just now — please try again in ${limit.retryAfter}s.`,
      values: submitted,
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      status: "error",
      message: `Email delivery isn't configured yet. Please reach me directly at ${site.email}.`,
      values: submitted,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      /* Resend requires a verified domain for a custom sender. Until one
         exists, onboarding@resend.dev delivers to the account owner. */
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL ?? site.email,
      replyTo: email,
      subject: `New enquiry from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `
        <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#0c1218">
          <h2 style="margin:0 0 12px">New enquiry via ${escapeHtml(site.url)}</h2>
          <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin:0 0 16px"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <div style="padding:16px;background:#f3f1fe;border-radius:10px;white-space:pre-wrap">${escapeHtml(
            message
          )}</div>
        </div>
      `,
    });

    if (error) {
      console.error("[contact] Resend rejected the message:", error);
      return {
        status: "error",
        message: `Something went wrong sending that. Please email me directly at ${site.email}.`,
        values: submitted,
      };
    }

    return { status: "success", message: "Thanks — your message is on its way. I'll reply shortly." };
  } catch (err) {
    console.error("[contact] Unexpected failure:", err);
    return {
      status: "error",
      message: `Something went wrong sending that. Please email me directly at ${site.email}.`,
      values: submitted,
    };
  }
}
