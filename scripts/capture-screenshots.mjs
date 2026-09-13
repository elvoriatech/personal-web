/**
 * Refreshes the project screenshots in public/projects.
 *
 * Playwright is NOT a project dependency — installing it would make Vercel
 * pull browser binaries on every build. Install it ad hoc to run this:
 *
 *   npm i -D playwright && node scripts/capture-screenshots.mjs && npm un playwright
 *
 * It drives the Chrome already installed on the machine (channel: 'chrome'),
 * so no extra browser download is needed. Consent banners are DECLINED, never
 * accepted, so the capture reflects a privacy-preserving visit.
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const OUT = "public/projects";

const targets = [
  { slug: "guessto", url: "https://guessto.com" },
  { slug: "mjcarros", url: "https://mjcarros-koblenz.guessto.com" },
  { slug: "retromotion", url: "https://retromotion.com" },
  { slug: "tpconnects", url: "https://tpconnects.com" },
  { slug: "dudiapp", url: "https://www.dudiapp.com" },
  { slug: "unikoop", url: "https://unikoop.nl" },
];

const DECLINE_SELECTORS = [
  "#CybotCookiebotDialogBodyButtonDecline",
  'button:has-text("Reject all")',
  'button:has-text("Alle ablehnen")',
  'button:has-text("Decline")',
  'button:has-text("Ablehnen")',
  'button:has-text("Only necessary")',
  'button:has-text("Nur notwendige")',
  'button:has-text("Alleen noodzakelijk")',
];

async function declineConsent(page) {
  for (const sel of DECLINE_SELECTORS) {
    const btn = page.locator(sel).first();
    if ((await btn.count()) && (await btn.isVisible().catch(() => false))) {
      await btn.click({ timeout: 3000 }).catch(() => {});
      return sel;
    }
  }
  // Cookiebot sometimes hides the decline button behind its JS API.
  return page.evaluate(() => {
    if (window.Cookiebot?.decline) {
      window.Cookiebot.decline();
      return "Cookiebot.decline()";
    }
    return "none";
  });
}

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });

for (const t of targets) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  });
  const page = await ctx.newPage();
  try {
    await page.goto(t.url, { waitUntil: "networkidle", timeout: 45000 });
    const how = await declineConsent(page);
    await page.waitForTimeout(2200);
    await page.screenshot({
      path: `${OUT}/${t.slug}.png`,
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
    console.log(`OK   ${t.slug.padEnd(12)} consent:${how}`);
  } catch (err) {
    console.log(`FAIL ${t.slug.padEnd(12)} ${err.message.split("\n")[0]}`);
  }
  await ctx.close();
}

await browser.close();
console.log(
  `\nPNGs written to ${OUT}. Downscale to 800x500 JPEG before committing ` +
    `(see the note in content/projects.ts).`
);
