<template>
  <div class="statistics-dashboard" :class="{ 'animated': !hasPlayedAnimation }">
    <!-- 顶部概览图表 - 2个并列 -->
    <div class="overview-section">
      <h2 class="section-title">数据概览</h2>
      <div class="overview-charts">
        <ChartCard title="成员统计" icon="user" height="450px">
          <MemberOverviewChart :data="memberOverview" :loading="memberOverviewLoading" height="350px" />
        </ChartCard>

        <ChartCard title="获奖等级分布" icon="chart-pie" height="450px">
          <div v-if="awardsByLevelLoading" class="loading-container">
            <t-loading size="large" />
          </div>
          <div v-else-if="!awardsByLevel || awardsByLevel.length === 0" class="empty-container">
            <t-empty description="暂无数据" />
          </div>
          <AwardLevelChart v-else :data="awardsByLevel" :loading="awardsByLevelLoading" height="350px" />
        </ChartCard>

      </div>
    </div>

    <div class="distribution-section">
      <!-- <h2 class="section-title">获奖趋势</h2> -->
      <div class="chart-card-with-tabs">
        <div class="chart-card-tabs-header">
          <t-tabs class="header-tabs">
            <t-tab-panel value="award-trend" label="获奖趋势" />
          </t-tabs>
        </div>
        <div class="chart-card-tabs-content">
          <div>
            <!-- 获奖趋势筛选器 -->
            <div class="trend-filters">
              <t-space>
                <t-select v-model="awardTrendPeriod" :options="periodOptions" size="small" style="width: 100px" />
                <template v-if="awardTrendPeriod === 'month'">
                  <t-date-picker v-model="awardTrendMonthStart" mode="month" size="small" placeholder="开始月份"
                    style="width: 140px" clearable @change="handleAwardTrendDateChange" />
                  <span style="color: var(--td-text-color-placeholder)">至</span>
                  <t-date-picker v-model="awardTrendMonthEnd" mode="month" size="small" placeholder="结束月份"
                    style="width: 140px" clearable @change="handleAwardTrendDateChange" />
                </template>
                <template v-else>
                  <t-date-picker v-model="awardTrendYearStart" mode="year" size="small" placeholder="开始年度"
                    style="width: 120px" clearable @change="handleAwardTrendDateChange" />
                  <span style="color: var(--td-text-color-placeholder)">至</span>
                  <t-date-picker v-model="awardTrendYearEnd" mode="year" size="small" placeholder="结束年度"
                    style="width: 120px" clearable @change="handleAwardTrendDateChange" />
                </template>
                <t-button v-if="awardTrendStartPeriod || awardTrendEndPeriod" size="small" variant="outline"
                  @click="resetAwardTrendFilter">
                  重置
                </t-button>
              </t-space>
            </div>
            <AwardTrendChart :data="awardTrendDetail" :loading="awardTrendLoading" height="400px" />
          </div>
        </div>
      </div>
    </div>

    <!-- 趋势图表 - 成员入会趋势:部门分布 = 3:2 -->
    <div class="trend-section">
      <div class="trend-grid">
        <div class="trend-chart">
          <ChartCard title="部门人数" icon="chart-radar" height="450px">
            <DepartmentChart :data="topDepartments" :loading="departmentsLoading" height="350px"
              @department-click="handleDepartmentClick" />
          </ChartCard>
        </div>
        <div class="level-chart">
          <ChartCard title="赛项分析" icon="chart-radar" height="450px">
            <DepartmentChart :data="topDepartments" :loading="departmentsLoading" height="350px"
              @department-click="handleDepartmentClick" />
          </ChartCard>
        </div>
      </div>
    </div>


    <div class="distribution-section">
      <div class="chart-card-with-tabs">
        <div class="chart-card-tabs-header">
          <t-tabs class="header-tabs">
            <t-tab-panel value="award-trend" label="获奖趋势" />
          </t-tabs>
        </div>
        <div class="chart-card-tabs-content">
          <div>
            <!-- 获奖趋势筛选器 -->
            <div class="trend-filters">
              <t-space>
                <t-select v-model="awardTrendPeriod" :options="periodOptions" size="small" style="width: 100px" />
                <template v-if="awardTrendPeriod === 'month'">
                  <t-date-picker v-model="awardTrendMonthStart" mode="month" size="small" placeholder="开始月份"
                    style="width: 140px" clearable @change="handleAwardTrendDateChange" />
                  <span style="color: var(--td-text-color-placeholder)">至</span>
                  <t-date-picker v-model="awardTrendMonthEnd" mode="month" size="small" placeholder="结束月份"
                    style="width: 140px" clearable @change="handleAwardTrendDateChange" />
                </template>
                <template v-else>
                  <t-date-picker v-model="awardTrendYearStart" mode="year" size="small" placeholder="开始年度"
                    style="width: 120px" clearable @change="handleAwardTrendDateChange" />
                  <span style="color: var(--td-text-color-placeholder)">至</span>
                  <t-date-picker v-model="awardTrendYearEnd" mode="year" size="small" placeholder="结束年度"
                    style="width: 120px" clearable @change="handleAwardTrendDateChange" />
                </template>
                <t-button v-if="awardTrendStartPeriod || awardTrendEndPeriod" size="small" variant="outline"
                  @click="resetAwardTrendFilter">
                  重置
                </t-button>
              </t-space>
            </div>
            <MembershipTrendChart :data="membershipTrend" :loading="membershipTrendLoading" height="400px" />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/api'
