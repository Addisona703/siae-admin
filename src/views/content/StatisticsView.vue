<template>
  <div class="statistics-dashboard">
    <!-- 面包屑导航 -->
    <t-breadcrumb class="mb-4">
      <t-breadcrumb-item>内容管理</t-breadcrumb-item>
      <t-breadcrumb-item>数据统计</t-breadcrumb-item>
    </t-breadcrumb>

    <!-- 统计卡片 -->
    <t-row :gutter="16" class="mb-4">
      <t-col :span="3">
        <t-card :bordered="false" class="stat-card" hover-shadow>
          <div class="stat-icon views">
            <t-icon name="browse" size="32px" />
          </div>
          <div class="stat-content">
            <div class="stat-label">总浏览量</div>
            <div class="stat-value">{{ summary.totalViews?.toLocaleString() || 0 }}</div>
            <div class="stat-trend positive">
              <t-icon name="arrow-up" />
              今日 +{{ summary.todayViews || 0 }}
            </div>
          </div>
        </t-card>
      </t-col>
      <t-col :span="3">
        <t-card :bordered="false" class="stat-card" hover-shadow>
          <div class="stat-icon likes">
            <t-icon name="thumb-up" size="32px" />
          </div>
          <div class="stat-content">
            <div class="stat-label">总点赞数</div>
            <div class="stat-value">{{ summary.totalLikes?.toLocaleString() || 0 }}</div>
            <div class="stat-trend positive">
              <t-icon name="arrow-up" />
              今日 +{{ summary.todayLikes || 0 }}
            </div>
          </div>
        </t-card>
      </t-col>
      <t-col :span="3">
        <t-card :bordered="false" class="stat-card" hover-shadow>
          <div class="stat-icon favorites">
            <t-icon name="star" size="32px" />
          </div>
          <div class="stat-content">
            <div class="stat-label">总收藏数</div>
            <div class="stat-value">{{ summary.totalFavorites?.toLocaleString() || 0 }}</div>
            <div class="stat-trend positive">
              <t-icon name="arrow-up" />
              今日 +{{ summary.todayFavorites || 0 }}
            </div>
          </div>
        </t-card>
      </t-col>
      <t-col :span="3">
        <t-card :bordered="false" class="stat-card" hover-shadow>
          <div class="stat-icon comments">
            <t-icon name="chat" size="32px" />
          </div>
          <div class="stat-content">
            <div class="stat-label">总评论数</div>
            <div class="stat-value">{{ summary.totalComments?.toLocaleString() || 0 }}</div>
            <div class="stat-trend positive">
              <t-icon name="arrow-up" />
              今日 +{{ summary.todayComments || 0 }}
            </div>
          </div>
        </t-card>
      </t-col>
    </t-row>

    <!-- 图表区域 -->
    <t-row :gutter="16" class="mb-4">
      <t-col :span="6">
        <t-card title="内容类型分布" :bordered="false" hover-shadow>
          <t-loading :loading="typeChartLoading" size="small">
            <div ref="typeChartRef" style="height: 350px"></div>
          </t-loading>
        </t-card>
      </t-col>
      <t-col :span="6">
        <t-card title="分类统计" :bordered="false" hover-shadow>
          <t-loading :loading="categoryChartLoading" size="small">
            <div ref="categoryChartRef" style="height: 350px"></div>
          </t-loading>
        </t-card>
      </t-col>
    </t-row>

    <!-- 趋势图 -->
    <t-row :gutter="16">
      <t-col :span="12">
        <t-card title="数据趋势" :bordered="false" hover-shadow>
          <template #actions>
            <t-radio-group v-model="days" size="small" @change="loadTrendData">
              <t-radio-button :value="7">近7天</t-radio-button>
              <t-radio-button :value="30">近30天</t-radio-button>
              <t-radio-button :value="90">近90天</t-radio-button>
            </t-radio-group>
          </template>
          <t-loading :loading="trendChartLoading" size="small">
            <div ref="trendChartRef" style="height: 400px"></div>
          </t-loading>
        </t-card>
      </t-col>
    </t-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { MessagePlugin } from 'tdesign-vue-next'
import { contentApi } from '@/api/content'

// 数据
const summary = ref({})
const days = ref(7)

// 图表引用
const typeChartRef = ref()
const categoryChartRef = ref()
const trendChartRef = ref()

