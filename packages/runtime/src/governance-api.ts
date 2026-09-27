import { randomUUID } from 'node:crypto';
import type { Database } from './database.js';
import { resolveTenantContext, TenantAccessDenied } from './authorization.js';
import { governanceStore } from './governance.js';
import { commentStore, workflowStore } from './workflows.js';

export function governanceApi(db: Database) {
  const governance = governanceStore(db); const workflows = workflowStore(db); const comments = commentStore(db);
  const context = (userId: string, sessionId: string) => resolveTenantContext(db, userId, sessionId);
  const assertResourceAccess = async (organizationId: string, resourceType: string, resourceId: string) => {
    const tables: Record<string,string> = { Finding: 'Finding', Risk: 'Risk', Asset: 'Asset', Vendor: 'Vendor', ComplianceProgram: 'ComplianceProgram', TenantSampleRecord: 'TenantSampleRecord', WorkflowInstance: 'WorkflowInstance' };
    const table = tables[resourceType]; if (!table) throw new TenantAccessDenied('Unsupported resource type.');
    const result = await db.query(`SELECT 1 FROM "${table}" WHERE "id"=$1 AND "organizationId"=$2`, [resourceId, organizationId]);
    if (!result.rowCount) throw new TenantAccessDenied('Resource is unavailable.');
  };
  return {
    async disableOrganization(userId: string, organizationId: string, reason: string) { return governance.disableOrganization(userId, organizationId, reason); },
    async updateSubscription(userId: string, organizationId: string, input: { plan: string; status: string; seatLimit?: number }) { return governance.updateSubscription(userId, organizationId, input); },
    async listAudit(userId: string, sessionId: string, input: { action?: string; resourceType?: string; actorUserId?: string; limit?: number; before?: Date }) { return governance.listAudit(await context(userId, sessionId), input); },
    async saveWorkflow(userId: string, sessionId: string, input: { id?: string; name: string; trigger: string; conditions: unknown[]; actors: unknown[]; deadlineSeconds?: number; escalation?: unknown; outcomes: unknown; active?: boolean }) {
      const ctx = await context(userId, sessionId); if (!ctx.permissions.includes('organization:manage')) throw new TenantAccessDenied(); const id = input.id ?? randomUUID();
      const prior = await db.query<{ version: number }>('SELECT COALESCE(MAX("version"),0)::int AS version FROM "WorkflowDefinition" WHERE "id"=$1 AND "organizationId"=$2', [id, ctx.organizationId]); const version = prior.rows[0].version + 1;
      const result = await db.query(`INSERT INTO "WorkflowDefinition" ("id","organizationId","version","name","trigger","conditions","actors","deadlineSeconds","escalation","outcomes","active") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`, [id, ctx.organizationId, version, input.name, input.trigger, input.conditions, input.actors, input.deadlineSeconds ?? null, input.escalation ?? null, input.outcomes, input.active ?? true]); return result.rows[0];
    },
    async listWorkflows(userId: string, sessionId: string) { const ctx = await context(userId, sessionId); const result = await db.query(`SELECT DISTINCT ON ("id") * FROM "WorkflowDefinition" WHERE "organizationId"=$1 ORDER BY "id","version" DESC`, [ctx.organizationId]); return result.rows; },
    async approvals(userId: string, sessionId: string) { return workflows.pendingApprovals(await context(userId, sessionId)); },
    async transition(userId: string, sessionId: string, id: string, input: { fromState: string; toState: string; comment?: string }) { return workflows.transition(await context(userId, sessionId), id, input.fromState, input.toState, input.comment); },
    async createComment(userId: string, sessionId: string, input: { resourceType: string; resourceId: string; parentId?: string; visibility: 'INTERNAL'|'EXTERNAL'; body: string; mentionIds?: string[] }) { const ctx = await context(userId, sessionId); await assertResourceAccess(ctx.organizationId,input.resourceType,input.resourceId); return comments.create(ctx, input); },
    async editComment(userId: string, sessionId: string, id: string, body: string) { return comments.edit(await context(userId, sessionId), id, body); },
    async listComments(userId: string, sessionId: string, input: { resourceType: string; resourceId: string; external?: boolean }) { const ctx=await context(userId,sessionId);await assertResourceAccess(ctx.organizationId,input.resourceType,input.resourceId);return comments.list(ctx, input.resourceType, input.resourceId, Boolean(input.external)); },
    async toggleReaction(userId: string, sessionId: string, id: string, emoji: string) { return { active: await comments.toggleReaction(await context(userId, sessionId), id, emoji) }; },
  };
}
