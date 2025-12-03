/**
 * Middleware for guest-only routes (like login page)
 * @param {Object} to - Target route
 * @param {Object} from - Source route
 * @param {Function} next - Navigation guard next function
 */
export const guestOnly = async (to, from, next) => {
  const { useAuthStore } = await import('@/stores')
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    // Redirect authenticated users away from guest-only pages
    next({ name: 'Dashboard' })
  } else {
    next()
  }
}

/**
 * Middleware for authenticated users only
 * @param {Object} to - Target route
 * @param {Object} from - Source route
 * @param {Function} next - Navigation guard next function
 */
export const authOnly = async (to, from, next) => {
  const { useAuthStore } = await import('@/stores')
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

/**
 * Middleware for admin users only
 * @param {Object} to - Target route
 * @param {Object} from - Source route
 * @param {Function} next - Navigation guard next function
 */
export const adminOnly = async (to, from, next) => {
  const { useAuthStore, usePermissionStore } = await import('@/stores')
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  if (!authStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }

  // Check if user has admin permissions
  const isAdmin = permissionStore.hasPermission('admin') ||
    authStore.currentUser?.roles?.includes('admin')

  if (!isAdmin) {
    const { MessagePlugin } = await import('tdesign-vue-next')
    MessagePlugin.error('需要管理员权限')
    next({ name: 'Dashboard' })
  } else {
    next()
  }
}

/**
 * Middleware factory for specific permissions
 * @param {string} permission - Required permission
 * @returns {Function} Middleware function
 */
export function requirePermission(permission) {
  return async (to, from, next) => {
    const { useAuthStore, usePermissionStore } = await import('@/stores')
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()

    if (!authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }

    if (!permissionStore.hasPermission(permission)) {
      const { MessagePlugin } = await import('tdesign-vue-next')
      MessagePlugin.error(`需要权限: ${permission}`)
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
}

/**
 * Middleware factory for multiple permissions (any of them)
 * @param {Array<string>} permissions - Required permissions (any)
 * @returns {Function} Middleware function
 */
export function requireAnyPermission(permissions) {
  return async (to, from, next) => {
    const { useAuthStore, usePermissionStore } = await import('@/stores')
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()

    if (!authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }

    if (!permissionStore.hasAnyOfPermissions(permissions)) {
      const { MessagePlugin } = await import('tdesign-vue-next')
      MessagePlugin.error('权限不足')
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
}

/**
 * Middleware factory for multiple permissions (all of them)
 * @param {Array<string>} permissions - Required permissions (all)
 * @returns {Function} Middleware function
 */
export function requireAllPermissions(permissions) {
  return async (to, from, next) => {
    const { useAuthStore, usePermissionStore } = await import('@/stores')
    const authStore = useAuthStore()
    const permissionStore = usePermissionStore()

    if (!authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }

    if (!permissionStore.hasAllPermissions(permissions)) {
      const { MessagePlugin } = await import('tdesign-vue-next')
      MessagePlugin.error('权限不足')
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
}

/**
 * Middleware for role-based access
 * @param {string} role - Required role
 * @returns {Function} Middleware function
 */
export function requireRole(role) {
  return async (to, from, next) => {
    const { useAuthStore } = await import('@/stores')
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
      return
    }

    const userRoles = authStore.currentUser?.roles || []
    if (!userRoles.includes(role)) {
      const { MessagePlugin } = await import('tdesign-vue-next')
      MessagePlugin.error(`需要角色: ${role}`)
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
}

/**
 * Compose multiple middleware functions
 * @param {...Function} middlewares - Middleware functions to compose
 * @returns {Function} Composed middleware function
 */
export function composeMiddleware(...middlewares) {
  return async (to, from, next) => {
    let index = 0

    const runNext = async (result) => {
      if (result !== undefined) {
        next(result)
        return
      }

      if (index >= middlewares.length) {
        next()
        return
      }

      const middleware = middlewares[index++]
      if (middleware) {
        await middleware(to, from, runNext)
      }
    }

    await runNext()
  }
}
