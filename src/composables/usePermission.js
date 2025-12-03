import { computed } from 'vue'
import { usePermissionStore, useAuthStore } from '@/stores'

/**
 * Composable for permission checking
 */
export function usePermission() {
  const permissionStore = usePermissionStore()
  const authStore = useAuthStore()

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission) => {
    if (!permission) return true
    
    if (Array.isArray(permission)) {
      // User must have at least one of the permissions
      return permission.some(p => permissionStore.hasPermission(p))
    }
    
    return permissionStore.hasPermission(permission)
  }

  /**
   * Check if user has all specified permissions
   */
  const hasAllPermissions = (permissions) => {
    if (!permissions || permissions.length === 0) return true
    return permissions.every(p => permissionStore.hasPermission(p))
  }

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissions) => {
    if (!permissions || permissions.length === 0) return true
    return permissions.some(p => permissionStore.hasPermission(p))
  }

  /**
   * Check if user has a specific role
   */
  const hasRole = (role) => {
    const userRoles = authStore.currentUser?.roles || []
    
    if (Array.isArray(role)) {
      return role.some(r => userRoles.includes(r))
    }
    
    return userRoles.includes(role)
  }

  /**
   * Check if user has all specified roles
   */
  const hasAllRoles = (roles) => {
    if (!roles || roles.length === 0) return true
    const userRoles = authStore.currentUser?.roles || []
    return roles.every(r => userRoles.includes(r))
  }

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles) => {
    if (!roles || roles.length === 0) return true
    const userRoles = authStore.currentUser?.roles || []
    return roles.some(r => userRoles.includes(r))
  }

  /**
   * Check if user is admin (has admin role)
   */
  const isAdmin = computed(() => {
    return hasRole('admin') || hasRole('administrator')
  })

  /**
   * Get all user permissions
   */
  const permissions = computed(() => {
    return Array.from(permissionStore.userPermissions)
  })

  /**
   * Get all user roles
   */
  const roles = computed(() => {
    return authStore.currentUser?.roles || []
  })

  /**
   * Check if permissions are loaded
   */
  const isPermissionsLoaded = computed(() => {
    return permissionStore.hasAnyPermission
  })

  return {
    // Permission checks
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,

    // Role checks
    hasRole,
    hasAllRoles,
    hasAnyRole,
    isAdmin,

    // Data
    permissions,
    roles,
    isPermissionsLoaded
  }
}
