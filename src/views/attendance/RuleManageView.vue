<template>
  <div class="rule-manage-view">
    <!-- 顶部标题区 -->
    <div class="header-section">
      <div>
        <h1 class="page-title">考勤规则管理</h1>
        <p class="page-description">配置不同部门或人员的考勤时间和要求</p>
      </div>
      <t-button theme="primary" @click="handleCreate">
        <template #icon><t-icon name="add" /></template>
        创建规则
      </t-button>
    </div>

    <!-- 搜索筛选区 -->
    <t-card :bordered="false" class="search-card">
      <t-form layout="inline" :data="searchForm" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="规则状态" name="status">
          <t-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 140px">
            <t-option
              v-for="item in STATUS_OPTIONS"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </t-select>
        </t-form-item>

        <t-form-item label="考勤类型" name="attendanceType">
          <t-select v-model="searchForm.attendanceType" placeholder="全部类型" clearable style="width: 140px">
            <t-option
              v-for="item in ATTENDANCE_TYPE_OPTIONS"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </t-select>
        </t-form-item>

        <t-form-item label="适用类型" name="targetType">
          <t-select v-model="searchForm.targetType" placeholder="全部类型" clearable style="width: 140px">
            <t-option
              v-for="item in TARGET_TYPE_OPTIONS"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
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
        stripe 
        hover
      >
        <!-- 空状态 -->
        <template #empty>
          <div class="empty-state">
            <t-icon name="calendar" size="64px" style="color: var(--td-text-color-placeholder);" />
            <p style="margin-top: 16px; color: var(--td-text-color-secondary);">暂无考勤规则</p>
            <p style="margin-top: 8px; color: var(--td-text-color-placeholder); font-size: 14px;">
              点击"创建规则"按钮添加新的考勤规则
            </p>
          </div>
        </template>

        <!-- 自定义：规则名称列 -->
        <template #name="{ row }">
          <span class="rule-name">{{ row.name || '-' }}</span>
        </template>

        <!-- 自定义：考勤类型列 -->
        <template #attendanceType="{ row }">
          <t-tag variant="light" :theme="ATTENDANCE_TYPE_MAP[getAttendanceTypeKey(row.attendanceType)]?.theme || 'default'">
            {{ ATTENDANCE_TYPE_MAP[getAttendanceTypeKey(row.attendanceType)]?.text || row.attendanceType }}
          </t-tag>
        </template>

        <!-- 自定义：签到时间列 -->
        <template #checkInTime="{ row }">
          <div v-if="row.checkInStartTime || row.checkInEndTime">
            {{ formatTime(row.checkInStartTime) }} ~ {{ formatTime(row.checkInEndTime) }}
          </div>
          <span v-else>-</span>
        </template>

        <!-- 自定义：签退时间列 -->
        <template #checkOutTime="{ row }">
          <div v-if="row.checkOutStartTime || row.checkOutEndTime">
            {{ formatTime(row.checkOutStartTime) }} ~ {{ formatTime(row.checkOutEndTime) }}
          </div>
          <span v-else>-</span>
        </template>

        <!-- 自定义：适用类型列 -->
        <template #targetType="{ row }">
          <t-tag variant="light" :theme="TARGET_TYPE_MAP[getTargetTypeKey(row.targetType)]?.theme || 'default'">
            {{ TARGET_TYPE_MAP[getTargetTypeKey(row.targetType)]?.text || row.targetType }}
          </t-tag>
        </template>

        <!-- 自定义：状态列 -->
        <template #status="{ row }">
          <t-tag shape="round" :theme="STATUS_MAP[getStatusKey(row.status)]?.theme" variant="light-outline">
            {{ STATUS_MAP[getStatusKey(row.status)]?.text || row.status }}
          </t-tag>
        </template>

        <!-- 自定义：创建时间列 -->
        <template #createdAt="{ row }">
          <span>{{ formatDateTime(row.createdAt) }}</span>
        </template>

        <!-- 自定义：操作列 -->
        <template #op="{ row }">
          <div class="op-btns">
            <span class="op-btn default" @click="handleEdit(row)">
              <t-icon name="edit" /> 编辑
            </span>
            <span
              class="op-btn"
              :class="row.status === 1 ? 'warning' : 'success'"
              @click="handleToggleStatus(row)"
            >
              <t-icon :name="row.status === 1 ? 'poweroff' : 'play-circle'" />
              {{ row.status === 1 ? '禁用' : '启用' }}
            </span>
            <span class="op-btn danger" @click="handleDelete(row)">
              <t-icon name="delete" /> 删除
            </span>
          </div>
        </template>
      </t-table>
    </t-card>

    <!-- 创建/编辑规则弹窗 -->
    <t-dialog
      v-model:visible="formDialogVisible"
      :header="isEdit ? '编辑规则' : '创建规则'"
      :confirm-btn="{ content: '确认', theme: 'primary', loading: submitLoading }"
      @confirm="handleFormSubmit"
      :destroy-on-close="true"
      attach="body"
      width="600px"
    >
      <t-form
        ref="formRef"
        :data="formData"
        :rules="formRules"
        label-width="120px"
        v-if="formDialogVisible"
      >
        <t-form-item label="规则名称" name="name">
          <t-input v-model="formData.name" placeholder="请输入规则名称" />
        </t-form-item>

        <t-form-item label="规则描述" name="description">
          <t-textarea v-model="formData.description" placeholder="请输入规则描述（可选）" :autosize="{ minRows: 2, maxRows: 4 }" />
        </t-form-item>

        <t-form-item label="考勤类型" name="attendanceType">
          <t-radio-group v-model="formData.attendanceType">
            <t-radio
              v-for="item in ATTENDANCE_TYPE_OPTIONS"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="签到开始时间" name="checkInStartTime">
          <t-time-picker v-model="formData.checkInStartTime" format="HH:mm" placeholder="请选择签到开始时间" />
        </t-form-item>

        <t-form-item label="签到结束时间" name="checkInEndTime">
          <t-time-picker v-model="formData.checkInEndTime" format="HH:mm" placeholder="请选择签到结束时间" />
        </t-form-item>

        <t-form-item label="签退开始时间" name="checkOutStartTime">
          <t-time-picker v-model="formData.checkOutStartTime" format="HH:mm" placeholder="请选择签退开始时间" />
        </t-form-item>

        <t-form-item label="签退结束时间" name="checkOutEndTime">
          <t-time-picker v-model="formData.checkOutEndTime" format="HH:mm" placeholder="请选择签退结束时间" />
        </t-form-item>

        <t-form-item label="适用类型" name="targetType">
          <t-select v-model="formData.targetType" placeholder="请选择适用类型">
            <t-option
              v-for="item in TARGET_TYPE_OPTIONS"
              :key="item.value"
              :value="item.value"
              :label="item.label"
            />
          </t-select>
        </t-form-item>

        <t-form-item label="适用对象" name="targetIds" v-if="formData.targetType !== 'ALL'">
          <t-select 
            v-model="formData.targetIds" 
            multiple 
            :placeholder="formData.targetType === 'DEPARTMENT' ? '请选择部门' : '请选择人员'"
            :loading="targetOptionsLoading"
            filterable
          >
            <t-option 
              v-for="item in targetOptions" 
              :key="item.value" 
              :value="item.value" 
              :label="item.label" 
            />
          </t-select>
        </t-form-item>

        <t-form-item label="位置验证" name="locationRequired">
          <t-switch v-model="formData.locationRequired" />
        </t-form-item>

        <t-form-item label="允许位置" name="allowedLocations" v-if="formData.locationRequired">
          <div class="location-list">
            <div v-for="(loc, index) in formData.allowedLocations" :key="index" class="location-item">
              <LocationPicker v-model="formData.allowedLocations[index]" />
              <span v-if="loc.latitude" class="location-coords">
                ({{ loc.latitude?.toFixed(4) }}, {{ loc.longitude?.toFixed(4) }})
              </span>
              <t-button theme="danger" variant="text" @click="removeLocation(index)">
                <t-icon name="delete" />
              </t-button>
            </div>
            <t-button theme="default" variant="dashed" @click="addLocation" style="width: 100%">
              <template #icon><t-icon name="add" /></template>
              添加位置
            </t-button>
          </div>
        </t-form-item>

        <t-form-item label="位置半径" name="locationRadiusMeters" v-if="formData.locationRequired">
          <t-input-number 
            v-model="formData.locationRadiusMeters" 
            :min="50" 
            :max="5000"
            suffix="米"
            placeholder="允许的打卡范围"
          />
        </t-form-item>

        <t-form-item label="迟到阈值" name="lateThresholdMinutes">
          <t-input-number 
            v-model="formData.lateThresholdMinutes" 
            :min="0" 
            :max="120"
            suffix="分钟"
            placeholder="迟到阈值"
          />
        </t-form-item>

        <t-form-item label="早退阈值" name="earlyThresholdMinutes">
          <t-input-number 
            v-model="formData.earlyThresholdMinutes" 
            :min="0" 
            :max="120"
            suffix="分钟"
            placeholder="早退阈值"
          />
        </t-form-item>

        <t-form-item label="生效日期" name="effectiveDate">
          <t-date-picker v-model="formData.effectiveDate" placeholder="请选择生效日期" clearable />
        </t-form-item>

        <t-form-item label="失效日期" name="expiryDate">
          <t-date-picker v-model="formData.expiryDate" placeholder="请选择失效日期（可选）" clearable />
        </t-form-item>

        <t-form-item label="优先级" name="priority">
          <t-input-number 
            v-model="formData.priority" 
            :min="0" 
            :max="100"
            placeholder="数字越大优先级越高"
          />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { attendanceApi } from '@/api/attendance'
