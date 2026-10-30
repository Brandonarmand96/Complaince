CREATE TABLE "ProgramActivation" (
 "idempotencyKey" TEXT NOT NULL, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
 "programId" UUID NOT NULL REFERENCES "ComplianceProgram"("id") ON DELETE CASCADE, "requestHash" TEXT NOT NULL,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY("organizationId","idempotencyKey")
);
CREATE TABLE "File" (
 "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
 "originalFilename" TEXT NOT NULL, "mimeType" TEXT NOT NULL, "size" BIGINT NOT NULL CHECK("size">=0),
 "sha256" TEXT NOT NULL CHECK(length("sha256")=64), "storageKey" TEXT NOT NULL UNIQUE,
 "encryptionVersion" INTEGER NOT NULL DEFAULT 1, "scanState" TEXT NOT NULL DEFAULT 'PENDING' CHECK("scanState" IN ('PENDING','CLEAN','INFECTED','ERROR')),
 "scanAttempts" INTEGER NOT NULL DEFAULT 0, "scanMessage" TEXT, "version" INTEGER NOT NULL DEFAULT 1,
 "legalHold" BOOLEAN NOT NULL DEFAULT FALSE, "linkedRecordCount" INTEGER NOT NULL DEFAULT 0,
 "expiresAt" TIMESTAMPTZ, "archivedAt" TIMESTAMPTZ, "createdByMembershipId" UUID NOT NULL,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 FOREIGN KEY("createdByMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId"),
 UNIQUE("organizationId","sha256")
);
CREATE TABLE "FileScanJob" (
 "fileId" UUID PRIMARY KEY REFERENCES "File"("id") ON DELETE CASCADE, "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK("status" IN ('PENDING','PROCESSING','COMPLETED','FAILED')),
 "attempts" INTEGER NOT NULL DEFAULT 0, "availableAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "lastError" TEXT, "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE "FileDownloadGrant" (
 "id" UUID PRIMARY KEY, "fileId" UUID NOT NULL REFERENCES "File"("id") ON DELETE CASCADE, "fileVersion" INTEGER NOT NULL,
 "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE, "membershipId" UUID NOT NULL,
 "sessionId" UUID NOT NULL, "expiresAt" TIMESTAMPTZ NOT NULL, "revokedAt" TIMESTAMPTZ, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 FOREIGN KEY("membershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId")
);
