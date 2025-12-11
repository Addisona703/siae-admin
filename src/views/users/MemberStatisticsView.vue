<template>
  <div class="member-statistics" :class="{ 'animated': !hasPlayedAnimation }">
    <!-- 成员概览 - 方案三：通栏仪表盘 -->
    <div class="overview-section">
      <h2 class="section-title">成员概览</h2>
      <div class="dashboard-container">
        <!-- 第一块：总览 -->
        <div class="dashboard-block">
          <div class="dashboard-icon blue">
            <t-icon name="user" size="24px" />
          </div>
          <div class="dashboard-content">
            <p class="dashboard-label">总用户数</p>
            <div class="dashboard-value-row">
              <span class="dashboard-value">{{ overview?.totalUsers || 0 }}</span>
              <span class="dashboard-badge success">
                <t-icon name="arrow-up" size="10px" />
                +{{ overview?.newUsersThisMonth || 0 }}
              </span>
            </div>
          </div>
        </div>

        <!-- 第二块：用户状态 -->
        <div class="dashboard-block vertical">
          <div class="dashboard-stats">
            <div class="stat-row">
              <span class="stat-label">启用用户</span>
              <span class="stat-value">{{ overview?.enabledUsers || 0 }}</span>
            </div>
            <div class="stat-progress">
              <div
                class="stat-progress-bar green"
                :style="{ width: `${overview?.totalUsers ? (overview.enabledUsers / overview.totalUsers * 100) : 0}%` }"
              ></div>
            </div>
            <div class="stat-row">
              <span class="stat-label">禁用用户</span>
              <span class="stat-value">{{ overview?.disabledUsers || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- 第三块：成员分类 -->
        <div class="dashboard-block vertical">
          <div class="dashboard-header">
            <span class="dashboard-header-label">成员分布</span>
            <span class="dashboard-header-badge">占比</span>
          </div>
          <div class="dashboard-split">
            <div class="split-item">
              <p class="split-label">正式成员</p>
              <p class="split-value purple">{{ overview?.formalMembers || 0 }}</p>
            </div>
            <div class="split-divider"></div>
            <div class="split-item">
              <p class="split-label">候选成员</p>
              <p class="split-value orange">{{ overview?.candidateMembers || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- 第四块：新增趋势 -->
        <div class="dashboard-block vertical">
          <div class="dashboard-center">
            <p class="dashboard-center-label">本年新增成员</p>
            <p class="dashboard-center-value">{{ overview?.newUsersThisYear || 0 }}</p>
            <div class="dashboard-avatars">
              <div
                v-for="i in Math.min(3, overview?.newUsersThisYear || 0)"
                :key="i"
                class="avatar-item"
              >
                <t-avatar size="24px" :image="`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`" />
              </div>
              <div v-if="(overview?.newUsersThisYear || 0) > 3" class="avatar-more">
                +{{ (overview?.newUsersThisYear || 0) - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 部门与职位分布 -->
    <div class="distribution-section">
      <h2 class="section-title">部门与职位分布</h2>
      <div class="distribution-grid">
        <ChartCard title="部门分布" icon="layers" class="chart-large">
          <DepartmentChart
            :data="departments"
            :loading="departmentsLoading"
            height="400px"
            @department-click="handleDepartmentClick"
          />
        </ChartCard>

        <ChartCard title="职位分布" icon="user-setting" class="chart-small">
          <PositionChart
            :data="positions"
            :loading="positionsLoading"
            height="400px"
          />
        </ChartCard>
      </div>
    </div>

    <!-- 人口统计 -->
    <div class="demographics-section">
      <h2 class="section-title">人口统计</h2>
      <div class="demographics-grid">
        <ChartCard title="性别分布" icon="user">
          <GenderChart
            :data="genderStats"
            :loading="genderLoading"
            height="300px"
          />
        </ChartCard>

        <ChartCard title="年级分布" icon="calendar">
          <GradeChart
            :data="gradeStats"
            :loading="gradeLoading"
            height="300px"
          />
        </ChartCard>

        <ChartCard title="专业分布" icon="education">
          <MajorChart
            :data="majorStats"
            :loading="majorLoading"
            height="300px"
          />
        </ChartCard>
      </div>
    </div>

    <!-- 入会趋势 -->
    <div class="trend-section">
      <h2 class="section-title">入会趋势</h2>
      <ChartCard title="成员入会与转正趋势" icon="chart-line">
        <template #extra>
          <t-space>
            <t-select
              v-model="trendPeriod"
              :options="periodOptions"
              size="small"
              style="width: 100px"
            />
            <t-select
              v-model="trendLimit"
              :options="limitOptions"
              size="small"
              style="width: 120px"
            />
          </t-space>
        </template>
        <MembershipTrendChart
          :data="membershipTrend"
          :loading="trendLoading"
          height="400px"
        />
      </ChartCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/api'
import ChartCard from '@/components/statistics/ChartCard.vue'
import DepartmentChart from '@/components/statistics/DepartmentChart.vue'
import PositionChart from '@/components/statistics/PositionChart.vue'
import GenderChart from '@/components/statistics/GenderChart.vue'
import GradeChart from '@/components/statistics/GradeChart.vue'
import MajorChart from '@/components/statistics/MajorChart.vue'
import MembershipTrendChart from '@/components/statistics/MembershipTrendChart.vue'

const router = useRouter()

// 标记是否已经播放过动画
const hasPlayedAnimation = ref(false)

// 数据状态
const overview = ref()
const departments = ref([])
const positions = ref([])
const genderStats = ref([])
const gradeStats = ref([])
const majorStats = ref([])
const membershipTrend = ref([])

// 加载状态
const departmentsLoading = ref(false)
const positionsLoading = ref(false)
const genderLoading = ref(false)
const gradeLoading = ref(false)
const majorLoading = ref(false)
const trendLoading = ref(false)

// 趋势参数
const trendPeriod = ref('month')
const trendLimit = ref(12)

const periodOptions = [
  { label: '按月', value: 'month' },
  { label: '按年', value: 'year' }
]

const limitOptions = [
  { label: '最近6个月', value: 6 },
  { label: '最近12个月', value: 12 },
  { label: '最近24个月', value: 24 }
]

// 加载数据
const loadOverview = async () => {
  try {
    const res = await userApi.getMemberOverview()
    if (res.code === 200) {
      overview.value = res.data
    }
  } catch (error) {
    console.error('加载成员概览失败:', error)
  }
}

const loadDepartments = async () => {
  departmentsLoading.value = true
  try {
    const res = await userApi.getDepartmentStats()
    if (res.code === 200) {
      departments.value = res.data
    }
  } catch (error) {
    console.error('加载部门统计失败:', error)
  } finally {
    departmentsLoading.value = false
  }
}

const loadPositions = async () => {
  positionsLoading.value = true
  try {
    const res = await userApi.getPositionStats()
    if (res.code === 200) {
      positions.value = res.data
    }
  } catch (error) {
    console.error('加载职位统计失败:', error)
  } finally {
    positionsLoading.value = false
  }
}

const loadGenderStats = async () => {
  genderLoading.value = true
  try {
    const res = await userApi.getGenderStats()
    if (res.code === 200) {
      genderStats.value = res.data
    }
  } catch (error) {
    console.error('加载性别统计失败:', error)
  } finally {
    genderLoading.value = false
  }
}

const loadGradeStats = async () => {
  gradeLoading.value = true
  try {
    const res = await userApi.getGradeStats()
    if (res.code === 200) {
      gradeStats.value = res.data
    }
  } catch (error) {
    console.error('加载年级统计失败:', error)
  } finally {
    gradeLoading.value = false
  }
}

const loadMajorStats = async () => {
  majorLoading.value = true
  try {
    const res = await userApi.getMajorStats()
    if (res.code === 200) {
      majorStats.value = res.data
    }
  } catch (error) {
    console.error('加载专业统计失败:', error)
  } finally {
    majorLoading.value = false
  }
}

const loadMembershipTrend = async () => {
  trendLoading.value = true
  try {
    const res = await userApi.getMembershipTrend(trendPeriod.value, trendLimit.value)
    if (res.code === 200) {
      membershipTrend.value = res.data
    }
  } catch (error) {
    console.error('加载入会趋势失败:', error)
  } finally {
    trendLoading.value = false
  }
}

const handleDepartmentClick = (departmentId) => {
  router.push(`/users?departmentId=${departmentId}`)
}

// 监听趋势参数变化
watch([trendPeriod, trendLimit], loadMembershipTrend)

// 初始化
onMounted(() => {
  // 标记动画已播放
  setTimeout(() => {
    hasPlayedAnimation.value = true
  }, 1000) // 等待所有动画完成

  loadOverview()
  loadDepartments()
  loadPositions()
  loadGenderStats()
  loadGradeStats()
  loadMajorStats()
  loadMembershipTrend()
})
</script>

<style scoped lang="less">
.member-statistics {
  width: 100%;

  // 只在首次加载时播放动画
  &.animated {
    animation: fadeIn 0.4s ease-out;

    .dashboard-container {
      animation: slideUp 0.4s ease-out forwards;
      opacity: 0;
    }

    .distribution-section {
      animation: slideUp 0.4s ease-out 0.15s forwards;
      opacity: 0;
    }

    .demographics-section {
      animation: slideUp 0.4s ease-out 0.25s forwards;
      opacity: 0;
    }

    .trend-section {
      animation: slideUp 0.4s ease-out 0.35s forwards;
      opacity: 0;
    }
  }
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 16px;
}

.overview-section {
  margin-bottom: 32px;
}

/* 通栏仪表盘样式 */
.dashboard-container {
  background: var(--td-bg-color-container);
  border-radius: 12px;
  box-shadow: var(--td-shadow-1);
  border: 1px solid var(--td-component-border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  overflow: hidden;
}

.dashboard-block {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-right: 1px solid var(--td-component-border);
  transition: background-color 0.2s ease;

  &:last-child {
    border-right: none;
  }

  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }

  &.highlight {
    background-color: var(--td-bg-color-component);

    html[theme-mode='dark'] & {
      background-color: var(--td-bg-color-component-hover);
    }
  }

  &.vertical {
    flex-direction: column;
    align-items: stretch;
    justify-content: center;
  }
}

.dashboard-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.blue {
    background: var(--td-brand-color-1);
    color: var(--td-brand-color);

    html[theme-mode='dark'] & {
      background: var(--td-brand-color-2);
    }
  }
}

.dashboard-content {
  flex: 1;
  min-width: 0;
}

.dashboard-label {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin-bottom: 4px;
}

.dashboard-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.dashboard-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--td-text-color-primary);
  line-height: 1;
}

.dashboard-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;

  &.success {
    color: var(--td-success-color);
    background: var(--td-success-color-1);

    html[theme-mode='dark'] & {
      background: var(--td-success-color-2);
    }
  }
}

.dashboard-stats {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--td-text-color-primary);
}

.stat-progress {
  width: 100%;
  height: 6px;
  background: var(--td-bg-color-component);
  border-radius: 3px;
  overflow: hidden;
}

.stat-progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;

  &.green {
    background: var(--td-success-color);

    html[theme-mode='dark'] & {
      background: var(--td-success-color-7);
    }
  }
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  width: 100%;
}

