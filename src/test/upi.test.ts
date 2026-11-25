import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildUpiUri, formatInrPretty, parseAmount, parseUpi } from "../lib/upi.ts";
import { buildAppHref, buildPaySearch, CRED_APP } from "../lib/upi-apps.ts";

describe("UPI parser & builder", () => {
  it("parses a raw VPA", () => {
    const res = parseUpi("lucia@okhdfcbank");
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.payload.vpa, "lucia@okhdfcbank");
      assert.equal(res.payload.name, "Lucia");
    }
  });

  it("parses a full upi://pay URI", () => {
    const res = parseUpi(
      "upi://pay?pa=jason@okicici&pn=Jason%20Duval&am=250.50&cu=INR&tn=Supplies",
    );
    assert.equal(res.ok, true);
    if (res.ok) {
      assert.equal(res.payload.vpa, "jason@okicici");
      assert.equal(res.payload.name, "Jason Duval");
      assert.equal(res.payload.amount, 250.5);
      assert.equal(res.payload.note, "Supplies");
    }
  });

  it("rejects non-UPI links", () => {
    const res = parseUpi("https://example.com");
    assert.equal(res.ok, false);
  });

  it("builds a valid upi://pay URI and formats INR", () => {
    const uri = buildUpiUri({
      vpa: "test@okaxis",
      name: "Test User",
      amount: 1410,
      note: "Bail",
      txnRef: "BM123",
    });
    assert.ok(uri.startsWith("upi://pay?pa=test@okaxis"));
    assert.ok(uri.includes("am=1410.00"));
    assert.equal(formatInrPretty(1410), "1,410");
    assert.equal(parseAmount("500001"), null);
  });
});

describe("UPI app deep links & BuckMe /pay query", () => {
  it("builds Android intent URL and iOS custom scheme URL", () => {
    const uri = "upi://pay?pa=test@okaxis&am=100.00&cu=INR";
    const androidHref = buildAppHref(uri, CRED_APP, true);
    const iosHref = buildAppHref(uri, CRED_APP, false);
    assert.ok(androidHref.startsWith("intent://pay?"));
    assert.ok(androidHref.includes(CRED_APP.androidPackage));
    assert.ok(iosHref.startsWith("credpay://upi/pay?"));
  });

  it("builds /pay search params with optional amount", () => {
    const qs = buildPaySearch({ vpa: "sannan@okaxis", name: "Sannan" });
    assert.ok(qs.includes("pa=sannan%40okaxis"));
    assert.ok(!qs.includes("am="));
  });
});
