-- CreateTable
CREATE TABLE "contact_requests" (
    "id" TEXT NOT NULL,
    "sessionKey" VARCHAR(255),
    "visitorEmail" VARCHAR(255),
    "visitorName" VARCHAR(255),
    "intent" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "context" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "sendError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_requests_sessionKey_idx" ON "contact_requests"("sessionKey");

-- CreateIndex
CREATE INDEX "contact_requests_createdAt_idx" ON "contact_requests"("createdAt");
