<template>
  <div class="leave-approval-view">
    <!-- 顶部标题区 -->
    <div class="header-section">
      <div>
        <h1 class="page-title">请假审批</h1>
        <p class="page-description">审核员工请假申请，批准或拒绝请假请求</p>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <t-card :bordered="false" class="search-card">
      <t-form layout="inline" :data="searchForm" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="审批状态" name="status">
          <t-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 140px">
            <t-option :value="0" label="待审批" />
            <t-option :value="1" label="已批准" />
            <t-option :value="2" label="已拒绝" />
            <t-option :value="3" label="已取消" />
          </t-select>
        </t-form-item>

        <t-form-item label="请假类型" name="leaveType">
          <t-select v-model="searchForm.leaveType" placeholder="全部类型" clearable style="width: 140px">
            <t-option :value="0" label="病假" />
            <t-option :value="1" label="事假" />
          </t-select>
        </t-form-item>

        <t-form-item>
          <t-space size="small">
            <t-button theme="primary" type="submit">
              <template #icon><t-icon name="search" /></template>
              查询
            </t-button>
            <t-button theme="default" type="reset" variant="base">
              <template #icon><t-icon name="refresh" /></template>
              重置
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-card>

    <!-- 数据表格区 -->
    <t-card :bordered="false" class="table-card">
      <!-- 批量操作栏 -->
      <div class="batch-actions" v-if="selectedRowKeys.length > 0">
        <div class="selected-info">
          已选择 <span class="count">{{ selectedRowKeys.length }}</span> 项
        </div>
        <t-space>
          <t-button theme="primary" variant="outline" size="small" @click="handleBatchApprove">批量通过</t-button>
          <t-button theme="danger" variant="outline" size="small" @click="handleBatchReject">批量拒绝</t-button>
        </t-space>
      </div>

      <t-table row-key="id" :data="tableData" :columns="columns" :loading="loading" :selected-row-keys="selectedRowKeys"
        @select-change="onSelectChange" :pagination="pagination" @page-change="onPageChange" stripe hover>
        <!-- 空状态 -->
        <template #empty>
          <div class="empty-state">
            <t-icon name="calendar" size="64px" style="color: var(--td-text-color-placeholder);" />
            <p style="margin-top: 16px; color: var(--td-text-color-secondary);">暂无请假记录</p>
            <p style="margin-top: 8px; color: var(--td-text-color-placeholder); font-size: 14px;">
              当有员工提交请假申请时，将在此处显示
            </p>
          </div>
        </template>

        <!-- 自定义：申请人列 -->
        <template #applicant="{ row }">
          <div class="applicant-cell">
            <t-avatar v-if="row.userAvatarUrl" :image="row.userAvatarUrl" size="small" />
            <t-avatar v-else size="small">{{ (row.userName || '?').charAt(0) }}</t-avatar>
            <span class="applicant-name">{{ row.userName || '-' }}</span>
          </div>
        </template>

        <!-- 自定义：请假类型列 -->
        <template #leaveType="{ row }">
          <t-tag variant="light" :theme="LEAVE_TYPE_MAP[row.leaveType]?.theme || 'default'">
            <template #icon>
              <t-icon :name="LEAVE_TYPE_MAP[row.leaveType]?.icon" />
            </template>
            {{ LEAVE_TYPE_MAP[row.leaveType]?.text || row.leaveType }}
          </t-tag>
        </template>

        <!-- 自定义：请假时间列 -->
        <template #leavePeriod="{ row }">
          <div class="leave-period">
            <div class="period-dates">
              {{ formatDate(row.startDate) }} ~ {{ formatDate(row.endDate) }}
            </div>
          </div>
        </template>

        <!-- 自定义：请假事由列 -->
        <template #reason="{ row }">
          <div class="reason-text" :title="row.reason">
            {{ row.reason || '-' }}
          </div>
        </template>

        <!-- 自定义：审批状态列 -->
        <template #status="{ row }">
          <t-tag shape="round" :theme="STATUS_MAP[row.status]?.theme" variant="light-outline">
            {{ STATUS_MAP[row.status]?.text || row.status }}
          </t-tag>
        </template>

        <!-- 自定义：操作列 -->
        <template #op="{ row }">
          <div class="op-btns">
            <span class="op-btn default" @click="handleViewDetail(row)">
              <t-icon name="browse" /> 详情
            </span>
            <template v-if="isPending(row)">
              <span class="op-btn primary" @click="handleApprove(row)">
                <t-icon name="check" /> 通过
              </span>
              <span class="op-btn danger" @click="handleReject(row)">
                <t-icon name="close" /> 拒绝
              </span>
            </template>
          </div>
        </template>
      </t-table>
    </t-card>

    <!-- 审批弹窗 -->
    <t-dialog v-model:visible="approvalDialogVisible" :header="approvalDialogTitle"
      :confirm-btn="{ content: '确认', theme: approvalAction === 'approve' ? 'primary' : 'danger' }"
      @confirm="handleApprovalConfirm" :destroy-on-close="true" attach="body" :show-overlay="true"
      :close-on-overlay-click="true">
      <t-form :data="approvalForm" :rules="approvalRules" ref="approvalFormRef" v-if="approvalDialogVisible">
        <t-form-item label="审批意见" name="reason">
          <t-textarea v-model="approvalForm.reason"
            :placeholder="approvalAction === 'approve' ? '请输入审批意见（可选）' : '请输入拒绝原因（必填）'"
            :maxlength="500" :autosize="{ minRows: 3, maxRows: 6 }" show-limit-number />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 详情对话框 -->
    <t-dialog v-model:visible="detailModalVisible" header="请假详情" width="800px" :destroy-on-close="true" attach="body"
      placement="center" :show-overlay="true" :close-on-overlay-click="true">
      <div class="detail-content" v-if="currentDetail">
        <!-- 请假信息 -->
        <div class="detail-section">
          <h3 class="section-title">请假信息</h3>
          <div class="detail-row">
            <span class="detail-label">申请ID：</span>
            <span class="detail-value">{{ currentDetail.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">申请人：</span>
            <span class="detail-value applicant-info">
              <t-avatar v-if="currentDetail.userAvatarUrl" :image="currentDetail.userAvatarUrl" size="small" />
              <t-avatar v-else size="small">{{ (currentDetail.userName || '?').charAt(0) }}</t-avatar>
              {{ currentDetail.userName || '-' }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">请假类型：</span>
            <t-tag variant="light" :theme="LEAVE_TYPE_MAP[currentDetail.leaveType]?.theme">
              <template #icon><t-icon :name="LEAVE_TYPE_MAP[currentDetail.leaveType]?.icon" /></template>
              {{ LEAVE_TYPE_MAP[currentDetail.leaveType]?.text }}
            </t-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">请假时间：</span>
            <span class="detail-value">
              {{ formatDate(currentDetail.startDate) }} ~ {{ formatDate(currentDetail.endDate) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">请假天数：</span>
            <span class="detail-value">{{ currentDetail.days }} 天</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">请假事由：</span>
            <span class="detail-value">{{ currentDetail.reason || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">审批状态：</span>
            <t-tag shape="round" :theme="STATUS_MAP[currentDetail.status]?.theme" variant="light-outline">
              {{ STATUS_MAP[currentDetail.status]?.text }}
            </t-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">申请时间：</span>
            <span class="detail-value">{{ formatDateTime(currentDetail.createdAt) }}</span>
          </div>
        </div>

        <!-- 审批信息 -->
        <div class="detail-section" v-if="currentDetail.status !== 0">
          <h3 class="section-title">审批信息</h3>
          <div class="detail-row">
            <span class="detail-label">审批人：</span>
            <span class="detail-value applicant-info">
              <t-avatar v-if="currentDetail.approverAvatarUrl" :image="currentDetail.approverAvatarUrl" size="small" />
              <t-avatar v-else-if="currentDetail.approverName" size="small">{{ currentDetail.approverName.charAt(0) }}</t-avatar>
              {{ currentDetail.approverName || '-' }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">审批时间：</span>
            <span class="detail-value">{{ formatDateTime(currentDetail.approvedAt) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">审批意见：</span>
            <span class="detail-value" :style="{ color: currentDetail.status === 2 ? '#f56c6c' : '' }">
              {{ currentDetail.approvalNote || '-' }}
            </span>
          </div>
        </div>

        <!-- 附件预览 -->
        <div class="detail-section" v-if="currentDetail.attachmentUrls?.length > 0">
          <h3 class="section-title">附件</h3>
          <div class="attachment-preview-list">
            <div v-for="(url, index) in currentDetail.attachmentUrls" :key="index" class="attachment-item">
              <t-image 
                :src="url" 
                fit="contain"
                :style="{ width: '120px', height: '120px' }"
                @click="handlePreviewImage(url)"
              >
                <template #error>
                  <div class="attachment-error" @click="handlePreviewAttachment(url)">
                    <t-icon name="file" size="32px" />
                    <span>附件 {{ index + 1 }}</span>
                  </div>
                </template>
              </t-image>
            </div>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { attendanceApi } from '@/api/attendance'
import dayjs from 'dayjs'

// 请假类型映射
const LEAVE_TYPE_MAP = {
  0: { text: '病假', icon: 'heart', theme: 'warning' },
  1: { text: '事假', icon: 'calendar', theme: 'primary' }
}

// 审批状态映射：0=待审批, 1=已批准, 2=已拒绝, 3=已取消
const STATUS_MAP = {
  0: { text: '待审批', theme: 'warning' },
  1: { text: '已批准', theme: 'success' },
  2: { text: '已拒绝', theme: 'danger' },
  3: { text: '已取消', theme: 'default' }
}

// 判断是否为待审批状态
const isPending = (row) => {
  return row.status === 0
}

// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return dayjs(dateString).format('YYYY-MM-DD')
}

// 日期时间格式化
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedRowKeys = ref([])

// 搜索表单
const searchForm = reactive({
  status: undefined,
  leaveType: undefined
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true
})

// 表格列定义
const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'id', title: 'ID', width: 70, align: 'center' },
  { colKey: 'applicant', title: '申请人', width: 150 },
  { colKey: 'leaveType', title: '请假类型', width: 110 },
  { colKey: 'leavePeriod', title: '请假时间', minWidth: 200 },
  { colKey: 'days', title: '天数', width: 80, align: 'center' },
  { colKey: 'reason', title: '请假事由', minWidth: 150 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'createdAt', title: '申请时间', width: 170 },
  { colKey: 'op', title: '操作', fixed: 'right', width: 200 }
]

// 审批弹窗
const approvalDialogVisible = ref(false)
const approvalDialogTitle = ref('')
const approvalAction = ref('approve')
const approvalFormRef = ref(null)
const currentApprovalRow = ref(null)
const approvalForm = reactive({
  reason: ''
})
const approvalRules = {
  reason: [
    {
      validator: (val) => approvalAction.value === 'approve' || (val && val.trim()),
      message: '拒绝时必须填写原因'
    }
  ]
}

// 详情对话框
const detailModalVisible = ref(false)
const currentDetail = ref(null)

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const param = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      params: {}
    }

    if (searchForm.status !== undefined && searchForm.status !== null) {
      param.params.status = searchForm.status
    }
    if (searchForm.leaveType !== undefined && searchForm.leaveType !== null) {
      param.params.leaveType = searchForm.leaveType
    }

    const res = await attendanceApi.getLeaveRequestPage(param)

    if (res.code === 200 && res.data) {
      tableData.value = res.data.records?.map(item => ({
        ...item,
        // 保持 status 为数字类型，不要用 || 因为 0 是有效值
        status: item.status !== undefined && item.status !== null
          ? item.status
          : 0 // 默认待审批
      })) || []
      pagination.total = res.data.total || 0
    } else {
      MessagePlugin.error(res.message || '获取请假列表失败')
    }
  } catch (error) {
    console.error('获取请假列表失败:', error)
    MessagePlugin.error(error.message || '获取请假列表失败')
  } finally {
    loading.value = false
  }
}

// 事件处理
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.status = undefined
  searchForm.leaveType = undefined
  pagination.current = 1
  fetchData()
}

const onPageChange = (pageInfo) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  fetchData()
}

const onSelectChange = (value) => {
  selectedRowKeys.value = value
}

// 查看详情
const handleViewDetail = async (row) => {
  currentDetail.value = row
  detailModalVisible.value = true

  try {
    const res = await attendanceApi.getLeaveById(row.id)

    if (res.code === 200 && res.data) {
      currentDetail.value = {
        ...row,
        ...res.data
      }
    }
  } catch (error) {
    console.error('获取请假详情失败:', error)
  }
}

// 预览附件（非图片）
const handlePreviewAttachment = (url) => {
  if (url) {
    window.open(url, '_blank')
  } else {
    MessagePlugin.warning('附件链接无效')
  }
}

// 预览图片（使用 TDesign 的图片预览）
const handlePreviewImage = (url) => {
  if (url) {
    window.open(url, '_blank')
  }
}

// 审批通过
const handleApprove = (row) => {
  currentApprovalRow.value = row
  approvalAction.value = 'approve'
  approvalDialogTitle.value = '审批通过'
  approvalForm.reason = ''
  approvalDialogVisible.value = true
}

// 审批拒绝
const handleReject = (row) => {
  currentApprovalRow.value = row
  approvalAction.value = 'reject'
  approvalDialogTitle.value = '审批拒绝'
  approvalForm.reason = ''
  approvalDialogVisible.value = true
}

// 确认审批
const handleApprovalConfirm = async () => {
  // 批量拒绝处理
  if (approvalAction.value === 'batchReject') {
    if (!approvalForm.reason?.trim()) {
      MessagePlugin.warning('拒绝时必须填写原因')
      return
    }
    await doBatchReject()
    return
  }

  if (approvalAction.value === 'reject' && !approvalForm.reason?.trim()) {
    MessagePlugin.warning('拒绝时必须填写原因')
    return
  }

  try {
    const approvalData = {
      approved: approvalAction.value === 'approve',
      reason: approvalForm.reason || ''
    }

    const res = await attendanceApi.approveLeave(
      currentApprovalRow.value.id,
      approvalData
    )

    if (res.code === 200) {
      MessagePlugin.success(
        approvalAction.value === 'approve' ? '批准成功' : '拒绝成功'
      )
      approvalDialogVisible.value = false
      fetchData()
    } else {
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('审批操作失败:', error)
    MessagePlugin.error(error.message || '操作失败，请重试')
  }
}

// 执行批量拒绝
const doBatchReject = async () => {
  try {
    const pendingRows = tableData.value.filter(
      row => selectedRowKeys.value.includes(row.id) && isPending(row)
    )

    if (pendingRows.length === 0) {
      MessagePlugin.warning('没有待审批的记录')
      return
    }

    const promises = pendingRows.map(row =>
      attendanceApi.approveLeave(row.id, {
        approved: false,
        reason: approvalForm.reason
      })
    )

    const results = await Promise.allSettled(promises)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failCount = results.filter(r => r.status === 'rejected').length

    if (failCount === 0) {
      MessagePlugin.success(`已拒绝 ${successCount} 条记录`)
    } else {
      MessagePlugin.warning(`拒绝 ${successCount} 条成功，${failCount} 条失败`)
    }

    selectedRowKeys.value = []
    approvalDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('批量拒绝失败:', error)
    MessagePlugin.error(error.message || '批量拒绝失败')
  }
}

// 批量通过
const handleBatchApprove = async () => {
  if (selectedRowKeys.value.length === 0) return

  try {
    const pendingRows = tableData.value.filter(
      row => selectedRowKeys.value.includes(row.id) && isPending(row)
    )

    if (pendingRows.length === 0) {
      MessagePlugin.warning('没有待审批的记录')
      return
    }

    const confirmed = await DialogPlugin.confirm({
      header: '批量批准',
      body: `确定要批准选中的 ${pendingRows.length} 条请假申请吗？`,
      confirmBtn: '确定',
      cancelBtn: '取消'
    })

    if (!confirmed) return

    const promises = pendingRows.map(row =>
      attendanceApi.approveLeave(row.id, {
        approved: true,
        reason: '批量审批通过'
      })
    )

    const results = await Promise.allSettled(promises)
    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failCount = results.filter(r => r.status === 'rejected').length

    if (failCount === 0) {
      MessagePlugin.success(`已批准 ${successCount} 条记录`)
    } else {
      MessagePlugin.warning(`批准 ${successCount} 条成功，${failCount} 条失败`)
    }

    selectedRowKeys.value = []
    fetchData()
  } catch (error) {
    console.error('批量批准失败:', error)
    MessagePlugin.error(error.message || '批量操作失败，请重试')
  }
}

// 批量拒绝
const handleBatchReject = async () => {
  if (selectedRowKeys.value.length === 0) return

  approvalAction.value = 'batchReject'
  approvalDialogTitle.value = '批量拒绝'
  approvalForm.reason = ''
  approvalDialogVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped lang="less">
.leave-approval-view {
  padding: 24px 24px 0 24px;
  min-height: auto;
  width: 100%;
  background: var(--td-bg-color-page);
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.header-section {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  visibility: visible !important;
  opacity: 1 !important;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--td-text-color-primary) !important;
  margin-bottom: 4px;
  display: block !important;
  visibility: visible !important;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary) !important;
  display: block !important;
  visibility: visible !important;
}

.search-card,
.table-card {
  border-radius: 8px;
  margin-bottom: 24px;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  background: var(--td-bg-color-container) !important;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--td-bg-color-container-hover);
  border-radius: 6px;

  .selected-info {
    font-size: 14px;
    color: var(--td-text-color-secondary);

    .count {
      font-weight: 700;
      color: var(--td-brand-color);
    }
  }
}

.leave-period {
  .period-dates {
    font-size: 14px;
    color: var(--td-text-color-primary);
  }
}

.reason-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
}

.applicant-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .applicant-name {
    font-size: 14px;
    color: var(--td-text-color-primary);
  }
}

