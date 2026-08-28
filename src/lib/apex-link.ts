import { prisma } from "@/lib/prisma";
import { INITIAL_PRICE_CENTS, PRICE_DECAY_DAYS } from "@/lib/config";

const DEFAULT_LINK = "https://app.budgetgenie.io";
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export async function getCurrentLink() {
  await prisma.currentLink.updateMany({
    where: {
      id: 1,
      ownerNumber: 0,
      stripeSessionId: null,
    },
    data: {
      url: DEFAULT_LINK,
    },
  });

  return prisma.currentLink.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      url: DEFAULT_LINK,
      ownerNumber: 0,
      priceCents: INITIAL_PRICE_CENTS,
    },
  });
}

export async function getOwnershipHistory() {
  const owners = await prisma.ownership.findMany({
    orderBy: { ownerNumber: "desc" },
    take: 100,
  });

  const ownersWithClicks = await Promise.all(
    owners.map(async (owner) => ({
      ...owner,
      clicks: await getOwnerClickCount(owner.ownerNumber),
    })),
  );

  return ownersWithClicks;
}

export async function getPurchaseState() {
  const currentLink = await getCurrentLink();

  return {
    currentLink,
    price: getPriceState(currentLink),
  };
}

export async function recordPageView(path: string) {
  try {
    await prisma.$executeRaw`INSERT INTO "PageView" ("id", "path") VALUES (${crypto.randomUUID()}, ${path})`;
  } catch (error) {
    console.warn("Page view tracking failed", error);
  }
}

export async function getSiteStats() {
  const currentLink = await getCurrentLink();
  const price = getPriceState(currentLink);
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [pageViews, linkClicks, completedPurchases, pendingPurchases] = await Promise.all([
    getPageViewStats(since),
    getLinkClickStats(currentLink.ownerNumber, since),
    prisma.ownership.count(),
    prisma.purchaseIntent.count({
      where: {
        status: "PENDING",
      },
    }),
  ]);

  return {
    totalViews: pageViews.totalViews,
    recentViews: pageViews.recentViews,
    totalClicks: linkClicks.totalClicks,
    recentClicks: linkClicks.recentClicks,
    currentOwnerClicks: linkClicks.currentOwnerClicks,
    completedPurchases,
    pendingPurchases,
    ownerNumber: currentLink.ownerNumber,
    nextOwnerNumber: currentLink.ownerNumber + 1,
    currentPriceCents: price.currentPriceCents,
    peakPriceCents: price.peakPriceCents,
    floorPriceCents: price.floorPriceCents,
    decayDays: price.decayDays,
    decayStartedAt: price.decayStartedAt,
    decayEndsAt: price.decayEndsAt,
    decayProgress: price.decayProgress,
  };
}

export async function recordCurrentLinkClick() {
  const currentLink = await getCurrentLink();

  try {
    await prisma.$executeRaw`INSERT INTO "LinkClick" ("id", "url", "ownerNumber") VALUES (${crypto.randomUUID()}, ${currentLink.url}, ${currentLink.ownerNumber})`;
  } catch (error) {
    console.warn("Link click tracking failed", error);
  }

  return currentLink.url;
}

export async function getOrCreateVisitor(token?: string) {
  if (token) {
    const visitors = await prisma.$queryRaw<Array<{ token: string; visitorNumber: number }>>`
      UPDATE "Visitor"
      SET "lastSeenAt" = now()
      WHERE "token" = ${token}
      RETURNING "token", "visitorNumber"
    `;

    if (visitors[0]) {
      return visitors[0];
    }
  }

  const newToken = crypto.randomUUID();
  const visitors = await prisma.$queryRaw<Array<{ token: string; visitorNumber: number }>>`
    INSERT INTO "Visitor" ("id", "token", "lastSeenAt")
    VALUES (${crypto.randomUUID()}, ${newToken}, now())
    RETURNING "token", "visitorNumber"
  `;

  return visitors[0];
}

export async function getTotalVisitors() {
  try {
    const rows = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "Visitor"`;

    return Number(rows[0]?.count ?? 0);
  } catch (error) {
    console.warn("Visitor stats unavailable", error);
    return 0;
  }
}

async function getPageViewStats(since: Date) {
  try {
    const [totalRows, recentRows] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "PageView"`,
      prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "PageView" WHERE "createdAt" >= ${since}`,
    ]);

    return {
      totalViews: Number(totalRows[0]?.count ?? 0),
      recentViews: Number(recentRows[0]?.count ?? 0),
    };
  } catch (error) {
    console.warn("Page view stats unavailable", error);
    return { totalViews: 0, recentViews: 0 };
  }
}

async function getLinkClickStats(ownerNumber: number, since: Date) {
  try {
    const [totalRows, recentRows, ownerRows] = await Promise.all([
      prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "LinkClick"`,
      prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "LinkClick" WHERE "createdAt" >= ${since}`,
      prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "LinkClick" WHERE "ownerNumber" = ${ownerNumber}`,
    ]);

    return {
      totalClicks: Number(totalRows[0]?.count ?? 0),
      recentClicks: Number(recentRows[0]?.count ?? 0),
      currentOwnerClicks: Number(ownerRows[0]?.count ?? 0),
    };
  } catch (error) {
    console.warn("Link click stats unavailable", error);
    return { totalClicks: 0, recentClicks: 0, currentOwnerClicks: 0 };
  }
}

