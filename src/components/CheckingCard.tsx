import { CreditCard } from "lucide-react";
import { formatInrPretty, formatUsdPretty } from "@/lib/upi";
import type { CurrencySymbol } from "@/lib/store";

export function CheckingCard({
  balance,
  currency,
  onFlipCurrency,
  onOpenScan,
  onOpenMyQr,
}: {
  balance: number;
  currency: CurrencySymbol;
  onFlipCurrency: () => void;
  onOpenScan: () => void;
  onOpenMyQr: () => void;
}) {
  const formatted =
    currency === "₹" ? formatInrPretty(balance) : formatUsdPretty(balance);

  return (
    <section className="buckme-gradient buckme-pattern relative overflow-hidden rounded-3xl p-5 text-white shadow-lg shadow-purple-900/15">
      <div className="flex items-start justify-between">
        <span className="text-xl font-extrabold tracking-tight text-white/95">
          buckme
        </span>
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-purple-100 backdrop-blur-sm">
          FLEECA PARTNER
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-end gap-1">
        <button
          type="button"
          onClick={onFlipCurrency}
          title="Tap symbol to switch $ / ₹"
          aria-label="Switch currency symbol"
          className="cursor-pointer rounded-lg px-1.5 py-0.5 text-3xl font-extrabold tracking-tight text-white transition hover:bg-white/20 active:scale-95"
        >
          {currency}
        </button>
        <span className="text-4xl font-extrabold tracking-tight tabular-nums">
          {formatted}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white">
          <CreditCard className="h-3.5 w-3.5" />
          <span>Checking Account</span>
        </div>
        <span className="text-[11px] text-purple-100/80">
          Tap {currency} to flip
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onOpenScan}
          className="cursor-pointer rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#5B21B6] shadow-sm transition hover:bg-purple-50 active:scale-[0.98]"
        >
          Scan &amp; Pay
        </button>
        <button
          type="button"
          onClick={onOpenMyQr}
          className="cursor-pointer rounded-2xl border border-white/35 bg-white/15 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/25 active:scale-[0.98]"
        >
          My BuckMe QR
        </button>
      </div>
    </section>
  );
}
