<template>
  <div class="user-list-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">用户列表</h2>
        <p class="page-description">管理系统中的所有用户</p>
      </div>
      <!-- <t-button theme="primary" @click="handleCreate">
        <template #icon><t-icon name="add" /></template>
新建用户
</t-button> -->
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <t-form :data="queryForm" layout="inline" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="用户名" name="username">
          <t-input v-model="queryForm.username" placeholder="请输入用户名" clearable style="width: 200px" />
        </t-form-item>

        <t-form-item label="学号" name="studentId">
          <t-input v-model="queryForm.studentId" placeholder="请输入学号" clearable style="width: 200px" />
        </t-form-item>

        <t-form-item label="真实姓名" name="realName">
          <t-input v-model="queryForm.realName" placeholder="请输入真实姓名" clearable style="width: 200px" />
        </t-form-item>

        <t-form-item label="邮箱" name="email">
          <t-input v-model="queryForm.email" placeholder="请输入邮箱" clearable style="width: 200px" />
        </t-form-item>

        <t-form-item label="状态" name="status">
          <t-select v-model="queryForm.status" placeholder="请选择状态" clearable style="width: 150px">
            <t-option :value="1" label="启用" />
            <t-option :value="0" label="禁用" />
          </t-select>
        </t-form-item>

        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit">
              <template #icon><t-icon name="search" /></template>
              搜索
            </t-button>
            <t-button theme="default" type="reset">
              <template #icon><t-icon name="refresh" /></template>
              重置
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <t-table :data="tableData" :columns="columns" :loading="loading" :pagination="pagination" row-key="id" stripe
        hover @page-change="handlePageChange">
        <!-- 头像列 -->
        <template #avatar="{ row }">
          <t-avatar v-if="row.avatarUrl" :image="row.avatarUrl" size="40px" />
          <t-avatar v-else size="40px">
            {{ row.nickname?.charAt(0) || row.username?.charAt(0) || 'U' }}
          </t-avatar>
        </template>

        <!-- 用户信息列 -->
        <template #userInfo="{ row }">
          <div class="user-info">
            <div class="user-name">{{ row.nickname || row.username }}</div>
            <div class="user-meta">@{{ row.username }}</div>
          </div>
        </template>

        <!-- 学号列 -->
        <template #studentId="{ row }">
          <t-tag v-if="row.studentId" theme="default" variant="outline">
            {{ row.studentId }}
          </t-tag>
          <span v-else style="color: var(--td-text-color-placeholder)">-</span>
        </template>

        <!-- 真实姓名列 -->
        <template #realName="{ row }">
          <span v-if="row.realName">{{ row.realName }}</span>
          <span v-else style="color: var(--td-text-color-placeholder)">-</span>
        </template>

        <!-- 邮箱列 -->
        <template #email="{ row }">
          <span v-if="row.email">{{ row.email }}</span>
          <span v-else style="color: var(--td-text-color-placeholder)">-</span>
        </template>

        <!-- 状态列 -->
        <template #status="{ row }">
          <t-tag v-if="row.status === '启用'" theme="success" variant="light">启用</t-tag>
          <t-tag v-else-if="row.status === '禁用'" theme="danger" variant="light">禁用</t-tag>
          <span v-else style="color: var(--td-text-color-placeholder)">-</span>
        </template>

        <!-- 创建时间列 -->
        <template #createAt="{ row }">
          <div class="time-info">
            <div>{{ formatDate(row.createdAt) }}</div>
            <div class="time-meta">{{ formatTime(row.createdAt) }}</div>
          </div>
        </template>

        <!-- 操作列 -->
        <template #operation="{ row }">
          <div class="op-btns">
            <span class="op-btn primary" @click="handleView(row)">
              <t-icon name="view" /> 查看
            </span>
            <span class="op-btn primary" @click="handleEdit(row)">
              <t-icon name="edit" /> 编辑
            </span>
            <t-popconfirm v-if="row.status === '启用'" content="确认拉黑该用户吗？拉黑后用户将无法登录" theme="warning" @confirm="handleDisable(row)">
              <span class="op-btn warning">
                <t-icon name="user-blocked" /> 拉黑
              </span>
            </t-popconfirm>
            <t-popconfirm content="确认删除该用户吗？" theme="warning" @confirm="handleDelete(row)">
              <span class="op-btn danger">
                <t-icon name="delete" /> 删除
              </span>
            </t-popconfirm>
          </div>
        </template>
      </t-table>
    </div>

    <!-- 用户详情弹窗 -->
    <UserDetailDialog v-model:visible="detailVisible" :user-id="currentUserId" />

    <!-- 用户编辑弹窗 -->
    <UserEditDialog v-model:visible="editVisible" :user-id="currentUserId" @success="handleEditSuccess" />

    <!-- 新建用户弹窗 -->
    <UserCreateDialog v-model:visible="createVisible" @success="handleCreateSuccess" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getAllUserList, searchUser } from '@/api/user/user'
import UserDetailDialog from '@/components/user/UserDetailDialog.vue'
import UserEditDialog from '@/components/user/UserEditDialog.vue'
import UserCreateDialog from '@/components/user/UserCreateDialog.vue'
import { deleteUser, disableUser } from '../../api/user/user'

// 查询表单
const queryForm = reactive({
  username: '',
  studentId: '',
  realName: '',
  email: '',
  status: undefined
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 弹窗状态
const detailVisible = ref(false)
const editVisible = ref(false)
const createVisible = ref(false)
const currentUserId = ref()

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100]
})

