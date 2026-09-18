ALTER TABLE "User" ADD COLUMN "displayName" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

CREATE TABLE "RefreshTokenFamily" (
  "id" UUID NOT NULL PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "RefreshTokenFamily_userId_revokedAt_idx" ON "RefreshTokenFamily" ("userId", "revokedAt");

CREATE TABLE "RefreshToken" (
  "id" UUID NOT NULL PRIMARY KEY,
  "familyId" UUID NOT NULL REFERENCES "RefreshTokenFamily" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "usedAt" TIMESTAMPTZ,
  "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "RefreshToken_familyId_createdAt_idx" ON "RefreshToken" ("familyId", "createdAt");
