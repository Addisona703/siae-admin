<template>
  <BaseChart :option="chartOption" :loading="loading" :height="height" />
</template>

<script setup>
import { computed } from 'vue'
import BaseChart from './BaseChart.vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  height: {
    type: String,
    default: '400px'
  },
  showTotal: {
    type: Boolean,
    default: false  // 默认不显示总数趋势线
  }
})

const chartOption = computed(() => {
  // 检查数据有效性
  if (!props.data || props.data.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        bottom: 'center',
        textStyle: {
          color: '#999',
          fontSize: 14
        }
      }
    }
  }

  const periods = props.data.map(item => item?.period || '')

  // 收集所有等级名称
  const levelNamesSet = new Set()
  props.data.forEach(item => {
    if (item && item.levelCounts && typeof item.levelCounts === 'object') {
      Object.keys(item.levelCounts).forEach(level => {
        if (level) levelNamesSet.add(level)
      })
    }
  })
  const levelNames = Array.from(levelNamesSet).sort()

  // 如果没有等级数据，返回空状态
  if (levelNames.length === 0) {
    return {
      title: {
        text: '暂无等级数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#999',
          fontSize: 14
        }
      }
    }
  }

  // 定义颜色数组
  const colors = ['#FF6347', '#9370DB', '#FFD700']

  // 构建系列数据
  const series = levelNames.map((levelName, index) => {
    const data = props.data.map(item => {
      if (!item || !item.levelCounts) return 0
      return item.levelCounts[levelName] || 0
    })

    const color = colors[index]

    return {
      name: levelName,
      type: 'line',
      stack: 'Total',
      data: data,
      itemStyle: {
        color: color
      }
    }
  })

  return {
    title: {
      left: 'center',
      top: '5%',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: levelNames,
      bottom: '5%',
      left: 'center',
      textStyle: {
        color: '#e0e6ed'
      }
    },
    grid: {
      left: '8%',
      right: '8%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      },
      right: '5%',
      top: '5%'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: periods,
      axisLabel: {
        color: '#e0e6ed'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(96, 165, 250, 0.3)'
        }
      }
    },
    yAxis: {
      type: 'value',
      nameTextStyle: {
        color: '#e0e6ed'
      },
      axisLabel: {
        color: '#e0e6ed'
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(96, 165, 250, 0.3)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(96, 165, 250, 0.1)'
        }
      }
    },
    series
  }
})
</script>
