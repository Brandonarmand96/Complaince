ALTER TABLE "RefreshTokenFamily" ADD COLUMN "ipAddress" TEXT;
ALTER TABLE "RefreshTokenFamily" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "RefreshTokenFamily" ADD COLUMN "lastSeenAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();
CREATE INDEX "RefreshTokenFamily_userId_lastSeenAt_idx" ON "RefreshTokenFamily" ("userId", "lastSeenAt" DESC);
