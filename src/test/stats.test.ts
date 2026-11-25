import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getStatsSnapshot, recordStatEvent } from "../../api/stats.ts";

describe("Stats API memory fallback", () => {
  it("increments landing and bucked counters in memory", async () => {
    const before = await getStatsSnapshot();
    assert.equal(before.storage, "memory");

    await recordStatEvent("landing");
    await recordStatEvent("upi_handoff");
    await recordStatEvent("qr_shared");

    const after = await getStatsSnapshot();
    assert.equal(after.totalLandings, before.totalLandings + 1);
    assert.equal(after.totalBucked, before.totalBucked + 1);
    assert.equal(after.totalQrsShared, before.totalQrsShared + 1);
  });
});
