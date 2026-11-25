export type StatEvent =
  | "landing"
  | "qr_created"
  | "upi_handoff"
  | "buck_confirmed"
  | "qr_shared";

export type StatsSnapshot = {
  totalLandings: number;
  totalBucked: number;
  totalQrsShared: number;
  totalQrsCreated: number;
  updatedAt: string;
  storage: "upstash" | "memory";
};

export async function fetchStats(): Promise<StatsSnapshot> {
  const res = await fetch("/api/stats", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json() as Promise<StatsSnapshot>;
}

export async function trackEvent(event: StatEvent): Promise<StatsSnapshot | null> {
  try {
    const res = await fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event }),
    });
    if (!res.ok) return null;
    return res.json() as Promise<StatsSnapshot>;
  } catch {
    return null;
  }
}
