import { ArrowLeft, CheckCircle2, Clock, Trash2, XCircle } from "lucide-react";
import { useBuckMeStore } from "@/lib/store";
import { formatInrPretty } from "@/lib/upi";

export function TransactionsView({ onBack }: { onBack: () => void }) {
  const { transactions, resolveTx, clearTransactions } = useBuckMeStore();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-5">
      <header className="flex items-center justify-between pb-4">
        <button
          type="button"
          onClick={onBack}
          className="flex cursor-pointer items-center gap-1.5 text-sm font-bold text-[#5B21B6]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <h1 className="text-base font-extrabold text-[#5B21B6]">Transactions</h1>
        {transactions.length > 0 ? (
          <button
            type="button"
            onClick={clearTransactions}
            aria-label="Clear transactions"
            className="cursor-pointer rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : (
          <span className="w-7" />
        )}
      </header>

      {transactions.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-purple-200/70 bg-white p-8 text-center">
          <p className="text-sm font-extrabold text-[#5B21B6]">
            No Bucks logged yet
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Scan a UPI QR from Home and launch a UPI app to see your log here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="rounded-2xl border border-purple-200/70 bg-white p-3.5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-gray-900">
                    {tx.name}
                  </p>
                  <p className="truncate text-[11px] text-gray-500">{tx.vpa}</p>
                  <p className="mt-1 text-[10px] text-gray-400">
                    via {tx.appLabel} • {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-[#5B21B6] tabular-nums">
                    -₹{formatInrPretty(tx.amount)}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#F8F7FC] px-2 py-0.5 text-[10px] font-bold capitalize text-gray-700">
                    {tx.status === "confirmed" && (
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    )}
                    {tx.status === "pending" && (
                      <Clock className="h-3 w-3 text-amber-500" />
                    )}
                    {tx.status === "cancelled" && (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    {tx.status}
                  </span>
                </div>
              </div>

              {tx.status === "pending" && (
                <div className="mt-2.5 flex gap-2 border-t border-purple-100 pt-2">
                  <button
                    type="button"
                    onClick={() => resolveTx(tx.id, "confirmed")}
                    className="flex-1 cursor-pointer rounded-lg bg-[#6D28D9] py-1.5 text-[11px] font-bold text-white"
                  >
                    Mark Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => resolveTx(tx.id, "cancelled")}
                    className="flex-1 cursor-pointer rounded-lg border border-gray-300 py-1.5 text-[11px] font-bold text-gray-700"
                  >
                    Cancelled
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
