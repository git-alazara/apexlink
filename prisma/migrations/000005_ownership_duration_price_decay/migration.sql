ALTER TABLE "Ownership" ADD COLUMN "endedAt" TIMESTAMP(3);

CREATE INDEX "Ownership_endedAt_idx" ON "Ownership"("endedAt");
