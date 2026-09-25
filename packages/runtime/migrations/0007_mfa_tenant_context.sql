ALTER TABLE "RefreshTokenFamily" ADD COLUMN "activeOrganizationId" UUID REFERENCES "Organization" ("id") ON DELETE SET NULL;

CREATE TABLE "OrganizationSecurityPolicy" (
  "organizationId" UUID PRIMARY KEY REFERENCES "Organization" ("id") ON DELETE CASCADE,
  "minimumPasswordLength" INTEGER NOT NULL DEFAULT 12 CHECK ("minimumPasswordLength" BETWEEN 12 AND 128),
  "requireUppercase" BOOLEAN NOT NULL DEFAULT FALSE,
  "requireLowercase" BOOLEAN NOT NULL DEFAULT FALSE,
  "requireNumber" BOOLEAN NOT NULL DEFAULT FALSE,
  "requireSymbol" BOOLEAN NOT NULL DEFAULT FALSE,
  "mfaRequired" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE "MfaEnrollment" (
  "userId" UUID PRIMARY KEY REFERENCES "User" ("id") ON DELETE CASCADE,
  "encryptedSecret" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'ACTIVE')),
  "confirmedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "MfaRecoveryCode" (
  "id" UUID PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User" ("id") ON DELETE CASCADE,
  "codeHash" TEXT NOT NULL,
  "usedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "codeHash")
);

CREATE TABLE "MfaChallenge" (
  "id" UUID PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User" ("id") ON DELETE CASCADE,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "consumedAt" TIMESTAMPTZ,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "MfaResetRequest" (
  "id" UUID PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User" ("id") ON DELETE CASCADE,
  "organizationId" UUID NOT NULL REFERENCES "Organization" ("id") ON DELETE CASCADE,
  "approverMembershipId" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "resolvedAt" TIMESTAMPTZ,
  CONSTRAINT "MfaResetRequest_approver_tenant_fkey" FOREIGN KEY ("approverMembershipId", "organizationId") REFERENCES "OrganizationMembership" ("id", "organizationId")
);

CREATE TABLE "TenantSampleRecord" (
  "id" UUID PRIMARY KEY,
  "organizationId" UUID NOT NULL REFERENCES "Organization" ("id") ON DELETE CASCADE,
  "ownerMembershipId" UUID NOT NULL,
  "departmentId" UUID,
  "name" TEXT NOT NULL,
  "internalNotes" TEXT,
  "vendorVisibleSummary" TEXT,
  CONSTRAINT "TenantSampleRecord_owner_tenant_fkey" FOREIGN KEY ("ownerMembershipId", "organizationId") REFERENCES "OrganizationMembership" ("id", "organizationId")
);
CREATE INDEX "TenantSampleRecord_organizationId_idx" ON "TenantSampleRecord" ("organizationId", "id");
