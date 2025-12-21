<template>
  <div class="user-audit-view">
    <!-- 面包屑导航 -->
    <t-breadcrumb class="mb-4">
      <t-breadcrumb-item>成员中心</t-breadcrumb-item>
      <t-breadcrumb-item>成员审核</t-breadcrumb-item>
    </t-breadcrumb>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <t-card :bordered="false" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon pending">
            <t-icon name="user-add" size="24px" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ pagination.total }}</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>
      </t-card>
    </div>

    <!-- 数据表格 -->
    <t-card :bordered="false" class="table-card" title="待审核列表">
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
        <!-- 成员信息列 -->
        <template #memberInfo="{ row }">
          <div class="member-info">
            <t-avatar :image="row.headshotUrl" size="40px" shape="circle">
              {{ row.realName?.[0] || '?' }}
            </t-avatar>
            <div class="member-details">
              <div class="member-name">{{ row.realName || '-' }}</div>
              <div class="member-id">用户ID: {{ row.userId }}</div>
            </div>
          </div>
        </template>

        <!-- 学籍信息列 -->
        <template #education="{ row }">
          <div v-if="row.majorName || row.entryYear">
            {{ row.majorName || '-' }} / {{ row.entryYear ? row.entryYear + '级' : '-' }}
          </div>
          <div v-else class="empty-text">-</div>
        </template>

        <!-- 状态列 -->
        <template #status="{ row }">
          <t-tag theme="warning" variant="light">
            <template #icon>
              <span class="status-dot pending"></span>
            </template>
            待审核
          </t-tag>
        </template>

        <!-- 申请时间列 -->
        <template #applyTime="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>

        <!-- 操作列 -->
        <template #op="{ row }">
          <div class="op-btns">
            <span class="op-btn success" @click="handleApprove(row)">
              <t-icon name="check" /> 通过
            </span>
            <t-popconfirm content="确认拒绝该用户的申请吗？" theme="warning" @confirm="() => handleReject(row)">
              <span class="op-btn danger">
                <t-icon name="close" /> 拒绝
              </span>
            </t-popconfirm>
          </div>
        </template>
      </t-table>
    </t-card>

    <!-- 审核通过弹窗 -->
    <MemberPromoteDialog v-model:visible="approveDialog.visible" :member="approveDialog.row"
      :loading="approveDialog.loading" :departments="departments" :positions="positions"
      @confirm="handleApproveSubmit" />

    <!-- 成员详情弹窗 -->
    <MemberDetailDialog v-model:visible="detailDialog.visible" :member-id="detailDialog.memberId" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getAllMemberShips } from '@/api/user/user'
import { userApi } from '@/api'
import MemberPromoteDialog from './components/MemberPromoteDialog.vue'
import MemberDetailDialog from './components/MemberDetailDialog.vue'
import { approve, approveReject } from '../../api/user/user'

// 响应式数据
const loading = ref(false)

// 部门和职位数据
const departments = ref([])
const positions = ref([])

// 表格配置
const columns = [
  { colKey: 'id', title: 'ID', width: 80, align: 'center' },
  { colKey: 'memberInfo', title: '申请人信息', width: 220 },
  { colKey: 'education', title: '学籍信息', width: 200 },
  { colKey: 'status', title: '状态', width: 120 },
  { colKey: 'applyTime', title: '申请时间', width: 180 },
  { colKey: 'op', title: '操作', fixed: 'right', width: 200 }
]

const tableData = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true
})

// 审核通过弹窗
const approveDialog = reactive({
  visible: false,
  loading: false,
  row: null
})

// 详情弹窗
const detailDialog = reactive({
  visible: false,
  memberId: null
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

// 数据加载 - 只查询候选成员（待审核）
const fetchData = async () => {
  loading.value = true
  try {
    const response = await getAllMemberShips({
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      params: {
        lifecycleStatus: 0 // 0 = 候选成员（待审核）
      }
    })

    if (response.code === 200 && response.data) {
      // 先清空旧数据，避免 Vue 更新冲突
      tableData.value = []
      // 使用 nextTick 确保 DOM 更新完成后再设置新数据
      await new Promise(resolve => setTimeout(resolve, 0))
      tableData.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      MessagePlugin.error(response.message || '查询失败')
    }
  } catch (error) {
    console.error('获取待审核列表失败:', error)
    MessagePlugin.error(error.message || '获取待审核列表失败')
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

const handleRefresh = () => {
  pagination.current = 1
  fetchData()
}

// 审核通过
const handleApprove = async (row) => {
  try {
    const res = await approve(row.id)
    if (res.code === 200) {
      MessagePlugin.success('审核通过')
      // 延迟刷新，避免 Vue DOM 更新冲突
      setTimeout(() => {
        fetchData()
      }, 100)
    } else {
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('审核通过失败:', error)
    MessagePlugin.error(error.message || '操作失败')
  }
}

// 提交审核通过
const handleApproveSubmit = async (formData) => {
  if (!approveDialog.row) return

  // 验证必填项
  if (!formData.joinDate) {
    MessagePlugin.warning('请选择转正日期')
    return
  }
  if (!formData.departmentId) {
    MessagePlugin.warning('请选择任命部门')
    return
  }
  if (!formData.positionId) {
    MessagePlugin.warning('请选择授予职位')
    return
  }
  if (!formData.positionStartDate) {
    MessagePlugin.warning('请选择生效日期')
    return
  }

  approveDialog.loading = true
  try {
    const response = await userApi.promoteToOfficial(approveDialog.row.id, formData)

    if (response.code === 200) {
      MessagePlugin.success('审核通过，已转为正式成员')
      approveDialog.visible = false
      fetchData() // 刷新列表
    } else {
      MessagePlugin.error(response.message || '审核失败')
    }
  } catch (error) {
    console.error('审核失败:', error)
    MessagePlugin.error(error.message || '审核失败')
  } finally {
    approveDialog.loading = false
  }
}

// 审核拒绝
const handleReject = async (row) => {
  try {
    const res = await approveReject(row.id)
    if (res.code === 200) {
      MessagePlugin.success('已拒绝申请')
      // 延迟刷新，避免 Vue DOM 更新冲突
      setTimeout(() => {
        fetchData()
      }, 100)
    } else {
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('拒绝申请失败:', error)
    MessagePlugin.error(error.message || '操作失败')
  }
}

// 查看详情
const viewDetail = (row) => {
  detailDialog.memberId = row.id
  detailDialog.visible = true
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="less">
.user-audit-view {
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

          &.pending {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
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

  .table-card {
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .mt-2 {
    margin-top: 8px;
  }

  // 成员信息样式
  .member-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;

    .member-details {
      .member-name {
        font-weight: 600;
        color: var(--td-text-color-primary);
        margin-bottom: 4px;
      }

      .member-id {
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

    &.pending {
      background-color: #e37318;
    }
  }

  .empty-text {
    color: var(--td-text-color-placeholder);
    font-size: 14px;
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

      &.danger {
        color: #e34d59;
        background: rgba(227, 77, 89, 0.1);

        &:hover {
          background: rgba(227, 77, 89, 0.2);
        }
      }
    }
  }
}
</style>
