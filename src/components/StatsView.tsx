import { useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, TrendingUp } from "lucide-react";
import { fetchStats, type StatsSnapshot } from "@/lib/stats";
import { useBuckMeStore } from "@/lib/store";
import { formatInrPretty } from "@/lib/upi";
import { BuckMeLogo } from "./BuckMeLogo";

export function StatsView({ onBack }: { onBack: () => void }) {
  const { familySavings, transactions } = useBuckMeStore();
  const confirmedCount = transactions.filter((t) => t.status === "confirmed").length;
  const [stats, setStats] = useState<StatsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchStats();
      setStats(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const conversion =
    stats && stats.totalLandings > 0
      ? Math.round((stats.totalBucked / stats.totalLandings) * 100)
      : 0;

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
        <h1 className="text-base font-extrabold text-[#5B21B6]">Live Stats</h1>
        <button
          type="button"
          onClick={() => void load()}
          aria-label="Refresh stats"
          className="cursor-pointer rounded-full p-1.5 text-[#5B21B6] hover:bg-purple-100"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      {/* X-Screenshot-Ready Card */}
      <section className="buckme-gradient buckme-pattern rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BuckMeLogo className="h-8 w-8" color="#FFFFFF" innerColor="#6D28D9" />
            <span className="text-xl font-extrabold">buckme</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            LEONIDA PULSE
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-purple-100">
              Total Landings
            </p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums">
              {stats ? stats.totalLandings.toLocaleString() : "—"}
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-purple-100">
              People Bucked
            </p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums">
              {stats ? stats.totalBucked.toLocaleString() : "—"}
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-purple-100">
              QRs Shared
            </p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">
              {stats ? stats.totalQrsShared.toLocaleString() : "—"}
            </p>
          </div>
          <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
            <p className="text-[11px] font-semibold text-purple-100">
              Buck Rate
            </p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums">
              {conversion}%
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-purple-100/85">
          Thank you for bucking with us • Storage: {stats?.storage ?? "loading"}
        </p>
      </section>

      {/* Personal Local Stats */}
      <section className="mt-4 rounded-3xl border border-purple-200/70 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#5B21B6]">Your Stats</h2>
          <span className="rounded-full bg-[#F3E8FF] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
            Local Device
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#F8F7FC] p-3.5">
            <p className="text-[11px] font-semibold text-gray-500">Total ₹ Bucked</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-[#5B21B6]">
              ₹{formatInrPretty(familySavings)}
            </p>
          </div>
          <div className="rounded-2xl bg-[#F8F7FC] p-3.5">
            <p className="text-[11px] font-semibold text-gray-500">Confirmed</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums text-[#5B21B6]">
              {confirmedCount} {confirmedCount === 1 ? "payment" : "payments"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
