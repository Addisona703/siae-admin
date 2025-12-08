import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'

import { useAuthStore } from './auth'

export const usePermissionStore = defineStore('permission', () => {
  // State
  const allPermissions = ref([])
  const userPermissions = ref(new Set())
  const userRoles = ref(new Set())
  const isLoading = ref(false)

  // Getters
  const permissionTree = computed(() => {
    return buildPermissionTree(allPermissions.value)
  })

  const hasAnyPermission = computed(() => {
    return userPermissions.value.size > 0
  })

  // Actions
  const setUserPermissions = (permissions) => {
    userPermissions.value = new Set(permissions)
  }

  const setUserRoles = (roles) => {
    userRoles.value = new Set(roles)
  }

  const setAllPermissions = (permissions) => {
    allPermissions.value = permissions
  }

  const hasPermission = (permission) => {
    return userPermissions.value.has(permission)
  }

  const hasRole = (role) => {
    return userRoles.value.has(role)
  }

  const hasAnyOfPermissions = (permissions) => {
    return permissions.some((permission) => userPermissions.value.has(permission))
  }

  const hasAnyOfRoles = (roles) => {
    return roles.some((role) => userRoles.value.has(role))
  }

  const hasAllPermissions = (permissions) => {
    return permissions.every((permission) => userPermissions.value.has(permission))
  }

  const initializePermissions = () => {
    const authStore = useAuthStore()
    if (authStore.currentUser?.permissions) {
      setUserPermissions(authStore.currentUser.permissions)
    }
    if (authStore.currentUser?.roles) {
      setUserRoles(authStore.currentUser.roles)
    }
  }

  const clearPermissions = () => {
    userPermissions.value.clear()
    userRoles.value.clear()
    allPermissions.value = []
  }

  const getPermissionsByParent = (parentId) => {
    return allPermissions.value.filter((permission) => permission.parentId === parentId)
  }

  const findPermissionById = (id) => {
    return allPermissions.value.find((permission) => permission.id === id) || null
  }

  const findPermissionByCode = (code) => {
    return allPermissions.value.find((permission) => permission.code === code) || null
  }

  return {
    // State
    allPermissions: [],
    userPermissions: new Set(),
    userRoles: new Set(),
    isLoading: false,
    // Getters
    permissionTree,
    hasAnyPermission,

    // Actions
    setUserPermissions,
    setUserRoles,
    setAllPermissions,
    hasPermission,
    hasRole,
    hasAnyOfPermissions,
    hasAnyOfRoles,
    hasAllPermissions,
    initializePermissions,
    clearPermissions,
    getPermissionsByParent,
    findPermissionById,
    findPermissionByCode,
  }
})

// Helper function to build permission tree
function buildPermissionTree(permissions) {
  const permissionMap = new Map()
  const rootPermissions = []

  // Create a map for quick lookup
  permissions.forEach((permission) => {
    permissionMap.set(permission.id, { ...permission, children: [] })
  })

  // Build the tree structure
  permissions.forEach((permission) => {
    const permissionWithChildren = permissionMap.get(permission.id)

    if (permission.parentId) {
      const parent = permissionMap.get(permission.parentId)
      if (parent) {
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(permissionWithChildren)
      }
    } else {
      rootPermissions.push(permissionWithChildren)
    }
  })

  // Convert to TreeNode format
  return convertToTreeNodes(rootPermissions)
}

function convertToTreeNodes(permissions) {
  return permissions.map((permission) => ({
    id: permission.id,
    label: permission.name,
    value: permission.code,
    children: permission.children?.length ? convertToTreeNodes(permission.children) : undefined,
    disabled: false,
    expanded: false,
    selected: false,
    indeterminate: false,
  }))
}
