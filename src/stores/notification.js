import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { notificationApi } from '@/api/notification'
import { APP_CONFIG } from '@/config/app.config'
import { useAuthStore } from './auth'
import { TokenManager } from '@/utils/token'

const MAX_BUFFER_SIZE = 20
const RECONNECT_DELAY_BASE = 1000 // 基础重连延迟 1秒
const RECONNECT_DELAY_MAX = 30000 // 最大重连延迟 30秒
const MAX_RECONNECT_ATTEMPTS = 10 // 最大重连次数

const buildStreamUrl = (token) => {
  const base = APP_CONFIG.apiBaseUrl.replace(/\/$/, '')
  // SSE 不支持自定义 headers，通过 query parameter 传递 token
  return token ? `${base}/notification/stream?token=${encodeURIComponent(token)}` : `${base}/notification/stream`
}

const normalizeNotification = (payload) => {
  if (!payload) {
    return null
  }

  if (payload.id === undefined || payload.userId === undefined) {
    return null
  }

  return {
    id: payload.id,
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    content: payload.content,
    linkUrl: payload.linkUrl ? payload.linkUrl : null,
    isRead: payload.isRead,
    createdAt: new Date(payload.createdAt).toISOString(),
  }
}

export const useNotificationStore = defineStore('notification', () => {
  const authStore = useAuthStore()

  const items = ref([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const lastError = ref(null)
  const lastEventAt = ref(null)
  const initialized = ref(false)
  const eventSource = ref(null)
  const reconnectAttempts = ref(0)
  const reconnectTimer = ref(null)

  const recentNotifications = computed(() => items.value.slice(0, 10))

  const setItems = (list) => {
    items.value = list
  }

  const upsertNotification = (notification) => {
    const existingIndex = items.value.findIndex((item) => item.id === notification.id)
    if (existingIndex >= 0) {
      items.value.splice(existingIndex, 1, notification)
    } else {
      items.value.unshift(notification)
    }

    if (items.value.length > MAX_BUFFER_SIZE) {
      items.value = items.value.slice(0, MAX_BUFFER_SIZE)
    }
  }

  const disconnect = () => {
    // 清除重连定时器
    if (reconnectTimer.value) {
      clearTimeout(reconnectTimer.value)
      reconnectTimer.value = null
    }
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
    }
    isConnected.value = false
    isConnecting.value = false
  }

  // 计算重连延迟（指数退避）
  const getReconnectDelay = () => {
    const delay = Math.min(
      RECONNECT_DELAY_BASE * Math.pow(2, reconnectAttempts.value),
      RECONNECT_DELAY_MAX
    )
    return delay
  }

  // 自动重连
  const scheduleReconnect = () => {
    if (reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS) {
      lastError.value = '连接失败次数过多，请刷新页面重试'
      return
    }

    const delay = getReconnectDelay()
    
    reconnectTimer.value = setTimeout(() => {
      if (authStore.isAuthenticated) {
        reconnectAttempts.value++
        connectStream()
      }
    }, delay)
  }

  const resetState = () => {
    disconnect()
    items.value = []
    unreadCount.value = 0
    lastError.value = null
    lastEventAt.value = null
    initialized.value = false
    isLoading.value = false
    reconnectAttempts.value = 0
  }

  const connectStream = () => {
    if (eventSource.value) {
      return
    }
    
    if (!authStore.isAuthenticated) {
      return
    }

    // 获取 token 用于 SSE 认证（EventSource 不支持自定义 headers）
    const token = TokenManager.getAccessToken()
    const streamUrl = buildStreamUrl(token)
    const source = new EventSource(streamUrl, { withCredentials: true })
    eventSource.value = source
    isConnecting.value = true
    lastError.value = null

    source.addEventListener('open', () => {
      isConnected.value = true
      isConnecting.value = false
    })

    source.addEventListener('ready', () => {
      isConnected.value = true
      isConnecting.value = false
      reconnectAttempts.value = 0 // 连接成功，重置重连计数
      lastError.value = null
    })

    // 处理心跳事件，保持连接活跃
    source.addEventListener('heartbeat', () => {
      lastEventAt.value = new Date().toISOString()
    })

    source.addEventListener('notify', (event) => {
      try {
        const payload = JSON.parse(event.data)
        const normalized = normalizeNotification(payload)
        if (normalized) {
          upsertNotification({ ...normalized, isRead: false })
          if (!normalized.isRead) {
            unreadCount.value += 1
          }
          lastEventAt.value = new Date().toISOString()
        }
      } catch (error) {
        lastError.value = '解析通知数据失败'
        console.error('[notification-store] Failed to parse notify event', error)
      }
    })

    source.addEventListener('error', (event) => {
      console.warn('[notification-store] SSE connection error', event)
      isConnected.value = false
      isConnecting.value = false
      
      // 关闭当前连接
      if (eventSource.value) {
        eventSource.value.close()
        eventSource.value = null
      }
      
      // 检查是否应该重连
      if (authStore.isAuthenticated && reconnectAttempts.value < MAX_RECONNECT_ATTEMPTS) {
        lastError.value = `通知连接断开，${Math.ceil(getReconnectDelay() / 1000)}秒后重连...`
        scheduleReconnect()
      } else if (reconnectAttempts.value >= MAX_RECONNECT_ATTEMPTS) {
        lastError.value = '通知连接失败，请刷新页面'
      }
    })
  }

  const fetchUnreadCount = async () => {
    const result = await notificationApi.getUnreadCount()
    unreadCount.value = Number(result.data ?? 0)
  }

  const fetchRecentNotifications = async () => {
    const result = await notificationApi.getMyNotifications({
      page: 1,
      size: MAX_BUFFER_SIZE,
    })
    const records = result.data?.items ?? []
    setItems(records)
  }

  const bootstrap = async () => {
    if (!authStore.isAuthenticated) {
      return
    }

    try {
      isLoading.value = true
      lastError.value = null
      await Promise.all([fetchRecentNotifications(), fetchUnreadCount()])
      connectStream()
      initialized.value = true
    } catch (error) {
      console.error('[notification-store] 初始化通知失败', error)
      lastError.value = '初始化通知数据失败'
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = async (id) => {
    await notificationApi.markAsRead(id)
    const target = items.value.find((item) => item.id === id)
    if (target && !target.isRead) {
      target.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  const markAllAsRead = async () => {
    await notificationApi.markAllAsRead()
    items.value = items.value.map((item) => ({ ...item, isRead: true }))
    unreadCount.value = 0
  }

  const refresh = async () => {
    await Promise.all([fetchRecentNotifications(), fetchUnreadCount()])
  }

  watch(
    () => authStore.isAuthenticated,
    async (authenticated) => {
      if (authenticated) {
        if (!initialized.value && !isLoading.value) {
          await new Promise((resolve) => setTimeout(resolve, 500))
          if (authStore.isAuthenticated) {
            try {
              await bootstrap()
            } catch (err) {
              console.warn('[notification-store] 初始化失败:', err.message)
            }
          }
        }
      } else {
        resetState()
      }
    },
  )

  return {
    // state
    items,
    recentNotifications,
    unreadCount,
    isLoading,
    isConnected,
    isConnecting,
    lastError,
    lastEventAt,
    initialized,

    // actions
    bootstrap,
    refresh,
    markAsRead,
    markAllAsRead,
    resetState,
  }
})
