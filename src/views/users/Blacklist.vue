<template>
  <div class="blacklist-view">
    <!-- 面包屑导航 -->
    <t-breadcrumb class="mb-4">
      <t-breadcrumb-item>用户管理</t-breadcrumb-item>
      <t-breadcrumb-item>黑名单</t-breadcrumb-item>
    </t-breadcrumb>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <t-card :bordered="false" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon disabled">
            <t-icon name="user-blocked" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ pagination.total }}</div>
            <div class="stat-label">禁用用户</div>
          </div>
        </div>
      </t-card>
    </div>

    <!-- 搜索筛选区 -->
    <t-card :bordered="false" class="search-card">
      <t-form layout="inline" :data="searchForm" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="关键词" name="keyword">
          <t-input v-model="searchForm.keyword" placeholder="用户名/姓名" style="width: 200px" clearable>
            <template #prefix-icon>
              <t-icon name="search" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item>
          <t-space size="small">
            <t-button theme="primary" type="submit">
              <template #icon>
                <t-icon name="search" />
              </template>
              查询
            </t-button>
            <t-button theme="default" type="reset">
              <template #icon>
                <t-icon name="refresh" />
              </template>
              重置
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-card>

    <!-- 数据表格 -->
    <t-card :bordered="false" class="table-card" title="禁用用户列表">
      <template #actions>
        <t-button theme="default" variant="outline" @click="handleRefresh">
          <template #icon>
            <t-icon name="refresh" />
          </template>
          刷新
        </t-button>
      </template>

      <t-table row-key="id" :data="tableData" :columns="columns" :loading="loading" :pagination="pagination" stripe
        hover class="mt-2" @page-change="handlePageChange">
        <!-- 用户信息列 -->
        <template #userInfo="{ row }">
          <div class="user-info">
            <t-avatar :image="row.avatarUrl" size="40px" shape="circle">
              {{ row.nickname?.[0] || row.username?.[0] || '?' }}
            </t-avatar>
            <div class="user-details">
              <div class="user-name">{{ row.realName || row.nickname || '-' }}</div>
              <div class="user-username">@{{ row.username }}</div>
            </div>
          </div>
        </template>

        <!-- 状态列 -->
        <template #status="{ row }">
          <t-tag theme="danger" variant="light">
            <template #icon>
              <span class="status-dot disabled"></span>
            </template>
            已禁用
          </t-tag>
        </template>

        <!-- 禁用时间列 -->
        <template #disabledTime="{ row }">
          {{ formatDateTime(row.updatedAt) }}
        </template>

        <!-- 操作列 -->
        <template #op="{ row }">
          <div class="op-btns">
            <t-popconfirm content="确认启用该用户吗？" theme="success" @confirm="handleEnable(row)">
              <span class="op-btn success">
                <t-icon name="check-circle" /> 启用
              </span>
            </t-popconfirm>
            <span class="op-btn primary" @click="viewDetail(row)">
              <t-icon name="view" /> 详情
            </span>
          </div>
        </template>
      </t-table>
    </t-card>

    <!-- 用户详情弹窗 -->
    <UserEditDialog v-model:visible="detailDialog.visible" :user-id="detailDialog.userId" @success="fetchData" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getAllUserList, EditUser } from '@/api/user/user'
import UserEditDialog from '@/components/user/UserEditDialog.vue'

// 响应式数据
const loading = ref(false)

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 表格配置
const columns = [
  { colKey: 'id', title: 'ID', width: 80, align: 'center' },
  { colKey: 'userInfo', title: '用户信息', width: 220 },
  { colKey: 'email', title: '邮箱', width: 200 },
  { colKey: 'phone', title: '手机号', width: 140 },
  { colKey: 'status', title: '状态', width: 120 },
  { colKey: 'disabledTime', title: '禁用时间', width: 180 },
  { colKey: 'op', title: '操作', fixed: 'right', width: 160 }
]

const tableData = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true
})

// 详情弹窗
const detailDialog = reactive({
  visible: false,
  userId: null
})

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 数据加载 - 只查询禁用用户（status: 0）
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      params: {
        status: 0 // 0 = 禁用用户
      }
    }

    // 添加关键词搜索
    if (searchForm.keyword) {
      params.params.keyword = searchForm.keyword
    }

    console.log('查询参数:', params)
    const response = await getAllUserList(params)
    console.log('黑名单数据:', response)

    if (response.code === 200 && response.data) {
      tableData.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      MessagePlugin.error(response.message || '查询失败')
    }
  } catch (error) {
    console.error('获取黑名单失败:', error)
    MessagePlugin.error(error.message || '获取黑名单失败')
  } finally {
    loading.value = false
  }
}

// 事件处理
const handlePageChange = (pageInfo) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  fetchData()
}

const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  pagination.current = 1
  fetchData()
}

const handleRefresh = () => {
  fetchData()
}

// 启用用户
const handleEnable = async (row) => {
  try {
    const response = await EditUser({
      id: row.id,
      status: 1 // 1 = 启用
    })

    if (response.code === 200) {
      MessagePlugin.success(`已启用用户: ${row.realName || row.username}`)
      // 延迟刷新，避免 Vue DOM 更新冲突
      setTimeout(() => {
        fetchData()
      }, 100)
    } else {
      MessagePlugin.error(response.message || '启用失败')
    }
  } catch (error) {
    console.error('启用用户失败:', error)
    MessagePlugin.error(error.message || '启用失败')
  }
}

// 查看详情
const viewDetail = (row) => {
  detailDialog.userId = row.id
  detailDialog.visible = true
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="less">
.blacklist-view {
  width: 100%;

  .mb-4 {
    margin-bottom: 16px;
  }

  // 统计卡片
  .stats-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 16px;

    .stat-card {
      border-radius: 12px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          &.disabled {
            background: linear-gradient(135deg, #e34d59 0%, #c9353f 100%);
            color: white;
          }
        }

        .stat-info {
          .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: var(--td-text-color-primary);
            line-height: 1;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: var(--td-text-color-placeholder);
          }
        }
      }
    }
  }

  .search-card,
  .table-card {
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    margin-bottom: 16px;
  }

  .mt-2 {
    margin-top: 8px;
  }

  // 用户信息样式
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;

    .user-details {
      .user-name {
        font-weight: 600;
        color: var(--td-text-color-primary);
        margin-bottom: 4px;
      }

      .user-username {
        font-size: 12px;
        color: var(--td-text-color-placeholder);
      }
    }
  }

  // 状态圆点
  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;

    &.disabled {
      background-color: #e34d59;
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

      &.success {
        color: #2ba471;
        background: rgba(43, 164, 113, 0.1);

        &:hover {
          background: rgba(43, 164, 113, 0.2);
        }
      }

      &.primary {
        color: #0052d9;
        background: rgba(0, 82, 217, 0.1);

        &:hover {
          background: rgba(0, 82, 217, 0.2);
        }
      }
    }
  }
}
</style>
