class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 403;
  }
}

function normalizeRoles(roles) {
  return Array.isArray(roles) ? roles : [roles];
}

function withAuth(roles, service) {
  const allowed = normalizeRoles(roles);
  return async function(user, ...args) {
    if (!user || !allowed.includes(user.role)) {
      throw new UnauthorizedError();
    }
    
    return service.call(this, user, ...args);
  };
}

function requiresRole(role) {
  return function(target, key, descriptor) {
    const orig = descriptor.value;
    descriptor.value = async function(user, ...args) {
      if (!user || user.role !== role) throw new UnauthorizedError();
      return orig.apply(this, [user, ...args]);
    };
    return descriptor;
  };
}

function requiresRoles(roles) {
  const allowed = normalizeRoles(roles);
  return function(target, key, descriptor) {
    const orig = descriptor.value;
    descriptor.value = async function(user, ...args) {
      if (!user || !allowed.includes(user.role)) throw new UnauthorizedError();
      return orig.apply(this, [user, ...args]);
    };
    return descriptor;
  };
}

function requiresPermission(permission) {
  return function(target, key, descriptor) {
    const orig = descriptor.value;
    descriptor.value = async function(user, ...args) {
      const perms = (user && user.permissions) || [];
      if (!user || !perms.includes(permission)) throw new UnauthorizedError();
      return orig.apply(this, [user, ...args]);
    };
    return descriptor;
  };
}

module.exports = {
  withAuth,
  requiresRole,
  requiresRoles,
  requiresPermission,
  UnauthorizedError,
};
