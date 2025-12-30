<template>
  <div class="record-query-view">
    <!-- 顶部标题区 -->
    <div class="header-section">
      <div>
        <h1 class="page-title">考勤记录查询</h1>
        <p class="page-description">查询和导出成员的考勤记录，了解出勤情况</p>
      </div>
      <t-button theme="primary" variant="outline" @click="handleExport" :loading="exportLoading">
        <template #icon><t-icon name="download" /></template>
        导出记录
      </t-button>
    </div>

    <!-- 搜索筛选区 -->
    <t-card :bordered="false" class="search-card">
      <t-form layout="inline" :data="searchForm" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="日期范围" name="dateRange">
          <t-date-range-picker
            v-model="searchForm.dateRange"
            :presets="datePresets"
            placeholder="选择日期范围"
            style="width: 260px"
            clearable
          />
        </t-form-item>

        <t-form-item label="用户" name="userName">
          <t-input
            v-model="searchForm.userName"
            placeholder="输入用户名搜索"
            clearable
            style="width: 160px"
          />
        </t-form-item>

        <t-form-item label="考勤状态" name="status">
          <t-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 140px">
            <t-option value="IN_PROGRESS" label="进行中" />
            <t-option value="COMPLETED" label="已完成" />
            <t-option value="ABNORMAL" label="异常" />
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
      <t-table
        row-key="id"
        :data="tableData"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        stripe
        hover
      >
        <!-- 空状态 -->
        <template #empty>
          <div class="empty-state">
            <t-icon name="calendar" size="64px" style="color: var(--td-text-color-placeholder);" />
            <p style="margin-top: 16px; color: var(--td-text-color-secondary);">暂无考勤记录</p>
            <p style="margin-top: 8px; color: var(--td-text-color-placeholder); font-size: 14px;">
              调整筛选条件或等待考勤数据生成
            </p>
          </div>
        </template>

        <!-- 自定义：用户列 -->
        <template #userName="{ row }">
          <div class="user-cell">
            <t-avatar v-if="row.userAvatarUrl" :image="row.userAvatarUrl" size="small" />
            <t-avatar v-else size="small">{{ (row.userName || '?').charAt(0) }}</t-avatar>
            <span class="user-name">{{ row.userName || '-' }}</span>
          </div>
        </template>

        <!-- 自定义：日期列 -->
        <template #attendanceDate="{ row }">
          <span>{{ formatDate(row.attendanceDate) }}</span>
        </template>

        <!-- 自定义：签到时间列 -->
        <template #checkInTime="{ row }">
          <span :class="{ 'time-late': row.status === 'ABNORMAL' }">
            {{ formatDateTime(row.checkInTime) }}
          </span>
        </template>

        <!-- 自定义：签退时间列 -->
        <template #checkOutTime="{ row }">
          <span :class="{ 'time-early': row.status === 'ABNORMAL' }">
            {{ formatDateTime(row.checkOutTime) }}
          </span>
        </template>

        <!-- 自定义：状态列 -->
        <template #status="{ row }">
          <t-tag shape="round" :theme="STATUS_MAP[row.status]?.theme" variant="light-outline">
            {{ STATUS_MAP[row.status]?.text || row.status }}
          </t-tag>
        </template>

        <!-- 自定义：工作时长列 -->
        <template #durationMinutes="{ row }">
          <span>{{ formatDuration(row.durationMinutes) }}</span>
        </template>

        <!-- 自定义：操作列 -->
        <template #op="{ row }">
          <div class="op-btns">
            <span class="op-btn default" @click="handleViewDetail(row)">
              <t-icon name="browse" /> 详情
            </span>
          </div>
        </template>
      </t-table>
    </t-card>

    <!-- 详情弹窗 -->
    <t-dialog
      v-model:visible="detailDialogVisible"
      header="考勤记录详情"
      width="600px"
      :destroy-on-close="true"
      attach="body"
      :footer="false"
    >
      <div class="detail-content" v-if="currentDetail">
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <div class="detail-row">
            <span class="detail-label">记录ID：</span>
            <span class="detail-value">{{ currentDetail.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">用户：</span>
            <span class="detail-value user-info">
              <t-avatar v-if="currentDetail.userAvatarUrl" :image="currentDetail.userAvatarUrl" size="small" />
              <t-avatar v-else size="small">{{ (currentDetail.userName || '?').charAt(0) }}</t-avatar>
              {{ currentDetail.userName || '-' }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">考勤日期：</span>
            <span class="detail-value">{{ formatDate(currentDetail.attendanceDate) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">考勤状态：</span>
            <t-tag shape="round" :theme="STATUS_MAP[currentDetail.status]?.theme" variant="light-outline">
              {{ STATUS_MAP[currentDetail.status]?.text || currentDetail.status }}
            </t-tag>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-title">签到签退</h3>
          <div class="detail-row">
            <span class="detail-label">签到时间：</span>
            <span class="detail-value" :class="{ 'time-late': currentDetail.status === 'ABNORMAL' }">
              {{ formatDateTime(currentDetail.checkInTime) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">签退时间：</span>
            <span class="detail-value" :class="{ 'time-early': currentDetail.status === 'ABNORMAL' }">
              {{ formatDateTime(currentDetail.checkOutTime) }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">工作时长：</span>
            <span class="detail-value">{{ formatDuration(currentDetail.durationMinutes) }}</span>
          </div>
        </div>

        <div class="detail-section" v-if="currentDetail.checkInLocation || currentDetail.checkOutLocation">
          <h3 class="section-title">位置信息</h3>
          <div class="detail-row" v-if="currentDetail.checkInLocation">
            <span class="detail-label">签到位置：</span>
            <span class="detail-value">{{ currentDetail.checkInLocation }}</span>
          </div>
          <div class="detail-row" v-if="currentDetail.checkOutLocation">
            <span class="detail-label">签退位置：</span>
            <span class="detail-value">{{ currentDetail.checkOutLocation }}</span>
          </div>
        </div>

        <div class="detail-section" v-if="currentDetail.remark">
          <h3 class="section-title">备注</h3>
          <div class="detail-row">
            <span class="detail-value">{{ currentDetail.remark }}</span>
          </div>
        </div>
      </div>
    </t-dialog>

    <!-- 导出弹窗 -->
    <t-dialog
      v-model:visible="exportDialogVisible"
      header="导出考勤记录"
      :confirm-btn="{ content: '导出', theme: 'primary', loading: exportLoading }"
      @confirm="handleExportConfirm"
      :destroy-on-close="true"
      attach="body"
      width="500px"
    >
      <t-form :data="exportForm" label-width="100px">
        <t-form-item label="日期范围" required>
          <t-date-range-picker
            v-model="exportForm.dateRange"
            :presets="datePresets"
            placeholder="选择导出日期范围"
            style="width: 100%"
          />
        </t-form-item>
        <t-form-item label="导出格式">
          <t-radio-group v-model="exportForm.format">
            <t-radio value="csv">CSV</t-radio>
            <t-radio value="xlsx">Excel</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="筛选状态">
          <t-select v-model="exportForm.status" placeholder="全部状态" clearable style="width: 100%">
            <t-option value="IN_PROGRESS" label="进行中" />
            <t-option value="COMPLETED" label="已完成" />
            <t-option value="ABNORMAL" label="异常" />
          </t-select>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>


<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { attendanceApi } from '@/api/attendance'
import dayjs from 'dayjs'

// 状态映射 - 对应后端 AttendanceStatus 枚举
const STATUS_MAP = {
  // 枚举名称形式
  IN_PROGRESS: { text: '进行中', theme: 'primary' },
  COMPLETED: { text: '已完成', theme: 'success' },
  ABNORMAL: { text: '异常', theme: 'danger' },
  // 数字形式（枚举code）
  0: { text: '进行中', theme: 'primary' },
  1: { text: '已完成', theme: 'success' },
  2: { text: '异常', theme: 'danger' }
}

// 日期预设
const datePresets = {
  今天: [dayjs().startOf('day').toDate(), dayjs().endOf('day').toDate()],
  本周: [dayjs().startOf('week').toDate(), dayjs().endOf('week').toDate()],
  本月: [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()],
  最近7天: [dayjs().subtract(6, 'day').startOf('day').toDate(), dayjs().endOf('day').toDate()],
  最近30天: [dayjs().subtract(29, 'day').startOf('day').toDate(), dayjs().endOf('day').toDate()]
}

// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return dayjs(dateString).format('YYYY-MM-DD')
}

// 日期时间格式化
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  return dayjs(dateTimeString).format('YYYY-MM-DD HH:mm:ss')
}

// 工作时长格式化
const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '-'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }
  return `${mins}分钟`
}

// 响应式数据
const loading = ref(false)
const tableData = ref([])

// 搜索表单
const searchForm = reactive({
  dateRange: [],
  userName: undefined,
  status: undefined
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
  { colKey: 'id', title: 'ID', width: 70, align: 'center' },
  { colKey: 'userName', title: '用户', width: 150 },
  { colKey: 'attendanceDate', title: '日期', width: 120 },
  { colKey: 'checkInTime', title: '签到时间', width: 180 },
  { colKey: 'checkOutTime', title: '签退时间', width: 180 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'durationMinutes', title: '工作时长', width: 120 },
  { colKey: 'op', title: '操作', fixed: 'right', width: 100 }
]

// 详情弹窗
const detailDialogVisible = ref(false)
const currentDetail = ref(null)

// 导出弹窗
const exportDialogVisible = ref(false)
const exportLoading = ref(false)
const exportForm = reactive({
  dateRange: [],
  format: 'xlsx',
  status: undefined
})

// 获取数据 - Requirements 2.1, 2.2
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      params: {}
    }

    // 日期范围筛选
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.params.startDate = dayjs(searchForm.dateRange[0]).format('YYYY-MM-DD')
      params.params.endDate = dayjs(searchForm.dateRange[1]).format('YYYY-MM-DD')
    }

    // 用户名筛选
    if (searchForm.userName) {
      params.params.userName = searchForm.userName
    }

    // 状态筛选
    if (searchForm.status) {
      params.params.status = searchForm.status
    }

    const res = await attendanceApi.getRecordPage(params)

    if (res.code === 200 && res.data) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
    } else {
      MessagePlugin.error(res.message || '获取考勤记录失败')
    }
  } catch (error) {
    console.error('获取考勤记录失败:', error)
    MessagePlugin.error(error.message || '获取考勤记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

// 重置搜索
const handleReset = () => {
  searchForm.dateRange = []
  searchForm.userName = undefined
  searchForm.status = undefined
  pagination.current = 1
  fetchData()
}

// 分页变化
const onPageChange = (pageInfo) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  fetchData()
}

// 查看详情 - Requirements 2.3
const handleViewDetail = async (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true

  try {
    const res = await attendanceApi.getRecordDetail(row.id)

    if (res.code === 200 && res.data) {
      currentDetail.value = {
        ...row,
        ...res.data
      }
    }
  } catch (error) {
    console.error('获取记录详情失败:', error)
  }
}

// 打开导出弹窗 - Requirements 2.4
const handleExport = () => {
  // 预填充当前搜索条件
  exportForm.dateRange = searchForm.dateRange?.length === 2 ? [...searchForm.dateRange] : []
  exportForm.status = searchForm.status
  exportForm.format = 'xlsx'
  exportDialogVisible.value = true
}

// 确认导出 - Requirements 2.4
const handleExportConfirm = async () => {
  if (!exportForm.dateRange || exportForm.dateRange.length !== 2) {
    MessagePlugin.warning('请选择导出日期范围')
    return
  }

  exportLoading.value = true
  try {
    const params = {
      startDate: dayjs(exportForm.dateRange[0]).format('YYYY-MM-DD'),
      endDate: dayjs(exportForm.dateRange[1]).format('YYYY-MM-DD'),
      format: exportForm.format
    }

    if (exportForm.status) {
      params.status = exportForm.status
    }

    const res = await attendanceApi.exportRecords(params)

    // 处理文件下载
    if (res instanceof Blob) {
      const filename = `考勤记录_${params.startDate}_${params.endDate}.${exportForm.format}`
      // 创建下载链接
      const url = window.URL.createObjectURL(res)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      MessagePlugin.success('导出成功')
      exportDialogVisible.value = false
    } else if (res.code === 200) {
      MessagePlugin.success('导出任务已提交')
      exportDialogVisible.value = false
    } else {
      MessagePlugin.error(res.message || '导出失败')
    }
  } catch (error) {
    console.error('导出失败:', error)
    MessagePlugin.error(error.message || '导出失败，请重试')
  } finally {
    exportLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>


<style scoped lang="less">
.record-query-view {
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .user-name {
    font-size: 14px;
    color: var(--td-text-color-primary);
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-late {
  color: var(--td-warning-color);
}

.time-early {
  color: var(--td-warning-color);
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
