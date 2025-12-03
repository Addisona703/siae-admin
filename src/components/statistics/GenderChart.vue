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
    default: '300px'
  }
})

const colorMap = {
  '男': '#1890ff',
  '女': '#eb2f96',
  '未知': '#d9d9d9'
}

const chartOption = computed(() => {
  const chartData = props.data.map(item => ({
    name: item.genderName,
    value: item.count,
    itemStyle: {
      color: colorMap[item.genderName] || '#1890ff'
    }
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 0
    },
    series: [
      {
        name: '性别分布',
        type: 'pie',
        radius: '60%',
        center: ['50%', '45%'],
        data: chartData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
})
</script>
