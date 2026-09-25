CREATE TABLE "PasswordResetToken" (
  "id" UUID NOT NULL PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "User" ("id") ON DELETE CASCADE,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "consumedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken" ("userId", "createdAt" DESC);

CREATE TABLE "Invitation" (
  "id" UUID NOT NULL PRIMARY KEY,
  "organizationId" UUID NOT NULL REFERENCES "Organization" ("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL CHECK (btrim("email") <> ''),
  "normalizedEmail" TEXT GENERATED ALWAYS AS (lower(btrim("email"))) STORED,
  "tokenHash" TEXT NOT NULL UNIQUE,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "acceptedAt" TIMESTAMPTZ,
  "createdByMembershipId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Invitation_id_organizationId_key" UNIQUE ("id", "organizationId"),
  CONSTRAINT "Invitation_creator_tenant_fkey" FOREIGN KEY ("createdByMembershipId", "organizationId")
    REFERENCES "OrganizationMembership" ("id", "organizationId") ON DELETE RESTRICT
);
CREATE INDEX "Invitation_organizationId_status_idx" ON "Invitation" ("organizationId", "status");

CREATE TABLE "InvitationRole" (
  "invitationId" UUID NOT NULL,
  "roleId" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  PRIMARY KEY ("invitationId", "roleId"),
  CONSTRAINT "InvitationRole_invitation_tenant_fkey" FOREIGN KEY ("invitationId", "organizationId")
    REFERENCES "Invitation" ("id", "organizationId") ON DELETE CASCADE,
  CONSTRAINT "InvitationRole_role_tenant_fkey" FOREIGN KEY ("roleId", "organizationId")
    REFERENCES "Role" ("id", "organizationId") ON DELETE CASCADE
);