// 表格列配置
const columns = [
  {
    colKey: 'avatar',
    title: '头像',
    width: 80,
    align: 'center'
  },
  {
    colKey: 'userInfo',
    title: '用户信息',
    width: 180
  },
  {
    colKey: 'studentId',
    title: '学号',
    width: 130
  },
  {
    colKey: 'realName',
    title: '真实姓名',
    width: 120
  },
  {
    colKey: 'email',
    title: '邮箱',
    width: 200
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'createAt',
    title: '创建时间',
    width: 180
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 200,
    align: 'center',
    fixed: 'right'
  }
]

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const response = await getAllUserList({
      pageNum: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 10,
      username: queryForm.username || undefined,
      studentId: queryForm.studentId || undefined,
      realName: queryForm.realName || undefined,
      email: queryForm.email || undefined,
      status: queryForm.status
    })

    if (response.code === 200 && response.data) {
      MessagePlugin.success("查询成功")
      tableData.value = response.data.records
      pagination.total = response.data.total
    } else {
      MessagePlugin.error(response.message || '加载数据失败')
    }
  } catch (error) {
    MessagePlugin.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = async () => {
  // 检查是否有搜索条件
  const hasSearchParams =
    queryForm.username ||
    queryForm.studentId ||
    queryForm.realName ||
    queryForm.email ||
    queryForm.status !== undefined

  if (!hasSearchParams) {
    // 没有搜索条件，使用分页接口
    pagination.current = 1
    loadData()
    return
  }

  // 有搜索条件，使用搜索接口
  loading.value = true
  try {
    // 构建查询参数，只传递有值的参数
    const param = {
      pageNum: 1,
      pageSize: 10,
      params: {}
    }
    if (queryForm.username) param.params.username = queryForm.username
    if (queryForm.studentId) param.params.studentId = queryForm.studentId
    if (queryForm.realName) param.params.realName = queryForm.realName
    if (queryForm.email) param.params.email = queryForm.email
    if (queryForm.status !== undefined) param.params.status = queryForm.status

    const response = await searchUser(param)

    if (response.code === 200 && response.data) {
      // 处理分页格式的返回数据
      if (response.data.records) {
        // 返回的是分页数据格式 { total, records, ... }
        tableData.value = response.data.records
        pagination.total = response.data.total || 0
        pagination.current = 1
      } else if (Array.isArray(response.data)) {
        // 返回的是数组
        tableData.value = response.data
        pagination.total = response.data.length
        pagination.current = 1
      } else {
        // 返回的是单个对象
        tableData.value = [response.data]
        pagination.total = 1
        pagination.current = 1
      }
    } else {
      MessagePlugin.warning(response.message || '未找到匹配的用户')
      tableData.value = []
      pagination.total = 0
    }
  }
  catch (error) {
    MessagePlugin.error('搜索失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 重置
const handleReset = () => {
  pagination.current = 1
  loadData()
}

// 分页变化
const handlePageChange = (pageInfo) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  loadData()
}

// 新建用户
const handleCreate = () => {
  createVisible.value = true
}

// 创建成功回调
const handleCreateSuccess = () => {
  loadData()
}

// 查看用户
const handleView = (row) => {
  currentUserId.value = row.id
  detailVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
  currentUserId.value = row.id
  editVisible.value = true
}

// 编辑成功回调
const handleEditSuccess = () => {
  loadData()
}

// 删除用户
const handleDelete = async (row) => {
  // console.log(row);
  let res = await deleteUser(row.id)
  // console.log(res);
  loadData()


  // try {
  //   const response = await userApi.deleteUser(row.id)
  //   if (response.code === 200) {
  //     MessagePlugin.success('删除成功')
  //     loadData()
  //   } else {
  //     MessagePlugin.error(response.message || '删除失败')
  //   }
  // } catch (error) {
  //   MessagePlugin.error('删除失败')
  //   console.error(error)
  // }
}

// 拉黑用户
const handleDisable = async (row) => {
  try {
    const response = await disableUser(row.id)
    if (response.code === 200) {
      MessagePlugin.success(`已拉黑用户: ${row.realName || row.username}`)
      loadData()
    } else {
      MessagePlugin.error(response.message || '拉黑失败')
    }
  } catch (error) {
    console.error('拉黑用户失败:', error)
    MessagePlugin.error(error.message || '拉黑失败')
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

// 格式化时间
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.user-list-view {
  width: 100%;
  min-height: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 8px;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.filter-section {
  background: var(--td-bg-color-container);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  border: 1px solid var(--td-component-border);
}

.table-section {
  background: var(--td-bg-color-container);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid var(--td-component-border);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--td-text-color-primary);
  }

  .user-meta {
    font-size: 12px;
    color: var(--td-text-color-placeholder);
  }
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 14px;
  color: var(--td-text-color-primary);

  .time-meta {
    font-size: 12px;
    color: var(--td-text-color-placeholder);
  }
}

:deep(.t-form) {
  .t-form__item {
    margin-bottom: 0;
  }
}

// 操作按钮样式
.op-btns {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .op-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &.primary {
      color: #0052d9;
      background: rgba(0, 82, 217, 0.1);

      &:hover {
        background: rgba(0, 82, 217, 0.2);
      }
    }

    &.warning {
      color: #e37318;
      background: rgba(227, 115, 24, 0.1);

      &:hover {
        background: rgba(227, 115, 24, 0.2);
      }
    }

    &.danger {
      color: #e34d59;
      background: rgba(227, 77, 89, 0.1);

      &:hover {
        background: rgba(227, 77, 89, 0.2);
      }
    }
  }
}
</style>
