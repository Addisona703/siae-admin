<template>
  <div class="award-statistics" :class="{ 'animated': !hasPlayedAnimation }">
    <!-- 获奖概览卡片 - 方案一：主次分明布局 -->
    <div class="overview-section">
      <h2 class="section-title">获奖概览</h2>
      <div class="overview-grid">
        <!-- 1. 核心指标 (Hero Card) -->
        <div class="hero-card">
          <div class="hero-card-bg"></div>
          <div class="hero-card-content">
            <div>
              <p class="hero-label">累计获奖总数</p>
              <h3 class="hero-value">{{ overview?.totalAwards || 0 }}</h3>
            </div>
            <div class="hero-badge">
              <t-icon name="trending-up" size="12px" />
              <span>持续增长中</span>
            </div>
          </div>
        </div>

        <!-- 2. 时间维度 -->
        <div class="time-cards">
          <div class="compact-card">
            <div class="compact-icon green">
              <t-icon name="calendar" />
            </div>
            <div class="compact-content">
              <p class="compact-label">本年获奖</p>
              <p class="compact-value">{{ overview?.thisYearAwards || 0 }}</p>
            </div>
          </div>
          <div class="compact-card">
            <div class="compact-icon orange">
              <t-icon name="time" />
            </div>
            <div class="compact-content">
              <p class="compact-label">本月新增</p>
              <p class="compact-value">{{ overview?.thisMonthAwards || 0 }}</p>
            </div>
          </div>
        </div>

        <!-- 3. 类型维度 (大卡片内分组) -->
        <div class="composition-card">
          <h4 class="composition-title">获奖构成</h4>
          <div class="composition-grid">
            <div class="composition-item">
              <p class="composition-label">团队获奖</p>
              <p class="composition-value purple">{{ overview?.teamAwards || 0 }}</p>
            </div>
            <div class="composition-divider"></div>
            <div class="composition-item">
              <p class="composition-label">个人获奖</p>
              <p class="composition-value red">{{ overview?.individualAwards || 0 }}</p>
            </div>
            <div class="composition-divider"></div>
            <div class="composition-item">
              <p class="composition-label">获奖总人数</p>
              <p class="composition-value gray">{{ overview?.totalAwardedUsers || 0 }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 获奖分布 -->
    <div class="distribution-section">
      <h2 class="section-title">获奖分布</h2>
      <div class="distribution-grid">
        <ChartCard title="按等级分布" icon="star">
          <AwardLevelChart :data="awardsByLevel" :loading="levelLoading" height="400px" />
        </ChartCard>

        <ChartCard title="按类型分布" icon="tag">
          <AwardTypeChart :data="awardsByType" :loading="typeLoading" height="400px" />
        </ChartCard>
      </div>
    </div>

    <!-- 获奖趋势 -->
    <div class="trend-section">
      <h2 class="section-title">获奖趋势</h2>
      <ChartCard title="获奖趋势分析" icon="chart-line">
        <template #extra>
          <t-space>
            <t-select v-model="trendPeriod" :options="periodOptions" size="small" style="width: 100px" />
            <t-select v-model="trendLimit" :options="limitOptions" size="small" style="width: 120px" />
          </t-space>
        </template>
        <AwardTrendChart :data="awardTrend" :loading="trendLoading" height="400px" />
      </ChartCard>
    </div>

    <!-- 获奖排行榜 -->
    <div class="ranking-section">
      <h2 class="section-title">获奖排行榜</h2>
      <ChartCard title="TOP 获奖成员" icon="trophy">
        <template #extra>
          <t-select v-model="rankingLimit" :options="rankingLimitOptions" size="small" style="width: 120px" />
        </template>
        <AwardRankingList :data="topRanking" :loading="rankingLoading" @user-click="handleUserClick" />
      </ChartCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '@/api'
import ChartCard from '@/components/statistics/ChartCard.vue'
import AwardLevelChart from '@/components/statistics/AwardLevelChart.vue'
import AwardTypeChart from '@/components/statistics/AwardTypeChart.vue'
import AwardTrendChart from '@/components/statistics/AwardTrendChart.vue'
import AwardRankingList from '@/components/statistics/AwardRankingList.vue'

const router = useRouter()

// 标记是否已经播放过动画
const hasPlayedAnimation = ref(false)

// 数据状态
const overview = ref(null)
const awardsByLevel = ref([])
const awardsByType = ref([])
const awardTrend = ref([])
const topRanking = ref([])

// 加载状态
const levelLoading = ref(false)
const typeLoading = ref(false)
const trendLoading = ref(false)
const rankingLoading = ref(false)

// 趋势参数
const trendPeriod = ref('month')
const trendLimit = ref(12)

const periodOptions = [
  { label: '按月', value: 'month' },
  { label: '按年', value: 'year' }
]

const limitOptions = [
  { label: '最近12个月', value: 12 },
  { label: '最近24个月', value: 24 },
  { label: '最近36个月', value: 36 }
]

// 排行榜参数
const rankingLimit = ref(10)

const rankingLimitOptions = [
  { label: 'TOP 10', value: 10 },
  { label: 'TOP 20', value: 20 },
  { label: 'TOP 50', value: 50 }
]

// 加载数据
const loadOverview = async () => {
  try {
    const res = await userApi.getAwardOverview()
    if (res.code === 200) {
      overview.value = res.data
    }
  } catch (error) {
    console.error('加载获奖概览失败:', error)
  }
}

const loadAwardsByLevel = async () => {
  levelLoading.value = true
  try {
    const res = await userApi.getAwardsByLevel()
    if (res.code === 200) {
      awardsByLevel.value = res.data
    }
  } catch (error) {
    console.error('加载获奖等级分布失败:', error)
  } finally {
    levelLoading.value = false
  }
}

const loadAwardsByType = async () => {
  typeLoading.value = true
  try {
    const res = await userApi.getAwardsByType()
    if (res.code === 200) {
      awardsByType.value = res.data
    }
  } catch (error) {
    console.error('加载获奖类型分布失败:', error)
  } finally {
    typeLoading.value = false
  }
}

const loadAwardTrend = async () => {
  trendLoading.value = true
  try {
    const res = await userApi.getAwardTrend(trendPeriod.value, trendLimit.value)
    if (res.code === 200) {
      awardTrend.value = res.data
    }
  } catch (error) {
    console.error('加载获奖趋势失败:', error)
  } finally {
    trendLoading.value = false
  }
}

const loadRanking = async () => {
  rankingLoading.value = true
  try {
    const res = await userApi.getAwardRanking(rankingLimit.value)
    if (res.code === 200) {
      topRanking.value = res.data
    }
  } catch (error) {
    console.error('加载获奖排行榜失败:', error)
  } finally {
    rankingLoading.value = false
  }
}

const handleUserClick = (userId) => {
  router.push(`/users/${userId}/awards`)
}

// 监听参数变化
watch([trendPeriod, trendLimit], loadAwardTrend)
watch(rankingLimit, loadRanking)

// 初始化
onMounted(() => {
  // 标记动画已播放
  setTimeout(() => {
    hasPlayedAnimation.value = true
  }, 1000)

  loadOverview()
  loadAwardsByLevel()
  loadAwardsByType()
  loadAwardTrend()
  loadRanking()
})
</script>

<style scoped lang="less">
.award-statistics {
  width: 100%;

  // 只在首次加载时播放动画
  &.animated {
    animation: fadeIn 0.4s ease-out;

    .hero-card {
      animation: slideUp 0.4s ease-out forwards;
      opacity: 0;
      animation-delay: 0s;
    }

    .time-cards {
      animation: slideUp 0.4s ease-out forwards;
      opacity: 0;
      animation-delay: 0.1s;
    }

    .composition-card {
      animation: slideUp 0.4s ease-out forwards;
      opacity: 0;
      animation-delay: 0.15s;
    }

    .distribution-section {
      animation: slideUp 0.4s ease-out 0.15s forwards;
      opacity: 0;
    }

    .trend-section {
      animation: slideUp 0.4s ease-out 0.25s forwards;
      opacity: 0;
    }

    .ranking-section {
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

.overview-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}

/* 1. Hero Card - 核心指标 */
.hero-card {
  grid-column: span 3;
  background: linear-gradient(135deg, var(--td-brand-color-7) 0%, var(--td-brand-color-8) 100%);
  border-radius: 16px;
  padding: 24px;
  color: var(--td-text-color-anti);
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px var(--td-shadow-3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px var(--td-shadow-4);

    .hero-card-bg {
      opacity: 0.2;
    }
  }

  // 暗黑模式适配
  html[theme-mode='dark'] & {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);

    &:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    }
  }
}

.hero-card-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 128px;
  height: 128px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  filter: blur(40px);
  margin: -40px -40px 0 0;
  opacity: 0.1;
  transition: opacity 0.3s ease;

  // 暗黑模式下使用更亮的光晕
  html[theme-mode='dark'] & {
    background: rgba(255, 255, 255, 0.15);
  }
}

