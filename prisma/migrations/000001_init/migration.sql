CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED');

CREATE TABLE "CurrentLink" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "url" TEXT NOT NULL,
    "email" TEXT,
    "ownerNumber" INTEGER NOT NULL DEFAULT 0,
    "priceCents" INTEGER NOT NULL,
    "previousPriceCents" INTEGER,
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CurrentLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseIntent" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "email" TEXT,
    "priceCents" INTEGER NOT NULL,
    "nextOwnerNumber" INTEGER NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseIntent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Ownership" (
    "id" TEXT NOT NULL,
    "ownerNumber" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "email" TEXT,
    "priceCents" INTEGER NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ownership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CurrentLink_stripeSessionId_key" ON "CurrentLink"("stripeSessionId");
CREATE UNIQUE INDEX "PurchaseIntent_stripeSessionId_key" ON "PurchaseIntent"("stripeSessionId");
CREATE UNIQUE INDEX "Ownership_ownerNumber_key" ON "Ownership"("ownerNumber");
CREATE UNIQUE INDEX "Ownership_stripeSessionId_key" ON "Ownership"("stripeSessionId");
