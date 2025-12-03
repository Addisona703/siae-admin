<template>
  <BaseChart ref="chartRef" :option="chartOption" :loading="loading" :height="height" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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

const emit = defineEmits(['departmentClick'])

const chartRef = ref()

const chartOption = computed(() => {
  // 如果没有数据，返回空状态
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

  // 计算最大值用于雷达图的 max
  const maxTotal = Math.max(...props.data.map(item => item.totalMembers), 1)

  // 计算合适的最大值，确保至少为 20，并向上取整到 10 的倍数
  const calculateMax = (value) => {
    const minMax = 20
    const maxValue = Math.max(value * 1.3, minMax) // 留出 30% 的空间，最小为 20
    return Math.ceil(maxValue / 10) * 10 // 向上取整到 10 的倍数
  }

  const radarMax = calculateMax(maxTotal)

  // 构建雷达图指标
  const indicator = props.data.map(item => ({
    name: item.departmentName,
    max: radarMax
  }))

  // 构建系列数据
  const totalMembersData = props.data.map(item => item.totalMembers)
  const formalMembersData = props.data.map(item => item.formalMembers)
  const candidateMembersData = props.data.map(item => item.candidateMembers)

  return {
    title: {
      left: 'center',
      top: '5%',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#e0e6ed'
      }
    },
    legend: {
      data: ['总人数', '正式成员', '候选成员'],
      bottom: '5%',
      left: 'center',
      textStyle: {
        color: '#e0e6ed'
      }
    },
    radar: {
      indicator: indicator,
      center: ['50%', '50%'],
      radius: '60%',
      axisName: {
        color: '#e0e6ed',
        fontSize: 12
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(96, 165, 250, 0.3)'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(96, 165, 250, 0.2)'
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(26, 31, 58, 0.1)', 'rgba(15, 23, 41, 0.1)']
        }
      }
    },
    series: [
      {
        name: '部门统计',
        type: 'radar',
        data: [
          {
            value: totalMembersData,
            name: '总人数',
            itemStyle: {
              color: '#1890ff'
            },
            areaStyle: {
              color: 'rgba(24, 144, 255, 0.3)'
            }
          },
          {
            value: formalMembersData,
            name: '正式成员',
            itemStyle: {
              color: '#52c41a'
            },
            areaStyle: {
              color: 'rgba(82, 196, 26, 0.3)'
            }
          },
          {
            value: candidateMembersData,
            name: '候选成员',
            itemStyle: {
              color: '#faad14'
            },
            areaStyle: {
              color: 'rgba(250, 173, 20, 0.3)'
            }
          }
        ]
      }
    ]
  }
})

onMounted(() => {
  const instance = chartRef.value?.getInstance()
  if (instance) {
    instance.on('click', (params) => {
      if (params.componentType === 'series') {
        const departmentId = props.data[params.dataIndex]?.departmentId
        if (departmentId) {
          emit('departmentClick', departmentId)
        }
      }
    })
  }
})
</script>
