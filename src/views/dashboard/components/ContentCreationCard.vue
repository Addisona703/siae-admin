<template>
  <t-card title="Content Creation Statistics" :bordered="true">
    <Chart :option="chartOption" height="350px" v-if="chartOption" />
    <t-empty v-else description="No data available" />
  </t-card>
</template>

<script setup>
import { computed } from 'vue'
import Chart from '@/components/Chart.vue'

const props = defineProps

const chartOption = computed(() => {
  if (props.data.length === 0) return null

  // Extract dates from the first series (all series should have same dates)
  const dates = props.data[0]?.data.map(d => d.date) || []

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: props.data.map(s => s.name),
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      name: 'Count'
    },
    series: props.data.map(series => ({
      name: series.name,
      type: 'bar',
      data: series.data.map(d => d.value),
      itemStyle: {
        color: series.color
      }
    })),
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    }
  }
})
</script>

<style scoped>
@media (max-width: 768px) {
  :deep(.t-card) {
    margin-bottom: 12px;
  }
}
</style>
