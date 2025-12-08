// Permission and Role management API service
import { get, post, put, del } from './client'

// Helper function to flatten tree structure
const flattenTree = (tree) => {
  const result = []
  const flatten = (nodes) => {
    nodes.forEach(node => {
      const { children, ...rest } = node
      result.push(rest)
      if (children && children.length > 0) {
        flatten(children)
      }
    })
  }
  flatten(tree)
  return result
}

export const permissionApi = {
  // ========== Permission CRUD Operations ==========
  
  /**
   * Get all permissions list (converted from tree structure)
   * @param enabledOnly Whether to only query enabled permissions
   * @returns Promise with flattened permission list
   */
  getAllPermissions: async (enabledOnly = false) => {
    const response = await get('/auth/permissions/tree', { params: { enabledOnly } })
    if (response.data) {
      // Flatten the tree structure to a flat list
      response.data = flattenTree(response.data)
    }
    return response
  },

  /**
   * Get permissions structure
   * @param enabledOnly Whether to only query enabled permissions
   * @returns Promise with permission tree list
   */
  getPermissionTree: async (enabledOnly = false) => {
    return get('/auth/permissions/tree', { params: { enabledOnly } })
  },

  /**
   * Get paginated permissions
   * @param params Pagination and filter parameters
   * @returns Promise with paginated permission list
   */
  getPermissionsPage: async (params) => {
    return post('/auth/permissions/page', params)
  },

  /**
   * Get permission by ID
   * @param id Permission ID
   * @returns Promise with permission details
   */
  getPermissionById: async (id) => {
    return get(`/auth/permissions/${id}`)
  },

  /**
   * Create new permission
   * @param permissionData Permission creation data
   * @returns Promise with created permission
   */
  createPermission: async (permissionData) => {
    return post('/auth/permissions', permissionData)
  },

  /**
   * Update permission information
   * @param permissionData Permission update data (must include id)
   * @returns Promise with updated permission
   */
  updatePermission: async (permissionData) => {
    return put('/auth/permissions', permissionData)
  },

  /**
   * Batch update permission tree structure
   * @param updates Array of permission tree updates
   * @returns Promise with boolean result
   */
  updatePermissionTree: async (updates) => {
    return put('/auth/permissions/tree', updates)
  },

  /**
   * Delete permission
   * @param id Permission ID
   * @returns Promise with boolean result
   */
  deletePermission: async (id) => {
    return del(`/auth/permissions/${id}`)
  },

  /**
   * Batch delete permissions
   * @param ids Array of permission IDs
   * @returns Promise with boolean result
   */
  batchDeletePermissions: async (ids) => {
    return del('/auth/permissions/batch', { data: ids })
  },

  // ========== Role CRUD Operations ==========

  /**
   * Get paginated role list
   * @param params Pagination parameters
   * @returns Promise with paginated role list
   */
  getRoles: async (params) => {
    return post('/auth/roles/page', params)
  },

  /**
   * Get role by ID
   * @param id Role ID
   * @returns Promise with role details
   */
  getRoleById: async (id) => {
    return get(`/auth/roles/${id}`)
  },

  /**
   * Get permissions by role ID
   * @param roleId Role ID
   * @returns Promise with permission list
   */
  getPermissionsByRoleId: async (roleId) => {
    return get(`/auth/roles/${roleId}/permissions`)
  },

  /**
   * Create new role
   * @param roleData Role creation data
   * @returns Promise with created role
   */
  createRole: async (roleData) => {
    return post('/auth/roles', roleData)
  },

  /**
   * Update role information
   * @param id Role ID
   * @param roleData Role update data
   * @returns Promise with boolean result
   */
  updateRole: async (id, roleData) => {
    return put(`/auth/roles/${id}`, roleData)
  },

  /**
   * Update role permissions
   * @param roleId Role ID
   * @param permissionIds Array of permission IDs
   * @returns Promise with boolean result
   */
  updateRolePermissions: async (roleId, permissionIds) => {
    return put(`/auth/roles/${roleId}/permissions`, { permissionIds })
  },

  /**
   * Delete role
   * @param id Role ID
   * @returns Promise with void result
   */
  deleteRole: async (id) => {
    return del(`/auth/roles/${id}`)
  },

  // ========== User-Role Assignment Operations ==========

  /**
   * 分页查询用户角色关联列表
   * @param params 分页和筛选参数 { userId, roleId, username, roleName }
   * @returns Promise with paginated user-role list
   */
  getUserRoleList: async (params) => {
    return post('/auth/users/roles/list', params)
  },

  /**
   * 为用户分配单个角色
   * @param userId User ID
   * @param roleId Role ID to assign
   * @returns Promise with boolean result
   */
  assignRoleToUser: async (userId, roleId) => {
    return post(`/auth/users/${userId}/role`, { roleId })
  },

  /**
   * 批量给用户分配同一个角色
   * @param roleId Role ID
   * @param userIds Array of user IDs
   * @returns Promise with boolean result
   */
  batchAssignRoleToUsers: async (roleId, userIds) => {
    return post(`/auth/users/roles/${roleId}`, { userIds })
  },

  /**
   * 更新用户角色关联
   * @param userRoleId User-Role relation ID
   * @param updateData Update data
   * @returns Promise with boolean result
   */
  updateUserRole: async (userRoleId, updateData) => {
    return put(`/auth/users/roles/${userRoleId}`, updateData)
  }
}
