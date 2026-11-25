import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatInrPretty, formatUsdPretty } from "./upi.ts";

export type CurrencySymbol = "$" | "₹";
export type TxStatus = "pending" | "confirmed" | "cancelled";

export type BuckTransaction = {
  id: string;
  createdAt: number;
  vpa: string;
  name: string;
  amount: number;
  note: string;
  appLabel: string;
  status: TxStatus;
};

export type UserProfile = {
  vpa: string;
  name: string;
  defaultAmount: string;
  defaultNote: string;
};

export type BuckMeState = {
  checkingBalance: number;
  familySavings: number;
  familyGoal: number;
  /** Home & Savings display currency (tap symbol to flip $ <-> ₹) */
  homeCurrency: CurrencySymbol;
  /** Checkout display currency (defaults to ₹ for Mix mode) */
  checkoutCurrency: CurrencySymbol;
  profile: UserProfile;
  transactions: BuckTransaction[];
  activePendingId: string | null;

  flipHomeCurrency: () => void;
  flipCheckoutCurrency: () => void;
  setProfile: (profile: UserProfile) => void;
  addPendingTx: (tx: Omit<BuckTransaction, "id" | "createdAt" | "status">) => string;
  resolveTx: (id: string, status: "confirmed" | "cancelled") => void;
  clearTransactions: () => void;
  buckYourself: (amount: number) => boolean;
  setCheckingBalance: (amount: number) => void;
};

export function formatBySymbol(amount: number, symbol: CurrencySymbol): string {
  return symbol === "₹"
    ? `₹${formatInrPretty(amount)}`
    : `$${formatUsdPretty(amount)}`;
}

export const useBuckMeStore = create<BuckMeState>()(
  persist(
    (set, get) => ({
      checkingBalance: 1410,
      familySavings: 0,
      familyGoal: 5000,
      homeCurrency: "₹",
      checkoutCurrency: "₹",
      profile: {
        vpa: "",
        name: "",
        defaultAmount: "",
        defaultNote: "For Leonida bail",
      },
      transactions: [],
      activePendingId: null,

      flipHomeCurrency: () =>
        set((s) => ({ homeCurrency: s.homeCurrency === "$" ? "₹" : "$" })),

      flipCheckoutCurrency: () =>
        set((s) => ({ checkoutCurrency: s.checkoutCurrency === "₹" ? "$" : "₹" })),

      setProfile: (profile) => set({ profile }),

      addPendingTx: (tx) => {
        const id = `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        const entry: BuckTransaction = {
          ...tx,
          id,
          createdAt: Date.now(),
          status: "pending",
        };
        set((s) => ({
          transactions: [entry, ...s.transactions].slice(0, 50),
          activePendingId: id,
        }));
        return id;
      },

      resolveTx: (id, status) =>
        set((s) => {
          const target = s.transactions.find((t) => t.id === id);
          const shouldAdd =
            status === "confirmed" && target && target.status !== "confirmed";
          return {
            transactions: s.transactions.map((t) =>
              t.id === id ? { ...t, status } : t,
            ),
            familySavings: shouldAdd
              ? Math.round((s.familySavings + target.amount) * 100) / 100
              : s.familySavings,
            activePendingId: s.activePendingId === id ? null : s.activePendingId,
          };
        }),

      clearTransactions: () => set({ transactions: [], activePendingId: null }),

      buckYourself: (amount) => {
        const { checkingBalance } = get();
        if (amount <= 0 || amount > checkingBalance) return false;
        set((s) => ({
          checkingBalance: Math.round((s.checkingBalance - amount) * 100) / 100,
          familySavings: Math.round((s.familySavings + amount) * 100) / 100,
        }));
        return true;
      },

      setCheckingBalance: (amount) =>
        set({ checkingBalance: Math.max(0, amount) }),
    }),
    {
      name: "buckme-upi-storage-v1",
      version: 3,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<BuckMeState>;
        const txs = Array.isArray(state.transactions) ? state.transactions : [];
        const confirmedTotal = txs
          .filter((t) => t.status === "confirmed")
          .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        return {
          ...state,
          checkingBalance: 1410,
          homeCurrency: "₹",
          familySavings: Math.round(confirmedTotal * 100) / 100,
        };
      },
    },
  ),
);
