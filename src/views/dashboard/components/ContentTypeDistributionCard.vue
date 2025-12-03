<template>
  <t-card title="Content Type Distribution" :bordered="true">
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

  const typeColors = {
    article: '#0052D9',
    note: '#00A870',
    question: '#E37318',
    announcement: '#D54941'
  }

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: props.data.map(d => d.type)
    },
    series: [
      {
        name: 'Content Type',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: props.data.map(d => ({
          value: d.count,
          name: d.type,
          itemStyle: {
            color: typeColors[d.type] || '#0052D9'
          }
        }))
      }
    ]
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
