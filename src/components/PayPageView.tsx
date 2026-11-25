import React from 'react';
import { BuckMeLogo } from './BuckMeLogo';

interface PayPageViewProps {
  recipientName: string;
  vpa: string;
  amount: number;
  note?: string;
  currency: '$' | '₹';
  awaitingReturn: boolean;
  doneMessage: string | null;
  apps: { id: string; label: string }[];
  onFlipCurrency: () => void;
  onLaunchCred: () => void;
  onLaunchApp: (appId: string) => void;
  onLaunchOther: () => void;
  onConfirmPaid: () => void;
  onConfirmCancelled: () => void;
  onCreateOwn: () => void;
}

const formatAmount = (n: number) =>
  new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);

export const PayPageView: React.FC<PayPageViewProps> = ({
  recipientName,
  vpa,
  amount,
  note,
  currency,
  awaitingReturn,
  doneMessage,
  apps,
  onFlipCurrency,
  onLaunchCred,
  onLaunchApp,
  onLaunchOther,
  onConfirmPaid,
  onConfirmCancelled,
  onCreateOwn,
}) => {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-[#F8F7FC] px-4 pb-10 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BuckMeLogo className="h-8 w-8" color="#5B21B6" />
          <span className="text-lg font-semibold tracking-tight text-[#5B21B6]">buckme</span>
        </div>
        <span className="rounded-full bg-[#F3E8FF] px-3 py-1 text-xs font-medium text-[#7C3AED]">
          You’re Bucking
        </span>
      </div>

      {/* Recipient card */}
      <div className="relative overflow-hidden rounded-3xl shadow-md">
        <div
          className="relative overflow-hidden rounded-3xl p-5 text-white"
          style={{
            background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 55%, #9333EA 100%)',
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <svg className="absolute inset-0 h-full w-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="paypage-watermark" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)">
                  <text x="4" y="40" fontSize="28" fontWeight="700" fill="#FFFFFF" fontFamily="system-ui, sans-serif">b</text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#paypage-watermark)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="text-xl font-semibold">{recipientName}</div>
            <div className="mt-0.5 text-sm text-white/75">{vpa}</div>
            {note && <div className="mt-1 text-xs text-white/60">{note}</div>}

            <div className="mt-4 flex items-baseline justify-end gap-0.5">
              <button
                type="button"
                onClick={onFlipCurrency}
                className="inline-flex min-h-[44px] cursor-pointer items-baseline px-1.5 text-3xl font-bold tabular-nums leading-none text-white/95 hover:text-white"
                aria-label="Flip currency"
              >
                {currency}
              </button>
              <span className="text-3xl font-bold tabular-nums leading-none">{formatAmount(amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {doneMessage ? (
        <div className="mt-6 text-center">
          <p className="text-base font-medium text-[#5B21B6]">{doneMessage}</p>
        </div>
      ) : awaitingReturn ? (
        <div className="mt-6 space-y-3">
          <p className="text-center text-base font-medium text-[#5B21B6]">Did the Buck clear?</p>
          <button
            type="button"
            onClick={onConfirmPaid}
            className="flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#5B21B6] text-sm font-semibold text-white"
          >
            Yes, Mark Paid
          </button>
          <button
            type="button"
            onClick={onConfirmCancelled}
            className="flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-[#5B21B6]/30 bg-white text-sm font-semibold text-[#5B21B6]"
          >
            Nah, Cancelled
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={onLaunchCred}
            className="mt-5 flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#1F2937] text-sm font-semibold text-white"
          >
            Pay with CRED
          </button>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {apps.slice(0, 9).map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => onLaunchApp(app.id)}
                className="flex min-h-[44px] items-center justify-center rounded-2xl border border-[#E9D5FF] bg-white px-2 text-xs font-medium text-[#5B21B6] active:scale-[0.98]"
              >
                {app.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onLaunchOther}
            className="mt-2.5 flex min-h-[44px] w-full items-center justify-center rounded-2xl border border-dashed border-[#C4B5FD] bg-white/80 px-4 text-xs font-semibold text-[#5B21B6] active:scale-[0.98]"
          >
            Other UPI App (Open System Drawer)
          </button>
        </>
      )}

      {/* Viral CTA */}
      <button
        type="button"
        onClick={onCreateOwn}
        className="mt-8 flex w-full flex-col items-start rounded-3xl border border-[#E9D5FF] bg-white p-4 text-left shadow-sm active:scale-[0.99]"
      >
        <span className="text-sm font-semibold text-[#5B21B6]">Want your own BuckMe QR?</span>
        <span className="mt-0.5 text-xs text-[#7C3AED]">Create yours →</span>
      </button>
    </div>
  );
};

export default PayPageView;
