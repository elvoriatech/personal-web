# Zahoor Ahmed — Personal Website

Single-page portfolio built from the supplied design template.
**Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Motion.**

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Where the content lives

All copy sits in `content/` — editing the site should never mean touching JSX.

| File | Holds |
|---|---|
| `content/site.ts` | Name, contact details, hero copy, stats, nav, work history, education, document downloads |
| `content/projects.ts` | The project cards: blurb, stack, link, screenshot, live/building status |
| `content/services.ts` | The four service cards |
| `content/skills.ts` | Skill bars, the tech-logo grid, and the grouped stack list |
| `content/process.ts` | The five process steps |

Assets: `assets/` holds images imported through `next/image` (portrait, avatar);
`public/` holds the CV, cover letter and project screenshots.

## Refreshing project screenshots

`public/projects/*.jpg` were captured from the live sites. To refresh:

```bash
npm i -D playwright
node scripts/capture-screenshots.mjs
npm uninstall playwright
```

It drives your installed Chrome (no browser download) and **declines** cookie
banners rather than accepting them. It writes 1440×900 PNGs — downscale them to
800×500 JPEG (quality ~82) before committing to keep the payload small.

Playwright is deliberately not a dependency: keeping it out stops Vercel
fetching browser binaries on every deploy.

## Deploying to Vercel

1. Push this folder to a GitHub repository.
2. In Vercel, **Add New → Project** and import that repo. The framework preset
   is detected automatically; no build settings need changing.
3. Add the environment variables from `.env.example` under
   **Settings → Environment Variables**.
4. Deploy. Then set `NEXT_PUBLIC_SITE_URL` to the URL Vercel assigns and
   redeploy, so canonical/OG/sitemap URLs are correct.

No `output` mode is set — Vercel prerenders every route as static HTML at build
time while keeping image optimization and OG image generation.


## Documents: résumé and cover letter

Two builds come from one source (`content/documents.ts`, overridden by the admin):

| Build | URL | Use it for |
|---|---|---|
| **Single column (ATS)** | `/api/documents/resume` | Job portals and ATS uploads. No tables, no images, real list bullets. |
| **Two column (with photo)** | `/api/documents/resume?variant=design` | Emailing a human. Photo, sidebar and contact icons. |
| Cover letter | `/api/documents/cover-letter` | `{{role}}` / `{{company}}` are filled from the admin. |

Previews that print cleanly to PDF: `/resume` and `/cover-letter`.

**Why two builds.** Applicant tracking systems read a linear run of paragraphs;
tables, text boxes, columns and images are routinely dropped or reordered, and a
photo carries no machine-readable text at all. A German CV still conventionally
carries a photo for the human reader — so rather than compromise, the photo lives
only in the two-column build. Never upload that one to a job portal.

### Checking ATS-friendliness

```bash
node scripts/ats-check.mjs /path/to/resume.docx
```

Reports tables, images, text boxes, multi-column sections, header/footer text,
whether contact details survive as plain text, whether real list bullets are
used, and keyword coverage against the Full Stack and AI Engineer job families.
Current state: the single-column build passes with no blocking structures;
the original Word file had 11 tables, 2 images and a multi-column section.

## Admin panel

`/admin`, protected by a password. Edit the résumé, the cover letter, the
outreach email templates, and the blog — then download or publish.

```bash
ADMIN_PASSWORD="…"                                  # your password
ADMIN_SESSION_SECRET="$(openssl rand -hex 32)"      # cookie signing key
DATABASE_URL="postgres://…"                         # required in production
```

Apply the schema once:

```bash
psql "$DATABASE_URL" -f lib/db/schema.sql
```

**Storage.** With `DATABASE_URL` set, edits go to Postgres. Without it, they go
to `.data/` on your own machine — which works locally but **not on Vercel**,
whose filesystem is read-only at runtime. The admin shows a banner telling you
which mode you are in, and refuses to pretend a save worked when it cannot.

## Blog

`/blog` lists published posts; `/blog/<slug>` renders one. Write them at
`/admin/blog` — save as a draft or publish. The body takes a deliberately tiny
markup subset (`## heading`, `- list item`, blank line between paragraphs) and
is rendered as React text nodes, never HTML, so a post cannot inject markup.
Posts are added to the sitemap automatically.

## Outreach templates

Six editable templates at `/admin/templates` for winning project work: cold
outreach (web and AI), a single follow-up, replying to a posting, asking for a
referral, and a post-call summary.

**Compliance:** unsolicited commercial email to businesses is restricted in
Germany and the EU (UWG §7, GDPR). Every template identifies the sender, gives a
concrete reason for the contact and ends with an opt-out. The `campaign_contacts`
table carries a permanent `opted_out` flag — check it before every send, keep
volumes low, and personalise.


