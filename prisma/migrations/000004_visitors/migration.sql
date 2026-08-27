CREATE SEQUENCE "Visitor_visitorNumber_seq" START WITH 0 INCREMENT BY 1 MINVALUE 0;

CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "visitorNumber" INTEGER NOT NULL DEFAULT nextval('"Visitor_visitorNumber_seq"'),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

ALTER SEQUENCE "Visitor_visitorNumber_seq" OWNED BY "Visitor"."visitorNumber";

CREATE UNIQUE INDEX "Visitor_token_key" ON "Visitor"("token");
CREATE UNIQUE INDEX "Visitor_visitorNumber_key" ON "Visitor"("visitorNumber");
CREATE INDEX "Visitor_createdAt_idx" ON "Visitor"("createdAt");
