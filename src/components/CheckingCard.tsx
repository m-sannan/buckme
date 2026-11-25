import React, { useEffect, useRef, useState } from 'react';
import { CreditCard, QrCode, ScanLine } from 'lucide-react';
import { BuckMeLogo } from './BuckMeLogo';

interface CheckingCardProps {
  balance: number;
  currency: '$' | '₹';
  onFlipCurrency: () => void;
  onUpdateBalance: (amount: number) => void;
  onOpenScan: () => void;
  onOpenMyQr: () => void;
}

const formatBalance = (value: number) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export const CheckingCard: React.FC<CheckingCardProps> = ({
  balance,
  currency,
  onFlipCurrency,
  onUpdateBalance,
  onOpenScan,
  onOpenMyQr,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(balance));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      setDraft(String(balance));
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, balance]);

  const commitBalance = () => {
    const cleaned = draft.replace(/[^0-9.]/g, '');
    const parsed = Number(cleaned);
    if (cleaned !== '' && Number.isFinite(parsed) && parsed >= 0) {
      onUpdateBalance(Math.round(parsed));
    }
    setEditing(false);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-lg ring-1 ring-purple-300/40">
      {/* Purple gradient base */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 text-white"
        style={{
          background: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 55%, #9333EA 100%)',
        }}
      >
        {/* Organic abstract purple swirl curves + cropped giant 'b' silhouette matching GTA 6 */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 360 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M-30,40 C55,-20 125,95 205,28 C275,-30 330,45 390,10 L390,175 L-30,175 Z"
            fill="#C4B5FD"
            opacity="0.22"
          />
          <path
            d="M15,180 C85,95 165,45 235,110 C295,165 340,120 390,145 L390,230 L15,230 Z"
            fill="#A78BFA"
            opacity="0.26"
          />
          <path
            d="M-20,120 C45,155 110,75 190,130 C250,170 305,95 385,120 L385,220 L-20,220 Z"
            fill="#DDD6FE"
            opacity="0.12"
          />
          {/* Giant translucent BuckMe 'b' sweep visible in-game behind the card */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M55,-10 L108,-10 C114,-10 118,-4 116,4 L110,42 C122,36 136,32 152,32 C194,32 228,66 228,108 C228,154 191,192 142,196 L128,198 L72,198 C64,198 62,192 66,188 L88,184 C70,172 60,152 60,130 L38,130 C32,130 30,126 30,120 C30,115 34,111 40,111 L62,111 L72,64 L52,64 C46,64 44,60 44,54 C44,49 48,45 54,45 L74,45 L82,8 L48,8 C42,8 40,4 40,-1 C40,-6 44,-10 55,-10 Z M148,68 C124,68 106,86 106,108 C106,130 124,148 148,148 C168,148 184,135 188,116 L172,116 C167,116 164,113 164,108 C164,103 167,100 172,100 L188,100 C184,81 168,68 148,68 Z"
            fill="#FFFFFF"
            opacity="0.14"
          />
        </svg>

        <div className="relative z-10">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BuckMeLogo className="h-6 w-6" color="#FFFFFF" showWordmark={false} />
              <span className="text-sm font-semibold tracking-tight">buckme</span>
            </div>
          </div>

          {/* Balance row */}
          <div className="mt-5 flex items-baseline justify-end gap-0.5">
            <button
              type="button"
              onClick={onFlipCurrency}
              className="inline-flex min-h-[44px] cursor-pointer items-baseline px-1 text-4xl font-bold tabular-nums leading-none text-white/95 hover:text-white"
              aria-label="Flip currency"
            >
              {currency}
            </button>
            {editing ? (
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={draft}
                onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
                onBlur={commitBalance}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitBalance();
                  if (e.key === 'Escape') setEditing(false);
                }}
                aria-label="Checking balance amount"
                className="w-48 max-w-[75%] rounded-xl bg-white/20 px-2.5 py-1 text-right text-4xl font-bold tabular-nums leading-none tracking-tight text-white outline-none ring-2 ring-white/60"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="Edit checking balance"
                title="Click to update balance"
                className="cursor-pointer rounded-xl px-1 py-0.5 text-4xl font-bold tabular-nums leading-none tracking-tight text-white transition hover:bg-white/10"
              >
                {formatBalance(balance)}
              </button>
            )}
          </div>

          {/* Checking Account outlined pill */}
          <div className="mt-4 flex items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-3.5 py-1.5 text-xs font-medium backdrop-blur-sm">
              <CreditCard className="h-3.5 w-3.5" />
              Checking Account
            </div>
          </div>

          {/* Bottom UPI actions */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenScan}
              className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-[#5B21B6] shadow-sm active:scale-[0.98]"
            >
              <ScanLine className="h-4 w-4" />
              Scan & Pay
            </button>
            <button
              type="button"
              onClick={onOpenMyQr}
              className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/15 px-4 text-sm font-semibold text-white backdrop-blur-sm active:scale-[0.98]"
            >
              <QrCode className="h-4 w-4" />
              My BuckMe QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckingCard;
