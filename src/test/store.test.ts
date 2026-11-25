import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatBySymbol, useBuckMeStore } from "../lib/store.ts";

describe("BuckMe Zustand store", () => {
  it("flips home and checkout currency symbols", () => {
    const s = useBuckMeStore.getState();
    assert.equal(s.homeCurrency, "$");
    s.flipHomeCurrency();
    assert.equal(useBuckMeStore.getState().homeCurrency, "₹");
    s.flipHomeCurrency();
    assert.equal(useBuckMeStore.getState().homeCurrency, "$");

    assert.equal(formatBySymbol(1410, "$"), "$1,410");
    assert.equal(formatBySymbol(1410, "₹"), "₹1,410");
  });

  it("locks funds into Family Savings via Buck Yourself", () => {
    useBuckMeStore.setState({ checkingBalance: 1410, familySavings: 100 });
    const ok = useBuckMeStore.getState().buckYourself(400);
    assert.equal(ok, true);
    assert.equal(useBuckMeStore.getState().checkingBalance, 1010);
    assert.equal(useBuckMeStore.getState().familySavings, 500);
  });

  it("logs pending transaction and deducts on confirmation", () => {
    useBuckMeStore.setState({ checkingBalance: 1000, transactions: [] });
    const id = useBuckMeStore.getState().addPendingTx({
      vpa: "friend@okaxis",
      name: "Friend",
      amount: 250,
      note: "Coffee",
      appLabel: "CRED",
    });
    assert.equal(useBuckMeStore.getState().transactions.length, 1);
    assert.equal(useBuckMeStore.getState().transactions[0]?.status, "pending");

    useBuckMeStore.getState().resolveTx(id, "confirmed");
    assert.equal(useBuckMeStore.getState().transactions[0]?.status, "confirmed");
    assert.equal(useBuckMeStore.getState().checkingBalance, 750);
  });
});
