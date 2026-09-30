CREATE TABLE "ControlReviewRequest" (
 "id" UUID PRIMARY KEY,
 "controlImplementationId" UUID NOT NULL REFERENCES "ControlImplementation"("id") ON DELETE CASCADE,
 "periodKey" TEXT NOT NULL,
 "status" TEXT NOT NULL CHECK ("status" IN ('PENDING','APPROVED','REJECTED')),
 "dueAt" TIMESTAMPTZ NOT NULL,
 "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE("controlImplementationId","periodKey")
);
