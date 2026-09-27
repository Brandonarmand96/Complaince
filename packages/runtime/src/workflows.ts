import { randomUUID } from 'node:crypto';
import type { Database } from './database.js';
import { TenantAccessDenied, type TenantContext } from './authorization.js';
import { ConcurrencyConflict, publishEvent } from './governance.js';

type Condition = { field: string; operator: 'eq' | 'neq' | 'in' | 'exists'; value?: unknown };
export function evaluateConditions(conditions: Condition[], subject: Record<string, unknown>) {
  return conditions.every(({ field, operator, value }) => {
    if (!['eq', 'neq', 'in', 'exists'].includes(operator)) throw new TypeError(`Unsupported workflow operator: ${operator as string}`);
    if (operator === 'exists') return subject[field] !== undefined && subject[field] !== null;
    if (operator === 'in') { if (!Array.isArray(value)) throw new TypeError('The in operator requires an array.'); return value.includes(subject[field]); }
    return operator === 'eq' ? subject[field] === value : subject[field] !== value;
  });
}

export function workflowStore(db: Database) {
  return {
    async transition(context: TenantContext, instanceId: string, fromState: string, toState: string, comment?: string) {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        const allowed = await client.query(`SELECT 1 FROM "WorkflowInstance" i JOIN "WorkflowDefinition" d ON d."id"=i."definitionId" AND d."version"=i."definitionVersion" AND d."organizationId"=i."organizationId" CROSS JOIN LATERAL jsonb_each_text(d."outcomes") outcome WHERE i."id"=$1 AND i."organizationId"=$2 AND outcome.value=$3`, [instanceId, context.organizationId, toState]);
        if (!allowed.rowCount) throw new TypeError('Transition is not an allowed workflow outcome.');
        const updated = await client.query(`UPDATE "WorkflowInstance" SET "state"=$4,"completedAt"=CASE WHEN $4 IN ('APPROVED','REJECTED','COMPLETED') THEN NOW() ELSE NULL END
          WHERE "id"=$1 AND "organizationId"=$2 AND "state"=$3 AND ("assignedMembershipId"=$5 OR $6=TRUE) RETURNING *`, [instanceId, context.organizationId, fromState, toState, context.membershipId, context.permissions.includes('workflow.manage')]);
        if (!updated.rowCount) throw new ConcurrencyConflict('Workflow state changed or actor is unauthorized.');
        await client.query(`INSERT INTO "WorkflowActionHistory" ("id","instanceId","actorMembershipId","fromState","toState","comment") VALUES ($1,$2,$3,$4,$5,$6)`, [randomUUID(), instanceId, context.membershipId, fromState, toState, comment ?? null]);
        await client.query('COMMIT'); return updated.rows[0];
      } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
    },
    async pendingApprovals(context: TenantContext) {
      const result = await db.query(`SELECT i.* FROM "WorkflowInstance" i WHERE i."organizationId"=$1 AND i."completedAt" IS NULL AND (i."assignedMembershipId"=$2 OR $3=TRUE) ORDER BY i."dueAt" NULLS LAST`, [context.organizationId, context.membershipId, context.permissions.includes('workflow.manage')]);
      return result.rows;
    },
    async escalateOverdue() {
      const client = await db.connect(); let count = 0;
      try {
        await client.query('BEGIN');
        const due = await client.query(`UPDATE "WorkflowInstance" SET "escalatedAt"=NOW() WHERE "dueAt"<=NOW() AND "completedAt" IS NULL AND "escalatedAt" IS NULL RETURNING *`);
        for (const row of due.rows) { await publishEvent(client.query.bind(client), { organizationId: row.organizationId, resourceType: 'WorkflowInstance', resourceId: row.id, eventType: 'TASK_OVERDUE', payloadVersion: 1, payload: { instanceId: row.id } }); count++; }
        await client.query('COMMIT'); return count;
      } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
    },
  };
}

const mentionPattern = /@\[([^\]]+)\]\(([0-9a-f-]{36})\)/gi;
export function parseMentionIds(body: string) { return [...body.matchAll(mentionPattern)].map(match => match[2]); }

export function commentStore(db: Database) {
  return {
    async create(context: TenantContext, input: { resourceType: string; resourceId: string; parentId?: string; visibility: 'INTERNAL' | 'EXTERNAL'; body: string }) {
      const mentions = parseMentionIds(input.body);
      const client = await db.connect(); const id = randomUUID();
      try { await client.query('BEGIN'); if(input.parentId){const parent=await client.query('SELECT 1 FROM "Comment" WHERE "id"=$1 AND "organizationId"=$2 AND "resourceType"=$3 AND "resourceId"=$4',[input.parentId,context.organizationId,input.resourceType,input.resourceId]);if(!parent.rowCount)throw new TenantAccessDenied('Reply parent is outside this resource.');} for(const memberId of new Set(mentions)){const recipient=await client.query('SELECT 1 FROM "OrganizationMembership" WHERE "id"=$1 AND "organizationId"=$2 AND "status"=\'ACTIVE\'',[memberId,context.organizationId]);if(!recipient.rowCount)throw new TenantAccessDenied('Mention recipient cannot access this resource.');} await client.query(`INSERT INTO "Comment" ("id","organizationId","resourceType","resourceId","parentId","authorMembershipId","visibility","body") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [id, context.organizationId, input.resourceType, input.resourceId, input.parentId ?? null, context.membershipId, input.visibility, input.body]); for (const memberId of new Set(mentions)) await client.query(`INSERT INTO "CommentMention" ("commentId","membershipId") VALUES ($1,$2)`, [id, memberId]); await client.query('COMMIT'); return { id }; } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
    },
    async edit(context: TenantContext, id: string, body: string) {
      const client = await db.connect();
      try { await client.query('BEGIN'); const prior = await client.query(`SELECT "body" FROM "Comment" WHERE "id"=$1 AND "organizationId"=$2 AND "authorMembershipId"=$3 FOR UPDATE`, [id, context.organizationId, context.membershipId]); if (!prior.rowCount) throw new TenantAccessDenied(); await client.query(`INSERT INTO "CommentEdit" ("id","commentId","actorMembershipId","priorBody") VALUES ($1,$2,$3,$4)`, [randomUUID(), id, context.membershipId, prior.rows[0].body]); await client.query(`UPDATE "Comment" SET "body"=$2,"updatedAt"=NOW() WHERE "id"=$1`, [id, body]); await client.query('COMMIT'); } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); }
    },
    async list(context: TenantContext, resourceType: string, resourceId: string, external = false) { const result = await db.query(`SELECT "id","parentId","authorMembershipId","visibility","body","createdAt","updatedAt" FROM "Comment" WHERE "organizationId"=$1 AND "resourceType"=$2 AND "resourceId"=$3 AND ($4=FALSE OR "visibility"='EXTERNAL') ORDER BY "createdAt"`, [context.organizationId, resourceType, resourceId, external]); return result.rows; },
    async toggleReaction(context: TenantContext, commentId: string, emoji: string) { const deleted = await db.query(`DELETE FROM "CommentReaction" r USING "Comment" c WHERE r."commentId"=$1 AND r."membershipId"=$2 AND r."emoji"=$3 AND c."id"=r."commentId" AND c."organizationId"=$4`, [commentId, context.membershipId, emoji, context.organizationId]); if (deleted.rowCount) return false; await db.query(`INSERT INTO "CommentReaction" ("commentId","membershipId","emoji") SELECT "id",$2,$3 FROM "Comment" WHERE "id"=$1 AND "organizationId"=$4`, [commentId, context.membershipId, emoji, context.organizationId]); return true; },
  };
}
