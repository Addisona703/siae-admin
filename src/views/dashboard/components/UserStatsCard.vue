<template>
  <t-card title="User Statistics" :bordered="true" class="user-stats-card">
    <Chart :option="chartOption" height="400px" v-if="chartOption" />
    <t-empty v-else description="No data available" />
  </t-card>
</template>

<script setup>
import { computed } from 'vue'
import Chart from '@/components/Chart.vue'

const props = defineProps

const chartOption = computed(() => {
  if (!props.activeUsersData || !props.registrationsData) return null

  // Get dates from active users data (both should have same dates)
  const dates = props.activeUsersData.data.map(d => d.date)

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
    legend: {
      data: ['Daily Active Users', 'New Registrations'],
      bottom: 10,
      left: 'center',
      itemGap: 20,
      textStyle: {
        fontSize: 13
      }
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLabel: {
        fontSize: 12,
        rotate: 45,
        interval: 'auto'
      },
      axisLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: 'Count',
      nameTextStyle: {
        fontSize: 12,
        padding: [0, 0, 0, 0]
      },
      min: 0,
      axisLabel: {
        fontSize: 12,
        formatter: '{value}'
      },
      axisLine: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Daily Active Users',
        type: 'line',
        smooth: true,
        data: props.activeUsersData.data.map(d => d.value),
        itemStyle: {
          color: props.activeUsersData.color || '#0052D9'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: (props.activeUsersData.color || '#0052D9') + '40' },
              { offset: 1, color: (props.activeUsersData.color || '#0052D9') + '00' }
            ]
          }
        }
      },
      {
        name: 'New Registrations',
        type: 'line',
        smooth: true,
        data: props.registrationsData.data.map(d => d.value),
        itemStyle: {
          color: props.registrationsData.color || '#00A870'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: (props.registrationsData.color || '#00A870') + '40' },
              { offset: 1, color: (props.registrationsData.color || '#00A870') + '00' }
            ]
          }
        }
      }
    ],
    grid: {
      left: '50px',
      right: '20px',
      top: '40px',
      bottom: '80px',
      containLabel: false
    }
  }
})
</script>

<style scoped>
.user-stats-card {
  height: 100%;
}

.user-stats-card :deep(.t-card__body) {
  padding: 20px;
}

@media (max-width: 768px) {
  .user-stats-card {
    margin-bottom: 12px;
  }

  .user-stats-card :deep(.t-card__body) {
    padding: 16px;
  }
}
</style>
