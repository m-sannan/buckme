import { useState } from "react";
import { Check, Lock, PiggyBank, X } from "lucide-react";
import { formatInrPretty, formatUsdPretty } from "@/lib/upi";
import type { CurrencySymbol } from "@/lib/store";
import { BruisedBMascot } from "./BuckMeBrand";

export function FamilySavingsCard({
  savings,
  goal,
  currency,
  onFlipCurrency,
  onBuckYourself,
  onViewTransactions,
}: {
  savings: number;
  goal: number;
  currency: CurrencySymbol;
  onFlipCurrency: () => void;
  onBuckYourself: (amount: number) => boolean;
  onViewTransactions: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [customTransfer, setCustomTransfer] = useState("100");
  const [feedback, setFeedback] = useState<string | null>(null);

  const pct = Math.min(100, Math.round((savings / Math.max(1, goal)) * 100));
  const remaining = Math.max(0, goal - savings);
  const fmt = (n: number) =>
    currency === "₹" ? formatInrPretty(n) : formatUsdPretty(n);

  const handleBuckYourself = () => {
    const val = Number(customTransfer);
    if (!Number.isFinite(val) || val <= 0) {
      setFeedback("Enter a valid amount.");
      return;
    }
    const ok = onBuckYourself(val);
    if (ok) {
      setFeedback(`Locked ${currency}${fmt(val)} into Family Savings!`);
    } else {
      setFeedback("Not enough in Checking Account.");
    }
  };

  return (
    <>
      <section className="rounded-3xl border border-purple-200/70 bg-[#EAE8F0] p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="flex w-full cursor-pointer flex-col items-center rounded-2xl bg-[#D8D5E2]/70 py-4 transition hover:bg-[#D8D5E2]"
        >
          <BruisedBMascot className="h-24 w-24" />
        </button>

        <div className="mt-3 flex flex-col items-center">
          <div className="flex items-baseline gap-0.5 text-[#5B21B6]">
            <button
              type="button"
              onClick={onFlipCurrency}
              title="Tap symbol to switch $ / ₹"
              className="cursor-pointer rounded px-1 text-2xl font-extrabold hover:bg-purple-200/60"
            >
              {currency}
            </button>
            <span className="text-3xl font-extrabold tabular-nums">
              {fmt(savings)}
            </span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-[#6D28D9] transition-all duration-300"
              style={{ width: `${Math.max(4, pct)}%` }}
            />
          </div>

          <p className="mt-1.5 text-xs font-medium text-gray-600">
            {remaining === 0
              ? `Goal ${currency}${fmt(goal)} reached!`
              : `${currency}${fmt(remaining)} to next goal`}
          </p>

          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-gray-400/50 bg-white/70 px-4 py-2 text-xs font-bold text-gray-800 transition hover:bg-white"
          >
            <PiggyBank className="h-3.5 w-3.5 text-[#5B21B6]" />
            <span>Family Savings</span>
          </button>
        </div>
      </section>

      {detailOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl bg-[#F8F7FC] p-5 shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#5B21B6]">
                Family Savings
              </h2>
              <button
                type="button"
                onClick={() => {
                  setDetailOpen(false);
                  setFeedback(null);
                }}
                className="cursor-pointer rounded-full p-1.5 text-gray-500 hover:bg-gray-200"
                aria-label="Close Family Savings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 flex flex-col items-center rounded-2xl bg-[#EAE8F0] p-5 text-center">
              <BruisedBMascot className="h-24 w-24" />
              <p className="mt-2 text-3xl font-extrabold text-[#5B21B6] tabular-nums">
                {currency}
                {fmt(savings)}
              </p>
              <span className="mt-1.5 rounded-full border border-purple-300 bg-white px-3 py-0.5 text-xs font-semibold text-[#5B21B6]">
                {remaining === 0 ? "Bucked Dry" : "Locked Vault"}
              </span>

              <div className="mt-4 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6D28D9] text-white">
                  <Check className="h-4 w-4" />
                </span>
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-purple-300 bg-white text-[#6D28D9]"
                  >
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-600">
                {remaining === 0
                  ? "Available goal reached!"
                  : "Funds moved here are permanently locked (GTA rules)."}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={customTransfer}
                onChange={(e) => setCustomTransfer(e.target.value)}
                className="w-28 rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-[#6D28D9]"
                aria-label="Transfer amount"
              />
              <button
                type="button"
                onClick={handleBuckYourself}
                className="flex-1 cursor-pointer rounded-xl bg-[#6D28D9] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#5B21B6] active:scale-[0.98]"
              >
                Buck Yourself
              </button>
            </div>

            {feedback && (
              <p className="mt-2 text-center text-xs font-semibold text-[#5B21B6]">
                {feedback}
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                setDetailOpen(false);
                onViewTransactions();
              }}
              className="mt-3 w-full cursor-pointer rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-bold text-gray-800 transition hover:bg-gray-50"
            >
              View Transactions
            </button>
          </div>
        </div>
      )}
    </>
  );
}
