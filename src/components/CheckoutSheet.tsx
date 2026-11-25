import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, X, XCircle } from "lucide-react";
import { trackEvent } from "@/lib/stats";
import { useBuckMeStore } from "@/lib/store";
import { buildUpiUri, formatInrPretty, formatUsdPretty, parseAmount, type UpiPayload } from "@/lib/upi";
import { buildAppHref, CRED_APP, isAndroidUa, PICKER_APPS, type UpiApp } from "@/lib/upi-apps";

export function CheckoutSheet({
  payload,
  onClose,
}: {
  payload: UpiPayload;
  onClose: () => void;
}) {
  const {
    checkoutCurrency,
    flipCheckoutCurrency,
    addPendingTx,
    resolveTx,
    activePendingId,
  } = useBuckMeStore();

  const [amountInput, setAmountInput] = useState(
    payload.amount ? String(payload.amount) : "",
  );
  const [noteInput, setNoteInput] = useState(payload.note || "");
  const [awaitingReturn, setAwaitingReturn] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  const numericAmount = parseAmount(amountInput);
  const android = typeof navigator !== "undefined" && isAndroidUa(navigator.userAgent);

  useEffect(() => {
    if (!awaitingReturn) return;
    const onVis = () => {
      if (document.visibilityState === "visible") {
        // Prompt stays visible for user to confirm
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [awaitingReturn]);

  const launchApp = (app: UpiApp) => {
    if (!numericAmount) return;
    const upiUri = buildUpiUri({
      vpa: payload.vpa,
      name: payload.name,
      amount: numericAmount,
      note: noteInput,
      mcc: payload.mcc,
      txnRef: payload.txnRef,
    });
    const txId = addPendingTx({
      vpa: payload.vpa,
      name: payload.name,
      amount: numericAmount,
      note: noteInput,
      appLabel: app.label,
    });
    setPendingId(txId);
    setAwaitingReturn(true);
    void trackEvent("upi_handoff");

    const href = buildAppHref(upiUri, app, android);
    window.location.href = href;
  };

  const handleConfirm = (status: "confirmed" | "cancelled") => {
    const id = pendingId ?? activePendingId;
    if (id) resolveTx(id, status);
    if (status === "confirmed") {
      void trackEvent("buck_confirmed");
      setDoneMessage(`Bucked ₹${formatInrPretty(numericAmount ?? 0)} to ${payload.name}!`);
    } else {
      setDoneMessage("Marked as cancelled.");
    }
    setAwaitingReturn(false);
  };

  const displayAmount = numericAmount
    ? checkoutCurrency === "₹"
      ? formatInrPretty(numericAmount)
      : formatUsdPretty(numericAmount)
    : "0";

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[#F8F7FC] p-5 shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold tracking-wider text-[#6D28D9] uppercase">
            BuckMe Checkout
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="cursor-pointer rounded-full p-1.5 text-gray-500 hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Recipient Card */}
        <div className="buckme-gradient buckme-pattern mt-3 rounded-2xl p-4 text-white">
          <p className="text-xs font-medium text-purple-100">Bucking</p>
          <p className="text-lg font-extrabold">{payload.name}</p>
          <p className="break-all text-xs text-purple-200">{payload.vpa}</p>

          <div className="mt-3 flex items-baseline gap-1">
            <button
              type="button"
              onClick={flipCheckoutCurrency}
              title="Tap symbol to flip ₹ / $"
              className="cursor-pointer rounded px-1 text-2xl font-extrabold hover:bg-white/20"
            >
              {checkoutCurrency}
            </button>
            <span className="text-3xl font-extrabold tabular-nums">
              {displayAmount}
            </span>
          </div>
          {checkoutCurrency === "$" && numericAmount ? (
            <p className="mt-0.5 text-[11px] text-purple-100">
              UPI transfer sends ₹{formatInrPretty(numericAmount)}
            </p>
          ) : null}
        </div>

        {doneMessage ? (
          <div className="mt-4 rounded-2xl border border-purple-200 bg-white p-4 text-center">
            <p className="text-sm font-extrabold text-[#5B21B6]">{doneMessage}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full cursor-pointer rounded-xl bg-[#6D28D9] py-2.5 text-sm font-bold text-white"
            >
              Back to BuckMe
            </button>
          </div>
        ) : awaitingReturn ? (
          <div className="mt-4 rounded-2xl border border-purple-200 bg-white p-4 text-center">
            <p className="text-sm font-extrabold text-[#5B21B6]">
              Did the Buck clear?
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Confirm whether your UPI payment went through so we can log it.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleConfirm("confirmed")}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#6D28D9] py-2.5 text-xs font-bold text-white hover:bg-[#5B21B6]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Yes, Mark Paid</span>
              </button>
              <button
                type="button"
                onClick={() => handleConfirm("cancelled")}
                className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-gray-300 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                <XCircle className="h-4 w-4" />
                <span>Nah, Cancelled</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Amount & Note */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-bold text-gray-600">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  min="1"
                  max="500000"
                  step="0.01"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="Enter ₹"
                  className="mt-1 w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm font-bold text-gray-900 outline-none focus:border-[#6D28D9]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-600">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Leonida bail"
                  className="mt-1 w-full rounded-xl border border-purple-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-900 outline-none focus:border-[#6D28D9]"
                />
              </div>
            </div>

            {/* UPI App Buttons */}
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold text-gray-600">
                Pay with UPI app
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

              <div className="mt-2 grid grid-cols-3 gap-2">
                {PICKER_APPS.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    disabled={!numericAmount}
                    onClick={() => launchApp(app)}
                    className="cursor-pointer rounded-xl border border-purple-200 bg-white px-2 py-2.5 text-xs font-bold text-gray-800 transition hover:border-[#6D28D9] hover:text-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {app.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
