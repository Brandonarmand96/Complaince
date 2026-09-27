-- T0151-T0161 domain records and relations; T0166 organization concurrency.
CREATE TABLE "Task" (
  "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL, "description" TEXT, "type" TEXT NOT NULL,
  "priority" TEXT NOT NULL CHECK ("priority" IN ('LOW','MEDIUM','HIGH','URGENT')),
  "ownerMembershipId" UUID NOT NULL, "dueDate" DATE, "progress" INTEGER NOT NULL DEFAULT 0 CHECK ("progress" BETWEEN 0 AND 100),
  "status" TEXT NOT NULL CHECK ("status" IN ('TODO','IN_PROGRESS','BLOCKED','COMPLETED','CANCELED')),
  FOREIGN KEY ("ownerMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId")
);
CREATE TABLE "Policy" (
  "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "number" TEXT NOT NULL, "title" TEXT NOT NULL, "category" TEXT NOT NULL,
  "authorMembershipId" UUID NOT NULL, "ownerMembershipId" UUID NOT NULL, "approverMembershipId" UUID,
  "classification" TEXT NOT NULL CHECK ("classification" IN ('PUBLIC','INTERNAL','CONFIDENTIAL','RESTRICTED')),
  "effectiveDate" DATE, "reviewDate" DATE,
  FOREIGN KEY ("authorMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId"),
  FOREIGN KEY ("ownerMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId"),
  FOREIGN KEY ("approverMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId"),
  UNIQUE("organizationId","number"), CHECK ("reviewDate" IS NULL OR "effectiveDate" IS NULL OR "reviewDate">="effectiveDate")
);
CREATE TABLE "Audit" (
  "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL, "type" TEXT NOT NULL, "scope" JSONB NOT NULL DEFAULT '{}',
  "objectives" TEXT[] NOT NULL DEFAULT '{}', "criteria" TEXT[] NOT NULL DEFAULT '{}', "leadAuditorMembershipId" UUID NOT NULL,
  "startDate" DATE, "endDate" DATE, "status" TEXT NOT NULL CHECK ("status" IN ('PLANNED','IN_PROGRESS','REPORTING','COMPLETED','CANCELED')),
  FOREIGN KEY ("leadAuditorMembershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId"),
  CHECK ("endDate" IS NULL OR "startDate" IS NULL OR "endDate">="startDate")
);

CREATE TABLE "ProgramScopeSystem" ("programId" UUID NOT NULL REFERENCES "ComplianceProgram"("id") ON DELETE CASCADE,"systemId" UUID NOT NULL,"name" TEXT NOT NULL,PRIMARY KEY("programId","systemId"));
CREATE TABLE "ProgramScopeApplication" ("programId" UUID NOT NULL REFERENCES "ComplianceProgram"("id") ON DELETE CASCADE,"applicationId" UUID NOT NULL,"name" TEXT NOT NULL,PRIMARY KEY("programId","applicationId"));
CREATE TABLE "ProgramScopeNetwork" ("programId" UUID NOT NULL REFERENCES "ComplianceProgram"("id") ON DELETE CASCADE,"networkId" UUID NOT NULL,"name" TEXT NOT NULL,PRIMARY KEY("programId","networkId"));
CREATE TABLE "ProgramScopeBusinessUnit" ("programId" UUID NOT NULL REFERENCES "ComplianceProgram"("id") ON DELETE CASCADE,"businessUnitId" UUID NOT NULL REFERENCES "BusinessUnit"("id") ON DELETE CASCADE,PRIMARY KEY("programId","businessUnitId"));
CREATE TABLE "ProgramScopeProcess" ("programId" UUID NOT NULL REFERENCES "ComplianceProgram"("id") ON DELETE CASCADE,"processId" UUID NOT NULL,"name" TEXT NOT NULL,PRIMARY KEY("programId","processId"));
CREATE TABLE "ProgramScopeVendor" ("programId" UUID NOT NULL REFERENCES "ComplianceProgram"("id") ON DELETE CASCADE,"vendorId" UUID NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,PRIMARY KEY("programId","vendorId"));
CREATE TABLE "ProgramScopeDataType" ("programId" UUID NOT NULL REFERENCES "ComplianceProgram"("id") ON DELETE CASCADE,"dataType" TEXT NOT NULL,PRIMARY KEY("programId","dataType"));

