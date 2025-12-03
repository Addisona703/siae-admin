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
  },
  topN: {
    type: Number,
    default: 10
  }
})

const chartOption = computed(() => {
  const topMajors = props.data.slice(0, props.topN)
  const majors = topMajors.map(item => item.majorName)
  const counts = topMajors.map(item => item.count)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10px',
      top: '30px',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      minInterval: 1
    },
    yAxis: {
      type: 'category',
      data: majors,
      axisLabel: {
        interval: 0
      }
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        data: counts,
        itemStyle: {
          color: '#1890ff',
          borderRadius: [0, 4, 4, 0]
        },
        label: {
          show: true,
          position: 'right'
        }
      }
    ]
  }
})
</script>
