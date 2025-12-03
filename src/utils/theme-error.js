/**
 * Theme error handling utilities
 */
import { MessagePlugin, NotifyPlugin } from 'tdesign-vue-next'

// Default retry configuration
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  timeout: 10000
}

// Error log storage
const ERROR_LOG_KEY = 'multi_theme_error_log'
const MAX_ERROR_LOGS = 50

/**
 * Create a theme-specific error
 */
export function createThemeError(code, message, themeId, originalError) {
  const error = new Error(message)
  error.code = code
  error.themeId = themeId
  error.originalError = originalError
  error.timestamp = Date.now()
  
  // Determine if error is recoverable and retryable
  error.recoverable = isRecoverableError(code)
  error.retryable = isRetryableError(code)
  
  return error
}

/**
 * Check if error code represents a recoverable error
 */
function isRecoverableError(code) {
  return [
    'LAYOUT_LOAD_FAILED',
    'STYLE_LOAD_FAILED',
    'THEME_SWITCH_TIMEOUT',
    'CACHE_OPERATION_FAILED'
  ].includes(code)
}

/**
 * Check if error code represents a retryable error
 */
function isRetryableError(code) {
  return [
    'LAYOUT_LOAD_FAILED',
    'STYLE_LOAD_FAILED',
    'THEME_SWITCH_TIMEOUT'
  ].includes(code)
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error) {
  const messages = {
    LAYOUT_LOAD_FAILED: `主题布局加载失败${error.themeId ? ` (${error.themeId})` : ''}`,
    STYLE_LOAD_FAILED: `主题样式加载失败${error.themeId ? ` (${error.themeId})` : ''}`,
    THEME_NOT_FOUND: `主题不存在${error.themeId ? ` (${error.themeId})` : ''}`,
    THEME_SWITCH_TIMEOUT: `主题切换超时${error.themeId ? ` (${error.themeId})` : ''}`,
    THEME_INIT_FAILED: '主题初始化失败',
    STORAGE_ACCESS_FAILED: '无法访问本地存储',
    INVALID_THEME_CONFIG: `主题配置无效${error.themeId ? ` (${error.themeId})` : ''}`,
    CACHE_OPERATION_FAILED: '缓存操作失败'
  }
  
  return messages[error.code] || error.message || '未知错误'
}

/**
 * Get recovery suggestion for error
 */
export function getRecoverySuggestion(error) {
  const suggestions = {
    LAYOUT_LOAD_FAILED: '请刷新页面或切换到其他主题',
    STYLE_LOAD_FAILED: '请刷新页面或切换到其他主题',
    THEME_NOT_FOUND: '请选择其他可用主题',
    THEME_SWITCH_TIMEOUT: '请稍后重试',
    THEME_INIT_FAILED: '请刷新页面',
    STORAGE_ACCESS_FAILED: '请检查浏览器设置',
    INVALID_THEME_CONFIG: '请联系管理员',
    CACHE_OPERATION_FAILED: '请刷新页面'
  }
  
  return suggestions[error.code] || '请刷新页面重试'
}

/**
 * Handle theme error with user feedback
 */
export function handleThemeError(error, options = {}) {
  const {
    showMessage = true,
    showNotification = false,
    onRetry
  } = options
  
  const message = getErrorMessage(error)
  const suggestion = getRecoverySuggestion(error)
  
  // Log error
  logThemeError(error)
  
  // Console logging with details
  console.error('[Theme Error]', {
    code: error.code,
    message: message,
    themeId: error.themeId,
    recoverable: error.recoverable,
    retryable: error.retryable,
    timestamp: new Date(error.timestamp).toISOString(),
    originalError: error.originalError || null
  })
  
  // Show user feedback
  if (showMessage && error.retryable && onRetry) {
    MessagePlugin.error({
      content: `${message}。${suggestion}`,
      duration: 5000,
      closeBtn: true,
      onCloseBtnClick: () => {
        if (onRetry) {
          onRetry()
        }
      }
    })
  } else if (showMessage) {
    MessagePlugin.error({
      content: `${message}。${suggestion}`,
      duration: 5000,
      closeBtn: true
    })
  }
  
  if (showNotification) {
    NotifyPlugin.error({
      title: '主题错误',
      content: `${message}。${suggestion}`,
      duration: 5000,
      closeBtn: true
    })
  }
}

