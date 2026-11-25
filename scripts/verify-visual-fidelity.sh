#!/usr/bin/env bash
# BuckMe Visual Fidelity Verification Harness
# Run after applying ROM changes to check for regressions and visual correctness markers.
#
# Usage: bash scripts/verify-visual-fidelity.sh
# Exit 0 = all checks pass, non-zero = failures listed.

set -euo pipefail
cd "$(dirname "$0")/.."

PASS=0
FAIL=0
WARNINGS=0

pass() { echo "  ✅ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }
warn() { echo "  ⚠️  $1"; WARNINGS=$((WARNINGS + 1)); }

echo ""
echo "═══════════════════════════════════════════"
echo "  BuckMe Visual Fidelity Verification"
echo "═══════════════════════════════════════════"
echo ""

# ─── 0. Build Checks ─────────────────────────
echo "▸ Build Checks"
if npm run typecheck >/dev/null 2>&1; then
  pass "TypeScript typechecks cleanly"
else
  fail "TypeScript has type errors"
fi

TEST_OUTPUT=$(npm run test 2>&1)
if echo "$TEST_OUTPUT" | grep -qE '(fail 0|# fail 0)'; then
  pass "All unit tests pass"
else
  fail "Unit tests have failures"
fi

if npm run build >/dev/null 2>&1; then
  pass "Production build succeeds"
else
  fail "Production build failed"
fi

# ─── 1. Checking Card — Swirl Art (P0) ───────
echo ""
echo "▸ P0: Checking Card Art"

# Should NOT have tiled b watermark pattern
if grep -q 'checking-watermark' src/components/CheckingCard.tsx 2>/dev/null; then
  fail "CheckingCard still uses tiled 'b' watermark pattern (should be organic swirls)"
else
  pass "CheckingCard does NOT have tiled 'b' watermark pattern"
fi

# Should have SVG path(s) for organic swirl shapes
if grep -c '<path' src/components/CheckingCard.tsx 2>/dev/null | grep -qE '[2-9]|[1-9][0-9]'; then
  pass "CheckingCard has multiple SVG paths (likely organic swirls)"
else
  warn "CheckingCard may not have organic swirl SVG paths — check visually"
fi

# Should NOT have "Fleeca Partner"
if grep -q 'Fleeca Partner' src/components/CheckingCard.tsx 2>/dev/null; then
  fail "CheckingCard still shows 'Fleeca Partner' badge (not in GTA 6)"
else
  pass "No 'Fleeca Partner' badge"
fi

# Should NOT have "Tap $ to flip" / "Tap ₹ to flip" hint text
if grep -q 'Tap.*to flip' src/components/CheckingCard.tsx 2>/dev/null; then
  fail "CheckingCard still shows 'Tap to flip' hint (not in GTA 6)"
else
  pass "No 'Tap to flip' hint text"
fi

# ─── 2. Family Savings Layout (P0) ───────────
echo ""
echo "▸ P0: Family Savings Card"

# Should use white/light background, not #EAE8F0
if grep -q 'EAE8F0' src/components/FamilySavingsCard.tsx 2>/dev/null; then
  fail "FamilySavingsCard uses dark gray #EAE8F0 background (should be white)"
else
  pass "FamilySavingsCard does NOT use dark gray background"
fi

if grep -q 'D8D5E2' src/components/FamilySavingsCard.tsx 2>/dev/null; then
  fail "FamilySavingsCard uses dark inner #D8D5E2 background (should be white)"
else
  pass "FamilySavingsCard does NOT use dark inner background"
fi

# Should say "Family Savings" somewhere
if grep -q 'Family Savings' src/components/FamilySavingsCard.tsx 2>/dev/null; then
  pass "FamilySavingsCard includes 'Family Savings' label"
else
  fail "FamilySavingsCard missing 'Family Savings' label"
fi

# Should NOT say "Family Fund — People Bucked" on home card
if grep -q 'People Bucked' src/components/FamilySavingsCard.tsx 2>/dev/null; then
  fail "FamilySavingsCard still says 'People Bucked' (should show dollar amount)"
else
  pass "No 'People Bucked' label on home card"
fi

# ─── 3. BruisedBMascot Shape (P0) ────────────
echo ""
echo "▸ P0: BruisedBMascot Shape"

# Should have an ellipse for the round blob body
if grep -q '<ellipse' src/components/BruisedBMascot.tsx 2>/dev/null; then
  pass "BruisedBMascot uses ellipse (round blob body)"
else
  warn "BruisedBMascot may not have round blob body — check if uses circle or rounded path"
fi

# Should still have band-aid (rect elements)
if grep -q 'Band-aid\|band-aid\|bandaid' src/components/BruisedBMascot.tsx 2>/dev/null; then
  pass "BruisedBMascot has band-aid"
else
  warn "BruisedBMascot may be missing band-aid"
fi

# Should still have coin
if grep -q 'coin\|FBBF24\|F59E0B' src/components/BruisedBMascot.tsx 2>/dev/null; then
  pass "BruisedBMascot has gold coin"
else
  warn "BruisedBMascot may be missing gold coin"
fi

# ─── 4. DualAvatars Colors (P2) ──────────────
echo ""
echo "▸ P2: DualAvatars Colors"

# Should NOT both be purple gradients
PURPLE_COUNT=$(grep -c '7C3AED\|5B21B6\|A78BFA' src/components/DualAvatars.tsx 2>/dev/null || true)
PURPLE_COUNT=${PURPLE_COUNT:-0}
if [ "$PURPLE_COUNT" -gt 2 ]; then
  warn "DualAvatars still uses purple gradients for both circles (should be warm brown + pink)"
else
  pass "DualAvatars uses non-purple colors"
fi

# ─── 5. Real INR Family Savings Flow (P1) ───
echo ""
echo "▸ P1: Real INR Family Savings Flow"

if grep -q 'familySavings: 0' src/lib/store.ts 2>/dev/null; then
  pass "Store initializes familySavings at ₹0"
else
  fail "Store does not initialize familySavings at 0"
fi

if grep -q 'MILESTONES' src/components/FamilySavingsCard.tsx 2>/dev/null; then
  pass "FamilySavingsCard uses dynamic milestone tiers (₹1K → ₹1L)"
else
  fail "FamilySavingsCard missing dynamic MILESTONES"
fi

# ─── 6. No Slop ──────────────────────────────
echo ""
echo "▸ Slop / Copy Checks"

if grep -ri 'virality\|VIRALITY' src/ 2>/dev/null | grep -v node_modules; then
  fail "Found 'virality' copy in source"
else
  pass "No 'virality' copy found"
fi

if grep -ri 'Fleeca Partner' src/ 2>/dev/null | grep -v node_modules; then
  fail "Found 'Fleeca Partner' copy in source"
else
  pass "No 'Fleeca Partner' copy found"
fi

# ─── 7. Logo Consistency ─────────────────────
echo ""
echo "▸ Logo Consistency"

if [ -f public/icon.svg ]; then
  if grep -q 'evenodd\|fillRule\|fill-rule' public/icon.svg 2>/dev/null; then
    pass "Favicon (icon.svg) uses evenodd fill rule (matches BuckMeLogo)"
  else
    warn "Favicon may not match BuckMeLogo vector"
  fi
else
  fail "public/icon.svg missing"
fi

# ─── Summary ─────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo "  Results: $PASS passed, $FAIL failed, $WARNINGS warnings"
echo "═══════════════════════════════════════════"
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
