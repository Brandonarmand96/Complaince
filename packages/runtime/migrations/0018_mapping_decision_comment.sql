ALTER TABLE "ControlRequirementMapping"
  ADD COLUMN IF NOT EXISTS "reviewComment" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMPTZ;