import { getAllMember, getAllAwards } from '@/api/dashboard/dashboard'
import ChartCard from '@/components/statistics/ChartCard.vue'
import MemberOverviewChart from '@/components/statistics/MemberOverviewChart.vue'
import MembershipTrendChart from '@/components/statistics/MembershipTrendChart.vue'
import AwardTrendChart from '@/components/statistics/AwardTrendChart.vue'
import DepartmentChart from '@/components/statistics/DepartmentChart.vue'
import AwardLevelChart from '@/components/statistics/AwardLevelChart.vue'
const router = useRouter()

// 标记是否已经播放过动画
const hasPlayedAnimation = ref(false)

// 数据状态
const memberOverview = ref()
const awardOverview = ref()
const membershipTrend = ref([])
const awardTrendDetail = ref([])
const departments = ref([])
const awardsByLevel = ref([])
const ranking = ref([])

// 加载状态
const memberOverviewLoading = ref(false)
const awardOverviewLoading = ref(false)
const membershipTrendLoading = ref(false)
const awardTrendLoading = ref(false)
const departmentsLoading = ref(false)
const awardsByLevelLoading = ref(false)
const rankingLoading = ref(false)

// 周期选择
const memberTrendPeriod = ref('month')
const awardTrendPeriod = ref('month')

// 获奖趋势时间筛选
const awardTrendMonthStart = ref()
const awardTrendMonthEnd = ref()
const awardTrendYearStart = ref()
const awardTrendYearEnd = ref()
const awardTrendStartPeriod = ref()
const awardTrendEndPeriod = ref()

const periodOptions = [
  { label: '按月', value: 'month' },
  { label: '按年', value: 'year' }
]

// 选项卡状态
const activeTab = ref('award-trend')

// 计算属性：TOP 5 部门
const topDepartments = computed(() => {
  return departments.value.slice(0, 5)
})

// 计算属性：TOP 5 排行榜
const topRanking = computed(() => {
  return ranking.value.slice(0, 5)
})

// 加载成员概览
const loadMemberOverview = async () => {
  memberOverviewLoading.value = true
  try {
    // 使用 getAllMember 接口获取成员数据
    const res = await getAllMember({
      pageNum: 1,
      pageSize: 1000
    })

    if (res && res.code === 200 && res.data) {
      // 处理返回的数据，统计各类成员数量
      const members = res.data.records || res.data.list || res.data || []

      // 根据实际数据结构统计
      const stats = {
        formalMembers: 0,
        candidateMembers: 0,
        enabledUsers: 0,
        disabledUsers: 0
      }

      members.forEach(member => {
        // 根据 enrollmentStatus 统计启用/禁用用户 (1=启用, 0=禁用)
        if (member.enrollmentStatus === 1) {
          stats.enabledUsers++
        } else {
          stats.disabledUsers++
        }

        // 根据 lifecycleStatus 字段统计正式成员和候选成员
        if (member.lifecycleStatus === '正式成员') {
          stats.formalMembers++
        } else if (member.lifecycleStatus === '候选成员') {
          stats.candidateMembers++
        }
      })

      memberOverview.value = stats
      // console.log('成员统计:', memberOverview.value)
    }
  } catch (error) {
    console.error('加载成员概览失败:', error)
  } finally {
    memberOverviewLoading.value = false
  }
}

