# BuckMe UPI — AI Handoff Document (`HANDOFF.md`)

> **Generated:** 2026-11-25  
> **Project Root:** `/Users/sannan/.gemini/antigravity/scratch/buckme-upi`  
> **Stack:** Vite 6 + React 19 + TypeScript + Tailwind CSS v4 + Zustand + Vercel Analytics  

---

## 1. What Was Built

1. **BuckMe UI & Brand Shell (`src/components/BuckMeBrand.tsx`, `src/index.css`)**
   - Light-mode lavender/white canvas (`#F8F7FC`), royal-to-electric purple gradient (`#5B21B6` → `#7C3AED` → `#9333EA`) with diagonal tiled `b` watermark.
   - `BuckMeLogo` (speed-line `b`), `DualAvatars` (Jason & Lucia), `BruisedBMascot`, and `SplashOverlay` (*"Thank you for bucking with us"*).
2. **Home Dashboard (`src/App.tsx`, `CheckingCard.tsx`, `FamilySavingsCard.tsx`, `FaqAccordion.tsx`)**
   - **Checking Account Card:** Displays balance with **tap-on-`$`/`₹`-to-flip** currency toggle, plus **`Scan & Pay`** and **`My BuckMe QR`** actions.
   - **Family Savings Card:** Bruised `b` mascot, progress bar, and detail modal with **`Buck Yourself`** (locks mock funds from Checking into Savings) and **`View Transactions`**.
   - **BuckMe FAQ Accordion:** 8 satirical in-game Fleeca/BuckMe FAQs on scroll-down.
3. **Personal UPI Scanner & Logger (`QrScannerSheet.tsx`, `CheckoutSheet.tsx`, `TransactionsView.tsx`)**
   - Ported `otherspe` UPI parser (`upi://pay`, raw VPA, Bharat QR `0002...`), QR decoder (`jsqr` + `qrcode`), and deep-link launcher (**CRED** + 9 UPI apps with Android `intent://` & iOS schemes).
   - **Optimistic Return Logger:** Tapping any UPI app logs a `pending` transaction and prompts **"Did the Buck clear?"** (`Yes, Mark Paid` / `Nah, Cancelled`) on return.
4. **Viral BuckMe QR & Recipient `/pay` Page (`MyQrSheet.tsx`, `PayPage.tsx`)**
   - `MyQrSheet` saves local UPI ID/name and generates a purple BuckMe QR encoding **`https://<origin>/pay?pa=...`** (never raw `upi://`), with Copy, Share, and Download PNG.
   - `/pay` renders *"You're Bucking [Name]"*, tap-to-flip currency, UPI app buttons, and a *"Want your own BuckMe QR? Create yours →"* viral loop CTA.
5. **Free Virality Analytics (`api/stats.ts`, `src/lib/stats.ts`, `StatsView.tsx`)**
   - Tracks `landing`, `qr_created`, `upi_handoff`, `buck_confirmed`, and `qr_shared` via `/api/stats` (Upstash Redis when env vars are set; automatic in-memory fallback in local dev) + `@vercel/analytics/react`.
   - `/stats` renders an X-screenshot-ready card with Total Landings, People Bucked, QRs Shared, and Buck Rate.
6. **Ralph Harness (`scripts/prd.json`, `scripts/progress.txt`)**
   - Structured user stories (`US-01` through `US-06`) and progress log.

---

## 2. File & Architecture Map

| Path | Purpose |
| :--- | :--- |
| `api/stats.ts` | Vercel serverless function + Vite dev middleware for `/api/stats` |
| `src/lib/upi.ts` | Ported UPI/Bharat QR parser, `buildUpiUri`, INR/USD formatters |
| `src/lib/upi-apps.ts` | Ported `CRED_APP`, `PICKER_APPS`, `buildAppHref`, `buildPaySearch` |
| `src/lib/decode-qr.ts` | Ported `jsqr` image/canvas decoder & `qrcode` generator |
| `src/lib/store.ts` | Zustand store (`localStorage` persisted) for balances, currency, profile, and transactions |
| `src/lib/stats.ts` | Client `fetchStats` / `trackEvent` helpers |
| `src/test/*.test.ts` | Node native unit tests (UPI, store, stats) |
| `tests/smoke.spec.mjs` | Playwright mobile-viewport (`390x844`) smoke test harness |

---

## 3. Environment & Deployment Guide

- **Local Dev:**
  ```bash
  npm install
  npm run dev
  ```
- **Deploy to Vercel (HTTPS required for mobile camera QR scanning):**
  - Push to GitHub and import into Vercel (`vercel.json` handles SPA rewrites + `/api/stats`).
  - **Optional Free Persistence for `/api/stats`:** Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in Vercel Environment Variables (free Upstash Redis tier). Without them, `/api/stats` uses an in-memory fallback.

---

## 4. Verification Results

- `npm run typecheck` (`tsc --noEmit`): **Passed (0 errors)**
- `npm run test` (`node --experimental-strip-types --test src/test/*.test.ts`): **Passed (10/10 tests across 4 suites)**
- `npm run build` (`tsc -b && vite build`): **Passed**
- `npm run test:e2e` (`node tests/smoke.spec.mjs` at `390x844`): **Blocked on this machine** (`Playwright does not support chromium on mac13`; no local Chrome binary at `/Applications/Google Chrome.app`). Run on macOS 14+ / Linux CI / Vercel.

---

## 5. Next-Build Backlog (What’s Needed Next for v2)

1. **Dynamic OG Image for `/pay` Links:** Add a Vercel `@vercel/og` endpoint so sharing a BuckMe `/pay` link on X/WhatsApp shows a rich purple BuckMe preview card with the recipient's name and amount.
2. **Downloadable Full Card PNG:** Currently "Save" downloads the QR PNG; upgrade to `html-to-image` or Canvas composition to export the entire purple BuckMe card frame.
3. **Custom Avatar Upload:** Allow replacing the default `J` / `L` avatars with custom photos.
4. **Sound Effects / Haptics:** Optional subtle cash-register/synth chime on `"Yes, Mark Paid"`.
