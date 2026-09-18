CREATE TABLE "User" (
  "id" UUID NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL CHECK (btrim("email") <> ''),
  "normalizedEmail" TEXT GENERATED ALWAYS AS (lower(btrim("email"))) STORED,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX "User_normalizedEmail_key" ON "User" ("normalizedEmail");

CREATE TABLE "Organization" (
  "id" UUID NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL CHECK (btrim("name") <> ''),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "OrganizationMembership" (
  "id" UUID NOT NULL PRIMARY KEY,
  "organizationId" UUID NOT NULL REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "userId" UUID NOT NULL REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE' CHECK ("status" IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'INACTIVE')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "OrganizationMembership_organizationId_userId_key" UNIQUE ("organizationId", "userId"),
  CONSTRAINT "OrganizationMembership_id_organizationId_key" UNIQUE ("id", "organizationId")
);
CREATE INDEX "OrganizationMembership_userId_status_idx" ON "OrganizationMembership" ("userId", "status");

CREATE TABLE "Role" (
  "id" UUID NOT NULL PRIMARY KEY,
  "organizationId" UUID NOT NULL REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "name" TEXT NOT NULL CHECK (btrim("name") <> ''),
  "description" TEXT,
  "isSystem" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "Role_organizationId_name_key" UNIQUE ("organizationId", "name"),
  CONSTRAINT "Role_id_organizationId_key" UNIQUE ("id", "organizationId")
);

CREATE TABLE "Permission" (
  "id" UUID NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE CHECK ("key" ~ '^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$'),
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "RolePermission" (
  "roleId" UUID NOT NULL REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "permissionId" UUID NOT NULL REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("roleId", "permissionId")
);
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission" ("permissionId");

CREATE TABLE "MembershipRole" (
  "membershipId" UUID NOT NULL,
  "roleId" UUID NOT NULL,
  "organizationId" UUID NOT NULL,
  "grantedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("membershipId", "roleId"),
  CONSTRAINT "MembershipRole_membership_tenant_fkey"
    FOREIGN KEY ("membershipId", "organizationId")
    REFERENCES "OrganizationMembership" ("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MembershipRole_role_tenant_fkey"
    FOREIGN KEY ("roleId", "organizationId")
    REFERENCES "Role" ("id", "organizationId") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "MembershipRole_roleId_organizationId_idx" ON "MembershipRole" ("roleId", "organizationId");
