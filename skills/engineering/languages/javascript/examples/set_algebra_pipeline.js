export class AccessPolicyEngine {
  #roleHierarchy = new Map();

  registerRoles(role, inheritedRoles) {
    this.#roleHierarchy.set(role, new Set(inheritedRoles));
  }

  resolveExpandedRoles(userDirectRoles) {
    const resolved = new Set(userDirectRoles);
    const queue = Array.from(resolved);

    while (queue.length > 0) {
      const role = queue.shift();
      const inherited = this.#roleHierarchy.get(role);
      if (!inherited) {
        continue;
      }
      for (const parentRole of inherited) {
        if (!resolved.has(parentRole)) {
          resolved.add(parentRole);
          queue.push(parentRole);
        }
      }
    }

    return resolved;
  }

  evaluateAccess(userRoles, requiredRoles) {
    const userScope = this.resolveExpandedRoles(userRoles);
    const requiredScope = new Set(requiredRoles);

    const missingPermissions = requiredScope.difference(userScope);
    const superfluousRoles = userScope.difference(requiredScope);

    return {
      allowed: missingPermissions.size === 0,
      missingCount: missingPermissions.size,
      missingList: Array.from(missingPermissions),
      unusedList: Array.from(superfluousRoles)
    };
  }
}
