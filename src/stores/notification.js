import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { notificationApi } from '@/api/notification'
import { APP_CONFIG } from '@/config/app.config'
import { useAuthStore } from './auth'

const MAX_BUFFER_SIZE = 20

const buildStreamUrl = () => {
  const base = APP_CONFIG.apiBaseUrl.replace(/\/$/, '')
  return `${base}/notification/stream`
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
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
    }
    isConnected.value = false
    isConnecting.value = false
  }

  const resetState = () => {
    disconnect()
    items.value = []
    unreadCount.value = 0
    lastError.value = null
    lastEventAt.value = null
    initialized.value = false
    isLoading.value = false
  }

  const connectStream = () => {
    if (eventSource.value || !authStore.isAuthenticated) {
      return
    }

    const streamUrl = buildStreamUrl()
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
      lastError.value = '通知实时连接异常，正在尝试重连...'
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
    if (!authStore.isAuthenticated || !authStore.currentUser?.id) {
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
          await bootstrap()
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
