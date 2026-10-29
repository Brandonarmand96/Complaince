CREATE TABLE "OrganizationSettings" (
 "organizationId" UUID PRIMARY KEY REFERENCES "Organization"("id") ON DELETE CASCADE,
 "dateFormat" TEXT NOT NULL DEFAULT 'YYYY-MM-DD', "currency" TEXT NOT NULL DEFAULT 'USD',
 "retentionDays" INTEGER NOT NULL DEFAULT 2555 CHECK ("retentionDays">=30),
 "brandColor" TEXT NOT NULL DEFAULT '#2563eb', "logoDataUrl" TEXT,
 "requireMfa" BOOLEAN NOT NULL DEFAULT FALSE, "emailNotifications" BOOLEAN NOT NULL DEFAULT TRUE,
 "version" INTEGER NOT NULL DEFAULT 1, "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE "SupportAccessRequest" ALTER COLUMN "approverMembershipId" DROP NOT NULL;
