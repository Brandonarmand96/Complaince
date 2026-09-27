-- T0101-T0139: tenant grants, platform governance, audit, outbox,
-- versioning, workflows and comments.  All tenant references use composite
-- foreign keys so an ID from another organization cannot be substituted.

CREATE TABLE "ConsultingClientGrant" (
  "id" UUID PRIMARY KEY, "consultantMembershipId" UUID NOT NULL,
  "parentOrganizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "clientOrganizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "grantedByMembershipId" UUID NOT NULL, "expiresAt" TIMESTAMPTZ, "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ("parentOrganizationId" <> "clientOrganizationId"),
  FOREIGN KEY ("consultantMembershipId", "parentOrganizationId") REFERENCES "OrganizationMembership"("id", "organizationId"),
  FOREIGN KEY ("grantedByMembershipId", "clientOrganizationId") REFERENCES "OrganizationMembership"("id", "organizationId"),
  UNIQUE ("consultantMembershipId", "clientOrganizationId")
);

CREATE TABLE "SupportAccessRequest" (
  "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "requesterUserId" UUID NOT NULL REFERENCES "User"("id"), "approverMembershipId" UUID NOT NULL,
  "resources" TEXT[] NOT NULL CHECK (cardinality("resources") > 0),
  "reason" TEXT NOT NULL CHECK (length(trim("reason")) > 0),
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING','APPROVED','REJECTED','REVOKED')),
  "expiresAt" TIMESTAMPTZ NOT NULL, "resolvedAt" TIMESTAMPTZ, "revokedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("approverMembershipId", "organizationId") REFERENCES "OrganizationMembership"("id", "organizationId")
);
CREATE INDEX "SupportAccessRequest_active_idx" ON "SupportAccessRequest"("requesterUserId", "organizationId", "expiresAt") WHERE "status"='APPROVED';