import { userApi } from '@/api/user'
import LocationPicker from '@/components/common/LocationPicker.vue'
import dayjs from 'dayjs'

// 考勤类型枚举映射 (对应数据库: 0-日常考勤, 1-活动考勤)
const ATTENDANCE_TYPE_MAP = {
  DAILY: { text: '日常考勤', theme: 'primary', value: 0 },
  ACTIVITY: { text: '活动考勤', theme: 'success', value: 1 }
}

// 适用对象类型枚举映射 (对应数据库: 0-全体, 1-部门, 2-个人)
const TARGET_TYPE_MAP = {
  ALL: { text: '全体成员', theme: 'primary', value: 0 },
  DEPARTMENT: { text: '部门', theme: 'warning', value: 1 },
  INDIVIDUAL: { text: '个人', theme: 'default', value: 2 }
}

// 规则状态枚举映射 (对应数据库: 0-禁用, 1-启用)
const STATUS_MAP = {
  DISABLED: { text: '禁用', theme: 'default', value: 0 },
  ENABLED: { text: '启用', theme: 'success', value: 1 }
}

// 考勤类型选项（用于表单）
const ATTENDANCE_TYPE_OPTIONS = [
  { label: '日常考勤', value: 'DAILY' },
  { label: '活动考勤', value: 'ACTIVITY' }
]