.hero-card-content {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  min-height: 140px;
}

.hero-label {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.hero-value {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--td-text-color-anti);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  width: fit-content;
  margin-top: 16px;

  // 暗黑模式下增强对比度
  html[theme-mode='dark'] & {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
}

/* 2. Time Cards - 时间维度 */
.time-cards {
  grid-column: span 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.compact-card {
  flex: 1;
  background: var(--td-bg-color-container);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--td-shadow-1);
  border: 1px solid var(--td-component-border);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--td-brand-color);
    box-shadow: var(--td-shadow-2);
    background: var(--td-bg-color-container-hover);
  }
}

.compact-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.green {
    background: var(--td-success-color-1);
    color: var(--td-success-color);

    html[theme-mode='dark'] & {
      background: var(--td-success-color-2);
    }
  }

  &.orange {
    background: var(--td-warning-color-1);
    color: var(--td-warning-color);

    html[theme-mode='dark'] & {
      background: var(--td-warning-color-2);
    }
  }
}

.compact-content {
  flex: 1;
  min-width: 0;
}

.compact-label {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin-bottom: 4px;
}

.compact-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--td-text-color-primary);
  line-height: 1;
}

/* 3. Composition Card - 类型维度 */
.composition-card {
  grid-column: span 6;
  background: var(--td-bg-color-container);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--td-shadow-1);
  border: 1px solid var(--td-component-border);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.composition-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--td-text-color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
}

