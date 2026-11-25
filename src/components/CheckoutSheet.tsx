import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/stats";
import { useBuckMeStore } from "@/lib/store";
import { buildUpiUri, formatInrPretty, parseAmount, type UpiPayload } from "@/lib/upi";
import { buildAppHref, CRED_APP, isAndroidUa, OTHER_UPI_APP, PICKER_APPS, type UpiApp } from "@/lib/upi-apps";
import { CheckoutSheetView } from "./CheckoutSheetView";

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

    window.location.href = buildAppHref(upiUri, app, android);
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

  return (
    <CheckoutSheetView
      recipientName={payload.name}
      vpa={payload.vpa}
      amount={amountInput}
      note={noteInput}
      currency={checkoutCurrency}
      awaitingReturn={awaitingReturn}
      doneMessage={doneMessage}
      apps={PICKER_APPS}
      onAmountChange={setAmountInput}
      onNoteChange={setNoteInput}
      onFlipCurrency={flipCheckoutCurrency}
      onLaunchCred={() => launchApp(CRED_APP)}
      onLaunchApp={(appId) => {
        const app = PICKER_APPS.find((a) => a.id === appId);
        if (app) launchApp(app);
      }}
      onLaunchOther={() => launchApp(OTHER_UPI_APP)}
      onConfirmPaid={() => handleConfirm("confirmed")}
      onConfirmCancelled={() => handleConfirm("cancelled")}
      onClose={onClose}
    />
  );
}
