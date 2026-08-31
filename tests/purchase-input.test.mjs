import assert from "node:assert/strict";
import test from "node:test";
import {
  getPriceValidationMessage,
  parsePriceCents,
} from "../src/lib/purchase-input.ts";
import {
  isHttpWebsiteUrl,
  normalizeWebsiteUrl,
  purchaseSchema,
} from "../src/lib/purchase-validation.ts";

test("normalizes website URLs without a protocol to HTTPS", () => {
  assert.equal(normalizeWebsiteUrl("www.google.com"), "https://www.google.com");
  assert.equal(normalizeWebsiteUrl(" example.com/path "), "https://example.com/path");
  assert.equal(normalizeWebsiteUrl("//example.com/path"), "https://example.com/path");
  assert.equal(normalizeWebsiteUrl("example.com:8080/path"), "https://example.com:8080/path");
  assert.equal(normalizeWebsiteUrl("localhost:3000"), "https://localhost:3000");
});

test("preserves explicit protocols for server-side allowlist validation", () => {
  assert.equal(normalizeWebsiteUrl("http://example.com"), "http://example.com");
  assert.equal(normalizeWebsiteUrl("https://example.com"), "https://example.com");
  assert.equal(normalizeWebsiteUrl("ftp://example.com"), "ftp://example.com");
});

test("recognizes only valid HTTP and HTTPS website URLs", () => {
  assert.equal(isHttpWebsiteUrl("https://example.com"), true);
  assert.equal(isHttpWebsiteUrl("http://example.com"), true);
  assert.equal(isHttpWebsiteUrl("ftp://example.com"), false);
  assert.equal(isHttpWebsiteUrl("not a URL"), false);
});

test("the server schema accepts and normalizes links without a protocol", () => {
  const parsedPurchase = purchaseSchema.parse({ url: "www.google.com", priceCents: 110 });

  assert.equal(parsedPurchase.url, "https://www.google.com");
});

test("the server schema rejects invalid and non-HTTP links", () => {
  assert.equal(purchaseSchema.safeParse({ url: "not a URL", priceCents: 110 }).success, false);
  assert.equal(purchaseSchema.safeParse({ url: "ftp://example.com", priceCents: 110 }).success, false);
  assert.equal(purchaseSchema.safeParse({ url: "javascript:alert(1)", priceCents: 110 }).success, false);
});

test("parses valid dollar amounts as exact integer cents", () => {
  assert.equal(parsePriceCents("1"), 100);
  assert.equal(parsePriceCents("1.1"), 110);
  assert.equal(parsePriceCents("1.10"), 110);
  assert.equal(parsePriceCents(" 10.01 "), 1001);
});

test("rejects malformed dollar amounts", () => {
  assert.equal(Number.isNaN(parsePriceCents("1.001")), true);
  assert.equal(Number.isNaN(parsePriceCents("1e2")), true);
  assert.equal(Number.isNaN(parsePriceCents("$1.10")), true);
  assert.equal(Number.isNaN(parsePriceCents(null)), true);
});

test("returns an immediate validation message below the minimum price", () => {
  assert.equal(getPriceValidationMessage("1.09", 110, "$1.10"), "Price must be at least $1.10.");
  assert.equal(getPriceValidationMessage("1.10", 110, "$1.10"), "");
  assert.equal(getPriceValidationMessage("2.00", 110, "$1.10"), "");
});

test("returns an immediate validation message for invalid positive amounts", () => {
  assert.equal(getPriceValidationMessage("0", 110, "$1.10"), "Enter a valid USD amount.");
  assert.equal(getPriceValidationMessage(".", 110, "$1.10"), "Enter a valid USD amount.");
  assert.equal(getPriceValidationMessage("", 110, "$1.10"), "");
});
