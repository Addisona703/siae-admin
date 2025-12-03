<template>
  <div class="permission-view">
    <div class="permission-container">
      <!-- 左侧：角色列表 -->
      <div class="left-panel">
        <RoleList :roles="roles" :active-role-id="activeRoleId || undefined" @update:active-role-id="handleRoleChange"
          @add="handleAddRole" />
      </div>

      <!-- 右侧：权限树管理 -->
      <div class="right-panel">
        <div class="permission-card">
          <PermissionToolbar :active-role-name="activeRoleName" :is-edit-mode="isEditMode" :search-query="searchQuery"
            @update:is-edit-mode="isEditMode = $event" @update:search-query="searchQuery = $event" @save="handleSave" />

          <PermissionTree :permission-tree="permissionTree" :role-permissions="currentRolePermissions"
            :is-edit-mode="isEditMode" :expanded-nodes="expandedNodes" @toggle-select="togglePermissionSelect"
            @toggle-expand="toggleExpand" @drop-node="handleDropNode" @delete-node="handleDeleteNode" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import RoleList from '@/components/permission/RoleList.vue'
import PermissionTree from '@/components/permission/PermissionTree.vue'
import PermissionToolbar from '@/components/permission/PermissionToolbar.vue'
import { permissionApi } from '@/api/permission'

// 数据
const roles = ref([])
const flatPermissions = ref([])
const rolePermissionMap = ref({})

// 状态
const activeRoleId = ref('')
const isEditMode = ref(false)
const expandedNodes = ref(new Set())
const searchQuery = ref('')
const loading = ref(false)

// 加载数据
const loadRoles = async () => {
  try {
    loading.value = true
    const response = await permissionApi.getRoles({ page: 1, size: 100 })
    console.log('[loadRoles] Response:', response)

    if (response.code === 200 && response.data) {
      console.log('[loadRoles] Raw records:', response.data.records)

      // 映射角色数据
      roles.value = response.data.records.map((role) => {
        console.log('[loadRoles] Mapping role:', role)
        const mappedRole = {
          id: role.id,
          name: role.name,
          code: role.code,
          description: role.description || '',
          status: role.status === 1 ? 'active' : 'inactive',
          permissions: [],
          count: 0,
          createdAt: role.createAt || '',
          updatedAt: role.updateAt || ''
        }
        console.log('[loadRoles] Mapped role:', mappedRole)
        return mappedRole
      })

      console.log('[loadRoles] All mapped roles:', roles.value)

      if (roles.value.length > 0 && !activeRoleId.value) {
        const firstRole = roles.value[0]
        console.log('[loadRoles] First role:', firstRole)
        console.log('[loadRoles] First role ID:', firstRole?.id)

        if (firstRole && firstRole.id !== undefined && firstRole.id !== null) {
          activeRoleId.value = String(firstRole.id)
          console.log('[loadRoles] Set activeRoleId to:', activeRoleId.value)
        } else {
          console.error('[loadRoles] First role ID is invalid!')
        }
      }
    }
  } catch (error) {
    console.error('Failed to load roles:', error)
    MessagePlugin.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

const loadPermissions = async () => {
  try {
    loading.value = true
    const response = await permissionApi.getAllPermissions()
    if (response.code === 200 && response.data) {
      flatPermissions.value = response.data
      // 自动展开根节点
      const rootNodes = response.data.filter(p => !p.parentId)
      expandedNodes.value = new Set(rootNodes.map(p => p.id))
    }
  } catch (error) {
    console.error('Failed to load permissions:', error)
    MessagePlugin.error('加载权限列表失败')
  } finally {
    loading.value = false
  }
}

const loadRolePermissions = async (roleId) => {
  console.log('[loadRolePermissions] Called with roleId:', roleId, 'Type:', typeof roleId)

  if (!roleId || roleId === 'undefined' || roleId === undefined) {
    console.error('[loadRolePermissions] Invalid roleId, skipping API call')
    return
  }

  try {
    const response = await permissionApi.getPermissionsByRoleId(roleId)
    if (response.code === 200 && response.data) {
      // 将权限对象数组转换为 ID 数组
      const permissionIds = Array.isArray(response.data)
        ? response.data.map(p => String(p.id))
        : []
      rolePermissionMap.value[String(roleId)] = permissionIds
      console.log('[loadRolePermissions] Loaded permissions for role', roleId, ':', permissionIds)
    }
  } catch (error) {
    console.error('Failed to load role permissions:', error)
    MessagePlugin.error('加载角色权限失败')
  }
}

// 计算属性
const activeRoleName = computed(() => roles.value.find(r => r.id === activeRoleId.value)?.name || '')

const currentRolePermissions = computed(() => rolePermissionMap.value[activeRoleId.value] || [])

const permissionTree = computed(() => {
  const tree = []
  const map = {}

  // 搜索时需要包含祖先节点
  const matchedIds = new Set()
  if (searchQuery.value) {
    flatPermissions.value.forEach(p => {
      if (p.name.includes(searchQuery.value) || p.code.includes(searchQuery.value)) {
        matchedIds.add(p.id)
        // 添加祖先
        let curr = p
        while (curr?.parentId) {
          matchedIds.add(curr.parentId)
          curr = flatPermissions.value.find(x => x.id === curr?.parentId)
          if (!curr) break
        }
      }
    })
  }

  const source = searchQuery.value
    ? flatPermissions.value.filter(p => matchedIds.has(p.id))
    : flatPermissions.value

  // 初始化 map
  source.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })

  // 构建树
  source.forEach(item => {
    const node = map[item.id]
    if (!node) return

    if (item.parentId && map[item.parentId]) {
      const parent = map[item.parentId]
      if (parent?.children) {
        parent.children.push(node)
      }
    } else if (!item.parentId) {
      tree.push(node)
    }
  })

  return tree
})

