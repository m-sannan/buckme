import React from 'react';
import { X } from 'lucide-react';
import { BuckMeLogo } from './BuckMeLogo';

interface CheckoutSheetProps {
  recipientName: string;
  vpa: string;
  amount: string;
  note: string;
  currency: '$' | '₹';
  awaitingReturn: boolean;
  doneMessage: string | null;
  apps: { id: string; label: string }[];
  onAmountChange: (v: string) => void;
  onNoteChange: (v: string) => void;
  onFlipCurrency: () => void;
  onLaunchCred: () => void;
  onLaunchApp: (appId: string) => void;
  onLaunchOther: () => void;
  onConfirmPaid: () => void;
  onConfirmCancelled: () => void;
  onClose: () => void;
}

const formatAmount = (raw: string) => {
  const n = Number(raw.replace(/[^0-9.]/g, '')) || 0;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
};

export const CheckoutSheetView: React.FC<CheckoutSheetProps> = ({
  recipientName,
  vpa,
  amount,
  note,
  currency,
  awaitingReturn,
  doneMessage,
  apps,
  onAmountChange,
  onNoteChange,
  onFlipCurrency,
  onLaunchCred,
  onLaunchApp,
  onLaunchOther,
  onConfirmPaid,
  onConfirmCancelled,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#F8F7FC] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#5B21B6]">Buck Someone</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5B21B6] shadow-sm"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Recipient card with layered gradient + watermark */}
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
                  <pattern id="checkout-watermark" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)">
                    <text x="4" y="40" fontSize="28" fontWeight="700" fill="#FFFFFF" fontFamily="system-ui, sans-serif">b</text>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#checkout-watermark)" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/80">
                <BuckMeLogo className="h-5 w-5" color="#FFFFFF" />
                Bucking
              </div>
              <div className="text-xl font-semibold">{recipientName}</div>
              <div className="mt-0.5 text-sm text-white/75">{vpa}</div>

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
            <button
              type="button"
              onClick={onClose}
              className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#5B21B6] text-sm font-semibold text-white"
            >
              Back to BuckMe
            </button>
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
            <div className="mt-5 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#5B21B6]/70">Amount (INR)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => onAmountChange(e.target.value)}
                  className="min-h-[44px] w-full rounded-2xl border border-[#E9D5FF] bg-white px-4 text-base tabular-nums outline-none focus:border-[#7C3AED]"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#5B21B6]/70">Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => onNoteChange(e.target.value)}
                  className="min-h-[44px] w-full rounded-2xl border border-[#E9D5FF] bg-white px-4 text-base outline-none focus:border-[#7C3AED]"
                  placeholder="Leonida bail"
                />
              </div>
            </div>

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
      </div>
    </div>
  );
};

export default CheckoutSheetView;
