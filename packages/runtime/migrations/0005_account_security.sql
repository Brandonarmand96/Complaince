ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE' CHECK ("status" IN ('ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED'));
ALTER TABLE "User" ADD COLUMN "failedLoginCount" INTEGER NOT NULL DEFAULT 0 CHECK ("failedLoginCount" >= 0);
ALTER TABLE "User" ADD COLUMN "lockedUntil" TIMESTAMPTZ;
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMPTZ;

CREATE TABLE "LoginHistory" (
  "id" UUID NOT NULL PRIMARY KEY,
  "userId" UUID REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "normalizedEmail" TEXT NOT NULL,
  "outcome" TEXT NOT NULL CHECK ("outcome" IN ('SUCCESS', 'INVALID_CREDENTIALS', 'LOCKED', 'ACCOUNT_DISABLED')),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "LoginHistory_email_createdAt_idx" ON "LoginHistory" ("normalizedEmail", "createdAt" DESC);
CREATE INDEX "LoginHistory_userId_createdAt_idx" ON "LoginHistory" ("userId", "createdAt" DESC);

CREATE TABLE "SecurityEvent" (
  "id" UUID NOT NULL PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "type" TEXT NOT NULL CHECK ("type" IN ('NEW_DEVICE_LOGIN')),
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "SecurityEvent_userId_createdAt_idx" ON "SecurityEvent" ("userId", "createdAt" DESC);

CREATE TABLE "EmailVerificationToken" (
  "id" UUID NOT NULL PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "consumedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "EmailVerificationToken_userId_createdAt_idx" ON "EmailVerificationToken" ("userId", "createdAt" DESC);