// 加载获奖概览
const loadAwardOverview = async () => {
  awardOverviewLoading.value = true
  try {
    const res = await getAllAwards({
      pageNum: 1,
      pageSize: 1000
    })
    console.log(res);

    if (res.code === 200) {
      awardOverview.value = res.data
    }
  } catch (error) {
    console.error('加载获奖概览失败:', error)
  } finally {
    awardOverviewLoading.value = false
  }
}

// 加载成员入会趋势
const loadMembershipTrend = async () => {
  membershipTrendLoading.value = true
  try {
    const res = await getAllMember({
      pageNum: 1,
      pageSize: 1000
    })

    if (res && res.code === 200 && res.data) {
      const members = res.data.records || []

      // 按时间周期分组统计
      const periodStats = {}

      members.forEach(member => {
        // 统计转正人数（使用 joinDate）
        if (member.lifecycleStatus === '正式成员' && member.joinDate) {
          let period
          if (memberTrendPeriod.value === 'month') {
            period = member.joinDate.substring(0, 7) // YYYY-MM
          } else {
            period = member.joinDate.substring(0, 4) // YYYY
          }

          if (!periodStats[period]) {
            periodStats[period] = { formalCount: 0, candidateCount: 0 }
          }
          periodStats[period].formalCount++
        }

        // 统计候选入会人数（使用 createdAt）
        if (member.lifecycleStatus === '候选成员' && member.createdAt) {
          let period
          if (memberTrendPeriod.value === 'month') {
            period = member.createdAt.substring(0, 7) // YYYY-MM
          } else {
            period = member.createdAt.substring(0, 4) // YYYY
          }

          if (!periodStats[period]) {
            periodStats[period] = { formalCount: 0, candidateCount: 0 }
          }
          periodStats[period].candidateCount++
        }
      })

      // 转换为图表需要的格式并排序
      membershipTrend.value = Object.keys(periodStats)
        .sort()
        .map(period => ({
          period,
          formalCount: periodStats[period].formalCount,
          candidateCount: periodStats[period].candidateCount
        }))

      console.log('成员入会趋势:', membershipTrend.value)
    }
  } catch (error) {
    console.error('加载成员入会趋势失败:', error)
  } finally {
    membershipTrendLoading.value = false
  }
}

// 加载获奖趋势（使用新的详细接口）
const loadAwardTrend = async () => {
  awardTrendLoading.value = true
  try {
    const res = await getAllAwards({
      pageNum: 1,
      pageSize: 1000  // 注意：改为 pageSize（大写 S）
    })
    console.log(res);


    if (res && res.code === 200 && res.data) {
      const awards = res.data.records || res.data.list || []

      // 按时间周期分组统计
      const periodStats = {}

      awards.forEach(award => {
        if (!award.awardedAt) return

        // 根据周期类型提取时间
        let period
        if (awardTrendPeriod.value === 'month') {
          period = award.awardedAt.substring(0, 7) // YYYY-MM
        } else {
          period = award.awardedAt.substring(0, 4) // YYYY
        }

        // 初始化周期统计
        if (!periodStats[period]) {
          periodStats[period] = {}
        }

        // 统计各等级数量
        const level = award.awardLevelName || '未知'
        if (!periodStats[period][level]) {
          periodStats[period][level] = 0
        }
        periodStats[period][level]++
      })

      // 转换为图表需要的格式并排序
      awardTrendDetail.value = Object.keys(periodStats)
        .sort()
        .map(period => ({
          period,
          levelCounts: periodStats[period]
        }))

      console.log('获奖趋势数据:', awardTrendDetail.value)
    }
  } catch (error) {
    console.error('加载获奖趋势失败:', error)
  } finally {
    awardTrendLoading.value = false
  }
}

