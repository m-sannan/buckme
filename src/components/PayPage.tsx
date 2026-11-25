import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { trackEvent } from "@/lib/stats";
import { useBuckMeStore } from "@/lib/store";
import {
  buildUpiUri,
  formatInrPretty,
  formatUsdPretty,
  parseAmount,
  parseUpi,
} from "@/lib/upi";
import {
  buildAppHref,
  buildPaySearch,
  CRED_APP,
  isAndroidUa,
  PICKER_APPS,
  type UpiApp,
} from "@/lib/upi-apps";
import { BuckMeLogo, DualAvatars } from "./BuckMeBrand";

export function PayPage({ onGoHome }: { onGoHome: () => void }) {
  const { checkoutCurrency, flipCheckoutCurrency } = useBuckMeStore();

  const params = useMemo(() => {
    const sp = new URLSearchParams(window.location.search);
    return {
      pa: sp.get("pa") ?? "",
      pn: sp.get("pn") ?? "",
      am: sp.get("am") ?? "",
      tn: sp.get("tn") ?? "",
      tr: sp.get("tr") ?? "",
      mc: sp.get("mc") ?? "",
    };
  }, []);

  const payload = useMemo(() => {
    if (!params.pa) return null;
    const raw = `upi://pay?${buildPaySearch({
      vpa: params.pa,
      name: params.pn,
      amount: parseAmount(params.am),
      note: params.tn,
      mcc: params.mc,
      txnRef: params.tr,
    })}`;
    const res = parseUpi(raw);
    return res.ok ? res.payload : null;
  }, [params]);

  const [amountInput, setAmountInput] = useState(params.am || "");
  const numericAmount = parseAmount(amountInput);
  const android = typeof navigator !== "undefined" && isAndroidUa(navigator.userAgent);

  useEffect(() => {
    void trackEvent("landing");
  }, []);

  const launchApp = (app: UpiApp) => {
    if (!payload || !numericAmount) return;
    const upiUri = buildUpiUri({
      vpa: payload.vpa,
      name: payload.name,
      amount: numericAmount,
      note: payload.note,
      mcc: payload.mcc,
      txnRef: payload.txnRef,
    });
    void trackEvent("upi_handoff");
    window.location.href = buildAppHref(upiUri, app, android);
  };

  if (!payload) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-8">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <BuckMeLogo className="mx-auto h-12 w-12" />
          <h1 className="mt-3 text-lg font-extrabold text-[#5B21B6]">
            Invalid BuckMe Link
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            This BuckMe payment link is missing a valid UPI ID.
          </p>
          <button
            type="button"
            onClick={onGoHome}
            className="mt-4 w-full cursor-pointer rounded-xl bg-[#6D28D9] py-2.5 text-sm font-bold text-white"
          >
            Open BuckMe Home
          </button>
        </div>
      </div>
    );
  }

  const displayAmount = numericAmount
    ? checkoutCurrency === "₹"
      ? formatInrPretty(numericAmount)
      : formatUsdPretty(numericAmount)
    : "0";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5">
      {/* Header */}
      <header className="flex items-center justify-between pb-4">
        <button
          type="button"
          onClick={onGoHome}
          className="flex cursor-pointer items-center gap-1.5"
        >
          <BuckMeLogo className="h-7 w-7" />
          <span className="text-base font-extrabold text-[#5B21B6]">buckme</span>
        </button>
        <DualAvatars />
      </header>

      {/* Main Card */}
      <section className="buckme-gradient buckme-pattern rounded-3xl p-5 text-white shadow-lg">
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
          You&apos;re Bucking
        </span>
        <h1 className="mt-2 text-2xl font-extrabold">{payload.name}</h1>
        <p className="break-all text-xs text-purple-200">{payload.vpa}</p>
        {payload.note ? (
          <p className="mt-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs text-purple-100">
            &ldquo;{payload.note}&rdquo;
          </p>
        ) : null}

        <div className="mt-4 flex items-baseline gap-1">
          <button
            type="button"
            onClick={flipCheckoutCurrency}
            title="Tap symbol to flip ₹ / $"
            className="cursor-pointer rounded px-1 text-3xl font-extrabold hover:bg-white/20"
          >
            {checkoutCurrency}
          </button>
          <span className="text-4xl font-extrabold tabular-nums">
            {displayAmount}
          </span>
        </div>
        {checkoutCurrency === "$" && numericAmount ? (
          <p className="mt-0.5 text-[11px] text-purple-100">
            UPI sends ₹{formatInrPretty(numericAmount)}
          </p>
        ) : null}
      </section>

      {!params.am && (
        <div className="mt-4 rounded-2xl border border-purple-200 bg-white p-3.5">
          <label className="text-xs font-bold text-gray-600">
            Enter Amount (INR)
          </label>
          <input
            type="number"
            min="1"
            max="500000"
            step="0.01"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder="₹500"
            className="mt-1.5 w-full rounded-xl border border-purple-200 bg-[#F8F7FC] px-3 py-2.5 text-base font-extrabold text-gray-900 outline-none focus:border-[#6D28D9]"
          />
        </div>
      )}

      {/* UPI App Buttons */}
      <div className="mt-4 rounded-3xl border border-purple-200/70 bg-white p-4 shadow-sm">
        <p className="mb-2.5 text-xs font-bold text-gray-600">
          Tap a UPI app to pay
        </p>
        <button
          type="button"
          disabled={!numericAmount}
          onClick={() => launchApp(CRED_APP)}
          className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-[#1F2937] px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span>Pay with {CRED_APP.label}</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>

        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {PICKER_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              disabled={!numericAmount}
              onClick={() => launchApp(app)}
              className="cursor-pointer rounded-xl border border-purple-200 bg-[#F8F7FC] px-2 py-2.5 text-xs font-bold text-gray-800 transition hover:border-[#6D28D9] hover:text-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {app.label}
            </button>
          ))}
        </div>
      </div>

      {/* Viral Loop CTA */}
      <button
        type="button"
        onClick={onGoHome}
        className="mt-auto flex w-full cursor-pointer items-center justify-center gap-1.5 pt-6 pb-2 text-xs font-extrabold text-[#6D28D9] hover:underline"
      >
        <span>Want your own BuckMe QR? Create yours</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