// 适用对象类型选项（用于表单和搜索）
const TARGET_TYPE_OPTIONS = [
  { label: '全体成员', value: 'ALL' },
  { label: '部门', value: 'DEPARTMENT' },
  { label: '个人', value: 'INDIVIDUAL' }
]

// 状态选项（用于搜索）
const STATUS_OPTIONS = [
  { label: '启用', value: 'ENABLED' },
  { label: '禁用', value: 'DISABLED' }
]

// 日期时间格式化
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss')
}

// 时间格式化（只显示时间部分）
const formatTime = (time) => {
  if (!time) return '-'
  return time
}

// 根据数值获取考勤类型枚举键
const getAttendanceTypeKey = (value) => {
  return Object.keys(ATTENDANCE_TYPE_MAP).find(key => ATTENDANCE_TYPE_MAP[key].value === value) || null
}

// 根据数值获取适用类型枚举键
const getTargetTypeKey = (value) => {
  return Object.keys(TARGET_TYPE_MAP).find(key => TARGET_TYPE_MAP[key].value === value) || null
}

// 根据数值获取状态枚举键
const getStatusKey = (value) => {
  return Object.keys(STATUS_MAP).find(key => STATUS_MAP[key].value === value) || null
}

// 响应式数据
const loading = ref(false)
const tableData = ref([])

