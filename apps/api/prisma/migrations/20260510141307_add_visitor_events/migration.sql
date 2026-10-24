-- CreateTable
CREATE TABLE "visitor_events" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visitor_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visitor_events_event_idx" ON "visitor_events"("event");

-- CreateIndex
CREATE INDEX "visitor_events_createdAt_idx" ON "visitor_events"("createdAt");
