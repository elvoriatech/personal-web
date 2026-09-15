import { z } from "zod";
import { BUDGET_OPTIONS } from "./contactState";

const budgetValues = BUDGET_OPTIONS.map((o) => o.value) as [string, ...string[]];

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(100, "That name is too long."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your work email.")
    .max(254, "That email address is too long.")
    .email("Please enter a valid email address."),
  company: z.string().trim().max(120, "That company name is too long."),
  message: z
    .string()
    .trim()
    .min(10, "Please include a little more detail (at least 10 characters).")
    .max(4000, "Please keep your message under 4000 characters."),
  budget: z.enum(budgetValues, { message: "Please pick an approximate budget." }),
  /* Honeypot: a real person never fills a hidden field. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
