import { computed, ref, onMounted } from 'vue'

/**
 * 设备性能检测 composable
 * 用于根据设备性能调整主题切换动画和加载策略
 */
export function useDevicePerformance() {
  const deviceInfo = ref({
    isLowPerformance: false,
    memory: null,
    cores: null,
    connection: null
  })

  const isLowPerformance = computed(() => deviceInfo.value.isLowPerformance)

  const getOptimalSettings = () => ({
    animationDuration: isLowPerformance.value ? 150 : 300,
    enableParallax: !isLowPerformance.value,
    imageQuality: isLowPerformance.value ? 'low' : 'high',
    enableComplexAnimations: !isLowPerformance.value,
    preloadThemes: !isLowPerformance.value
  })

  const detectPerformance = () => {
    try {
      // 检测设备内存 (如果支持)
      const memory = navigator.deviceMemory
      const cores = navigator.hardwareConcurrency
      const connection = navigator.connection?.effectiveType

      deviceInfo.value = {
        memory: memory || null,
        cores: cores || null,
        connection: connection || null,
        isLowPerformance: determineIsLowPerformance(memory, cores, connection)
      }

      console.log('Device performance detected:', deviceInfo.value)
    } catch (error) {
      console.warn('Failed to detect device performance:', error)
      // 默认假设中等性能设备
      deviceInfo.value.isLowPerformance = false
    }
  }

  const determineIsLowPerformance = (memory, cores, connection) => {
    // 内存小于 4GB 认为是低性能设备
    if (memory && memory < 4) return true
    
    // 核心数小于 4 认为是低性能设备
    if (cores && cores < 4) return true
    
    // 慢速网络连接
    if (connection && ['slow-2g', '2g'].includes(connection)) return true
    
    return false
  }

  const getPerformanceLevel = () => {
    const { memory, cores } = deviceInfo.value
    
    if (isLowPerformance.value) return 'low'
    
    // 高性能设备：内存 >= 8GB 且核心数 >= 8
    if (memory && memory >= 8 && cores && cores >= 8) return 'high'
    
    return 'medium'
  }

  const getRecommendedThemeSettings = () => {
    const level = getPerformanceLevel()
    
    switch (level) {
      case 'low':
        return {
          transitionDuration: 150,
          enableProgressBar: false,
          adaptToPerformance: true,
          preloadThemes: false,
          enableComplexEffects: false
        }
      case 'high':
        return {
          transitionDuration: 400,
          enableProgressBar: true,
          adaptToPerformance: false,
          preloadThemes: true,
          enableComplexEffects: true
        }
      default:
        return {
          transitionDuration: 300,
          enableProgressBar: true,
          adaptToPerformance: true,
          preloadThemes: false,
          enableComplexEffects: true
        }
    }
  }

  onMounted(() => {
    detectPerformance()
  })

  return {
    deviceInfo: computed(() => deviceInfo.value),
    isLowPerformance,
    getOptimalSettings,
    getPerformanceLevel,
    getRecommendedThemeSettings,
    detectPerformance
  }
}
