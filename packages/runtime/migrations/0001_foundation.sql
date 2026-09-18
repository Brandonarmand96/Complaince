-- Additive and compatible with the foundation tables already created in this setup.
CREATE TABLE IF NOT EXISTS "JobRecord" (
  "id" UUID NOT NULL PRIMARY KEY,
  "scope" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "payloadHash" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "failUntil" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "JobRecord_scope_idempotencyKey_key" ON "JobRecord" ("scope", "idempotencyKey");
CREATE INDEX IF NOT EXISTS "JobRecord_scope_status_createdAt_idx" ON "JobRecord" ("scope", "status", "createdAt");
CREATE TABLE IF NOT EXISTS "HealthEffect" (
  "jobId" UUID NOT NULL PRIMARY KEY REFERENCES "JobRecord" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

