export type Role = 'ADMIN' | 'OPERATOR' | 'VIEWER';

export interface UserContext {
  userId: string;
  role: Role;
  tenantId: string;
}

export class RbacPermissionGate {
  private rolePermissions: Map<Role, Set<string>>;

  constructor() {
    this.rolePermissions = new Map([
      ['ADMIN', new Set(['order:create', 'order:read', 'order:delete', 'tenant:admin'])],
      ['OPERATOR', new Set(['order:create', 'order:read'])],
      ['VIEWER', new Set(['order:read'])]
    ]);
  }

  hasPermission(user: UserContext, requiredPermission: string): boolean {
    const permissions = this.rolePermissions.get(user.role);
    if (!permissions) {
      return false;
    }
    return permissions.has(requiredPermission);
  }

  assertTenantAccess(user: UserContext, targetTenantId: string): void {
    if (user.tenantId !== targetTenantId) {
      throw new Error(`Unauthorized cross-tenant access attempt by user ${user.userId}`);
    }
  }
}