async function getOwnerClickCount(ownerNumber: number) {
  try {
    const rows = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*)::bigint AS count FROM "LinkClick" WHERE "ownerNumber" = ${ownerNumber}`;

    return Number(rows[0]?.count ?? 0);
  } catch (error) {
    console.warn("Owner click stats unavailable", error);
    return 0;
  }
}

export async function createPurchaseIntent(input: {
  url: string;
  email?: string;
  stripeSessionId: string;
  priceCents: number;
  nextOwnerNumber: number;
}) {
  return prisma.purchaseIntent.create({
    data: {
      url: input.url,
      email: input.email,
      priceCents: input.priceCents,
      nextOwnerNumber: input.nextOwnerNumber,
      stripeSessionId: input.stripeSessionId,
    },
  });
}

export async function completePurchase(stripeSessionId: string, paymentIntentId?: string | null) {
  return prisma.$transaction(async (tx) => {
    const intent = await tx.purchaseIntent.findUnique({
      where: { stripeSessionId },
    });

    if (!intent || intent.status === "PAID") {
      return null;
    }

    const existingOwnership = await tx.ownership.findUnique({
      where: { stripeSessionId },
    });

    if (existingOwnership) {
      await tx.purchaseIntent.update({
        where: { stripeSessionId },
        data: { status: "PAID" },
      });
      return existingOwnership;
    }

    const completedAt = new Date();

    await tx.ownership.updateMany({
      where: {
        ownerNumber: intent.nextOwnerNumber - 1,
        endedAt: null,
      },
      data: {
        endedAt: completedAt,
      },
    });

    const ownership = await tx.ownership.create({
      data: {
        ownerNumber: intent.nextOwnerNumber,
        url: intent.url,
        email: intent.email,
        priceCents: intent.priceCents,
        stripeSessionId,
        stripePaymentIntentId: paymentIntentId ?? undefined,
        createdAt: completedAt,
      },
    });

    await tx.currentLink.upsert({
      where: { id: 1 },
      update: {
        url: intent.url,
        email: intent.email,
        ownerNumber: intent.nextOwnerNumber,
        previousPriceCents: intent.priceCents,
        priceCents: intent.priceCents,
        stripeSessionId,
      },
      create: {
        id: 1,
        url: intent.url,
        email: intent.email,
        ownerNumber: intent.nextOwnerNumber,
        previousPriceCents: intent.priceCents,
        priceCents: intent.priceCents,
        stripeSessionId,
      },
    });

    await tx.purchaseIntent.update({
      where: { stripeSessionId },
      data: { status: "PAID" },
    });

    return ownership;
  });
}

function getPriceState(currentLink: { priceCents: number; ownerNumber: number; updatedAt: Date }) {
  const peakPriceCents = Math.max(currentLink.priceCents, INITIAL_PRICE_CENTS);

  if (currentLink.ownerNumber === 0 || peakPriceCents <= INITIAL_PRICE_CENTS) {
    return {
      currentPriceCents: INITIAL_PRICE_CENTS,
      peakPriceCents: INITIAL_PRICE_CENTS,
      floorPriceCents: INITIAL_PRICE_CENTS,
      decayDays: PRICE_DECAY_DAYS,
      decayStartedAt: currentLink.updatedAt,
      decayEndsAt: currentLink.updatedAt,
      decayProgress: 1,
    };
  }

  const decayDurationMs = Math.max(1, PRICE_DECAY_DAYS) * MS_PER_DAY;
  const elapsedMs = Math.max(0, Date.now() - currentLink.updatedAt.getTime());
  const linearProgress = Math.min(1, elapsedMs / decayDurationMs);
  const progress = linearProgress ** 2;
  const dropCents = peakPriceCents - INITIAL_PRICE_CENTS;
  const currentPriceCents = Math.max(INITIAL_PRICE_CENTS, Math.ceil(peakPriceCents - dropCents * progress));

  return {
    currentPriceCents,
    peakPriceCents,
    floorPriceCents: INITIAL_PRICE_CENTS,
    decayDays: PRICE_DECAY_DAYS,
    decayStartedAt: currentLink.updatedAt,
    decayEndsAt: new Date(currentLink.updatedAt.getTime() + decayDurationMs),
    decayProgress: progress,
  };
}
