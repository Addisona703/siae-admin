<template>
  <div class="member-overview-chart">
    <div v-if="loading" class="loading-container">
      <t-loading size="large" />
    </div>
    <div v-else-if="!data" class="empty-container">
      <t-empty description="暂无数据" />
    </div>
    <div v-else ref="chartRef" :style="{ height, width: '100%' }"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  height: {
    type: String,
    default: '300px'
  }
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {

  if (!chartRef.value || !props.data) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 人 ({d}%)'
    },
    legend: {
      bottom: 'bottom',
      textStyle: {
        color: '#e0e6ed'
      }
    },
    toolbox: {
      show: true,
      feature: {
        mark: { show: true },
        dataView: { show: true, readOnly: false },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    series: [
      {
        name: '成员统计',
        type: 'pie',
        radius: [40, 110],
        center: ['50%', '40%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        label: {
          color: '#e0e6ed',
          fontSize: 14,
          fontWeight: 'bold',
          textBorderColor: 'transparent',
          textBorderWidth: 0,
          textShadowColor: 'transparent',
          textShadowBlur: 0
        },
        labelLine: {
          lineStyle: {
            color: '#8b92a7'
          }
        },
        data: [
          {
            value: props.data.formalMembers,
            name: '正式成员',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#4facfe' },
                // { offset: 1, color: '#00f2fe' }
              ])
            }
          },
          {
            value: props.data.candidateMembers,
            name: '候选成员',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#a8edea' },
                // { offset: 1, color: '#fed6e3' }
              ])
            }
          },
          {
            value: props.data.enabledUsers,
            name: '启用用户',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#43e97b' },
                // { offset: 1, color: '#38f9d7' }
              ])
            }
          },
          {
            value: props.data.disabledUsers,
            name: '禁用用户',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#fa709a' },
                { offset: 1, color: '#fee140' }
              ])
            }
          }
        ]
      }
    ]
  }

  chartInstance.setOption(option)
}

const resizeChart = () => {
  chartInstance?.resize()
}

watch(() => [props.data, props.loading], () => {
  if (!props.loading && props.data) {
    setTimeout(initChart, 100)
  }
}, { deep: true })

onMounted(() => {
  if (!props.loading && props.data) {
    initChart()
  }
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})
</script>

<style scoped lang="less">
.member-overview-chart {
  width: 100%;
  height: 100%;
  position: relative;
}

.loading-container,
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