// 图表实例
let typeChart = null
let categoryChart = null
let trendChart = null

// 加载状态
const typeChartLoading = ref(false)
const categoryChartLoading = ref(false)
const trendChartLoading = ref(false)

// 加载统计汇总
const loadSummary = async () => {
  try {
    const res = await contentApi.getStatisticsSummary()
    if (res.code === 200) {
      summary.value = res.data
    }
  } catch (error) {
    console.error('加载统计汇总失败:', error)
    MessagePlugin.error('加载统计汇总失败')
  }
}

// 加载内容类型图表
const loadTypeChart = async () => {
  if (!typeChartRef.value) return

  typeChartLoading.value = true
  try {
    const res = await contentApi.getContentTypeStatistics()
    if (res.code === 200 && res.data) {
      if (!typeChart) {
        typeChart = echarts.init(typeChartRef.value)
      }

      typeChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center'
        },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            // borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              color:'#FEFEFE',
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: res.data.map(item => ({
            name: item.typeName,
            value: item.contentCount
          })),
          color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
        }]
      })
    }
  } catch (error) {
    console.error('加载内容类型统计失败:', error)
    MessagePlugin.error('加载内容类型统计失败')
  } finally {
    typeChartLoading.value = false
  }
}

// 加载分类图表
const loadCategoryChart = async () => {
  if (!categoryChartRef.value) return

  categoryChartLoading.value = true
  try {
    const res = await contentApi.getCategoryStatistics()
    if (res.code === 200 && res.data) {
      if (!categoryChart) {
        categoryChart = echarts.init(categoryChartRef.value)
      }

      // 只显示前10个分类
      const topCategories = res.data.slice(0, 10)

      categoryChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: topCategories.map(item => item.categoryName),
          axisLabel: {
            rotate: 45,
            interval: 0
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          name: '内容数量',
          type: 'bar',
          data: topCategories.map(item => item.contentCount),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' }
              ])
            }
          }
        }]
      })
    }
  } catch (error) {
    console.error('加载分类统计失败:', error)
    MessagePlugin.error('加载分类统计失败')
  } finally {
    categoryChartLoading.value = false
  }
}

// 加载趋势数据
const loadTrendData = async () => {
  if (!trendChartRef.value) return

  trendChartLoading.value = true
  try {
    const res = await contentApi.getTrendData(days.value)
    if (res.code === 200 && res.data) {
      if (!trendChart) {
        trendChart = echarts.init(trendChartRef.value)
      }

      trendChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['浏览量', '点赞数', '收藏数', '评论数'],
          top: 10
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: res.data.dates
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '浏览量',
            type: 'line',
            data: res.data.viewCounts,
            smooth: true,
            itemStyle: { color: '#5470c6' }
          },
          {
            name: '点赞数',
            type: 'line',
            data: res.data.likeCounts,
            smooth: true,
            itemStyle: { color: '#91cc75' }
          },
          {
            name: '收藏数',
            type: 'line',
            data: res.data.favoriteCounts,
            smooth: true,
            itemStyle: { color: '#fac858' }
          },
          {
            name: '评论数',
            type: 'line',
            data: res.data.commentCounts,
            smooth: true,
            itemStyle: { color: '#ee6666' }
          }
        ]
      })
    }
  } catch (error) {
    console.error('加载趋势数据失败:', error)
    MessagePlugin.error('加载趋势数据失败')
  } finally {
    trendChartLoading.value = false
  }
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  typeChart?.resize()
  categoryChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  loadSummary()
  loadTypeChart()
  loadCategoryChart()
  loadTrendData()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  typeChart?.dispose()
  categoryChart?.dispose()
  trendChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="less">
.statistics-dashboard {
  padding: 20px;

  .mb-4 {
    margin-bottom: 16px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    transition: all 0.3s;

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      &.views {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      &.likes {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }

      &.favorites {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }

      &.comments {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
      }
    }

    .stat-content {
      flex: 1;
      min-width: 0;

      .stat-label {
        font-size: 14px;
        color: var(--td-text-color-secondary);
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--td-text-color-primary);
        margin-bottom: 4px;
        line-height: 1;
      }

      .stat-trend {
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;

        &.positive {
          color: var(--td-success-color);
        }
      }
    }
  }
}
</style>
