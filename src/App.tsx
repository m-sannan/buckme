import { useCallback, useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { BarChart3, History } from "lucide-react";
import { fetchStats, trackEvent, type StatsSnapshot } from "@/lib/stats";
import { useBuckMeStore } from "@/lib/store";
import type { UpiPayload } from "@/lib/upi";
import { BuckMeLogo } from "./components/BuckMeLogo";
import { CheckingCard } from "./components/CheckingCard";
import { CheckoutSheet } from "./components/CheckoutSheet";
import { DualAvatars } from "./components/DualAvatars";
import { FamilySavingsCard } from "./components/FamilySavingsCard";
import { FaqAccordion } from "./components/FaqAccordion";
import { MyQrSheet } from "./components/MyQrSheet";
import { PayPage } from "./components/PayPage";
import { QrScannerSheet } from "./components/QrScannerSheet";
import { SplashOverlay } from "./components/SplashOverlay";
import { StatsView } from "./components/StatsView";
import { TransactionsView } from "./components/TransactionsView";

type RoutePath = "/" | "/pay" | "/transactions" | "/stats";

function resolveRoute(): RoutePath {
  const p = window.location.pathname;
  if (p.startsWith("/pay")) return "/pay";
  if (p.startsWith("/transactions")) return "/transactions";
  if (p.startsWith("/stats")) return "/stats";
  return "/";
}

export function App() {
  const [route, setRoute] = useState<RoutePath>(() => resolveRoute());
  const [showSplash, setShowSplash] = useState(() => resolveRoute() === "/");
  const [scanOpen, setScanOpen] = useState(false);
  const [myQrOpen, setMyQrOpen] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState<UpiPayload | null>(null);
  const [stats, setStats] = useState<StatsSnapshot | null>(null);

  const {
    checkingBalance,
    familySavings,
    homeCurrency,
    flipHomeCurrency,
    setCheckingBalance,
    transactions,
  } = useBuckMeStore();

  const confirmedTxs = transactions.filter((t) => t.status === "confirmed");

  const refreshStats = useCallback(async () => {
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      /* ignore local/offline error */
    }
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(resolveRoute());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (route === "/") {
      void trackEvent("landing").then((snap) => {
        if (snap) setStats(snap);
        else void refreshStats();
      });
      const t = setTimeout(() => setShowSplash(false), 1250);
      return () => clearTimeout(t);
    }
  }, [route, refreshStats]);

  const navigate = (next: RoutePath) => {
    if (window.location.pathname !== next) {
      window.history.pushState({}, "", next);
    }
    setRoute(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (route === "/pay") {
    return (
      <>
        <PayPage onGoHome={() => navigate("/")} />
        <Analytics />
      </>
    );
  }

  if (route === "/transactions") {
    return (
      <>
        <TransactionsView onBack={() => navigate("/")} />
        <Analytics />
      </>
    );
  }

  if (route === "/stats") {
    return (
      <>
        <StatsView onBack={() => navigate("/")} />
        <Analytics />
      </>
    );
  }

  return (
    <>
      {showSplash && <SplashOverlay onSkip={() => setShowSplash(false)} />}

      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-[#F8F7FC] px-4 py-5 pb-10">
        {/* Top Bar matching GTA 6 BuckMe */}
        <header className="flex items-center justify-between pb-4">
          <BuckMeLogo className="h-8 w-8" color="#5B21B6" />
          <DualAvatars />
        </header>

        <main className="space-y-4">
          <CheckingCard
            balance={checkingBalance}
            currency={homeCurrency}
            onFlipCurrency={flipHomeCurrency}
            onUpdateBalance={setCheckingBalance}
            onOpenScan={() => setScanOpen(true)}
            onOpenMyQr={() => setMyQrOpen(true)}
          />

          <FamilySavingsCard
            familySavings={familySavings}
            currency={homeCurrency}
            peopleBucked={stats?.totalBucked ?? 0}
            confirmedTxs={confirmedTxs}
            onScanAndPay={() => setScanOpen(true)}
            onViewTransactions={() => navigate("/transactions")}
          />

          {/* Quick Actions / ATM Card */}
          <section className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate("/transactions")}
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-purple-200/70 bg-white p-4 text-left shadow-sm transition hover:border-[#6D28D9]"
            >
              <div>
                <p className="text-xs font-extrabold text-[#5B21B6]">
                  Transactions
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  {transactions.length} logged
                </p>
              </div>
              <History className="h-5 w-5 text-[#6D28D9]" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/stats")}
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-purple-200/70 bg-white p-4 text-left shadow-sm transition hover:border-[#6D28D9]"
            >
              <div>
                <p className="text-xs font-extrabold text-[#5B21B6]">
                  Live Stats
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Community pulse
                </p>
              </div>
              <BarChart3 className="h-5 w-5 text-[#6D28D9]" />
            </button>
          </section>

          {/* Scroll-down BuckMe FAQ */}
          <FaqAccordion />
        </main>
      </div>

      {scanOpen && (
        <QrScannerSheet
          onClose={() => setScanOpen(false)}
          onParsed={(payload) => {
            setScanOpen(false);
            setCheckoutPayload(payload);
          }}
        />
      )}

      {checkoutPayload && (
        <CheckoutSheet
          payload={checkoutPayload}
          onClose={() => {
            setCheckoutPayload(null);
            void refreshStats();
          }}
        />
      )}

      {myQrOpen && <MyQrSheet onClose={() => setMyQrOpen(false)} />}

      <Analytics />
    </>
  );
}
