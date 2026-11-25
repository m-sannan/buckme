import type { IncomingMessage, ServerResponse } from "node:http";

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

// Local in-memory fallback so local dev & tests work with zero external keys
const memoryStore = {
  totalLandings: 0,
  totalBucked: 0,
  totalQrsShared: 0,
  totalQrsCreated: 0,
};

async function upstashCmd(
  url: string,
  token: string,
  command: (string | number)[],
): Promise<unknown> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Upstash error ${res.status}`);
  const data = (await res.json()) as { result: unknown };
  return data.result;
}

export async function getStatsSnapshot(): Promise<StatsSnapshot> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/mget/buckme:landings/buckme:bucked/buckme:qr_shared/buckme:qr_created`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { result: Array<string | null> };
        const [l, b, s, c] = data.result ?? [];
        return {
          totalLandings: Number(l ?? 0),
          totalBucked: Number(b ?? 0),
          totalQrsShared: Number(s ?? 0),
          totalQrsCreated: Number(c ?? 0),
          updatedAt: new Date().toISOString(),
          storage: "upstash",
        };
      }
    } catch {
      // Fallback to memory store on transient network errors
    }
  }

  return {
    ...memoryStore,
    updatedAt: new Date().toISOString(),
    storage: "memory",
  };
}

export async function recordStatEvent(event: StatEvent): Promise<StatsSnapshot> {
  const keyMap: Record<StatEvent, { redis: string; mem: keyof typeof memoryStore }> = {
    landing: { redis: "buckme:landings", mem: "totalLandings" },
    upi_handoff: { redis: "buckme:bucked", mem: "totalBucked" },
    buck_confirmed: { redis: "buckme:bucked", mem: "totalBucked" },
    qr_shared: { redis: "buckme:qr_shared", mem: "totalQrsShared" },
    qr_created: { redis: "buckme:qr_created", mem: "totalQrsCreated" },
  };

  const target = keyMap[event];
  if (!target) return getStatsSnapshot();

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      await upstashCmd(url, token, ["INCR", target.redis]);
      return getStatsSnapshot();
    } catch {
      // Fall through to memory
    }
  }

  memoryStore[target.mem] += 1;
  return getStatsSnapshot();
}

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    const stats = await getStatsSnapshot();
    res.statusCode = 200;
    res.end(JSON.stringify(stats));
    return;
  }

  if (req.method === "POST") {
    let rawBody = "";
    if (typeof req.body === "object" && req.body !== null) {
      const parsed = req.body as { event?: StatEvent };
      if (parsed.event) {
        const stats = await recordStatEvent(parsed.event);
        res.statusCode = 200;
        res.end(JSON.stringify(stats));
        return;
      }
    }
    for await (const chunk of req) {
      rawBody += chunk;
    }
    try {
      const parsed = JSON.parse(rawBody || "{}") as { event?: StatEvent };
      if (!parsed.event) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Missing event" }));
        return;
      }
      const stats = await recordStatEvent(parsed.event);
      res.statusCode = 200;
      res.end(JSON.stringify(stats));
    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
    return;
  }

  res.statusCode = 405;
  res.end(JSON.stringify({ error: "Method not allowed" }));
}
