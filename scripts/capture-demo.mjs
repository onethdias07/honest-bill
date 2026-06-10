// Auto-captures product screenshots for the founding page demo gallery.
// Usage: start the app (npm run dev), then: node scripts/capture-demo.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

const BASE = process.env.DEMO_BASE_URL || "http://localhost:3000";
const outDir = path.join(process.cwd(), "public", "demo");
mkdirSync(outDir, { recursive: true });

const shots = [
  { name: "dashboard", url: "/", waitFor: "text=Unbilled work" },
  { name: "time", url: "/time", waitFor: "text=Track time" },
  { name: "import", url: "/import", waitFor: "text=Import your data" },
  { name: "charter", url: "/charter", waitFor: "text=The Pricing Charter" },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

async function shoot(name) {
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(outDir, `${name}.png`) });
  console.log("captured", name);
}

for (const s of shots) {
  await page.goto(BASE + s.url, { waitUntil: "networkidle", timeout: 60000 });
  try {
    await page.waitForSelector(s.waitFor, { timeout: 10000 });
  } catch {
    console.warn("selector not found for", s.name, "(continuing)");
  }
  await shoot(s.name);
}

// Invoice detail: open the first invoice from the list.
try {
  await page.goto(BASE + "/invoices", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("text=INV-", { timeout: 10000 });
  await page.locator("a:has-text('View')").first().click();
  await page.waitForLoadState("networkidle");
  await page.waitForSelector("text=Line items", { timeout: 10000 });
  await shoot("invoice");
} catch (e) {
  console.warn("invoice detail failed, capturing list instead:", e.message);
  await page.goto(BASE + "/invoices", { waitUntil: "networkidle" });
  await shoot("invoice");
}

await browser.close();
console.log("done -> public/demo/");
