<template>
  <div ref="chartRef" class="base-chart" :style="{ width: width, height: height }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  option: {
    type: Object,
    required: true
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const chartRef = ref()
let chartInstance = null

const initChart = () => {
  if (!chartRef.value) return

  // 使用更高的 devicePixelRatio 修复模糊问题
  // 对于高分辨率屏幕，使用实际的 devicePixelRatio
  // 最小值为 2，确保在普通屏幕上也清晰
  const dpr = Math.max(window.devicePixelRatio || 1, 2)

  chartInstance = echarts.init(chartRef.value, null, {
    renderer: 'canvas',
    devicePixelRatio: dpr,
    width: 'auto',
    height: 'auto'
  })

  chartInstance.setOption(props.option)

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

const handleResize = () => {
  chartInstance?.resize()
}

const updateChart = () => {
  if (chartInstance) {
    // 合并全局文本样式配置，提高清晰度
    const enhancedOption = {
      ...props.option,
      textStyle: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: 12,
        ...(props.option.textStyle || {})
      }
    }
    chartInstance.setOption(enhancedOption, true)
  }
}

// 监听 option 变化
watch(() => props.option, updateChart, { deep: true })

// 监听 loading 状态
watch(() => props.loading, (loading) => {
  if (chartInstance) {
    if (loading) {
      chartInstance.showLoading()
    } else {
      chartInstance.hideLoading()
    }
  }
})

onMounted(async () => {
  await nextTick()
  initChart()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})

// 暴露实例方法
defineExpose({
  getInstance: () => chartInstance,
  resize: () => chartInstance?.resize()
})
</script>


<style scoped>
.base-chart {
  /* 确保容器有明确的尺寸 */
  min-width: 0;
  min-height: 0;

  /* 优化渲染性能 */
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.base-chart canvas {
  /* 确保 canvas 清晰渲染 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}
</style>
