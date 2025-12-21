<template>
  <div class="statistics-view">
    <!-- 顶部标题区 -->
    <div class="header-section">
      <div>
        <h1 class="page-title">考勤统计</h1>
        <p class="page-description">查看和分析部门及个人的出勤情况统计数据</p>
      </div>
      <t-space>
        <t-button theme="primary" variant="outline" @click="handleGenerateReport" :loading="reportLoading">
          <template #icon><t-icon name="file-add" /></template>
          生成报表
        </t-button>
        <t-button theme="primary" variant="outline" @click="handleExportReport" :loading="exportLoading">
          <template #icon><t-icon name="download" /></template>
          导出报表
        </t-button>
      </t-space>
    </div>

    <!-- 筛选区 -->
    <t-card :bordered="false" class="filter-card">
      <t-form layout="inline" :data="filterForm">
        <t-form-item label="统计类型" name="type">
          <t-radio-group v-model="filterForm.type" @change="handleTypeChange">
            <t-radio-button value="personal">个人统计</t-radio-button>
            <t-radio-button value="department">部门统计</t-radio-button>
          </t-radio-group>
        </t-form-item>

        <t-form-item v-if="filterForm.type === 'personal'" label="选择用户" name="userId">
          <t-select
            v-model="filterForm.userId"
            placeholder="请选择用户"
            filterable
            style="width: 180px"
            @change="handleFilterChange"
          >
            <t-option
              v-for="user in userList"
              :key="user.id"
              :value="user.id"
              :label="user.name"
            />
          </t-select>
        </t-form-item>

        <t-form-item v-if="filterForm.type === 'department'" label="选择部门" name="departmentId">
          <t-select
            v-model="filterForm.departmentId"
            placeholder="请选择部门"
            filterable
            style="width: 180px"
            @change="handleFilterChange"
          >
            <t-option
              v-for="dept in departmentList"
              :key="dept.id"
              :value="dept.id"
              :label="dept.name"
            />
          </t-select>
        </t-form-item>

        <t-form-item label="日期范围" name="dateRange">
          <t-date-range-picker
            v-model="filterForm.dateRange"
            :presets="datePresets"
            placeholder="选择日期范围"
            style="width: 260px"
            clearable
            @change="handleFilterChange"
          />
        </t-form-item>

        <t-form-item>
          <t-button theme="primary" @click="fetchStatistics">
            <template #icon><t-icon name="search" /></template>
            查询
          </t-button>
        </t-form-item>
      </t-form>
    </t-card>

    <!-- 统计卡片区 -->
    <div class="stats-cards">
      <div class="stat-card-item">
        <StatCard
          title="出勤率"
          :value="statisticsData.attendanceRate ? `${statisticsData.attendanceRate}%` : '-'"
          icon="check-circle"
          color="green"
          :sub-text="`实际出勤 ${statisticsData.actualDays || 0} / ${statisticsData.totalDays || 0} 天`"
        />
      </div>
      <div class="stat-card-item">
        <StatCard
          title="迟到率"
          :value="statisticsData.lateRate ? `${statisticsData.lateRate}%` : '-'"
          icon="time"
          color="red"
          :sub-text="`迟到 ${statisticsData.lateDays || 0} 天`"
        />
      </div>
      <div class="stat-card-item">
        <StatCard
          title="早退次数"
          :value="statisticsData.earlyLeaveDays || 0"
          icon="logout"
          color="purple"
          sub-text="本周期内"
        />
      </div>
      <div class="stat-card-item">
        <StatCard
          title="缺勤天数"
          :value="statisticsData.absentDays || 0"
          icon="close-circle"
          color="red"
          sub-text="本周期内"
        />
      </div>
      <div class="stat-card-item">
        <StatCard
          title="请假天数"
          :value="statisticsData.leaveDays || 0"
          icon="calendar"
          color="blue"
          sub-text="本周期内"
        />
      </div>
    </div>

    <!-- 图表区 -->
    <div class="charts-section">
      <t-row :gutter="24">
        <t-col :span="8">
          <t-card :bordered="false" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span class="chart-title">出勤状态分布</span>
              </div>
            </template>
            <Chart :option="pieChartOption" height="320px" />
          </t-card>
        </t-col>
        <t-col :span="16">
          <t-card :bordered="false" class="chart-card">
            <template #header>
              <div class="chart-header">
                <span class="chart-title">每日出勤情况</span>
              </div>
            </template>
            <Chart :option="barChartOption" height="320px" />
          </t-card>
        </t-col>
      </t-row>
    </div>

    <!-- 报表生成弹窗 -->
    <t-dialog
      v-model:visible="reportDialogVisible"
      header="生成考勤报表"
      :confirm-btn="{ content: '生成', theme: 'primary', loading: reportLoading }"
      @confirm="handleReportConfirm"
      :destroy-on-close="true"
      attach="body"
      width="500px"
    >
      <t-form :data="reportForm" label-width="100px">
        <t-form-item label="报表类型" required>
          <t-radio-group v-model="reportForm.type">
            <t-radio value="personal">个人报表</t-radio>
            <t-radio value="department">部门报表</t-radio>
          </t-radio-group>
        </t-form-item>
        <t-form-item label="日期范围" required>
          <t-date-range-picker
            v-model="reportForm.dateRange"
            :presets="datePresets"
            placeholder="选择报表日期范围"
            style="width: 100%"
          />
        </t-form-item>
        <t-form-item v-if="reportForm.type === 'personal'" label="选择用户">
          <t-select
            v-model="reportForm.userId"
            placeholder="全部用户"
            clearable
            filterable
            style="width: 100%"
          >
            <t-option
              v-for="user in userList"
              :key="user.id"
              :value="user.id"
              :label="user.name"
            />
          </t-select>
        </t-form-item>
        <t-form-item v-if="reportForm.type === 'department'" label="选择部门">
          <t-select
            v-model="reportForm.departmentId"
            placeholder="全部部门"
            clearable
            filterable
            style="width: 100%"
          >
            <t-option
              v-for="dept in departmentList"
              :key="dept.id"
              :value="dept.id"
              :label="dept.name"
            />
          </t-select>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 导出弹窗 -->
    <t-dialog
      v-model:visible="exportDialogVisible"
      header="导出考勤报表"
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
            <t-radio value="xlsx">Excel</t-radio>
            <t-radio value="pdf">PDF</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>