## Campaigns: outreach email at volume

Ported from the Elvoria email-marketing system and re-themed. `/admin/campaigns`.

**How a send works.** Import prospects → audit their domains → queue a job. The
job stores `processed_index` against the recipient list, so a worker timeout
resumes exactly where it stopped and never double-sends. Batches default to 25
emails with a ~1s gap between each, which keeps Gmail from rate-limiting.

**Three guards run at send time, not just when the list is built** — a recipient
can opt out or bounce after a job is queued:

| Guard | Why |
|---|---|
| `opted_out` | Legally required in the EU. Permanent; never cleared automatically. |
| `status = 'bounced'` | Re-sending to a dead mailbox destroys sender reputation. |
| `domain_status = 'invalid'` | DNS audit found no MX or A record — it would hard-bounce. |

Every outcome is written to `em_send_logs`, so there is a full audit trail.

**Follow-ups** are queued automatically 3 and 7 days after the initial send, and
stop the moment someone replies or opts out.

### Running the worker

Three things can advance a send job, in order of how often they run:

1. **The admin tab.** While `/admin/campaigns` is open it drains batches itself,
   so a campaign you start by hand finishes without any cron at all.
2. **GitHub Actions** (`.github/workflows/campaign-worker.yml`), every 15
   minutes. This is the real cadence — Vercel's Hobby plan permits only one
   cron run per day, which cannot drain a job in batches. Actions is free on a
   public repo. It needs two repository secrets: `SITE_URL` and `CRON_SECRET`.
3. **Vercel Cron**, once daily at 07:00 UTC — a safety net that queues due
   follow-ups even if Actions is disabled.

GitHub disables scheduled workflows on repositories with no activity for 60
days; if outreach goes quiet for two months, re-enable it in the Actions tab.

### Mail transport

Two transports are supported, chosen automatically:

| | Used when | Best for |
|---|---|---|
| **SMTP** | `EMAIL_USER` + `EMAIL_PASS` are set | One-off personal email from your own mailbox |
| **Resend** | only `RESEND_API_KEY` is set | Campaigns — proper SPF/DKIM on a domain you own |

```bash
# SMTP (Outlook/Hotmail shown; STARTTLS on 587, not 465)
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="you@hotmail.com"
EMAIL_PASS="…"                       # an app password, not your account password
CRON_SECRET="$(openssl rand -hex 32)"
```

`Reply-To` is always set to `CONTACT_TO_EMAIL`, so replies reach your personal
inbox whichever transport carried the message out.

**Do not run campaigns through a personal mailbox.** Free consumer accounts cap
daily recipients, throttle bulk patterns aggressively, and their terms prohibit
commercial bulk mail — the realistic outcome is spam-foldering or a suspended
account. Campaigns want a domain and Resend. Microsoft is also phasing out basic
authentication on personal Outlook/Hotmail accounts, so SMTP there may not
authenticate at all; `/admin/email` has a **Test connection** button that tells
you in a second rather than after a failed campaign.

## Sending a personal email

`/admin/email` — a one-off email (application, introduction, reply to a lead)
using the same branded shell but without the cold-outreach opt-out line. It can
attach the ATS résumé, the two-column résumé and the cover letter; each is
generated fresh at send time, so an attachment is never a stale copy.

Preview the campaign shell at `/api/admin/campaigns/preview?template=initial`.

## Notes on this build

- **Contact form** posts to a server action (`app/actions/contact.ts`) with zod
  validation, a honeypot field, and a best-effort in-memory rate limit. If
  `RESEND_API_KEY` is absent it degrades to a visible "email me directly"
  message rather than a dead button. On failure the visitor's text is preserved.
- **Accessibility**: the template's body grey (`#7B7682`) measures 4.3:1 on
  white and fails WCAG AA, so body text uses `#5F5A68` (6.7:1). The template
  purple fails on small text too, so it is split into a decorative fill
  (`--accent`), a button background (`--accent-strong`) and a text-safe ink
  (`--accent-deep`, 5.7:1). Every animation respects `prefers-reduced-motion`.
- **Next 16 specifics**: `data-scroll-behavior="smooth"` is required on `<html>`
  for anchor scrolling; `next/image` uses `loading="eager"` + `fetchPriority`
  rather than the now-deprecated `priority` prop.
- Brand marks in the tech grid are generated from `simple-icons` (CC0) into
  `components/ui/techIcons.ts`. AWS is drawn as a wordmark because simple-icons
  no longer ships an Amazon logo.