// 搜索表单
const searchForm = reactive({
  status: undefined,
  attendanceType: undefined,
  targetType: undefined
})

// 表格列定义
const columns = [
  { colKey: 'id', title: 'ID', width: 70, align: 'center' },
  { colKey: 'name', title: '规则名称', width: 150 },
  { colKey: 'attendanceType', title: '考勤类型', width: 110 },
  { colKey: 'checkInTime', title: '签到时间', width: 150 },
  { colKey: 'checkOutTime', title: '签退时间', width: 150 },
  { colKey: 'targetType', title: '适用类型', width: 100 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'createdAt', title: '创建时间', width: 170 },
  { colKey: 'op', title: '操作', fixed: 'right', width: 200 }
]

// 表单弹窗
const formDialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const currentEditId = ref(null)

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  attendanceType: 'DAILY',
  checkInStartTime: '',
  checkInEndTime: '',
  checkOutStartTime: '',
  checkOutEndTime: '',
  targetType: 'ALL',
  targetIds: [],
  lateThresholdMinutes: 30,
  earlyThresholdMinutes: 30,
  locationRequired: false,
  allowedLocations: [],
  locationRadiusMeters: 200,
  effectiveDate: null,
  expiryDate: null,
  priority: 0
})

// 适用对象选项
const targetOptions = ref([])
const targetOptionsLoading = ref(false)

// 监听 targetType 变化，加载对应的选项
watch(() => formData.targetType, async (newType) => {
  formData.targetIds = []
  targetOptions.value = []
  
  if (newType === 'ALL') return
  
  targetOptionsLoading.value = true
  try {
    if (newType === 'DEPARTMENT') {
      const res = await userApi.getDepartments()
      if (res.code === 200 && res.data) {
        targetOptions.value = res.data.map(d => ({ value: d.id, label: d.name }))
      }
    } else if (newType === 'INDIVIDUAL') {
      const res = await userApi.getAllUserList({ pageNum: 1, pageSize: 500 })
      if (res.code === 200 && res.data?.records) {
        targetOptions.value = res.data.records.map(u => ({ value: u.id, label: u.realName || u.username }))
      }
    }
  } catch (error) {
    console.error('加载适用对象失败:', error)
  } finally {
    targetOptionsLoading.value = false
  }
})

// 添加位置
const addLocation = () => {
  formData.allowedLocations.push({ name: '', latitude: null, longitude: null })
}

// 移除位置
const removeLocation = (index) => {
  formData.allowedLocations.splice(index, 1)
}

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  attendanceType: [{ required: true, message: '请选择考勤类型', trigger: 'change' }],
  checkInStartTime: [{ required: true, message: '请选择签到开始时间', trigger: 'change' }],
  checkInEndTime: [{ required: true, message: '请选择签到结束时间', trigger: 'change' }],
  checkOutStartTime: [{ required: true, message: '请选择签退开始时间', trigger: 'change' }],
  checkOutEndTime: [{ required: true, message: '请选择签退结束时间', trigger: 'change' }],
  targetType: [{ required: true, message: '请选择适用类型', trigger: 'change' }],
  effectiveDate: [{ required: true, message: '请选择生效日期', trigger: 'change' }]
}