<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { attendanceApi } from '@/api/attendance'
import { userApi } from '@/api/user'
import StatCard from '@/components/StatCard.vue'
import Chart from '@/components/Chart.vue'
import dayjs from 'dayjs'

// 日期预设
const datePresets = {
  本周: [dayjs().startOf('week').toDate(), dayjs().endOf('week').toDate()],
  本月: [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()],
  上月: [dayjs().subtract(1, 'month').startOf('month').toDate(), dayjs().subtract(1, 'month').endOf('month').toDate()],
  最近7天: [dayjs().subtract(6, 'day').startOf('day').toDate(), dayjs().endOf('day').toDate()],
  最近30天: [dayjs().subtract(29, 'day').startOf('day').toDate(), dayjs().endOf('day').toDate()]
}

// 响应式数据
const loading = ref(false)
const reportLoading = ref(false)
const exportLoading = ref(false)

// 用户和部门列表
const userList = ref([])
const departmentList = ref([])

// 筛选表单
const filterForm = reactive({
  type: 'personal',
  userId: undefined,
  departmentId: undefined,
  dateRange: [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()]
})

// 统计数据 - Requirements 3.1
const statisticsData = reactive({
  totalDays: 0,
  actualDays: 0,
  lateDays: 0,
  earlyLeaveDays: 0,
  absentDays: 0,
  leaveDays: 0,
  attendanceRate: 0,
  lateRate: 0,
  dailyRecords: []
})