.composition-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 24px;
}

.composition-item {
  text-align: center;
}

.composition-label {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin-bottom: 8px;
}

.composition-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;

  &.purple {
    color: var(--td-brand-color-7);

    html[theme-mode='dark'] & {
      color: var(--td-brand-color-6);
    }
  }

  &.red {
    color: var(--td-error-color);

    html[theme-mode='dark'] & {
      color: var(--td-error-color-6);
    }
  }

  &.gray {
    color: var(--td-text-color-primary);
  }
}

.composition-divider {
  width: 1px;
  height: 32px;
  background: var(--td-component-border);
}

.distribution-section {
  margin-bottom: 32px;
}

.distribution-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.trend-section {
  margin-bottom: 32px;
}

.ranking-section {
  margin-bottom: 32px;
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

// 响应式
@media (max-width: 1400px) {
  .overview-grid {
    grid-template-columns: repeat(6, 1fr);
  }

  .hero-card {
    grid-column: span 6;
  }

  .time-cards {
    grid-column: span 3;
  }

  .composition-card {
    grid-column: span 3;
  }

  .distribution-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .hero-card,
  .time-cards,
  .composition-card {
    grid-column: span 1;
  }

  .composition-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .composition-divider {
    width: 100%;
    height: 1px;
  }
}
</style>