.applicant-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.op-btns {
  display: flex;
  gap: 8px;

  .op-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 14px;
    transition: color 0.2s;

    &.default {
      color: var(--td-text-color-secondary);

      &:hover {
        color: var(--td-brand-color);
      }
    }

    &.primary {
      color: var(--td-brand-color);

      &:hover {
        color: var(--td-brand-color-hover);
      }
    }

    &.danger {
      color: var(--td-error-color);

      &:hover {
        color: var(--td-error-color-hover);
      }
    }
  }
}

.detail-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--td-component-border);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin-bottom: 16px;
  }
}

.detail-row {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;

  .detail-label {
    flex-shrink: 0;
    width: 100px;
    color: var(--td-text-color-secondary);
    font-weight: 500;
  }

  .detail-value {
    flex: 1;
    color: var(--td-text-color-primary);
    word-break: break-word;
  }
}

.attachment-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  .attachment-item {
    border: 1px solid var(--td-component-border);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--td-brand-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .attachment-error {
    width: 120px;
    height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--td-bg-color-container-hover);
    color: var(--td-text-color-secondary);
    font-size: 12px;
  }
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

:deep(.t-table) {
  .t-table__header th {
    white-space: nowrap;
  }

  .t-table__pagination {
    padding: 16px 0 0 0;
    margin: 0;
  }
}
</style>