// 报表弹窗
const reportDialogVisible = ref(false)
const reportForm = reactive({
  type: 'personal',
  dateRange: [],
  userId: undefined,
  departmentId: undefined
})

// 导出弹窗
const exportDialogVisible = ref(false)
const exportForm = reactive({
  dateRange: [],
  format: 'xlsx'
})

// 饼图配置 - Requirements 3.7
const pieChartOption = computed(() => {
  const data = [
    { value: statisticsData.actualDays - statisticsData.lateDays - statisticsData.earlyLeaveDays, name: '正常' },
    { value: statisticsData.lateDays, name: '迟到' },
    { value: statisticsData.earlyLeaveDays, name: '早退' },
    { value: statisticsData.absentDays, name: '缺勤' },
    { value: statisticsData.leaveDays, name: '请假' }
  ].filter(item => item.value > 0)

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} 天 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    color: ['#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6'],
    series: [
      {
        name: '出勤状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: data
      }
    ]
  }
})

// 柱状图配置 - Requirements 3.7
const barChartOption = computed(() => {
  const dailyData = statisticsData.dailyRecords || []
  const dates = dailyData.map(item => dayjs(item.date).format('MM-DD'))
  const normalData = dailyData.map(item => item.normal || 0)
  const lateData = dailyData.map(item => item.late || 0)
  const absentData = dailyData.map(item => item.absent || 0)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['正常', '迟到', '缺勤'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates.length > 0 ? dates : ['暂无数据'],
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '人数'
    },
    color: ['#10b981', '#f59e0b', '#ef4444'],
    series: [
      {
        name: '正常',
        type: 'bar',
        stack: 'total',
        data: normalData.length > 0 ? normalData : [0]
      },
      {
        name: '迟到',
        type: 'bar',
        stack: 'total',
        data: lateData.length > 0 ? lateData : [0]
      },
      {
        name: '缺勤',
        type: 'bar',
        stack: 'total',
        data: absentData.length > 0 ? absentData : [0]
      }
    ]
  }
})

