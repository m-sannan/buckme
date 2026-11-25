import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4179;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Server did not start at ${url}`);
}

const server = spawn("npx", ["vite", "--port", String(PORT), "--host", "127.0.0.1"], {
  stdio: "ignore",
});

try {
  await waitForServer(BASE_URL);
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch {
    browser = await chromium.launch({ headless: true, channel: "chrome" });
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));

  // 1. Home renders + skip splash
  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  const splashBtn = page.locator("button", { hasText: "Thank you for bucking with us" });
  if (await splashBtn.isVisible()) await splashBtn.click();

  await page.getByText("Checking Account").waitFor();
  await page.getByText("Family Savings").waitFor();

  // 2. Tap-to-flip currency ($ -> ₹)
  await page.getByRole("button", { name: "Switch currency symbol" }).click();
  await page.getByText("₹", { exact: true }).first().waitFor();

  // 3. FAQ accordion expands
  await page.getByRole("button", { name: "What is BuckMe?" }).click();
  await page.getByText(/Fleeca Financial/i).waitFor();

  // 4. Scan & Pay -> Sample QR -> Checkout
  await page.getByRole("button", { name: "Scan & Pay" }).click();
  await page.getByRole("button", { name: "Try Sample QR" }).click();
  await page.getByText("Gupta Kirana").waitFor();
  await page.getByRole("button", { name: "Close checkout" }).click();

  // 5. My BuckMe QR -> generates QR
  await page.getByRole("button", { name: "My BuckMe QR" }).click();
  await page.getByPlaceholder("you@okaxis").fill("sannan@okaxis");
  await page.getByPlaceholder("you@okaxis").blur();
  await page.locator('img[alt="BuckMe QR Code"]').waitFor();
  await page.getByRole("button", { name: "Close My BuckMe QR" }).click();

  // 6. Shared /pay page renders
  await page.goto(`${BASE_URL}/pay?pa=test@okhdfcbank&pn=Lucia&am=250`, {
    waitUntil: "networkidle",
  });
  await page.getByText("You're Bucking").waitFor();
  await page.getByText("Lucia").waitFor();
  await page.getByText("Pay with CRED").waitFor();

  // 7. Stats page renders live counters
  await page.goto(`${BASE_URL}/stats`, { waitUntil: "networkidle" });
  await page.getByText("Total Landings").waitFor();
  await page.getByText("People Bucked").waitFor();

  assert.equal(errors.length, 0, `Unexpected page errors: ${errors.join("; ")}`);
  console.log("ALL PLAYWRIGHT MOBILE SMOKE CHECKS PASSED (390x844)");
  await browser.close();
} finally {
  server.kill("SIGTERM");
}
