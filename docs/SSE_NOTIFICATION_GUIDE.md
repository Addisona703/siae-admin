# SSE 实时通知连接指南

## 概述

本系统使用 Server-Sent Events (SSE) 实现实时通知推送。当有新通知时，服务端会主动推送到前端，无需轮询。

## 连接地址

```
GET /api/v1/notification/stream?token={JWT_TOKEN}
```

## 认证方式

由于 `EventSource` 不支持自定义 Headers，需要通过 URL Query Parameter 传递 JWT Token：

```javascript
const token = 'your-jwt-token'
const url = `${API_BASE_URL}/notification/stream?token=${encodeURIComponent(token)}`
const eventSource = new EventSource(url, { withCredentials: true })
```

## 事件类型

### 1. `ready` - 连接就绪

连接成功后服务端发送的确认事件。

```javascript
eventSource.addEventListener('ready', (event) => {
  const data = JSON.parse(event.data)
  console.log('SSE 连接成功', data)
  // data: { ts: "2025-12-05T10:00:00Z", userId: 1, heartbeatInterval: 30 }
})
```

### 2. `notify` - 新通知

收到新通知时触发。

```javascript
eventSource.addEventListener('notify', (event) => {
  const notification = JSON.parse(event.data)
  console.log('收到新通知', notification)
})
```

**通知数据结构：**

```typescript
interface Notification {
  id: number           // 通知ID
  userId: number       // 接收用户ID
  type: number         // 通知类型: 1=系统通知, 2=公告, 3=提醒
  title: string        // 通知标题
  content: string      // 通知内容
  linkUrl: string | null  // 跳转链接
  isRead: boolean      // 是否已读
  createdAt: string    // 创建时间 (ISO 8601)
}
```

### 3. `heartbeat` - 心跳

服务端每 30 秒发送一次心跳，保持连接活跃。

```javascript
eventSource.addEventListener('heartbeat', (event) => {
  console.log('心跳', event.data)
})
```

### 4. `error` - 错误

认证失败或其他错误。

```javascript
eventSource.addEventListener('error', (event) => {
  console.error('SSE 连接错误', event)
  // 可能需要重连
})
```

## 完整示例

```javascript
class NotificationSSE {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl
    this.eventSource = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 10
  }

  connect(token) {
    if (this.eventSource) {
      this.disconnect()
    }

    const url = `${this.apiBaseUrl}/notification/stream?token=${encodeURIComponent(token)}`
    this.eventSource = new EventSource(url, { withCredentials: true })

    // 连接就绪
    this.eventSource.addEventListener('ready', (event) => {
      const data = JSON.parse(event.data)
      console.log('[SSE] 连接成功, userId:', data.userId)
      this.reconnectAttempts = 0 // 重置重连计数
    })

    // 接收通知
    this.eventSource.addEventListener('notify', (event) => {
      const notification = JSON.parse(event.data)
      console.log('[SSE] 收到通知:', notification)
      this.onNotification(notification)
    })

    // 心跳
    this.eventSource.addEventListener('heartbeat', () => {
      console.log('[SSE] 心跳')
    })

    // 错误处理
    this.eventSource.addEventListener('error', (event) => {
      console.error('[SSE] 连接错误', event)
      this.handleError()
    })
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  handleError() {
    this.disconnect()
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)
      console.log(`[SSE] ${delay}ms 后重连...`)
      
      setTimeout(() => {
        this.reconnectAttempts++
        this.connect(this.token)
      }, delay)
    } else {
      console.error('[SSE] 重连次数过多，请刷新页面')
    }
  }

  // 重写此方法处理通知
  onNotification(notification) {
    // 更新未读数量
    // 显示通知提示
    // 播放提示音等
  }
}

// 使用示例
const sse = new NotificationSSE('/api/v1')
sse.onNotification = (notification) => {
  alert(`新通知: ${notification.title}`)
}
sse.connect('your-jwt-token')
```

## Vue 3 + Pinia 集成示例

参考 `src/stores/notification.js`：

```javascript
import { TokenManager } from '@/utils/token'

const connectStream = () => {
  const token = TokenManager.getAccessToken()
  const url = `${API_BASE_URL}/notification/stream?token=${encodeURIComponent(token)}`
  
  const source = new EventSource(url, { withCredentials: true })
  
  source.addEventListener('notify', (event) => {
    const notification = JSON.parse(event.data)
    // 更新 store 中的未读数量
    unreadCount.value += 1
    // 添加到通知列表
    items.value.unshift(notification)
  })
  
  // ... 其他事件处理
}
```

## 注意事项

1. **Token 过期处理**：Token 过期后 SSE 连接会断开，需要刷新 Token 后重连
2. **页面切换**：切换页面时不要断开连接，保持全局单例
3. **多标签页**：同一用户多个标签页会建立多个 SSE 连接，都能收到通知
4. **断线重连**：使用指数退避策略重连，避免服务器压力
5. **浏览器限制**：同一域名 SSE 连接数有限制（通常 6 个），注意复用连接

## 后端接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/notification/stream` | GET | SSE 连接端点 |
| `/notification/my` | GET | 获取通知列表 |
| `/notification/unread-count` | GET | 获取未读数量 |
| `/notification/{id}/status` | PUT | 标记已读/未读 |
| `/notification/status-all` | PUT | 全部标记已读 |
