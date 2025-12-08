<template>
  <div class="user-role-view">
    <div class="user-role-container">
      <!-- 左侧：用户列表 -->
      <div class="left-panel">
        <div class="panel-card">
          <div class="panel-header">
            <div class="header-title">
              <t-icon name="user" />
              <h3>用户列表</h3>
            </div>
            <t-input v-model="userSearchQuery" placeholder="搜索用户名/姓名" clearable size="small" style="width: 160px"
              @enter="loadUsers">
              <template #prefix-icon><t-icon name="search" /></template>
            </t-input>
          </div>

          <div class="user-list" v-loading="userLoading">
            <div v-for="user in users" :key="user.id"
              :class="['user-item', { active: String(activeUserId) === String(user.id) }]"
              @click="handleUserSelect(user)">
              <t-avatar size="36px">{{ user.nickname?.charAt(0) || user.username?.charAt(0) }}</t-avatar>
              <div class="user-info">
                <div class="user-name">{{ user.nickname || user.username }}</div>
                <div class="user-meta">{{ user.username }}</div>
              </div>
            </div>
            <div v-if="users.length === 0 && !userLoading" class="empty-tip">暂无用户</div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrap">
            <t-pagination v-model:current="userPage" v-model:pageSize="userPageSize" :total="userTotal" size="small"
              :page-size-options="[10, 20, 50]" @change="loadUsers" />
          </div>
        </div>
      </div>

      <!-- 右侧：角色分配 -->
      <div class="right-panel">
        <div class="panel-card">
          <div class="panel-header">
            <div class="header-title">
              <t-icon name="usergroup" />
              <h3>{{ activeUserName ? `为 ${activeUserName} 分配角色` : '请选择用户' }}</h3>
            </div>
          </div>

          <div v-if="!activeUserId" class="empty-state">
            <t-icon name="user-arrow-left" size="48px" />
            <p>请从左侧选择一个用户</p>
          </div>

          <div v-else class="role-assignment">
            <div class="role-grid">
              <div v-for="role in allRoles" :key="role.id" class="role-card"
                :class="{ assigned: isRoleAssigned(role.id) }">
                <div class="role-content">
                  <div class="role-header-row">
                    <div class="role-name">{{ role.name }}</div>
                    <t-tag v-if="isRoleAssigned(role.id)" size="small" theme="success">已分配</t-tag>
                  </div>
                  <div class="role-code">{{ role.code }}</div>
                  <div class="role-desc">{{ role.description || '暂无描述' }}</div>
                </div>
                <div class="role-action">
                  <t-button v-if="!isRoleAssigned(role.id)" theme="primary" size="small" :loading="assigningRoleId === role.id"
                    @click="handleAssignRole(role.id)">
                    分配
                  </t-button>
                  <t-tag v-else theme="success" variant="light-outline">
                    <t-icon name="check" /> 已拥有
                  </t-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { userApi } from '@/api/user'
import { permissionApi } from '@/api/permission'

// 用户列表
const users = ref([])
const userPage = ref(1)
const userPageSize = ref(20)
const userTotal = ref(0)
const userLoading = ref(false)
const userSearchQuery = ref('')
const activeUserId = ref(null)
const activeUserName = ref('')

// 角色
const allRoles = ref([])
const userRoles = ref([]) // 当前用户已分配的角色
const assigningRoleId = ref(null)

// 判断角色是否已分配
const isRoleAssigned = (roleId) => {
  return userRoles.value.some(ur => String(ur.roleId) === String(roleId))
}

// 加载用户列表
const loadUsers = async () => {
  try {
    userLoading.value = true
    const params = {
      page: userPage.value,
      size: userPageSize.value
    }
    if (userSearchQuery.value) {
      params.params = { username: userSearchQuery.value }
    }
    const response = await userApi.getUsers(params)
    if (response.code === 200 && response.data) {
      users.value = response.data.records || []
      userTotal.value = response.data.total || 0
    }
  } catch (error) {
    console.error('Failed to load users:', error)
    MessagePlugin.error('加载用户列表失败')
  } finally {
    userLoading.value = false
  }
}

// 加载所有角色
const loadRoles = async () => {
  try {
    const response = await permissionApi.getRoles({ page: 1, size: 100 })
    if (response.code === 200 && response.data) {
      allRoles.value = response.data.records || []
    }
  } catch (error) {
    console.error('Failed to load roles:', error)
    MessagePlugin.error('加载角色列表失败')
  }
}

// 加载用户的角色
const loadUserRoles = async (userId) => {
  try {
    const response = await permissionApi.getUserRoleList({
      page: 1,
      size: 100,
      params: { userId }
    })
    if (response.code === 200 && response.data) {
      userRoles.value = response.data.records || []
    }
  } catch (error) {
    console.error('Failed to load user roles:', error)
    userRoles.value = []
  }
}

// 选择用户
const handleUserSelect = async (user) => {
  activeUserId.value = user.id
  activeUserName.value = user.nickname || user.username
  await loadUserRoles(user.id)
}

// 分配角色
const handleAssignRole = async (roleId) => {
  if (!activeUserId.value) return

  try {
    assigningRoleId.value = roleId
    const response = await permissionApi.assignRoleToUser(activeUserId.value, roleId)
    if (response.code === 200) {
      MessagePlugin.success('分配成功')
      await loadUserRoles(activeUserId.value)
    } else {
      MessagePlugin.error(response.message || '分配失败')
    }
  } catch (error) {
    console.error('Failed to assign role:', error)
    MessagePlugin.error('分配失败')
  } finally {
    assigningRoleId.value = null
  }
}

// 初始化
onMounted(async () => {
  await Promise.all([loadUsers(), loadRoles()])
})
</script>

<style scoped lang="less">
.user-role-view {
  width: 100%;
  height: 100%;
  padding: 8px 12px;
}

.user-role-container {
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

.panel-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--td-bg-color-container);
  border-radius: 12px;
  border: 1px solid var(--td-component-border);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--td-component-border);

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin: 0;
    }
  }
}

.user-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;

  &:hover {
    background: var(--td-bg-color-container-hover);
  }

  &.active {
    background: var(--td-brand-color-light);
    border-color: var(--td-brand-color);
  }
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-meta {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.empty-tip {
  text-align: center;
  color: var(--td-text-color-placeholder);
  padding: 40px 0;
}

.pagination-wrap {
  padding: 12px;
  border-top: 1px solid var(--td-component-border);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-placeholder);
  gap: 16px;
}

.role-assignment {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.role-card {
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--td-component-border);
  background: var(--td-bg-color-container);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 12px;

  &:hover {
    border-color: var(--td-brand-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &.assigned {
    border-color: var(--td-success-color);
    background: var(--td-success-color-1);
  }
}

.role-content {
  flex: 1;
}

.role-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.role-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.role-code {
  font-size: 12px;
  color: var(--td-brand-color);
  font-family: 'Consolas', 'Monaco', monospace;
  margin-bottom: 4px;
}

.role-desc {
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.role-action {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1200px) {
  .user-role-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .left-panel {
    max-height: 400px;
  }
}
</style>
