<template>
  <t-popup trigger="click" placement="bottom-right" :overlay-class-name="'notification-popup'"
    @visible-change="handleVisibleChange">
    <button class="header-btn notification-btn" type="button">
      <t-icon name="notification" />
      <span v-if="unreadCount > 0" class="badge">{{ badgeLabel }}</span>
    </button>

    <template #content>
      <div class="notification-panel">
        <div class="panel-header">
          <div>
            <span class="panel-title">通知中心</span>
            <span v-if="unreadCount > 0" class="panel-subtitle">未读 {{ unreadCount }} 条</span>
          </div>
          <t-button variant="text" size="small" :disabled="unreadCount === 0 || markAllPending" @click="handleMarkAll">
            全部已读
          </t-button>
        </div>

        <div class="panel-body">
          <div v-if="isLoading" class="panel-empty">
            <t-loading size="small" />
            <span>加载通知中...</span>
          </div>

          <div v-else-if="errorMessage" class="panel-empty">
            <t-icon name="error-circle" />
            <span>{{ errorMessage }}</span>
            <t-button variant="outline" size="small" @click="handleRefresh">重试</t-button>
          </div>

          <div v-else-if="notifications.length === 0" class="panel-empty">
            <t-icon name="mail" />
            <span>暂无新通知</span>
          </div>

          <ul v-else class="notification-list">
            <li v-for="item in notifications" :key="item.id" class="notification-item" :class="{ unread: !item.isRead }"
              @click="handleNotificationClick(item)">
              <div class="item-main">
                <div class="item-title">{{ item.title }}</div>
                <div class="item-content">{{ item.content || '无内容' }}</div>
              </div>
              <div class="item-meta">
                <span class="item-time">{{ formatTimestamp(item.createdAt) }}</span>
                <t-button v-if="!item.isRead" variant="text" size="small" class="mark-read-btn"
                  :loading="markingId === item.id" @click.stop="handleMarkSingle(item.id)">
                  标记已读
                </t-button>
              </div>
            </li>
          </ul>
        </div>

        <div class="panel-footer">
          <span class="connection-indicator" :class="{ error: !isConnected && !!errorMessage }">
            <span class="dot" />
            {{ isConnected ? '实时连接正常' : '等待重连' }}
          </span>
          <t-button variant="text" size="small" @click="handleRefresh">
            刷新
          </t-button>
        </div>
      </div>
    </template>
  </t-popup>
</template>

<script setup>
import { computed, ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useNotificationStore } from '@/stores/notification'

const notificationStore = useNotificationStore()

const markingId = ref(null)
const markAllPending = ref(false)

const unreadCount = computed(() => notificationStore.unreadCount)
const notifications = computed(() => notificationStore.recentNotifications)
const isLoading = computed(() => notificationStore.isLoading)
const isConnected = computed(() => notificationStore.isConnected)
const errorMessage = computed(() => notificationStore.lastError)

const badgeLabel = computed(() => {
  if (unreadCount.value > 99) return '99+'
  return String(unreadCount.value)
})

const formatTimestamp = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mi = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

const handleVisibleChange = async (visible) => {
  if (visible) {
    try {
      if (!notificationStore.initialized) {
        await notificationStore.bootstrap()
      } else {
        await notificationStore.refresh()
      }
    } catch (error) {
      console.error('[NotificationBell] Failed to load notifications', error)
    }
  }
}

const handleNotificationClick = async (item) => {
  if (!item.isRead) {
    await notificationStore.markAsRead(item.id)
  }

  if (item.linkUrl) {
    window.open(item.linkUrl, '_blank', 'noopener')
  }
}

const handleMarkSingle = async (id) => {
  try {
    markingId.value = id
    await notificationStore.markAsRead(id)
    MessagePlugin.success('已标记为已读')
  } catch (error) {
    MessagePlugin.error('标记失败，请稍后重试')
    console.error('[NotificationBell] mark single failed', error)
  } finally {
    markingId.value = null
  }
}

const handleMarkAll = async () => {
  try {
    markAllPending.value = true
    await notificationStore.markAllAsRead()
    MessagePlugin.success('全部通知已标记为已读')
  } catch (error) {
    MessagePlugin.error('操作失败，请稍后重试')
    console.error('[NotificationBell] mark all failed', error)
  } finally {
    markAllPending.value = false
  }
}

const handleRefresh = async () => {
  try {
    await notificationStore.refresh()
    MessagePlugin.success('已刷新通知')
  } catch (error) {
    MessagePlugin.error('刷新失败，请稍后重试')
    console.error('[NotificationBell] refresh failed', error)
  }
}
</script>

<style scoped lang="less">
.notification-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: #ffffff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
  border: 2px solid #ffffff;
}

.notification-panel {
  width: 320px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 45px -12px rgba(15, 23, 42, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 420px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;

  .panel-title {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
  }

  .panel-subtitle {
    margin-left: 8px;
    font-size: 12px;
    color: #64748b;
  }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 6px;
}

.panel-empty {
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 13px;

  .t-icon {
    font-size: 24px;
    color: #94a3b8;
  }
}

.notification-list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}

.notification-item {
  padding: 12px 14px;
  border-radius: 10px;
  margin: 4px 0;
  transition: background 0.2s ease;
  cursor: pointer;
  border: 1px solid transparent;

  &:hover {
    background: #f8fafc;
  }

  &.unread {
    background: rgba(14, 165, 233, 0.08);
    border-color: rgba(14, 165, 233, 0.15);
  }
}

.item-main {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .item-title {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
  }

  .item-content {
    font-size: 13px;
    color: #475569;
    line-height: 1.4;
  }
}

.item-meta {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #94a3b8;
}

.mark-read-btn {
  color: #3b82f6;
}

.panel-footer {
  padding: 10px 16px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .connection-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #22c55e;

    &.error {
      color: #f97316;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      animation: pulse 1.6s infinite;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }

  50% {
    transform: scale(1.3);
    opacity: 0.4;
  }

  100% {
    transform: scale(1);
    opacity: 0.9;
  }
}

// Dark theme support
html[theme-mode='dark'] {
  .notification-panel {
    background: #1f2937;
    box-shadow: 0 20px 45px -12px rgba(0, 0, 0, 0.5);
  }

  .panel-header {
    border-bottom-color: #334155;

    .panel-title {
      color: #f8fafc;
    }

    .panel-subtitle {
      color: #94a3b8;
    }
  }

  .panel-body {
    background: #1f2937;
  }

  .panel-empty {
    color: #94a3b8;

    .t-icon {
      color: #64748b;
    }
  }

  .notification-item {
    &:hover {
      background: rgba(148, 163, 184, 0.1);
    }

    &.unread {
      background: rgba(59, 130, 246, 0.12);
      border-color: rgba(59, 130, 246, 0.18);
    }

    .item-title {
      color: #e2e8f0;
    }

    .item-content {
      color: #cbd5f5;
    }
  }

  .item-meta {
    color: #94a3b8;
  }

  .panel-footer {
    border-top-color: #334155;
  }
}
</style>
