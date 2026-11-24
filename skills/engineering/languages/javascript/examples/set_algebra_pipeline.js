export class AccessPolicyEngine {
  #roleHierarchy = new Map();

  registerRoles(role, inheritedRoles) {
    this.#roleHierarchy.set(role, new Set(inheritedRoles));
  }

  resolveExpandedRoles(userDirectRoles) {
    let resolved = new Set(userDirectRoles);

    for (const role of userDirectRoles) {
      const inherited = this.#roleHierarchy.get(role);
      if (inherited) {
        resolved = resolved.union(inherited);
      }
    }

    return resolved;
  }

  evaluateAccess(userRoles, requiredRoles) {
    const userScope = this.resolveExpandedRoles(userRoles);
    const requiredScope = new Set(requiredRoles);

    const missingPermissions = requiredScope.difference(userScope);
    const superflousRoles = userScope.difference(requiredScope);

    return {
      allowed: missingPermissions.size === 0,
      missingCount: missingPermissions.size,
      missingList: Array.from(missingPermissions),
      unusedList: Array.from(superflousRoles)
    };
  }
}
