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

const colorMap = {
  '国家级': '#FF0000',
  '省级': '#FFD700',
  '校级': '#9370DB'
}

const chartOption = computed(() => {
  const chartData = props.data.map(item => ({
    name: item.name,
    value: item.count
  }))

  return {
    title: {
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      },
      subtextStyle: {
        fontSize: 12,
        color: '#999'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      right: 'right',
      top: 'bottom',
      data: chartData.map(item => item.name),
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
        name: '获奖等级',
        type: 'pie',
        radius: [30, 120],
        center: ['50%', '50%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 5
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
        data: chartData.map(item => ({
          ...item,
          itemStyle: {
            color: colorMap[item.name] || '#1890ff'
          }
        }))
      }
    ]
  }
})
</script>
