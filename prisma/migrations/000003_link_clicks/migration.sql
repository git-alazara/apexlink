CREATE TABLE "LinkClick" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ownerNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkClick_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LinkClick_ownerNumber_idx" ON "LinkClick"("ownerNumber");
CREATE INDEX "LinkClick_createdAt_idx" ON "LinkClick"("createdAt");
