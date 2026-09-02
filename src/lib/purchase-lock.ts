import type { Prisma } from "@prisma/client";

const PURCHASE_LOCK_ID = 8675309;

export async function acquirePurchaseTransactionLock(
  transaction: Pick<Prisma.TransactionClient, "$queryRaw">,
) {
  await transaction.$queryRaw<Array<{ acquired: string }>>`
    SELECT pg_advisory_xact_lock(${PURCHASE_LOCK_ID})::text AS "acquired"
  `;
}