CREATE TABLE "PlatformAdministrator" (
  "userId" UUID PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "Organization" ADD COLUMN "disabledAt" TIMESTAMPTZ;
ALTER TABLE "Organization" ADD COLUMN "disabledReason" TEXT;
ALTER TABLE "Organization" ADD COLUMN "disabledByUserId" UUID REFERENCES "User"("id");

CREATE TABLE "SubscriptionMetadata" (
  "organizationId" UUID PRIMARY KEY REFERENCES "Organization"("id") ON DELETE CASCADE,
  "plan" TEXT NOT NULL, "status" TEXT NOT NULL CHECK ("status" IN ('TRIAL','ACTIVE','PAST_DUE','CANCELED')),
  "seatLimit" INTEGER CHECK ("seatLimit" > 0), "currentPeriodEndsAt" TIMESTAMPTZ,
  "metadata" JSONB NOT NULL DEFAULT '{}', "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE "AdministrativeApproval" (
  "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "action" TEXT NOT NULL, "resourceType" TEXT NOT NULL, "resourceId" UUID,
  "requestedByMembershipId" UUID NOT NULL, "approvedByMembershipId" UUID,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING','APPROVED','REJECTED','CONSUMED')),
  "expiresAt" TIMESTAMPTZ NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "resolvedAt" TIMESTAMPTZ,
  FOREIGN KEY ("requestedByMembershipId", "organizationId") REFERENCES "OrganizationMembership"("id", "organizationId"),
  FOREIGN KEY ("approvedByMembershipId", "organizationId") REFERENCES "OrganizationMembership"("id", "organizationId")
);

CREATE TABLE "AuditLog" (
  "id" UUID PRIMARY KEY, "organizationId" UUID REFERENCES "Organization"("id") ON DELETE RESTRICT,
  "actorUserId" UUID REFERENCES "User"("id") ON DELETE SET NULL, "actorMembershipId" UUID,
  "action" TEXT NOT NULL, "resourceType" TEXT NOT NULL, "resourceId" UUID,
  "before" JSONB, "after" JSONB, "requestId" TEXT NOT NULL, "ipAddress" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("actorMembershipId", "organizationId") REFERENCES "OrganizationMembership"("id", "organizationId")
);
CREATE INDEX "AuditLog_tenant_time_idx" ON "AuditLog"("organizationId", "createdAt" DESC);
CREATE FUNCTION "prevent_audit_log_mutation"() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'AuditLog is append-only'; END $$;
CREATE TRIGGER "AuditLog_append_only" BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION "prevent_audit_log_mutation"();
REVOKE UPDATE, DELETE, TRUNCATE ON "AuditLog" FROM PUBLIC;

CREATE TABLE "OutboxEvent" (
  "id" UUID PRIMARY KEY, "organizationId" UUID REFERENCES "Organization"("id") ON DELETE CASCADE,
  "resourceType" TEXT NOT NULL, "resourceId" UUID, "eventType" TEXT NOT NULL,
  "payloadVersion" INTEGER NOT NULL CHECK ("payloadVersion" > 0), "payload" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING','PROCESSING','DELIVERED','FAILED')),
  "attempts" INTEGER NOT NULL DEFAULT 0, "availableAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deliveredAt" TIMESTAMPTZ, "lastError" TEXT, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "OutboxEvent_delivery_idx" ON "OutboxEvent"("status", "availableAt");
CREATE TABLE "ConsumedEvent" (
  "consumer" TEXT NOT NULL, "eventId" UUID NOT NULL REFERENCES "OutboxEvent"("id") ON DELETE CASCADE,
  "consumedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY ("consumer", "eventId")
);

CREATE TABLE "EntityVersion" (
  "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "entityType" TEXT NOT NULL, "entityId" UUID NOT NULL, "version" INTEGER NOT NULL CHECK ("version" > 0),
  "snapshot" JSONB NOT NULL, "actorMembershipId" UUID NOT NULL, "changeReason" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("actorMembershipId", "organizationId") REFERENCES "OrganizationMembership"("id", "organizationId"),
  UNIQUE ("organizationId", "entityType", "entityId", "version")
);

CREATE TABLE "WorkflowDefinition" (
  "id" UUID NOT NULL, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "version" INTEGER NOT NULL CHECK ("version" > 0), "name" TEXT NOT NULL, "trigger" TEXT NOT NULL,
  "conditions" JSONB NOT NULL DEFAULT '[]', "actors" JSONB NOT NULL DEFAULT '[]',
  "deadlineSeconds" INTEGER CHECK ("deadlineSeconds" > 0), "escalation" JSONB, "outcomes" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("id", "version"), UNIQUE ("id", "version", "organizationId")
);
CREATE TABLE "WorkflowInstance" (
  "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "definitionId" UUID NOT NULL, "definitionVersion" INTEGER NOT NULL, "resourceType" TEXT NOT NULL, "resourceId" UUID NOT NULL,
  "state" TEXT NOT NULL, "assignedMembershipId" UUID, "dueAt" TIMESTAMPTZ, "escalatedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "completedAt" TIMESTAMPTZ,
  FOREIGN KEY ("definitionId", "definitionVersion", "organizationId") REFERENCES "WorkflowDefinition"("id", "version", "organizationId"),
  FOREIGN KEY ("assignedMembershipId", "organizationId") REFERENCES "OrganizationMembership"("id", "organizationId")
);
CREATE TABLE "WorkflowActionHistory" (
  "id" UUID PRIMARY KEY, "instanceId" UUID NOT NULL REFERENCES "WorkflowInstance"("id") ON DELETE CASCADE,
  "actorMembershipId" UUID NOT NULL REFERENCES "OrganizationMembership"("id"),
  "fromState" TEXT NOT NULL, "toState" TEXT NOT NULL, "comment" TEXT, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Comment" (
  "id" UUID PRIMARY KEY, "organizationId" UUID NOT NULL REFERENCES "Organization"("id") ON DELETE CASCADE,
  "resourceType" TEXT NOT NULL, "resourceId" UUID NOT NULL, "parentId" UUID,
  "authorMembershipId" UUID NOT NULL, "visibility" TEXT NOT NULL CHECK ("visibility" IN ('INTERNAL','EXTERNAL')),
  "body" TEXT NOT NULL CHECK (length(trim("body")) > 0), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("id", "organizationId"),
  FOREIGN KEY ("authorMembershipId", "organizationId") REFERENCES "OrganizationMembership"("id", "organizationId"),
  FOREIGN KEY ("parentId", "organizationId") REFERENCES "Comment"("id", "organizationId") ON DELETE CASCADE
);
CREATE INDEX "Comment_resource_idx" ON "Comment"("organizationId", "resourceType", "resourceId", "createdAt");
CREATE TABLE "CommentEdit" (
  "id" UUID PRIMARY KEY, "commentId" UUID NOT NULL REFERENCES "Comment"("id") ON DELETE CASCADE,
  "actorMembershipId" UUID NOT NULL REFERENCES "OrganizationMembership"("id"), "priorBody" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE "CommentMention" (
  "commentId" UUID NOT NULL REFERENCES "Comment"("id") ON DELETE CASCADE,
  "membershipId" UUID NOT NULL REFERENCES "OrganizationMembership"("id") ON DELETE CASCADE,
  PRIMARY KEY ("commentId", "membershipId")
);
CREATE TABLE "CommentReaction" (
  "commentId" UUID NOT NULL REFERENCES "Comment"("id") ON DELETE CASCADE,
  "membershipId" UUID NOT NULL REFERENCES "OrganizationMembership"("id") ON DELETE CASCADE,
  "emoji" TEXT NOT NULL CHECK (length("emoji") BETWEEN 1 AND 16), "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("commentId", "membershipId", "emoji")
);