// 方法
const toggleExpand = (nodeId) => {
  const newSet = new Set(expandedNodes.value)
  if (newSet.has(nodeId)) {
    newSet.delete(nodeId)
  } else {
    newSet.add(nodeId)
  }
  expandedNodes.value = newSet
}

const getDescendants = (id, list = []) => {
  const children = flatPermissions.value.filter(p => p.parentId === id)
  children.forEach(child => {
    list.push(child.id)
    getDescendants(child.id, list)
  })
  return list
}

const getAncestors = (id, list = []) => {
  const node = flatPermissions.value.find(p => p.id === id)
  if (node && node.parentId) {
    list.push(node.parentId)
    getAncestors(node.parentId, list)
  }
  return list
}

const togglePermissionSelect = (permissionId) => {
  if (!activeRoleId.value) return

  const currentPerms = new Set(rolePermissionMap.value[activeRoleId.value] || [])

  if (currentPerms.has(permissionId)) {
    // 取消选中：取消自己和所有后代
    currentPerms.delete(permissionId)
    const descendants = getDescendants(permissionId)
    descendants.forEach(d => currentPerms.delete(d))
  } else {
    // 选中：选中自己和所有祖先
    currentPerms.add(permissionId)
    const ancestors = getAncestors(permissionId)
    ancestors.forEach(a => currentPerms.add(a))
  }

  rolePermissionMap.value = {
    ...rolePermissionMap.value,
    [activeRoleId.value]: Array.from(currentPerms),
  }
}

const isAncestor = (sourceId, targetId) => {
  let current = flatPermissions.value.find(i => i.id === targetId)
  while (current?.parentId) {
    if (current.parentId === sourceId) return true
    current = flatPermissions.value.find(i => i.id === current?.parentId)
  }
  return false
}

const handleDropNode = async (draggedId, targetId) => {
  if (draggedId === targetId) return

  if (isAncestor(draggedId, targetId)) {
    MessagePlugin.warning('无法将节点移动到其子节点下')
    return
  }

  try {
    // 更新权限的父级
    const response = await permissionApi.updatePermission({
      id: draggedId,
      parentId: targetId
    })
    if (response.code === 200) {
      MessagePlugin.success('移动成功')
      await loadPermissions()
      // 展开目标以便查看
      if (!expandedNodes.value.has(targetId)) {
        toggleExpand(targetId)
      }
    } else {
      MessagePlugin.error(response.message || '移动失败')
    }
  } catch (error) {
    console.error('Failed to move permission:', error)
    MessagePlugin.error('移动失败')
  }
}

const handleDeleteNode = async (nodeId) => {
  if (confirm('确定要删除此权限及其所有子权限吗？')) {
    try {
      const response = await permissionApi.deletePermission(nodeId)
      if (response.code === 200) {
        MessagePlugin.success('删除成功')
        await loadPermissions()
      } else {
        MessagePlugin.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('Failed to delete permission:', error)
      MessagePlugin.error('删除失败')
    }
  }
}

const handleAddRole = () => {
  MessagePlugin.info('添加角色功能开发中...')
}

const handleSave = async () => {
  if (!activeRoleId.value) {
    MessagePlugin.warning('请选择一个角色')
    return
  }

  try {
    loading.value = true
    const permissionIds = currentRolePermissions.value
    const response = await permissionApi.updateRolePermissions(activeRoleId.value, permissionIds)

    if (response.code === 200) {
      MessagePlugin.success('保存成功')
      await loadRoles()
    } else {
      MessagePlugin.error(response.message || '保存失败')
    }
  } catch (error) {
    console.error('Failed to save role permissions:', error)
    MessagePlugin.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 监听角色切换，加载对应权限
const handleRoleChange = async (roleId) => {
  console.log('[handleRoleChange] Called with roleId:', roleId, 'Type:', typeof roleId)

  if (!roleId || roleId === 'undefined' || roleId === undefined) {
    console.error('[handleRoleChange] Invalid roleId received!')
    return
  }

  const id = String(roleId)
  activeRoleId.value = id
  console.log('[handleRoleChange] Set activeRoleId to:', activeRoleId.value)

  if (!rolePermissionMap.value[id]) {
    console.log('[handleRoleChange] Loading permissions for role:', id)
    await loadRolePermissions(roleId)
  } else {
    console.log('[handleRoleChange] Permissions already loaded for role:', id)
  }
}

// 初始化
onMounted(async () => {
  await loadPermissions()
  await loadRoles()
  // 等待角色加载完成后，如果有选中的角色，加载其权限
  if (activeRoleId.value && activeRoleId.value !== '' && activeRoleId.value !== 'undefined') {
    await loadRolePermissions(activeRoleId.value)
  }
})
</script>

<style scoped lang="less">
.permission-view {
  width: 100%;
  height: 100%;
  padding: 8px 12px;
}

.permission-container {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  height: calc(100vh - 90px);
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.permission-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--td-bg-color-container);
  border-radius: 12px;
  border: 1px solid var(--td-component-border);
  overflow: hidden;
}

@media (max-width: 1200px) {
  .permission-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .left-panel {
    max-height: 400px;
  }
}
</style>