// 重置表单数据
const resetFormData = () => {
  formData.name = ''
  formData.description = ''
  formData.attendanceType = 'DAILY'
  formData.checkInStartTime = ''
  formData.checkInEndTime = ''
  formData.checkOutStartTime = ''
  formData.checkOutEndTime = ''
  formData.targetType = 'ALL'
  formData.targetIds = []
  formData.lateThresholdMinutes = 30
  formData.earlyThresholdMinutes = 30
  formData.locationRequired = false
  formData.allowedLocations = []
  formData.locationRadiusMeters = 200
  formData.effectiveDate = null
  formData.expiryDate = null
  formData.priority = 0
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await attendanceApi.getRuleList(
      searchForm.status,
      searchForm.attendanceType,
      searchForm.targetType
    )

    if (res.code === 200 && res.data) {
      tableData.value = res.data || []
    } else {
      MessagePlugin.error(res.message || '获取规则列表失败')
    }
  } catch (error) {
    console.error('获取规则列表失败:', error)
    MessagePlugin.error(error.message || '获取规则列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  fetchData()
}

// 重置搜索
const handleReset = () => {
  searchForm.status = undefined
  searchForm.attendanceType = undefined
  searchForm.targetType = undefined
  fetchData()
}

// 创建规则
const handleCreate = () => {
  isEdit.value = false
  currentEditId.value = null
  resetFormData()
  formDialogVisible.value = true
}

// 编辑规则
const handleEdit = (row) => {
  isEdit.value = true
  currentEditId.value = row.id
  formData.name = row.name
  formData.description = row.description || ''

  // 将数字类型的 attendanceType 转换为枚举键
  formData.attendanceType = getAttendanceTypeKey(row.attendanceType) || 'DAILY'

  // 时间字段直接使用字符串格式
  formData.checkInStartTime = row.checkInStartTime || ''
  formData.checkInEndTime = row.checkInEndTime || ''
  formData.checkOutStartTime = row.checkOutStartTime || ''
  formData.checkOutEndTime = row.checkOutEndTime || ''

  // 将数字类型的 targetType 转换为枚举键
  formData.targetType = getTargetTypeKey(row.targetType) || 'ALL'
  formData.targetIds = row.targetIds || []
  formData.lateThresholdMinutes = row.lateThresholdMinutes || 30
  formData.earlyThresholdMinutes = row.earlyThresholdMinutes || 30
  formData.locationRequired = row.locationRequired || false
  formData.allowedLocations = row.allowedLocations || []
  formData.locationRadiusMeters = row.locationRadiusMeters || 200
  formData.effectiveDate = row.effectiveDate ? new Date(row.effectiveDate) : null
  formData.expiryDate = row.expiryDate ? new Date(row.expiryDate) : null
  formData.priority = row.priority || 0
  formDialogVisible.value = true
}

// 提交表单
const handleFormSubmit = async () => {
  console.log('开始提交表单...')
  console.log('formRef.value:', formRef.value)
  
  const valid = await formRef.value?.validate()
  console.log('表单验证结果:', valid)
  
  if (valid !== true) {
    console.log('表单验证失败')
    return
  }

  submitLoading.value = true
  try {
    // 处理时间格式 - 确保是 HH:mm:ss 格式的字符串
    const formatTime = (time) => {
      console.log('原始时间值:', time, '类型:', typeof time)
      if (!time) return null
      if (typeof time === 'string') {
        // 如果是 HH:mm 格式，补上秒
        if (time.length === 5) {
          const result = time + ':00'
          console.log('补秒后:', result)
          return result
        }
        return time
      }
      // 如果是Date对象，格式化为HH:mm:ss
      const result = dayjs(time).format('HH:mm:ss')
      console.log('Date格式化后:', result)
      return result
    }

    const dto = {
      name: formData.name,
      description: formData.description,
      attendanceType: formData.attendanceType,
      checkInStartTime: formatTime(formData.checkInStartTime),
      checkInEndTime: formatTime(formData.checkInEndTime),
      checkOutStartTime: formatTime(formData.checkOutStartTime),
      checkOutEndTime: formatTime(formData.checkOutEndTime),
      targetType: formData.targetType,
      targetIds: formData.targetType !== 'ALL' ? formData.targetIds : null,
      lateThresholdMinutes: formData.lateThresholdMinutes,
      earlyThresholdMinutes: formData.earlyThresholdMinutes,
      locationRequired: formData.locationRequired,
      allowedLocations: formData.locationRequired ? formData.allowedLocations.filter(loc => loc.name && loc.latitude && loc.longitude) : null,
      locationRadiusMeters: formData.locationRequired ? formData.locationRadiusMeters : null,
      effectiveDate: formData.effectiveDate ? dayjs(formData.effectiveDate).format('YYYY-MM-DD') : null,
      expiryDate: formData.expiryDate ? dayjs(formData.expiryDate).format('YYYY-MM-DD') : null,
      priority: formData.priority
    }

    console.log('准备发送的数据:', dto)

    let res
    if (isEdit.value) {
      res = await attendanceApi.updateRule(currentEditId.value, dto)
    } else {
      res = await attendanceApi.createRule(dto)
    }

    console.log('API响应:', res)

    if (res.code === 200) {
      MessagePlugin.success(isEdit.value ? '更新成功' : '创建成功')
      formDialogVisible.value = false
      fetchData()
    } else {
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    MessagePlugin.error(error.message || '操作失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

// 切换状态（启用/禁用）
const handleToggleStatus = async (row) => {
  const isEnable = row.status !== 1  // 1 表示启用，0 表示禁用
  const actionText = isEnable ? '启用' : '禁用'

  const confirmDialog = DialogPlugin.confirm({
    header: `${actionText}规则`,
    body: `确定要${actionText}规则"${row.name}"吗？`,
    confirmBtn: { content: '确定', theme: isEnable ? 'primary' : 'warning' },
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        let res
        if (isEnable) {
          res = await attendanceApi.enableRule(row.id)
        } else {
          res = await attendanceApi.disableRule(row.id)
        }

        if (res.code === 200) {
          MessagePlugin.success(`${actionText}成功`)
          fetchData()
        } else {
          MessagePlugin.error(res.message || `${actionText}失败`)
        }
      } catch (error) {
        console.error(`${actionText}失败:`, error)
        MessagePlugin.error(error.message || `${actionText}失败，请重试`)
      }
      confirmDialog.destroy()
    },
    onClose: () => {
      confirmDialog.destroy()
    }
  })
}

// 删除规则
const handleDelete = (row) => {
  const confirmDialog = DialogPlugin.confirm({
    header: '删除规则',
    body: `确定要删除规则"${row.name}"吗？此操作不可恢复。`,
    confirmBtn: { content: '删除', theme: 'danger' },
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        const res = await attendanceApi.deleteRule(row.id)

        if (res.code === 200) {
          MessagePlugin.success('删除成功')
          fetchData()
        } else {
          MessagePlugin.error(res.message || '删除失败')
        }
      } catch (error) {
        console.error('删除失败:', error)
        MessagePlugin.error(error.message || '删除失败，请重试')
      }
      confirmDialog.destroy()
    },
    onClose: () => {
      confirmDialog.destroy()
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>


<style scoped lang="less">
.rule-manage-view {
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

.rule-name {
  font-weight: 500;
  color: var(--td-text-color-primary);
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

    &.success {
      color: var(--td-success-color);

      &:hover {
        color: var(--td-success-color-hover);
      }
    }

    &.warning {
      color: var(--td-warning-color);

      &:hover {
        color: var(--td-warning-color-hover);
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.location-list {
  width: 100%;
  
  .location-item {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    align-items: center;
  }

  .location-coords {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    white-space: nowrap;
  }
}

:deep(.t-table) {
  .t-table__header th {
    white-space: nowrap;
  }
}
</style>
