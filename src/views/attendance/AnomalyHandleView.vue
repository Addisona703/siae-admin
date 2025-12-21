<template>
  <div class="anomaly-handle-view">
    <!-- 顶部标题区 -->
    <div class="header-section">
      <div>
        <h1 class="page-title">考勤异常处理</h1>
        <p class="page-description">查看和处理考勤异常，及时处理迟到、早退、缺勤等异常情况</p>
      </div>
      <t-button theme="warning" variant="outline" @click="handleShowUnresolved">
        <template #icon><t-icon name="error-circle" /></template>
        未处理异常
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

        <t-form-item label="异常类型" name="anomalyType">
          <t-select v-model="searchForm.anomalyType" placeholder="全部类型" clearable style="width: 140px">
            <t-option value="LATE" label="迟到" />
            <t-option value="EARLY_DEPARTURE" label="早退" />
            <t-option value="ABSENCE" label="缺勤" />
            <t-option value="MISSING_CHECK_IN" label="漏签到" />
            <t-option value="MISSING_CHECK_OUT" label="漏签退" />
          </t-select>
        </t-form-item>

        <t-form-item label="处理状态" name="resolved">
          <t-select v-model="searchForm.resolved" placeholder="全部状态" clearable style="width: 140px">
            <t-option :value="false" label="未处理" />
            <t-option :value="true" label="已处理" />
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
            <t-icon name="check-circle" size="64px" style="color: var(--td-text-color-placeholder);" />
            <p style="margin-top: 16px; color: var(--td-text-color-secondary);">暂无考勤异常</p>
            <p style="margin-top: 8px; color: var(--td-text-color-placeholder); font-size: 14px;">
              调整筛选条件或等待异常数据生成
            </p>
          </div>
        </template>

        <!-- 自定义：用户列 -->
        <template #userName="{ row }">
          <div class="user-cell">
            <t-avatar size="small">{{ (row.userName || '?').charAt(0) }}</t-avatar>
            <span class="user-name">{{ row.userName || '-' }}</span>
          </div>
        </template>

        <!-- 自定义：异常类型列 -->
        <template #anomalyType="{ row }">
          <t-tag shape="round" :theme="getAnomalyTypeConfig(row.anomalyType)?.theme" variant="light-outline">
            <template #icon>
              <t-icon :name="getAnomalyTypeConfig(row.anomalyType)?.icon" />
            </template>
            {{ getAnomalyTypeConfig(row.anomalyType)?.text || row.anomalyType }}
          </t-tag>
        </template>

        <!-- 自定义：异常日期列 -->
        <template #anomalyDate="{ row }">
          <span>{{ formatDate(row.anomalyDate) }}</span>
        </template>

        <!-- 自定义：异常时长列 -->
        <template #durationMinutes="{ row }">
          <span>{{ row.durationMinutes ? `${row.durationMinutes}分钟` : '-' }}</span>
        </template>

        <!-- 自定义：处理状态列 -->
        <template #resolved="{ row }">
          <t-tag shape="round" :theme="row.resolved ? 'success' : 'warning'" variant="light-outline">
            {{ row.resolved ? '已处理' : '未处理' }}
          </t-tag>
        </template>

        <!-- 自定义：处理人列 -->
        <template #handlerName="{ row }">
          <span>{{ row.handlerName || '-' }}</span>
        </template>

        <!-- 自定义：操作列 -->
        <template #op="{ row }">
          <div class="op-btns">
            <span class="op-btn default" @click="handleViewDetail(row)">
              <t-icon name="browse" /> 查看
            </span>
            <span v-if="!row.resolved" class="op-btn primary" @click="handleProcess(row)">
              <t-icon name="check" /> 处理
            </span>
          </div>
        </template>
      </t-table>
    </t-card>

    <!-- 详情弹窗 -->
    <t-dialog
      v-model:visible="detailDialogVisible"
      header="异常详情"
      width="600px"
      :destroy-on-close="true"
      attach="body"
      :footer="false"
    >
      <div class="detail-content" v-if="currentDetail">
        <div class="detail-section">
          <h3 class="section-title">基本信息</h3>
          <div class="detail-row">
            <span class="detail-label">异常ID：</span>
            <span class="detail-value">{{ currentDetail.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">用户：</span>
            <span class="detail-value user-info">
              <t-avatar size="small">{{ (currentDetail.userName || '?').charAt(0) }}</t-avatar>
              {{ currentDetail.userName || '-' }}
            </span>
          </div>
          <div class="detail-row">
            <span class="detail-label">异常类型：</span>
            <t-tag shape="round" :theme="getAnomalyTypeConfig(currentDetail.anomalyType)?.theme" variant="light-outline">
              <template #icon>
                <t-icon :name="getAnomalyTypeConfig(currentDetail.anomalyType)?.icon" />
              </template>
              {{ getAnomalyTypeConfig(currentDetail.anomalyType)?.text || currentDetail.anomalyType }}
            </t-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">异常日期：</span>
            <span class="detail-value">{{ formatDate(currentDetail.anomalyDate) }}</span>
          </div>
          <div class="detail-row" v-if="currentDetail.durationMinutes">
            <span class="detail-label">异常时长：</span>
            <span class="detail-value">{{ currentDetail.durationMinutes }}分钟</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">处理状态：</span>
            <t-tag shape="round" :theme="currentDetail.resolved ? 'success' : 'warning'" variant="light-outline">
              {{ currentDetail.resolved ? '已处理' : '未处理' }}
            </t-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">创建时间：</span>
            <span class="detail-value">{{ formatDateTime(currentDetail.createdAt) }}</span>
          </div>
        </div>

        <div class="detail-section" v-if="currentDetail.description">
          <h3 class="section-title">异常描述</h3>
          <div class="detail-row">
            <span class="detail-value">{{ currentDetail.description }}</span>
          </div>
        </div>

        <div class="detail-section" v-if="currentDetail.resolved">
          <h3 class="section-title">处理信息</h3>
          <div class="detail-row">
            <span class="detail-label">处理人：</span>
            <span class="detail-value">{{ currentDetail.handlerName || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">处理时间：</span>
            <span class="detail-value">{{ formatDateTime(currentDetail.handledAt) }}</span>
          </div>
          <div class="detail-row" v-if="currentDetail.handlerNote">
            <span class="detail-label">处理备注：</span>
            <span class="detail-value">{{ currentDetail.handlerNote }}</span>
          </div>
        </div>

        <div class="detail-section" v-if="currentDetail.suppressedByLeave">
          <h3 class="section-title">关联信息</h3>
          <div class="detail-row">
            <span class="detail-label">关联请假：</span>
            <span class="detail-value">请假申请ID: {{ currentDetail.suppressedByLeave }}</span>
          </div>
        </div>
      </div>
    </t-dialog>

    <!-- 处理弹窗 -->
    <t-dialog
      v-model:visible="processDialogVisible"
      header="处理异常"
      :confirm-btn="{ content: '确认处理', theme: 'primary', loading: processLoading }"
      @confirm="handleProcessConfirm"
      :destroy-on-close="true"
      attach="body"
      width="500px"
    >
      <t-form :data="processForm" :rules="processRules" ref="processFormRef" label-width="100px">
        <t-form-item label="处理结果" name="resolved" required>
          <t-radio-group v-model="processForm.resolved">
            <t-radio :value="true">已解决</t-radio>
            <t-radio :value="false">未解决</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="处理备注" name="handlerNote">
          <t-textarea
            v-model="processForm.handlerNote"
            placeholder="请输入处理备注（可选）"
            :maxlength="500"
            :autosize="{ minRows: 3, maxRows: 6 }"
            show-limit-number
          />
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

// 异常类型映射 - 与后端 AnomalyType 枚举对齐
// 后端枚举: LATE(0), EARLY_DEPARTURE(1), ABSENCE(2), MISSING_CHECK_IN(3), MISSING_CHECK_OUT(4)
const ANOMALY_TYPE_MAP = {
  // 按枚举名称映射
  LATE: { text: '迟到', theme: 'warning', icon: 'time' },
  EARLY_DEPARTURE: { text: '早退', theme: 'warning', icon: 'logout' },
  ABSENCE: { text: '缺勤', theme: 'danger', icon: 'close-circle' },
  MISSING_CHECK_IN: { text: '漏签到', theme: 'danger', icon: 'login' },
  MISSING_CHECK_OUT: { text: '漏签退', theme: 'danger', icon: 'logout' }
}

// 按枚举code映射
const ANOMALY_TYPE_CODE_MAP = {
  0: { text: '迟到', theme: 'warning', icon: 'time' },
  1: { text: '早退', theme: 'warning', icon: 'logout' },
  2: { text: '缺勤', theme: 'danger', icon: 'close-circle' },
  3: { text: '漏签到', theme: 'danger', icon: 'login' },
  4: { text: '漏签退', theme: 'danger', icon: 'logout' }
}

// 获取异常类型配置（支持枚举对象、字符串或code）
const getAnomalyTypeConfig = (anomalyType) => {
  if (anomalyType === null || anomalyType === undefined) return null
  
  // 如果是数字（枚举code）
  if (typeof anomalyType === 'number') {
    return ANOMALY_TYPE_CODE_MAP[anomalyType] || null
  }
  
  // 如果是字符串（枚举名称）
  if (typeof anomalyType === 'string') {
    return ANOMALY_TYPE_MAP[anomalyType] || null
  }
  
  // 如果是对象（枚举对象 { code: 0, description: '迟到' }）
  if (typeof anomalyType === 'object') {
    // 优先使用code
    if (anomalyType.code !== undefined && anomalyType.code !== null) {
      return ANOMALY_TYPE_CODE_MAP[anomalyType.code] || null
    }
    // 其次使用description匹配
    if (anomalyType.description) {
      const found = Object.values(ANOMALY_TYPE_MAP).find(v => v.text === anomalyType.description)
      return found || { text: anomalyType.description, theme: 'default', icon: 'info-circle' }
    }
  }
  
  return null
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
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

// 响应式数据
const loading = ref(false)
const tableData = ref([])

// 搜索表单
const searchForm = reactive({
  dateRange: [],
  anomalyType: undefined,
  resolved: undefined
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true
})

// 表格列定义 - 与后端 AttendanceAnomalyVO 字段对齐
const columns = [
  { colKey: 'id', title: 'ID', width: 70, align: 'center' },
  { colKey: 'userName', title: '用户', width: 150 },
  { colKey: 'anomalyType', title: '异常类型', width: 120 },
  { colKey: 'anomalyDate', title: '异常日期', width: 120 },
  { colKey: 'durationMinutes', title: '异常时长', width: 100 },
  { colKey: 'resolved', title: '处理状态', width: 100 },
  { colKey: 'handlerName', title: '处理人', width: 120 },
  { colKey: 'op', title: '操作', fixed: 'right', width: 150 }
]

// 详情弹窗
const detailDialogVisible = ref(false)
const currentDetail = ref(null)

// 处理弹窗
const processDialogVisible = ref(false)
const processLoading = ref(false)
const processFormRef = ref(null)
const currentProcessRow = ref(null)
// 处理表单 - 与后端 AnomalyHandleDTO 字段对齐
const processForm = reactive({
  resolved: true,
  handlerNote: ''
})
const processRules = {
  resolved: [{ required: true, message: '请选择处理结果' }]
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      params: {}
    }

    // 日期范围筛选 - 与后端 AnomalyQueryDTO 字段对齐
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      params.params.startDate = dayjs(searchForm.dateRange[0]).format('YYYY-MM-DD')
      params.params.endDate = dayjs(searchForm.dateRange[1]).format('YYYY-MM-DD')
    }

    // 异常类型筛选
    if (searchForm.anomalyType) {
      params.params.anomalyType = searchForm.anomalyType
    }

    // 处理状态筛选
    if (searchForm.resolved !== undefined && searchForm.resolved !== null) {
      params.params.resolved = searchForm.resolved
    }

    const res = await attendanceApi.getAnomalyPage(params)

    if (res.code === 200 && res.data) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
    } else {
      MessagePlugin.error(res.message || '获取异常记录失败')
    }
  } catch (error) {
    console.error('获取异常记录失败:', error)
    MessagePlugin.error(error.message || '获取异常记录失败')
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
  searchForm.anomalyType = undefined
  searchForm.resolved = undefined
  pagination.current = 1
  fetchData()
}

// 分页变化
const onPageChange = (pageInfo) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  fetchData()
}

// 查看详情
const handleViewDetail = async (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true

  try {
    const res = await attendanceApi.getAnomalyDetail(row.id)

    if (res.code === 200 && res.data) {
      currentDetail.value = {
        ...row,
        ...res.data
      }
    }
  } catch (error) {
    console.error('获取异常详情失败:', error)
  }
}

// 打开处理弹窗
const handleProcess = (row) => {
  currentProcessRow.value = row
  processForm.resolved = true
  processForm.handlerNote = ''
  processDialogVisible.value = true
}

// 确认处理 - 与后端 AnomalyHandleDTO 字段对齐
const handleProcessConfirm = async () => {
  if (processForm.resolved === undefined || processForm.resolved === null) {
    MessagePlugin.warning('请选择处理结果')
    return
  }

  processLoading.value = true
  try {
    const dto = {
      resolved: processForm.resolved,
      handlerNote: processForm.handlerNote || ''
    }

    const res = await attendanceApi.handleAnomaly(currentProcessRow.value.id, dto)

    if (res.code === 200) {
      MessagePlugin.success('处理成功')
      processDialogVisible.value = false
      fetchData()
    } else {
      MessagePlugin.error(res.message || '处理失败')
    }
  } catch (error) {
    console.error('处理异常失败:', error)
    MessagePlugin.error(error.message || '处理失败，请重试')
  } finally {
    processLoading.value = false
  }
}

// 显示未处理异常
const handleShowUnresolved = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: 1,
      pageSize: pagination.pageSize
    }

    const res = await attendanceApi.getUnresolvedAnomalies(params)

    if (res.code === 200 && res.data) {
      tableData.value = res.data.records || []
      pagination.total = res.data.total || 0
      pagination.current = 1
      
      // 更新搜索表单状态
      searchForm.resolved = false
      searchForm.dateRange = []
      searchForm.anomalyType = undefined
      
      MessagePlugin.success(`找到 ${pagination.total} 条未处理异常`)
    } else {
      MessagePlugin.error(res.message || '获取未处理异常失败')
    }
  } catch (error) {
    console.error('获取未处理异常失败:', error)
    MessagePlugin.error(error.message || '获取未处理异常失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>


<style scoped lang="less">
.anomaly-handle-view {
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
