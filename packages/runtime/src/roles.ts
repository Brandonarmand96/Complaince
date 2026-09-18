export const PERMISSIONS = [
  'organization:manage', 'users:manage', 'compliance:manage', 'controls:manage',
  'risks:manage', 'policies:approve', 'audits:manage', 'reports:read',
  'workspace:read', 'vendor_portal:access',
] as const;
export type PermissionKey = typeof PERMISSIONS[number];

export const ROLE_PERMISSION_MATRIX = {
  'Organization Owner': PERMISSIONS,
  'Compliance Manager': ['compliance:manage', 'controls:manage', 'policies:approve', 'audits:manage', 'reports:read', 'workspace:read'],
  'Control Owner': ['controls:manage', 'workspace:read'],
  'Risk Manager': ['risks:manage', 'reports:read', 'workspace:read'],
  'Policy Approver': ['policies:approve', 'workspace:read'],
  'Internal Auditor': ['audits:manage', 'reports:read', 'workspace:read'],
  'External Auditor': ['reports:read', 'workspace:read'],
  'Executive': ['reports:read', 'workspace:read'],
  'Employee': ['workspace:read'],
  'Vendor User': ['vendor_portal:access'],
} as const satisfies Record<string, readonly PermissionKey[]>;

export const BUILT_IN_ROLES = Object.keys(ROLE_PERMISSION_MATRIX) as Array<keyof typeof ROLE_PERMISSION_MATRIX>;
