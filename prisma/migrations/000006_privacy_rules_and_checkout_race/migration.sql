ALTER TABLE "CurrentLink" DROP COLUMN "email";

ALTER TABLE "PurchaseIntent"
DROP COLUMN "email",
ADD COLUMN "rulesVersion" TEXT NOT NULL DEFAULT 'pre-2026-08-30';

ALTER TABLE "PurchaseIntent" ALTER COLUMN "rulesVersion" DROP DEFAULT;

ALTER TABLE "Ownership"
DROP COLUMN "email",
ADD COLUMN "rulesVersion" TEXT;