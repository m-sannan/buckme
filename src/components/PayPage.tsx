import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/stats";
import { useBuckMeStore } from "@/lib/store";
import { buildUpiUri, formatInrPretty, parseAmount, parseUpi } from "@/lib/upi";
import {
  buildAppHref,
  buildPaySearch,
  CRED_APP,
  isAndroidUa,
  OTHER_UPI_APP,
  PICKER_APPS,
  type UpiApp,
} from "@/lib/upi-apps";
import { BuckMeLogo } from "./BuckMeLogo";
import { PayPageView } from "./PayPageView";

export function PayPage({ onGoHome }: { onGoHome: () => void }) {
  const {
    checkoutCurrency,
    flipCheckoutCurrency,
    addPendingTx,
    resolveTx,
    activePendingId,
  } = useBuckMeStore();

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

  const [awaitingReturn, setAwaitingReturn] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const numericAmount = payload?.amount ?? 0;
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
    const txId = addPendingTx({
      vpa: payload.vpa,
      name: payload.name,
      amount: numericAmount,
      note: payload.note,
      appLabel: app.label,
    });
    setPendingId(txId);
    setAwaitingReturn(true);
    void trackEvent("upi_handoff");
    window.location.href = buildAppHref(upiUri, app, android);
  };

  if (!payload) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center bg-[#F8F7FC] px-5 py-8">
        <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
          <BuckMeLogo className="mx-auto h-12 w-12" color="#5B21B6" />
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

  return (
    <PayPageView
      recipientName={payload.name}
      vpa={payload.vpa}
      amount={numericAmount}
      note={payload.note}
      currency={checkoutCurrency}
      awaitingReturn={awaitingReturn}
      doneMessage={doneMessage}
      apps={PICKER_APPS}
      onFlipCurrency={flipCheckoutCurrency}
      onLaunchCred={() => launchApp(CRED_APP)}
      onLaunchApp={(appId) => {
        const app = PICKER_APPS.find((a) => a.id === appId);
        if (app) launchApp(app);
      }}
      onLaunchOther={() => launchApp(OTHER_UPI_APP)}
      onConfirmPaid={() => {
        const id = pendingId ?? activePendingId;
        if (id) resolveTx(id, "confirmed");
        void trackEvent("buck_confirmed");
        setAwaitingReturn(false);
        setDoneMessage(`Bucked ₹${formatInrPretty(numericAmount)} to ${payload.name}!`);
      }}
      onConfirmCancelled={() => {
        const id = pendingId ?? activePendingId;
        if (id) resolveTx(id, "cancelled");
        setAwaitingReturn(false);
        setDoneMessage("Marked as cancelled.");
      }}
      onCreateOwn={onGoHome}
    />
  );
}