CREATE TABLE "FrameworkVersion" (
  "id" UUID PRIMARY KEY, "frameworkId" UUID NOT NULL REFERENCES "Framework"("id") ON DELETE CASCADE,
  "versionIdentifier" TEXT NOT NULL, "effectiveDate" DATE NOT NULL, "retirementDate" DATE,
  UNIQUE("frameworkId","versionIdentifier"), UNIQUE("id","frameworkId"),
  CHECK ("retirementDate" IS NULL OR "retirementDate">="effectiveDate")
);
CREATE TABLE "FrameworkDomain" (
  "id" UUID PRIMARY KEY, "frameworkVersionId" UUID NOT NULL REFERENCES "FrameworkVersion"("id") ON DELETE CASCADE,
  "reference" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, UNIQUE("frameworkVersionId","reference"), UNIQUE("id","frameworkVersionId")
);
CREATE TABLE "FrameworkRequirement" (
  "id" UUID PRIMARY KEY, "frameworkVersionId" UUID NOT NULL REFERENCES "FrameworkVersion"("id") ON DELETE CASCADE,
  "domainId" UUID NOT NULL, "reference" TEXT NOT NULL, "description" TEXT NOT NULL,
  "weight" NUMERIC(7,4) NOT NULL DEFAULT 1 CHECK ("weight">=0),
  FOREIGN KEY ("domainId","frameworkVersionId") REFERENCES "FrameworkDomain"("id","frameworkVersionId"),
  UNIQUE("frameworkVersionId","reference")
);
ALTER TABLE "ComplianceProgram" ADD CONSTRAINT "ComplianceProgram_frameworkVersion_fkey" FOREIGN KEY ("frameworkVersionId") REFERENCES "FrameworkVersion"("id") ON DELETE RESTRICT;

CREATE TABLE "ControlImplementation" (
  "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "controlId" UUID NOT NULL REFERENCES "UnifiedControl"("id") ON DELETE RESTRICT,
  "implementationScope" JSONB NOT NULL DEFAULT '{}', "status" TEXT NOT NULL CHECK ("status" IN ('PLANNED','PARTIAL','IMPLEMENTED','NOT_APPLICABLE')),
  "description" TEXT, UNIQUE("id","organizationId")
);
CREATE TABLE "ControlOwner" (
  "controlImplementationId" UUID NOT NULL, "organizationId" UUID NOT NULL, "membershipId" UUID NOT NULL,
  "role" TEXT NOT NULL CHECK ("role" IN ('PRIMARY','SECONDARY','REVIEWER','APPROVER')),
  FOREIGN KEY ("controlImplementationId","organizationId") REFERENCES "ControlImplementation"("id","organizationId") ON DELETE CASCADE,
  FOREIGN KEY ("membershipId","organizationId") REFERENCES "OrganizationMembership"("id","organizationId"),
  PRIMARY KEY("controlImplementationId","membershipId","role")
);
CREATE TABLE "ControlRequirementMapping" (
  "id" UUID PRIMARY KEY, "controlImplementationId" UUID NOT NULL REFERENCES "ControlImplementation"("id") ON DELETE CASCADE,
  "requirementId" UUID NOT NULL REFERENCES "FrameworkRequirement"("id") ON DELETE CASCADE,
  "mappingType" TEXT NOT NULL CHECK ("mappingType" IN ('DIRECT','PARTIAL','SUPPORTING','INHERITED','COMPENSATING','NOT_APPLICABLE')),
  "coverage" INTEGER NOT NULL CHECK ("coverage" BETWEEN 0 AND 100), "rationale" TEXT NOT NULL,
  "provenance" JSONB NOT NULL DEFAULT '{}', "approvalStatus" TEXT NOT NULL CHECK ("approvalStatus" IN ('DRAFT','PENDING','APPROVED','REJECTED')),
  UNIQUE("controlImplementationId","requirementId")
);
CREATE TABLE "ProgramControlApplicability" (
  "programId" UUID NOT NULL REFERENCES "ComplianceProgram"("id") ON DELETE CASCADE,
  "controlImplementationId" UUID NOT NULL REFERENCES "ControlImplementation"("id") ON DELETE CASCADE,
  "applicability" TEXT NOT NULL CHECK ("applicability" IN ('APPLICABLE','NOT_APPLICABLE','CONDITIONAL')),
  "rationale" TEXT, PRIMARY KEY("programId","controlImplementationId")
);

ALTER TABLE "Organization" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version">0);
