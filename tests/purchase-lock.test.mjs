import assert from "node:assert/strict";
import test from "node:test";
import { acquirePurchaseTransactionLock } from "../src/lib/purchase-lock.ts";

test("casts the PostgreSQL advisory lock result to a Prisma-supported type", async () => {
  let query;
  const transaction = {
    async $queryRaw(strings, ...values) {
      query = { strings: [...strings], values };
      return [{ acquired: "" }];
    },
  };

  await acquirePurchaseTransactionLock(transaction);

  assert.deepEqual(query, {
    strings: [
      '\n    SELECT pg_advisory_xact_lock(',
      ')::text AS "acquired"\n  ',
    ],
    values: [8675309],
  });
});
