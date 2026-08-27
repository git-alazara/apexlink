import { prisma } from "@/lib/prisma";
import { INITIAL_PRICE_CENTS, PRICE_INCREMENT_CENTS } from "@/lib/config";

const DEFAULT_LINK = "https://app.budgetgenie.io";

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
  return prisma.ownership.findMany({
    orderBy: { ownerNumber: "desc" },
    take: 100,
  });
}

export async function recordPageView(path: string) {
  try {
    await prisma.pageView.create({
      data: { path },
    });
  } catch (error) {
    console.warn("Page view tracking failed", error);
  }
}

export async function getSiteStats() {
  const currentLink = await getCurrentLink();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [pageViews, completedPurchases, pendingPurchases] = await Promise.all([
    getPageViewStats(since),
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
    completedPurchases,
    pendingPurchases,
    ownerNumber: currentLink.ownerNumber,
    nextOwnerNumber: currentLink.ownerNumber + 1,
    currentPriceCents: currentLink.priceCents,
  };
}

async function getPageViewStats(since: Date) {
  try {
    const [totalViews, recentViews] = await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.count({
        where: {
          createdAt: {
            gte: since,
          },
        },
      }),
    ]);

    return { totalViews, recentViews };
  } catch (error) {
    console.warn("Page view stats unavailable", error);
    return { totalViews: 0, recentViews: 0 };
  }
}

export async function createPurchaseIntent(input: {
  url: string;
  email?: string;
  stripeSessionId: string;
}) {
  const currentLink = await getCurrentLink();

  return prisma.purchaseIntent.create({
    data: {
      url: input.url,
      email: input.email,
      priceCents: currentLink.priceCents,
      nextOwnerNumber: currentLink.ownerNumber + 1,
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

    const ownership = await tx.ownership.create({
      data: {
        ownerNumber: intent.nextOwnerNumber,
        url: intent.url,
        email: intent.email,
        priceCents: intent.priceCents,
        stripeSessionId,
        stripePaymentIntentId: paymentIntentId ?? undefined,
      },
    });

    await tx.currentLink.upsert({
      where: { id: 1 },
      update: {
        url: intent.url,
        email: intent.email,
        ownerNumber: intent.nextOwnerNumber,
        previousPriceCents: intent.priceCents,
        priceCents: intent.priceCents + PRICE_INCREMENT_CENTS,
        stripeSessionId,
      },
      create: {
        id: 1,
        url: intent.url,
        email: intent.email,
        ownerNumber: intent.nextOwnerNumber,
        previousPriceCents: intent.priceCents,
        priceCents: intent.priceCents + PRICE_INCREMENT_CENTS,
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
