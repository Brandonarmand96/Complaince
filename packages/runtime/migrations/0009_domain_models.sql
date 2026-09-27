-- T0140-T0150. The project uses additive SQL/pg rather than Prisma (ADR 0001).
ALTER TABLE "Organization" ADD COLUMN "industry" TEXT, ADD COLUMN "registrationNumber" TEXT,
  ADD COLUMN "country" TEXT, ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC',
  ADD COLUMN "employeeCount" INTEGER CHECK ("employeeCount" >= 0), ADD COLUMN "website" TEXT,
  ADD COLUMN "contacts" JSONB NOT NULL DEFAULT '[]';

CREATE TABLE "BusinessUnit" (
 "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
 "name" TEXT NOT NULL, "type" TEXT NOT NULL CHECK ("type" IN ('DIVISION','SUBSIDIARY','FUNCTION','OTHER')),
 "parentUnitId" UUID, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE("organizationId","name"), UNIQUE("id","organizationId"),
 FOREIGN KEY ("parentUnitId","organizationId") REFERENCES "BusinessUnit"("id","organizationId")
);
CREATE TABLE "Department" (
 "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
 "businessUnitId" UUID, "name" TEXT NOT NULL, "headMembershipId" UUID, UNIQUE("id","organizationId"),
 FOREIGN KEY ("businessUnitId","organizationId") REFERENCES "BusinessUnit"("id","organizationId"),
 FOREIGN KEY ("headMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId"), UNIQUE("organizationId","name")
);
CREATE TABLE "Location" (
 "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
 "name" TEXT NOT NULL, "address" JSONB NOT NULL, "country" TEXT NOT NULL, "timezone" TEXT NOT NULL, UNIQUE("organizationId","name"), UNIQUE("id","organizationId")
);
CREATE TABLE "Framework" (
 "id" UUID PRIMARY KEY, "organizationId" UUID REFERENCES "Organization"("id") ON DELETE CASCADE,
 "name" TEXT NOT NULL, "publisher" TEXT NOT NULL, "description" TEXT, "ownership" TEXT NOT NULL CHECK ("ownership" IN ('GLOBAL','CUSTOM')),
 CHECK (("ownership"='GLOBAL' AND "organizationId" IS NULL) OR ("ownership"='CUSTOM' AND "organizationId" IS NOT NULL))
);
CREATE TABLE "UnifiedControl" (
 "id" UUID PRIMARY KEY, "organizationId" UUID REFERENCES "Organization"("id") ON DELETE CASCADE,
 "reference" TEXT NOT NULL, "title" TEXT NOT NULL, "objective" TEXT NOT NULL, "type" TEXT NOT NULL,
 "category" TEXT NOT NULL, "guidance" TEXT, "testProcedure" TEXT, "frequency" TEXT NOT NULL,
 UNIQUE NULLS NOT DISTINCT ("organizationId","reference")
);
CREATE TABLE "ComplianceProgram" (
 "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
 "name" TEXT NOT NULL, "frameworkVersionId" UUID, "ownerMembershipId" UUID NOT NULL, "scope" JSONB NOT NULL DEFAULT '{}',
 "startDate" DATE, "endDate" DATE, "assessmentType" TEXT NOT NULL, "stage" TEXT NOT NULL, "status" TEXT NOT NULL,
 FOREIGN KEY ("ownerMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId"),
 CHECK ("endDate" IS NULL OR "startDate" IS NULL OR "endDate">="startDate")
);
CREATE TABLE "Risk" (
 "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
 "reference" TEXT NOT NULL, "title" TEXT NOT NULL, "category" TEXT NOT NULL, "threat" TEXT NOT NULL, "vulnerability" TEXT NOT NULL,
 "ownerMembershipId" UUID NOT NULL, "process" TEXT, "reviewDate" DATE,
 FOREIGN KEY ("ownerMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId"), UNIQUE("organizationId","reference")
);
CREATE TABLE "Asset" (
 "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
 "name" TEXT NOT NULL, "type" TEXT NOT NULL, "ownerMembershipId" UUID NOT NULL, "custodianMembershipId" UUID,
 "departmentId" UUID, "locationId" UUID, "ipAddress" INET,
 "hostname" TEXT, "serialNumber" TEXT, "operatingSystem" TEXT, "environment" TEXT, "classification" TEXT NOT NULL, "criticality" TEXT NOT NULL,
 FOREIGN KEY ("ownerMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId"),
 FOREIGN KEY ("departmentId","organizationId") REFERENCES "Department"("id","organizationId"),
 FOREIGN KEY ("locationId","organizationId") REFERENCES "Location"("id","organizationId"),
 FOREIGN KEY ("custodianMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId")
);
CREATE TABLE "Vendor" (
 "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
 "name" TEXT NOT NULL, "service" TEXT NOT NULL, "businessOwnerMembershipId" UUID NOT NULL, "contacts" JSONB NOT NULL DEFAULT '[]',
 "countries" TEXT[] NOT NULL DEFAULT '{}', "dataAccess" TEXT[] NOT NULL DEFAULT '{}', "systemAccess" TEXT[] NOT NULL DEFAULT '{}',
 "contractStartDate" DATE, "contractEndDate" DATE,
 FOREIGN KEY ("businessOwnerMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId"),
 CHECK ("contractEndDate" IS NULL OR "contractStartDate" IS NULL OR "contractEndDate">="contractStartDate")
);
CREATE TABLE "Finding" (
 "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
 "type" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT NOT NULL,
 "severity" TEXT NOT NULL CHECK ("severity" IN ('LOW','MEDIUM','HIGH','CRITICAL')),
 "impact" TEXT, "ownerMembershipId" UUID NOT NULL, "dueDate" DATE, "managementResponse" TEXT,
 FOREIGN KEY ("ownerMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId")
);