// 格式化日期为字符串
const formatDate = (date, format) => {
  if (!date) return ''

  // 如果已经是字符串，直接返回
  if (typeof date === 'string') {
    return format === 'month' ? date.substring(0, 7) : date.substring(0, 4)
  }

  // 如果是 Date 对象，格式化
  if (date instanceof Date) {
    const year = date.getFullYear()
    if (format === 'year') {
      return year.toString()
    }
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}-${month}`
  }

  return ''
}

// 处理获奖趋势日期变化
const handleAwardTrendDateChange = () => {
  if (awardTrendPeriod.value === 'month') {
    if (awardTrendMonthStart.value && awardTrendMonthEnd.value) {
      // 格式化为 YYYY-MM
      awardTrendStartPeriod.value = formatDate(awardTrendMonthStart.value, 'month')
      awardTrendEndPeriod.value = formatDate(awardTrendMonthEnd.value, 'month')
    } else {
      awardTrendStartPeriod.value = undefined
      awardTrendEndPeriod.value = undefined
    }
  } else {
    if (awardTrendYearStart.value && awardTrendYearEnd.value) {
      // 格式化为 YYYY
      awardTrendStartPeriod.value = formatDate(awardTrendYearStart.value, 'year')
      awardTrendEndPeriod.value = formatDate(awardTrendYearEnd.value, 'year')
    } else {
      awardTrendStartPeriod.value = undefined
      awardTrendEndPeriod.value = undefined
    }
  }
  loadAwardTrend()
}

// 重置获奖趋势筛选
const resetAwardTrendFilter = () => {
  awardTrendMonthStart.value = undefined
  awardTrendMonthEnd.value = undefined
  awardTrendYearStart.value = undefined
  awardTrendYearEnd.value = undefined
  awardTrendStartPeriod.value = undefined
  awardTrendEndPeriod.value = undefined
  loadAwardTrend()
}

// 加载部门统计
const loadDepartments = async () => {
  departmentsLoading.value = true
  try {
    const res = await getAllMember({
      pageNum: 1,
      pageSize: 1000
    })

    if (res && res.code === 200 && res.data) {
      const members = res.data.records || []

      // 只统计正式成员
      const formalMembers = members.filter(m => m.lifecycleStatus === '正式成员')

      // 按部门分组统计
      const deptStats = {}

      formalMembers.forEach(member => {
        const deptName = member.departmentName || '未分配部门'

        if (!deptStats[deptName]) {
          deptStats[deptName] = {
            departmentName: deptName,
            totalMembers: 0,
            formalMembers: 0,
            candidateMembers: 0
          }
        }

        deptStats[deptName].totalMembers++
        deptStats[deptName].formalMembers++
      })

      // 转换为数组并按总人数排序
      departments.value = Object.values(deptStats)
        .sort((a, b) => b.totalMembers - a.totalMembers)

      console.log('部门统计:', departments.value)
    }
  } catch (error) {
    console.error('加载部门统计失败:', error)
  } finally {
    departmentsLoading.value = false
  }
}

// 加载获奖等级分布
const loadAwardsByLevel = async () => {
  awardsByLevelLoading.value = true
  try {
    // console.log('开始加载获奖等级分布...')
    // 使用 getAllAwards 接口获取所有获奖数据
    const res = await getAllAwards({
      pageNum: 1,
      pageSize: 1000  // 注意：改为 pageSize（大写 S）
    })

    // console.log('API 响应:', res)

    if (res && res.code === 200 && res.data) {
      // 处理返回的数据，按等级统计
      const awards = res.data.records || res.data.list || res.data || []

      // console.log('原始获奖数据数量:', awards.length)

      // 统计各等级的获奖数量
      const levelStats = {}

      awards.forEach(award => {
        const level = award.awardLevelName || award.level || '未知'
        if (levelStats[level]) {
          levelStats[level]++
        } else {
          levelStats[level] = 1
        }
      })

      // console.log('等级统计:', levelStats)

      // 转换为图表需要的格式
      awardsByLevel.value = Object.keys(levelStats).map(level => ({
        name: level,
        count: levelStats[level]
      }))

      // console.log('获奖等级分布:', awardsByLevel.value)
    } else {
      console.error('API 响应格式错误:', res)
    }
  } catch (error) {
    console.error('加载获奖等级分布失败:', error)
  } finally {
    awardsByLevelLoading.value = false
  }
}

// 加载获奖排行榜
const loadRanking = async () => {
  rankingLoading.value = true
  try {
    const res = await userApi.getAwardRanking(10)
    if (res.code === 200) {
      ranking.value = res.data
    }
  } catch (error) {
    console.error('加载获奖排行榜失败:', error)
  } finally {
    rankingLoading.value = false
  }
}

// 事件处理
const handleDepartmentClick = (departmentId) => {
  router.push(`/members/list?departmentId=${departmentId}`)
}

const handleUserClick = (userId) => {
  router.push(`/awards/list?userId=${userId}`)
}

// 监听周期变化
watch(memberTrendPeriod, loadMembershipTrend)
watch(awardTrendPeriod, () => {
  // 切换周期时重置日期选择
  awardTrendMonthStart.value = undefined
  awardTrendMonthEnd.value = undefined
  awardTrendYearStart.value = undefined
  awardTrendYearEnd.value = undefined
  awardTrendStartPeriod.value = undefined
  awardTrendEndPeriod.value = undefined
  loadAwardTrend()
})

// 初始化加载
onMounted(() => {
  // 标记动画已播放
  setTimeout(() => {
    hasPlayedAnimation.value = true
  }, 800) // 等待所有动画完成

  loadMemberOverview()
  loadAwardsByLevel()
  loadAwardTrend()
  loadDepartments()
  loadMembershipTrend()
  // loadAwardOverview()
  // loadRanking()
})
</script>

<style scoped lang="less">
.statistics-dashboard {
  width: 100%;
  padding: 8px;
  background: var(--td-bg-color-page);
  min-height: 100vh;
  color: var(--td-text-color-primary);
}

.loading-container,
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 350px;
}

// 只在首次加载时播放动画
.statistics-dashboard.animated {
  animation: fadeIn 0.4s ease-out;

  .overview-charts>* {
    animation: slideUp 0.4s ease-out forwards;
    opacity: 0;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.05s;
    }
  }

  .trend-grid {
    animation: slideUp 0.4s ease-out 0.1s forwards;
    opacity: 0;
  }

  .distribution-section {
    animation: slideUp 0.4s ease-out 0.2s forwards;
    opacity: 0;
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary) !important;
  margin-bottom: 16px;
}

.overview-section {
  margin-bottom: 32px;
}

.overview-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.trend-section {
  margin-bottom: 32px;
}

.trend-grid {
  display: grid;
  grid-template-columns: 2fr 2fr;
  gap: 24px;

  .trend-chart {
    min-width: 0;
  }

  .level-chart {
    min-width: 0;
  }
}

.distribution-section {
  margin-bottom: 24px;
}

// Tabs 作为卡片头部的样式
.chart-card-with-tabs {
  background: var(--td-bg-color-container);
  border-radius: 16px;
  border: 1px solid var(--td-component-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.chart-card-tabs-header {
  background: var(--td-bg-color-container-hover) !important;
  backdrop-filter: blur(10px);

  .header-tabs {
    background: transparent !important;

    :deep(.t-tabs__nav-wrap) {
      padding: 0 24px !important;
      margin: 0 !important;
      border-bottom: 1px solid var(--td-component-border) !important;
      background: transparent !important;

      &::after {
        display: none !important;
        background: transparent !important;
        border: none !important;
      }
    }

    :deep(.t-tabs__nav) {
      background: transparent !important;
      border: none !important;
      border-bottom: none !important;
    }

    :deep(.t-tabs__bar) {
      display: none !important;
    }

    :deep(.t-tabs__nav-item) {
      font-size: 15px !important;
      font-weight: 500 !important;
      padding: 18px 24px !important;
      color: var(--td-text-color-secondary) !important;
      background: transparent !important;
      transition: all 0.3s !important;
      border: none !important;
      border-bottom: 3px solid transparent !important;
      position: relative !important;

      &.t-is-active {
        color: var(--td-brand-color) !important;
        font-weight: 600 !important;
        border-bottom-color: var(--td-brand-color) !important;
        background: transparent !important;

        &::after {
          content: '' !important;
          position: absolute !important;
          bottom: -1px !important;
          left: 0 !important;
          right: 0 !important;
          height: 3px !important;
          background: var(--td-brand-color) !important;
        }
      }

      &:hover {
        color: var(--td-brand-color) !important;
        background: var(--td-bg-color-container-hover) !important;
      }
    }

    :deep(.t-tabs__nav-item-wrapper) {
      border: none !important;
      background: transparent !important;
    }

    :deep(.t-tabs__content) {
      display: none !important;
    }

    // 强制覆盖所有可能的背景色
    :deep(*) {
      background-color: transparent !important;
    }

    :deep(.t-tabs__nav-wrap),
    :deep(.t-tabs__nav),
    :deep(.t-tabs__nav-container) {
      background-color: transparent !important;
      background: transparent !important;
    }
  }
}

.chart-card-tabs-content {
  padding: 24px;
  background: var(--td-bg-color-container);
}

.trend-filters {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--td-component-border);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式调整
@media (max-width: 1200px) {
  .trend-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .overview-charts {
    grid-template-columns: 1fr;
  }
}
</style>
