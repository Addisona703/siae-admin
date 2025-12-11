<template>
  <div class="permission-view">
    <div class="permission-container">
      <!-- 左侧：角色列表 -->
      <div class="left-panel">
        <RoleList :roles="roles" :active-role-id="activeRoleId || undefined" @update:active-role-id="handleRoleChange"
          @add="handleAddRole" @edit="handleEditRole" @delete="handleDeleteRole" />
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

    <!-- 角色编辑弹窗 -->
    <t-dialog v-model:visible="roleDialogVisible" :header="isEditingRole ? '编辑角色' : '新增角色'" :confirm-btn="{ loading: roleSubmitting }"
      @confirm="handleRoleSubmit" @close="resetRoleForm">
      <t-form ref="roleFormRef" :data="roleForm" :rules="roleRules" label-width="80px">
        <t-form-item label="角色名称" name="name">
          <t-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </t-form-item>
        <t-form-item label="角色编码" name="code">
          <t-input v-model="roleForm.code" placeholder="请输入角色编码，如 admin" :disabled="isEditingRole" />
        </t-form-item>
        <t-form-item label="角色描述" name="description">
          <t-textarea v-model="roleForm.description" placeholder="请输入角色描述" :maxlength="200" />
        </t-form-item>
      </t-form>
    </t-dialog>
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
const permissionTreeData = ref([])  // 直接存储后端返回的树结构
const flatPermissions = ref([])      // 扁平数据用于搜索和权限操作
const rolePermissionMap = ref({})

// 状态
const activeRoleId = ref('')
const isEditMode = ref(false)
const expandedNodes = ref(new Set())
const searchQuery = ref('')
const loading = ref(false)

// 将树结构扁平化（仅用于内部操作，不重复构建树）
const flattenTree = (tree, result = []) => {
  tree.forEach(node => {
    const { children, ...rest } = node
    result.push(rest)
    if (children?.length) {
      flattenTree(children, result)
    }
  })
  return result
}

// 加载数据
const loadRoles = async () => {
  try {
    loading.value = true
    const response = await permissionApi.getRoles({ page: 1, size: 100 })

    if (response.code === 200 && response.data) {
      roles.value = response.data.records.map((role) => ({
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description || '',
        status: role.status === 1 ? 'active' : 'inactive',
        permissions: [],
        count: 0,
        createdAt: role.createAt || '',
        updatedAt: role.updateAt || ''
      }))

      if (roles.value.length > 0 && !activeRoleId.value) {
        const firstRole = roles.value[0]
        if (firstRole?.id != null) {
          activeRoleId.value = String(firstRole.id)
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
    // 直接获取树结构，避免重复构建
    const response = await permissionApi.getPermissionTree()
    if (response.code === 200 && response.data) {
      permissionTreeData.value = response.data
      // 扁平化数据用于搜索和权限操作
      flatPermissions.value = flattenTree(response.data)
      // 自动展开根节点
      expandedNodes.value = new Set(response.data.map(p => p.id))
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

// 搜索过滤树（只在搜索时重新构建，无搜索时直接用后端数据）
const permissionTree = computed(() => {
  // 无搜索时直接返回后端树结构
  if (!searchQuery.value) {
    return permissionTreeData.value
  }

  // 有搜索时，过滤并重建树
  const matchedIds = new Set()
  flatPermissions.value.forEach(p => {
    if (p.name.includes(searchQuery.value) || p.code.includes(searchQuery.value)) {
      matchedIds.add(p.id)
      // 添加祖先节点
      let curr = p
      while (curr?.parentId) {
        matchedIds.add(curr.parentId)
        curr = flatPermissions.value.find(x => x.id === curr?.parentId)
        if (!curr) break
      }
    }
  })

  // 递归过滤树
  const filterTree = (nodes) => {
    return nodes
      .filter(node => matchedIds.has(node.id))
      .map(node => ({
        ...node,
        children: node.children?.length ? filterTree(node.children) : []
      }))
  }

  return filterTree(permissionTreeData.value)
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

  // 统一转为字符串处理
  const pid = String(permissionId)
  const currentPerms = new Set(rolePermissionMap.value[activeRoleId.value] || [])

  if (currentPerms.has(pid)) {
    // 取消选中：取消自己和所有后代
    currentPerms.delete(pid)
    const descendants = getDescendants(permissionId)
    descendants.forEach(d => currentPerms.delete(String(d)))
  } else {
    // 选中：选中自己、所有祖先、所有后代
    currentPerms.add(pid)
    const ancestors = getAncestors(permissionId)
    ancestors.forEach(a => currentPerms.add(String(a)))
    const descendants = getDescendants(permissionId)
    descendants.forEach(d => currentPerms.add(String(d)))
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

// 角色表单相关
const roleDialogVisible = ref(false)
const isEditingRole = ref(false)
const roleSubmitting = ref(false)
const roleFormRef = ref(null)
const roleForm = ref({
  id: null,
  name: '',
  code: '',
  description: ''
})
const roleRules = {
  name: [{ required: true, message: '请输入角色名称' }],
  code: [
    { required: true, message: '请输入角色编码' },
    { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '编码只能包含字母、数字和下划线，且以字母或下划线开头' }
  ]
}

const resetRoleForm = () => {
  roleForm.value = { id: null, name: '', code: '', description: '' }
  isEditingRole.value = false
}

const handleAddRole = () => {
  resetRoleForm()
  roleDialogVisible.value = true
}

const handleEditRole = (role) => {
  roleForm.value = {
    id: role.id,
    name: role.name,
    code: role.code,
    description: role.description || ''
  }
  isEditingRole.value = true
  roleDialogVisible.value = true
}

const handleDeleteRole = async (roleId) => {
  try {
    const response = await permissionApi.deleteRole(roleId)
    if (response.code === 200) {
      MessagePlugin.success('删除成功')
      // 如果删除的是当前选中的角色，清空选中
      if (String(roleId) === activeRoleId.value) {
        activeRoleId.value = ''
      }
      await loadRoles()
      // 重新选中第一个角色
      if (roles.value.length > 0 && !activeRoleId.value) {
        activeRoleId.value = String(roles.value[0].id)
        await loadRolePermissions(activeRoleId.value)
      }
    } else {
      MessagePlugin.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('Failed to delete role:', error)
    MessagePlugin.error('删除失败')
  }
}

const handleRoleSubmit = async () => {
  const valid = await roleFormRef.value?.validate()
  if (valid !== true) return

  try {
    roleSubmitting.value = true
    let response
    if (isEditingRole.value) {
      response = await permissionApi.updateRole(roleForm.value.id, {
        name: roleForm.value.name,
        description: roleForm.value.description
      })
    } else {
      response = await permissionApi.createRole({
        name: roleForm.value.name,
        code: roleForm.value.code,
        description: roleForm.value.description
      })
    }

    if (response.code === 200) {
      MessagePlugin.success(isEditingRole.value ? '更新成功' : '创建成功')
      roleDialogVisible.value = false
      await loadRoles()
    } else {
      MessagePlugin.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('Failed to submit role:', error)
    MessagePlugin.error('操作失败')
  } finally {
    roleSubmitting.value = false
  }
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
  // height: 100vh;
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
