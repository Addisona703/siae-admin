/**
 * Composable for monitoring and debugging theme errors
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getErrorLogs, getErrorStatistics, clearErrorLogs } from '@/utils/theme-error'

export function useThemeErrorMonitor() {
  const lastError = ref(null)
  const errorCount = ref(0)
  const isRecovering = ref(false)
  
  const errorLogs = ref([])
  const isMonitoring = ref(false)
  const refreshInterval = ref(null)
  
  // Computed statistics
  const errorStats = computed(() => getErrorStatistics())
  
  const hasErrors = computed(() => errorCount.value > 0)
  
  const hasRecentErrors = computed(() => {
    const recentThreshold = Date.now() - 5 * 60 * 1000 // Last 5 minutes
    return errorLogs.value.some(log => log.timestamp > recentThreshold)
  })
  
  const errorRate = computed(() => {
    const last24h = Date.now() - 24 * 60 * 60 * 1000
    const recentErrors = errorLogs.value.filter(log => log.timestamp > last24h)
    return recentErrors.length
  })
  
  const mostCommonError = computed(() => {
    const stats = errorStats.value
    const entries = Object.entries(stats.byCode || {})
    if (entries.length === 0) return null
    
    const [code, count] = entries.reduce((max, entry) => 
      entry[1] > max[1] ? entry : max
    )
    
    return { code, count }
  })
  
  const recoveryRate = computed(() => {
    const stats = errorStats.value
    if (stats.total === 0) return 100
    return Math.round((stats.recovered / stats.total) * 100)
  })
  
  // Actions
  const refreshLogs = () => {
    errorLogs.value = getErrorLogs()
  }
  
  const clearLogs = () => {
    clearErrorLogs()
    refreshLogs()
  }
  
  const startMonitoring = (intervalMs = 5000) => {
    if (isMonitoring.value) return
    
    isMonitoring.value = true
    refreshLogs()
    
    refreshInterval.value = window.setInterval(() => {
      refreshLogs()
    }, intervalMs)
    
    console.log('[Theme Error Monitor] Started monitoring')
  }
  
  const stopMonitoring = () => {
    if (!isMonitoring.value) return
    
    if (refreshInterval.value !== null) {
      clearInterval(refreshInterval.value)
      refreshInterval.value = null
    }
    
    isMonitoring.value = false
    console.log('[Theme Error Monitor] Stopped monitoring')
  }
  
  const exportLogs = () => {
    const logs = getErrorLogs()
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `theme-error-logs-${Date.now()}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    console.log('[Theme Error Monitor] Logs exported')
  }
  
  const getErrorSummary = () => {
    return {
      totalErrors: errorCount.value,
      currentError: lastError.value,
      isRecovering: isRecovering.value,
      errorRate: errorRate.value,
      recoveryRate: recoveryRate.value,
      mostCommonError: mostCommonError.value,
      recentLogs: errorLogs.value.slice(0, 5)
    }
  }
  
  // Lifecycle
  onMounted(() => {
    refreshLogs()
  })
  
  onUnmounted(() => {
    stopMonitoring()
  })
  
  return {
    // State
    errorLogs,
    isMonitoring,
    lastError,
    errorCount,
    isRecovering,
    
    // Computed
    errorStats,
    hasErrors,
    hasRecentErrors,
    errorRate,
    mostCommonError,
    recoveryRate,
    
    // Actions
    refreshLogs,
    clearLogs,
    startMonitoring,
    stopMonitoring,
    exportLogs,
    getErrorSummary
  }
}
