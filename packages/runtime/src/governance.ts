import { randomUUID } from 'node:crypto';
import type { Database } from './database.js';
import { TenantAccessDenied, type TenantContext } from './authorization.js';

export class ApprovalRequired extends Error {}
export class ConcurrencyConflict extends Error {}

export function governanceStore(db: Database) {
  const requirePlatformAdministrator = async (userId: string) => {
    const result = await db.query('SELECT 1 FROM "PlatformAdministrator" WHERE "userId"=$1', [userId]);
    if (!result.rowCount) throw new TenantAccessDenied();
  };
  return {
    async grantClientAccess(context: TenantContext, consultantMembershipId: string, parentOrganizationId: string, expiresAt?: Date) {
      if (!context.permissions.includes('organization.manage')) throw new TenantAccessDenied();
      const result = await db.query(`INSERT INTO "ConsultingClientGrant" ("id","consultantMembershipId","parentOrganizationId","clientOrganizationId","grantedByMembershipId","expiresAt")
        VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT ("consultantMembershipId","clientOrganizationId") DO UPDATE SET "revokedAt"=NULL,"expiresAt"=EXCLUDED."expiresAt","grantedByMembershipId"=EXCLUDED."grantedByMembershipId" RETURNING *`,
      [randomUUID(), consultantMembershipId, parentOrganizationId, context.organizationId, context.membershipId, expiresAt ?? null]);
      return result.rows[0];
    },
    async canAccessClient(consultantMembershipId: string, clientOrganizationId: string) {
      const result = await db.query(`SELECT 1 FROM "ConsultingClientGrant" WHERE "consultantMembershipId"=$1 AND "clientOrganizationId"=$2 AND "revokedAt" IS NULL AND ("expiresAt" IS NULL OR "expiresAt">NOW())`, [consultantMembershipId, clientOrganizationId]);
      return Boolean(result.rowCount);
    },
    async requestSupport(userId: string, organizationId: string, approverMembershipId: string, resources: string[], reason: string, expiresAt: Date) {
      const result = await db.query(`INSERT INTO "SupportAccessRequest" ("id","organizationId","requesterUserId","approverMembershipId","resources","reason","expiresAt") VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [randomUUID(), organizationId, userId, approverMembershipId, resources, reason, expiresAt]);
      return result.rows[0];
    },
    async resolveSupport(context: TenantContext, id: string, decision: 'APPROVED' | 'REJECTED') {
      const result = await db.query(`UPDATE "SupportAccessRequest" SET "status"=$3,"resolvedAt"=NOW() WHERE "id"=$1 AND "organizationId"=$2 AND "approverMembershipId"=$4 AND "status"='PENDING' AND "expiresAt">NOW() RETURNING *`, [id, context.organizationId, decision, context.membershipId]);
      if (!result.rowCount) throw new TenantAccessDenied();
      return result.rows[0];
    },
    async revokeSupport(context: TenantContext, id: string) {
      const result = await db.query(`UPDATE "SupportAccessRequest" SET "status"='REVOKED',"revokedAt"=NOW() WHERE "id"=$1 AND "organizationId"=$2 AND "status"='APPROVED' RETURNING *`, [id, context.organizationId]);
      if (!result.rowCount) throw new TenantAccessDenied();
      return result.rows[0];
    },
    async requireSupport(userId: string, organizationId: string, resource: string) {
      const result = await db.query(`SELECT 1 FROM "SupportAccessRequest" WHERE "requesterUserId"=$1 AND "organizationId"=$2 AND "status"='APPROVED' AND "revokedAt" IS NULL AND "expiresAt">NOW() AND $3=ANY("resources")`, [userId, organizationId, resource]);
      if (!result.rowCount) throw new TenantAccessDenied();
    },
    async disableOrganization(actorUserId: string, organizationId: string, reason: string) {
      await requirePlatformAdministrator(actorUserId);
      if (!reason.trim()) throw new TypeError('A disable reason is required.');
      const result = await db.query(`UPDATE "Organization" SET "disabledAt"=NOW(),"disabledReason"=$2,"disabledByUserId"=$3 WHERE "id"=$1 AND "disabledAt" IS NULL RETURNING *`, [organizationId, reason.trim(), actorUserId]);
      return result.rows[0] ?? null;
    },
    async updateSubscription(actorUserId: string, organizationId: string, input: { plan: string; status: string; seatLimit?: number; currentPeriodEndsAt?: Date; metadata?: unknown }) {
      await requirePlatformAdministrator(actorUserId);
      const result = await db.query(`INSERT INTO "SubscriptionMetadata" ("organizationId","plan","status","seatLimit","currentPeriodEndsAt","metadata") VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT ("organizationId") DO UPDATE SET "plan"=EXCLUDED."plan","status"=EXCLUDED."status","seatLimit"=EXCLUDED."seatLimit","currentPeriodEndsAt"=EXCLUDED."currentPeriodEndsAt","metadata"=EXCLUDED."metadata","updatedAt"=NOW() RETURNING *`, [organizationId, input.plan, input.status, input.seatLimit ?? null, input.currentPeriodEndsAt ?? null, input.metadata ?? {}]);
      return result.rows[0];
    },
    async consumeApproval(context: TenantContext, action: string, resourceType: string, resourceId?: string) {
      const result = await db.query(`UPDATE "AdministrativeApproval" SET "status"='CONSUMED' WHERE "organizationId"=$1 AND "action"=$2 AND "resourceType"=$3 AND "resourceId" IS NOT DISTINCT FROM $4 AND "status"='APPROVED' AND "expiresAt">NOW() RETURNING "id"`, [context.organizationId, action, resourceType, resourceId ?? null]);
      if (!result.rowCount) throw new ApprovalRequired();
    },
    async listAudit(context: TenantContext, input: { action?: string; resourceType?: string; actorUserId?: string; limit?: number; before?: Date }) {
      if (!context.permissions.includes('organization:manage') && !context.permissions.includes('audits:manage')) throw new TenantAccessDenied();
      const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
      const result = await db.query(`SELECT "id","actorUserId","action","resourceType","resourceId","before","after","requestId","createdAt" FROM "AuditLog"
        WHERE "organizationId"=$1 AND ($2::text IS NULL OR "action"=$2) AND ($3::text IS NULL OR "resourceType"=$3) AND ($4::uuid IS NULL OR "actorUserId"=$4) AND ($5::timestamptz IS NULL OR "createdAt"<$5)
        ORDER BY "createdAt" DESC,"id" DESC LIMIT $6`, [context.organizationId, input.action ?? null, input.resourceType ?? null, input.actorUserId ?? null, input.before ?? null, limit]);
      return result.rows;
    },
  };
}

export async function appendAudit(query: Database['query'], event: { organizationId?: string; actorUserId?: string; actorMembershipId?: string; action: string; resourceType: string; resourceId?: string; before?: unknown; after?: unknown; requestId: string; ipAddress?: string }) {
  await query(`INSERT INTO "AuditLog" ("id","organizationId","actorUserId","actorMembershipId","action","resourceType","resourceId","before","after","requestId","ipAddress") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [randomUUID(), event.organizationId ?? null, event.actorUserId ?? null, event.actorMembershipId ?? null, event.action, event.resourceType, event.resourceId ?? null, event.before ?? null, event.after ?? null, event.requestId, event.ipAddress ?? null]);
}

export async function publishEvent(query: Database['query'], event: { organizationId?: string; resourceType: string; resourceId?: string; eventType: string; payloadVersion: number; payload: unknown }) {
  const id = randomUUID();
  await query(`INSERT INTO "OutboxEvent" ("id","organizationId","resourceType","resourceId","eventType","payloadVersion","payload") VALUES ($1,$2,$3,$4,$5,$6,$7)`, [id, event.organizationId ?? null, event.resourceType, event.resourceId ?? null, event.eventType, event.payloadVersion, event.payload]);
  return id;
}

export const domainEventTypes = ['CONTROL_STATUS_CHANGED','EVIDENCE_SUBMITTED','EVIDENCE_REVIEWED','ASSESSMENT_COMPLETED','FINDING_CREATED','FINDING_STATUS_CHANGED','TASK_ASSIGNED','TASK_OVERDUE','RISK_ACCEPTED','POLICY_PUBLISHED','AUDIT_COMPLETED'] as const;
export function validateDomainEvent(type: string, payload: unknown) {
  if (!(domainEventTypes as readonly string[]).includes(type) || !payload || typeof payload !== 'object' || Array.isArray(payload)) throw new TypeError('Unsupported event type or payload.');
}

export async function deliverOutboxBatch(db: Database, consumer: string, deliver: (event: { id: string; eventType: string; payloadVersion: number; payload: unknown }) => Promise<void>, limit = 25) {
  const claimed = await db.query(`UPDATE "OutboxEvent" SET "status"='PROCESSING',"attempts"="attempts"+1
    WHERE "id" IN (SELECT "id" FROM "OutboxEvent" WHERE "status" IN ('PENDING','FAILED') AND "availableAt"<=NOW() AND "attempts"<5 ORDER BY "createdAt" FOR UPDATE SKIP LOCKED LIMIT $1)
    RETURNING "id","eventType","payloadVersion","payload"`, [Math.min(Math.max(limit, 1), 100)]);
  for (const event of claimed.rows) {
    try {
      const consumed = await db.query('SELECT 1 FROM "ConsumedEvent" WHERE "consumer"=$1 AND "eventId"=$2', [consumer, event.id]);
      if (!consumed.rowCount) await deliver(event);
      const client = await db.connect();
      try { await client.query('BEGIN'); await client.query('INSERT INTO "ConsumedEvent" ("consumer","eventId") VALUES ($1,$2) ON CONFLICT DO NOTHING', [consumer, event.id]); await client.query(`UPDATE "OutboxEvent" SET "status"='DELIVERED',"deliveredAt"=NOW(),"lastError"=NULL WHERE "id"=$1`, [event.id]); await client.query('COMMIT'); } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
    } catch (error) {
      await db.query(`UPDATE "OutboxEvent" SET "status"='FAILED',"availableAt"=NOW() + (LEAST("attempts",5) * INTERVAL '10 seconds'),"lastError"=$2 WHERE "id"=$1`, [event.id, error instanceof Error ? error.message.slice(0, 500) : 'Delivery failed']);
    }
  }
  return claimed.rowCount ?? 0;
}

export function compareSnapshots(before: Record<string, unknown>, after: Record<string, unknown>, restricted: string[] = []) {
  const hidden = new Set(restricted); const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].filter(key => !hidden.has(key) && JSON.stringify(before[key]) !== JSON.stringify(after[key])).map(key => ({ field: key, before: before[key], after: after[key] }));
}

export async function appendEntityVersion(query: Database['query'], input: { organizationId: string; entityType: string; entityId: string; expectedVersion: number; snapshot: unknown; actorMembershipId: string; changeReason: string }) {
  const current = await query<{ version: number }>('SELECT COALESCE(MAX("version"),0)::int AS version FROM "EntityVersion" WHERE "organizationId"=$1 AND "entityType"=$2 AND "entityId"=$3', [input.organizationId, input.entityType, input.entityId]);
  if (current.rows[0].version !== input.expectedVersion) throw new ConcurrencyConflict('The record changed after it was loaded.');
  const version = input.expectedVersion + 1;
  await query(`INSERT INTO "EntityVersion" ("id","organizationId","entityType","entityId","version","snapshot","actorMembershipId","changeReason") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [randomUUID(), input.organizationId, input.entityType, input.entityId, version, input.snapshot, input.actorMembershipId, input.changeReason]);
  return version;
}

export async function restoreEntityVersion(query: Database['query'], input: { organizationId: string; entityType: string; entityId: string; sourceVersion: number; expectedVersion: number; actorMembershipId: string; changeReason: string }) {
  const source = await query<{ snapshot: unknown }>('SELECT "snapshot" FROM "EntityVersion" WHERE "organizationId"=$1 AND "entityType"=$2 AND "entityId"=$3 AND "version"=$4', [input.organizationId, input.entityType, input.entityId, input.sourceVersion]);
  if (!source.rowCount) throw new TypeError('Version not found.');
  const version = await appendEntityVersion(query, { ...input, snapshot: source.rows[0].snapshot });
  return { version, snapshot: source.rows[0].snapshot };
}
