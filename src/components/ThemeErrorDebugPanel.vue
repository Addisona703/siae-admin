<template>
  <div v-if="showPanel" class="theme-error-debug-panel">
    <div class="debug-panel-header">
      <h3>主题错误监控</h3>
      <div class="header-actions">
        <t-button size="small" variant="text" @click="toggleMonitoring">
          {{ isMonitoring ? '停止监控' : '开始监控' }}
        </t-button>
        <t-button size="small" variant="text" @click="handleClose">
          关闭
        </t-button>
      </div>
    </div>

    <div class="debug-panel-content">
      <!-- Statistics -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-label">总错误数</div>
          <div class="stat-value" :class="{ 'has-errors': errorCount > 0 }">
            {{ errorCount }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">24小时错误率</div>
          <div class="stat-value" :class="{ 'has-errors': errorRate > 5 }">
            {{ errorRate }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">恢复率</div>
          <div class="stat-value success">
            {{ recoveryRate }}%
          </div>
        </div>
      </div>

      <!-- Current Error -->
      <div v-if="lastError" class="current-error-section">
        <h4>当前错误</h4>
        <div class="error-info">
          <div class="error-row">
            <span class="label">错误代码:</span>
            <span class="value">{{ lastError.code }}</span>
          </div>
          <div class="error-row">
            <span class="label">主题ID:</span>
            <span class="value">{{ lastError.themeId || 'N/A' }}</span>
          </div>
          <div class="error-row">
            <span class="label">时间:</span>
            <span class="value">{{ formatTimestamp(lastError.timestamp) }}</span>
          </div>
          <div class="error-row">
            <span class="label">可恢复:</span>
            <span class="value">{{ lastError.recoverable ? '是' : '否' }}</span>
          </div>
          <div class="error-row">
            <span class="label">可重试:</span>
            <span class="value">{{ lastError.retryable ? '是' : '否' }}</span>
          </div>
        </div>
      </div>

      <!-- Most Common Error -->
      <div v-if="mostCommonError" class="common-error-section">
        <h4>最常见错误</h4>
        <div class="common-error-info">
          <span class="error-code">{{ mostCommonError.code }}</span>
          <span class="error-count">出现 {{ mostCommonError.count }} 次</span>
        </div>
      </div>

      <!-- Recent Logs -->
      <div class="logs-section">
        <div class="logs-header">
          <h4>最近错误日志</h4>
          <div class="logs-actions">
            <t-button size="small" theme="default" @click="refreshLogs">
              刷新
            </t-button>
            <t-button size="small" theme="default" @click="exportLogs">
              导出
            </t-button>
            <t-button size="small" theme="danger" @click="clearLogs">
              清空
            </t-button>
          </div>
        </div>
        <div class="logs-list">
          <div v-for="log in recentLogs" :key="log.timestamp" class="log-item" :class="{ recovered: log.recovered }">
            <div class="log-time">{{ formatTimestamp(log.timestamp) }}</div>
            <div class="log-code">{{ log.code }}</div>
            <div class="log-message">{{ log.message }}</div>
            <div v-if="log.themeId" class="log-theme">{{ log.themeId }}</div>
            <div v-if="log.recovered" class="log-recovered">已恢复</div>
          </div>
          <div v-if="recentLogs.length === 0" class="no-logs">
            暂无错误日志
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useThemeErrorMonitor } from '@/composables/useThemeErrorMonitor'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const {
  errorLogs,
  isMonitoring,
  lastError,
  errorCount,
  errorRate,
  mostCommonError,
  recoveryRate,
  refreshLogs,
  clearLogs,
  startMonitoring,
  stopMonitoring,
  exportLogs
} = useThemeErrorMonitor()

const showPanel = computed(() => props.show ?? false)

const recentLogs = computed(() => errorLogs.value.slice(0, 10))

const toggleMonitoring = () => {
  if (isMonitoring.value) {
    stopMonitoring()
  } else {
    startMonitoring(3000) // Refresh every 3 seconds
  }
}

const handleClose = () => {
  emit('close')
}

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.theme-error-debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 600px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.debug-panel-header {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.debug-panel-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.debug-panel-content {
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-card {
  padding: 0.75rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
}

.stat-value.has-errors {
  color: #f44336;
}

.stat-value.success {
  color: #4caf50;
}

.current-error-section,
.common-error-section {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(244, 67, 54, 0.05);
  border-radius: 8px;
  border-left: 3px solid #f44336;
}

.current-error-section h4,
.common-error-section h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #f44336;
}

.error-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.error-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}

.error-row .label {
  color: rgba(0, 0, 0, 0.6);
}

.error-row .value {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.common-error-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.error-code {
  font-weight: 600;
  color: #f44336;
}

.error-count {
  color: rgba(0, 0, 0, 0.6);
}

.logs-section {
  margin-top: 1rem;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.logs-header h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.logs-actions {
  display: flex;
  gap: 0.5rem;
}

.logs-list {
  max-height: 250px;
  overflow-y: auto;
}

.log-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 6px;
  border-left: 3px solid #f44336;
  font-size: 0.75rem;
}

.log-item.recovered {
  border-left-color: #4caf50;
  opacity: 0.7;
}

.log-time {
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 0.25rem;
}

.log-code {
  font-weight: 600;
  color: #f44336;
  margin-bottom: 0.25rem;
}

.log-message {
  color: rgba(0, 0, 0, 0.75);
  margin-bottom: 0.25rem;
}

.log-theme {
  color: rgba(0, 0, 0, 0.6);
  font-style: italic;
}

.log-recovered {
  color: #4caf50;
  font-weight: 600;
  margin-top: 0.25rem;
}

.no-logs {
  text-align: center;
  padding: 2rem;
  color: rgba(0, 0, 0, 0.4);
  font-size: 0.85rem;
}
</style>
