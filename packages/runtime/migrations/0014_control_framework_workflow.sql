ALTER TABLE "UnifiedControl" ADD COLUMN "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE "UnifiedControl" ADD COLUMN "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE "UnifiedControl" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version">0);
ALTER TABLE "UnifiedControl" ADD CONSTRAINT "UnifiedControl_type_check" CHECK ("type" IN ('PREVENTIVE','DETECTIVE','CORRECTIVE','DIRECTIVE'));
ALTER TABLE "UnifiedControl" ADD CONSTRAINT "UnifiedControl_frequency_check" CHECK ("frequency" IN ('CONTINUOUS','DAILY','WEEKLY','MONTHLY','QUARTERLY','ANNUALLY','EVENT_DRIVEN'));

ALTER TABLE "FrameworkVersion" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT' CHECK ("status" IN ('DRAFT','PUBLISHED','RETIRED'));
ALTER TABLE "FrameworkVersion" ADD COLUMN "publishedAt" TIMESTAMPTZ;
ALTER TABLE "FrameworkVersion" ADD COLUMN "provenance" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "FrameworkVersion" ADD COLUMN "sourceRequirementCount" INTEGER CHECK ("sourceRequirementCount">=0);
ALTER TABLE "FrameworkVersion" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version">0);
ALTER TABLE "FrameworkRequirement" DROP CONSTRAINT IF EXISTS "FrameworkRequirement_weight_check";
ALTER TABLE "FrameworkRequirement" ADD CONSTRAINT "FrameworkRequirement_weight_positive" CHECK ("weight">0);
ALTER TABLE "FrameworkRequirement" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version">0);

ALTER TABLE "ControlImplementation" ADD COLUMN "implementationNotes" TEXT;
ALTER TABLE "ControlImplementation" ADD COLUMN "reviewStatus" TEXT NOT NULL DEFAULT 'DRAFT' CHECK ("reviewStatus" IN ('DRAFT','PENDING','APPROVED','REJECTED'));
ALTER TABLE "ControlImplementation" ADD COLUMN "reviewComment" TEXT;
ALTER TABLE "ControlImplementation" ADD COLUMN "reviewedAt" TIMESTAMPTZ;
ALTER TABLE "ControlImplementation" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version">0);
ALTER TABLE "ControlRequirementMapping" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1 CHECK ("version">0);

CREATE TABLE "ControlRetestSchedule" (
 "controlImplementationId" UUID PRIMARY KEY REFERENCES "ControlImplementation"("id") ON DELETE CASCADE,
 "intervalDays" INTEGER NOT NULL CHECK ("intervalDays">0), "nextDueAt" TIMESTAMPTZ NOT NULL, "lastRequestPeriod" TEXT
);