// 获取统计数据 - Requirements 3.2, 3.3, 3.4
const fetchStatistics = async () => {
  if (!filterForm.dateRange || filterForm.dateRange.length !== 2) {
    MessagePlugin.warning('请选择日期范围')
    return
  }

  const startDate = dayjs(filterForm.dateRange[0]).format('YYYY-MM-DD')
  const endDate = dayjs(filterForm.dateRange[1]).format('YYYY-MM-DD')

  loading.value = true
  try {
    let res
    if (filterForm.type === 'personal') {
      if (!filterForm.userId) {
        MessagePlugin.warning('请选择用户')
        loading.value = false
        return
      }
      res = await attendanceApi.getPersonalStatistics(filterForm.userId, startDate, endDate)
    } else {
      if (!filterForm.departmentId) {
        MessagePlugin.warning('请选择部门')
        loading.value = false
        return
      }
      res = await attendanceApi.getDepartmentStatistics(filterForm.departmentId, startDate, endDate)
    }

    if (res.code === 200 && res.data) {
      Object.assign(statisticsData, res.data)
    } else {
      MessagePlugin.error(res.message || '获取统计数据失败')
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
    MessagePlugin.error(error.message || '获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 类型切换
const handleTypeChange = () => {
  // 重置选择
  filterForm.userId = undefined
  filterForm.departmentId = undefined
  // 清空统计数据
  Object.assign(statisticsData, {
    totalDays: 0,
    actualDays: 0,
    lateDays: 0,
    earlyLeaveDays: 0,
    absentDays: 0,
    leaveDays: 0,
    attendanceRate: 0,
    lateRate: 0,
    dailyRecords: []
  })
}

// 筛选条件变化
const handleFilterChange = () => {
  // 可以在这里添加自动查询逻辑
}

// 打开报表生成弹窗 - Requirements 3.5
const handleGenerateReport = () => {
  reportForm.type = filterForm.type
  reportForm.dateRange = filterForm.dateRange?.length === 2 ? [...filterForm.dateRange] : []
  reportForm.userId = filterForm.userId
  reportForm.departmentId = filterForm.departmentId
  reportDialogVisible.value = true
}

// 确认生成报表 - Requirements 3.5
const handleReportConfirm = async () => {
  if (!reportForm.dateRange || reportForm.dateRange.length !== 2) {
    MessagePlugin.warning('请选择报表日期范围')
    return
  }

  reportLoading.value = true
  try {
    const dto = {
      type: reportForm.type,
      startDate: dayjs(reportForm.dateRange[0]).format('YYYY-MM-DD'),
      endDate: dayjs(reportForm.dateRange[1]).format('YYYY-MM-DD')
    }

    if (reportForm.type === 'personal' && reportForm.userId) {
      dto.userId = reportForm.userId
    }
    if (reportForm.type === 'department' && reportForm.departmentId) {
      dto.departmentId = reportForm.departmentId
    }

    const res = await attendanceApi.generateReport(dto)

    if (res.code === 200) {
      MessagePlugin.success('报表生成成功')
      reportDialogVisible.value = false
    } else {
      MessagePlugin.error(res.message || '报表生成失败')
    }
  } catch (error) {
    console.error('报表生成失败:', error)
    MessagePlugin.error(error.message || '报表生成失败，请重试')
  } finally {
    reportLoading.value = false
  }
}

// 打开导出弹窗 - Requirements 3.6
const handleExportReport = () => {
  exportForm.dateRange = filterForm.dateRange?.length === 2 ? [...filterForm.dateRange] : []
  exportForm.format = 'xlsx'
  exportDialogVisible.value = true
}

// 确认导出报表 - Requirements 3.6
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

    const res = await attendanceApi.exportReport(params)

    // 处理文件下载
    if (res instanceof Blob) {
      const url = window.URL.createObjectURL(res)
      const link = document.createElement('a')
      link.href = url
      const filename = `考勤报表_${params.startDate}_${params.endDate}.${exportForm.format}`
      link.setAttribute('download', filename)
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

// 获取用户列表
const fetchUserList = async () => {
  try {
    const res = await userApi.getUsers({
      pageNum: 1,
      pageSize: 1000 // 获取所有用户用于下拉选择
    })
    
    if (res.code === 200 && res.data) {
      // 转换为下拉选项格式
      userList.value = res.data.records.map(user => ({
        id: user.id,
        name: user.username || user.name || `用户${user.id}`
      }))
      console.log('用户列表加载成功:', userList.value.length, '个用户')
    } else {
      console.error('获取用户列表失败:', res.message)
      MessagePlugin.warning('获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    MessagePlugin.error('获取用户列表失败')
  }
}

// 获取部门列表
const fetchDepartmentList = async () => {
  try {
    const res = await userApi.getDepartments()
    
    if (res.code === 200 && res.data) {
      // 转换为下拉选项格式
      departmentList.value = res.data.map(dept => ({
        id: dept.id,
        name: dept.name
      }))
      console.log('部门列表加载成功:', departmentList.value.length, '个部门')
    } else {
      console.error('获取部门列表失败:', res.message)
      MessagePlugin.warning('获取部门列表失败')
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
    MessagePlugin.error('获取部门列表失败')
  }
}

onMounted(() => {
  fetchUserList()
  fetchDepartmentList()
})
</script>


<style scoped lang="less">
.statistics-view {
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

.filter-card {
  border-radius: 8px;
  margin-bottom: 24px;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  background: var(--td-bg-color-container) !important;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.stat-card-item {
  min-width: 0;
}

.charts-section {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 8px;
  background: var(--td-bg-color-container) !important;
  height: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

:deep(.t-card__header) {
  padding-bottom: 8px;
}

:deep(.t-card__body) {
  padding-top: 8px;
}
</style>