.dashboard-header-label {
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.dashboard-header-badge {
  font-size: 12px;
  background: var(--td-bg-color-component);
  padding: 2px 8px;
  border-radius: 4px;
  color: var(--td-text-color-placeholder);
}

.dashboard-split {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.split-item {
  flex: 1;
  text-align: center;
}

.split-label {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin-bottom: 4px;
}

.split-value {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;

  &.purple {
    color: var(--td-brand-color-7);

    html[theme-mode='dark'] & {
      color: var(--td-brand-color-6);
    }
  }

  &.orange {
    color: var(--td-warning-color);

    html[theme-mode='dark'] & {
      color: var(--td-warning-color-6);
    }
  }
}

.split-divider {
  width: 1px;
  height: 32px;
  background: var(--td-component-border);
  flex-shrink: 0;
}

.dashboard-center {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.dashboard-center-label {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin-bottom: 4px;
}

.dashboard-center-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--td-text-color-primary);
  line-height: 1;
  margin-bottom: 8px;
}

.dashboard-avatars {
  display: flex;
  align-items: center;
  gap: -8px;
  margin-top: 8px;
}

.avatar-item {
  margin-left: -8px;

  &:first-child {
    margin-left: 0;
  }

  :deep(.t-avatar) {
    border: 2px solid var(--td-bg-color-container);
  }
}

.avatar-more {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--td-bg-color-container);
  background: var(--td-bg-color-component);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--td-text-color-placeholder);
  font-weight: 700;
  margin-left: -8px;
}

.distribution-section {
  margin-bottom: 32px;
}

.distribution-grid {
  display: grid;
  grid-template-columns: 5fr 4fr;
  gap: 20px;
}

.demographics-section {
  margin-bottom: 32px;
}

.demographics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.trend-section {
  margin-bottom: 32px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
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

// 响应式
@media (max-width: 1400px) {
  .dashboard-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-block {
    border-right: none;
    border-bottom: 1px solid var(--td-component-border);

    &:nth-child(2n) {
      border-right: 1px solid var(--td-component-border);
    }

    &:last-child,
    &:nth-last-child(2) {
      border-bottom: none;
    }
  }

  .distribution-grid {
    grid-template-columns: 1fr;
  }

  .demographics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    grid-template-columns: 1fr;
  }

  .dashboard-block {
    border-right: none;
    border-bottom: 1px solid var(--td-component-border);

    &:last-child {
      border-bottom: none;
    }
  }
}
</style>
