import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, CheckCircle2, Lock, PiggyBank } from 'lucide-react';
import type { BuckTransaction, CurrencySymbol } from '@/lib/store';
import { formatInrPretty } from '@/lib/upi';
import { BruisedBMascot } from './BruisedBMascot';

const MILESTONES = [1000, 5000, 10000, 50000, 100000] as const;

const MASCOT_QUIPS = [
  "Stop poking, I'm already bruised.",
  "Pocket cash drops on Wasted. UPI doesn't.",
  'Still 0% MDR in Leonida.',
  'Checking stays safe. Even in Vice City.',
] as const;

interface FamilySavingsCardProps {
  familySavings: number;
  currency: CurrencySymbol;
  peopleBucked: number;
  confirmedTxs: BuckTransaction[];
  onScanAndPay: () => void;
  onViewTransactions: () => void;
}

const formatCount = (n: number) =>
  new Intl.NumberFormat('en-US').format(n);

const formatCompactInr = (n: number) => {
  if (n >= 100000) return `${n / 100000}L`;
  if (n >= 1000) return `${n / 1000}K`;
  return String(n);
};

export const FamilySavingsCard: React.FC<FamilySavingsCardProps> = ({
  familySavings,
  currency,
  peopleBucked,
  confirmedTxs,
  onScanAndPay,
  onViewTransactions,
}) => {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [quipIndex, setQuipIndex] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleMascotTap = () => {
    setQuipIndex((prev) => (prev === null ? 0 : (prev + 1) % MASCOT_QUIPS.length));
    setBouncing(true);
    setTimeout(() => setBouncing(false), 180);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setQuipIndex(null), 2400);
  };

  const nextGoal =
    MILESTONES.find((m) => familySavings < m) ?? MILESTONES[MILESTONES.length - 1];
  const progress = Math.min(100, (familySavings / nextGoal) * 100);
  const allMilestonesCleared = familySavings >= MILESTONES[MILESTONES.length - 1];

  return (
    <>
      <div className="rounded-3xl border border-[#E9D5FF]/70 bg-white p-4 shadow-sm">
        {/* Soft rounded mascot stage with Easter egg tap bubble */}
        <div className="relative flex items-center justify-center rounded-2xl bg-[#F3F1F8] py-4">
          {quipIndex !== null && (
            <div className="pointer-events-none absolute top-2 z-10 max-w-[85%] rounded-full border border-[#DDD6FE] bg-white px-3 py-1 text-center text-[11px] font-semibold text-[#5B21B6] shadow-sm">
              {MASCOT_QUIPS[quipIndex]}
            </div>
          )}
          <button
            type="button"
            onClick={handleMascotTap}
            aria-label="Poke BuckMe mascot"
            className={`cursor-pointer rounded-full transition-transform duration-150 focus:outline-none ${
              bouncing ? 'scale-110' : 'hover:scale-105 active:scale-95'
            }`}
          >
            <BruisedBMascot
              variant={allMilestonesCleared ? 'sad' : 'bruised'}
              className="h-24 w-24"
            />
          </button>
        </div>

        {/* Real lifetime UPI total */}
        <div className="mt-3 text-center">
          <div className="text-3xl font-bold tabular-nums text-[#5B21B6]">
            {currency}
            {formatInrPretty(familySavings)}
          </div>
        </div>

        {/* Dynamic milestone progress bar */}
        <div className="mt-3">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#EDE9FE]">
            <div
              className="h-full rounded-full bg-[#6D28D9] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1.5 text-center text-xs font-medium text-[#6B7280]">
            Goal {currency}
            {formatCompactInr(nextGoal)}
          </div>
        </div>

        {/* Outlined Family Savings pill opening personal summary */}
        <button
          type="button"
          onClick={() => setSummaryOpen(true)}
          className="mt-3 flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-full border border-[#D8B4FE]/80 bg-white px-4 text-sm font-medium text-[#374151] transition hover:border-[#7C3AED] active:scale-[0.99]"
        >
          <span className="inline-flex items-center gap-2 font-semibold text-[#374151]">
            <PiggyBank className="h-4 w-4 text-[#5B21B6]" />
            Family Savings
          </span>
          <span className="text-xs font-semibold tabular-nums text-[#7C3AED]">
            {formatCount(peopleBucked)} bucked
          </span>
        </button>
      </div>

      {summaryOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#F8F7FC] p-5 shadow-xl sm:rounded-3xl">
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSummaryOpen(false)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white text-[#5B21B6] shadow-sm"
                aria-label="Close"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-[#5B21B6]">Family Savings</h2>
            </div>

            <div className="rounded-3xl border border-[#E9D5FF] bg-white p-5 text-center shadow-sm">
              <BruisedBMascot
                variant={allMilestonesCleared ? 'sad' : 'bruised'}
                className="mx-auto h-24 w-24"
              />
              <p className="mt-2 text-xs font-medium text-[#6B7280]">
                Total ₹ Bucked Through BuckMe
              </p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-[#5B21B6]">
                ₹{formatInrPretty(familySavings)}
              </p>
              <p className="mt-1 text-xs font-semibold text-[#7C3AED]">
                {confirmedTxs.length} confirmed UPI{' '}
                {confirmedTxs.length === 1 ? 'payment' : 'payments'}
              </p>

              {/* Milestone ladder ₹1K → ₹1L */}
              <div className="mt-5 grid grid-cols-5 gap-1.5">
                {MILESTONES.map((m) => {
                  const unlocked = familySavings >= m;
                  return (
                    <div key={m} className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          unlocked
                            ? 'bg-[#5B21B6] text-white'
                            : 'border border-[#DDD6FE] bg-[#F8F7FC] text-[#A78BFA]'
                        }`}
                      >
                        {unlocked ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Lock className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <span className="mt-1 text-[11px] font-bold tabular-nums text-[#5B21B6]">
                        ₹{formatCompactInr(m)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent confirmed payments */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#5B21B6]/70">
                Recent Confirmed
              </p>
              {confirmedTxs.length === 0 ? (
                <div className="rounded-2xl border border-[#E9D5FF] bg-white p-4 text-center text-xs text-[#6B7280]">
                  Scan a QR and mark your payment as paid to grow your Family Savings counter.
                </div>
              ) : (
                <div className="space-y-2">
                  {confirmedTxs.slice(0, 3).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-2xl border border-[#E9D5FF] bg-white px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#111827]">
                          {tx.name}
                        </p>
                        <p className="truncate text-[11px] text-[#6B7280]">
                          via {tx.appLabel}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-bold tabular-nums text-[#5B21B6]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        ₹{formatInrPretty(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setSummaryOpen(false);
                  onScanAndPay();
                }}
                className="buckme-gradient flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-sm active:scale-[0.99]"
              >
                Scan & Pay Now
              </button>
              <button
                type="button"
                onClick={() => {
                  setSummaryOpen(false);
                  onViewTransactions();
                }}
                className="flex min-h-[46px] w-full cursor-pointer items-center justify-center rounded-2xl border border-[#DDD6FE] bg-white text-sm font-semibold text-[#5B21B6] active:scale-[0.99]"
              >
                View All Transactions
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FamilySavingsCard;
