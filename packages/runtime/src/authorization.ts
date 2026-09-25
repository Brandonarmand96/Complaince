import type { Database } from './database.js';
export interface TenantContext { userId: string; sessionId: string; organizationId: string; membershipId: string; permissions: string[] }
export class TenantAccessDenied extends Error {}
export async function resolveTenantContext(db: Database, userId: string, sessionId: string): Promise<TenantContext> {
  const result = await db.query(`SELECT f."activeOrganizationId" AS "organizationId", m."id" AS "membershipId", COALESCE(array_agg(DISTINCT p."key") FILTER (WHERE p."key" IS NOT NULL), ARRAY[]::TEXT[]) AS permissions
    FROM "RefreshTokenFamily" f JOIN "OrganizationMembership" m ON m."organizationId" = f."activeOrganizationId" AND m."userId" = f."userId" AND m."status" = 'ACTIVE'
    LEFT JOIN "MembershipRole" mr ON mr."membershipId" = m."id" LEFT JOIN "RolePermission" rp ON rp."roleId" = mr."roleId" LEFT JOIN "Permission" p ON p."id" = rp."permissionId"
    WHERE f."id" = $1 AND f."userId" = $2 AND f."revokedAt" IS NULL GROUP BY f."activeOrganizationId", m."id"`, [sessionId, userId]);
  if (!result.rowCount || !result.rows[0].organizationId) throw new TenantAccessDenied();
  return { userId, sessionId, ...result.rows[0] };
}
export function requirePermission(context: TenantContext, permission: string) { if (!context.permissions.includes(permission)) throw new TenantAccessDenied(); }
export function enforceRecordScope(context: TenantContext, record: { organizationId: string; ownerMembershipId?: string | null; departmentId?: string | null }, scope: { ownerOnly?: boolean; departmentIds?: string[] } = {}) {
  if (record.organizationId !== context.organizationId) throw new TenantAccessDenied();
  if (scope.ownerOnly && record.ownerMembershipId !== context.membershipId) throw new TenantAccessDenied();
  if (scope.departmentIds && (!record.departmentId || !scope.departmentIds.includes(record.departmentId))) throw new TenantAccessDenied();
}
export const projectVendorRecord = <T extends { id: string; name: string; vendorVisibleSummary?: string | null }>(record: T) => ({ id: record.id, name: record.name, summary: record.vendorVisibleSummary ?? null });
export const projectAuditorRecord = <T extends { id: string; name: string; vendorVisibleSummary?: string | null }>(record: T) => ({ id: record.id, name: record.name, summary: record.vendorVisibleSummary ?? null });
export function tenantRepository(db: Database, context: TenantContext) {
  return { async findSample(id: string) { const result = await db.query('SELECT * FROM "TenantSampleRecord" WHERE "id" = $1 AND "organizationId" = $2', [id, context.organizationId]); return result.rows[0] ?? null; }, async renameSample(id: string, name: string) { const result = await db.query('UPDATE "TenantSampleRecord" SET "name" = $3 WHERE "id" = $1 AND "organizationId" = $2 RETURNING *', [id, context.organizationId, name]); return result.rows[0] ?? null; } };
}
