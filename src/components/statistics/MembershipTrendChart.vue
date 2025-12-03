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
  }
})

const chartOption = computed(() => {
  if (!props.data || props.data.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#999',
          fontSize: 14
        }
      }
    }
  }

  // 检查数据类型
  const isAwardData = 'totalCount' in props.data[0]

  // 格式化周期显示
  const formatPeriod = (period) => {
    if (!period) return ''

    // 判断是月份格式 (YYYY-MM) 还是年份格式 (YYYY)
    if (period.length === 7 && period.includes('-')) {
      // 月份格式：2024-01 -> 2024年1月
      const [year, month] = period.split('-')
      return `${year}年${parseInt(month)}月`
    } else if (period.length === 4) {
      // 年份格式：2024 -> 2024年
      return `${period}年`
    }

    return period
  }

  const periods = props.data.map(item => formatPeriod(item.period))
  let formalCounts = []
  let candidateCounts = []

  if (isAwardData) {
    // AwardTrendDetail 数据
    formalCounts = props.data.map(item => item.totalCount)
    candidateCounts = props.data.map(() => 0)
  } else {
    // MembershipTrend 数据
    formalCounts = props.data.map(item => item.formalCount)
    candidateCounts = props.data.map(item => item.candidateCount)
  }

  // 计算总数
  const totalCounts = props.data.map((_, index) =>
    (formalCounts[index] || 0) + (candidateCounts[index] || 0)
  )

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar'] },
        restore: { show: true },
        saveAsImage: { show: true }
      },
      right: '5%',
      top: '0%'
    },
    legend: {
      data: ['转正人数', '候选入会人数', '总入会人数'],
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
      top: '15%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: periods,
        axisPointer: {
          type: 'shadow'
        },
        axisLabel: {
          color: '#e0e6ed'
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(96, 165, 250, 0.3)'
          }
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '人数',
        min: 0,
        nameTextStyle: {
          color: '#e0e6ed'
        },
        axisLabel: {
          formatter: '{value} 人',
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
      {
        type: 'value',
        name: '总数',
        min: 0,
        nameTextStyle: {
          color: '#e0e6ed'
        },
        axisLabel: {
          formatter: '{value} 人',
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
      }
    ],
    series: [
      {
        name: '转正人数',
        type: 'bar',
        tooltip: {
          valueFormatter: (value) => value + ' 人'
        },
        data: formalCounts,
        itemStyle: {
          color: '#52c41a'
        }
      },
      {
        name: '候选入会人数',
        type: 'bar',
        tooltip: {
          valueFormatter: (value) => value + ' 人'
        },
        data: candidateCounts,
        itemStyle: {
          color: '#1890ff'
        }
      },
      {
        name: '总入会人数',
        type: 'line',
        yAxisIndex: 1,
        tooltip: {
          valueFormatter: (value) => value + ' 人'
        },
        data: totalCounts,
        itemStyle: {
          color: '#fa8c16'
        },
        lineStyle: {
          width: 3
        },
        smooth: true
      }
    ]
  }
})
</script>