/**
 * Log theme error for debugging and analytics
 */
export function logThemeError(error) {
  try {
    const errorLog = {
      timestamp: error.timestamp || Date.now(),
      code: error.code,
      message: error.message,
      themeId: error.themeId,
      stack: error.stack,
      userAgent: navigator.userAgent,
      recovered: false
    }
    
    const logs = getErrorLogs()
    
    // Add new log
    logs.unshift(errorLog)
    
    // Keep only recent logs
    const trimmedLogs = logs.slice(0, MAX_ERROR_LOGS)
    
    // Save to localStorage
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(trimmedLogs))
  } catch (e) {
    console.warn('Failed to log theme error:', e)
  }
}

/**
 * Get error logs from localStorage
 */
export function getErrorLogs() {
  try {
    const logs = localStorage.getItem(ERROR_LOG_KEY)
    return logs ? JSON.parse(logs) : []
  } catch (e) {
    console.warn('Failed to retrieve error logs:', e)
    return []
  }
}

/**
 * Clear error logs
 */
export function clearErrorLogs() {
  try {
    localStorage.removeItem(ERROR_LOG_KEY)
  } catch (e) {
    console.warn('Failed to clear error logs:', e)
  }
}

/**
 * Mark error in logs as recovered
 */
export function markErrorRecovered(timestamp) {
  try {
    const logs = getErrorLogs()
    const log = logs.find(l => l.timestamp === timestamp)
    if (log) {
      log.recovered = true
      localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs))
    }
  } catch (e) {
    console.warn('Failed to mark error:', e)
  }
}

/**
 * Create a retry handler with exponential backoff
 */
export async function retryOperation(operation, config = {}) {
  const {
    maxRetries,
    retryDelay,
    backoffMultiplier,
    timeout
  } = { ...DEFAULT_RETRY_CONFIG, ...config }
  
  let lastError = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timeout')), timeout)
      })
      
      // Race between operation and timeout
      const result = await Promise.race([
        operation(),
        timeoutPromise
      ])
      
      // Success - log recovery if this was a retry
      if (attempt > 0) {
        console.log(`[Theme Retry] Operation succeeded after ${attempt} retries`)
        MessagePlugin.success({
          content: '操作已恢复',
          duration: 3000
        })
      }
      
      return result
    } catch (error) {
      lastError = error
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break
      }
      
      // Calculate delay with exponential backoff
      const delay = retryDelay * Math.pow(backoffMultiplier, attempt)
      
      console.warn(`[Theme Retry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delay}ms...`, error)
      
      // Show retry message to user
      MessagePlugin.warning({
        content: `正在重试... (${attempt + 1}/${maxRetries})`,
        duration: 3000
      })
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // All retries failed
  throw lastError || new Error('Operation failed after all retries')
}

/**
 * Wrap theme operation with timeout
 */
export async function withTimeout(operation, timeoutMs, errorMessage = 'Operation timeout') {
  return Promise.race([
    operation,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    })
  ])
}

/**
 * Get error statistics for monitoring
 */
export function getErrorStatistics() {
  const logs = getErrorLogs()
  
  const byCode = {}
  let recovered = 0
  
  logs.forEach(log => {
    byCode[log.code] = (byCode[log.code] || 0) + 1
    if (log.recovered) {
      recovered++
    }
  })
  
  return {
    total: logs.length,
    byCode,
    recovered,
    recent: logs.slice(0, 10)
  }
}
