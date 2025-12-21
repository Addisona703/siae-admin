# SSE 实时通知连接指南

## 概述

本系统使用 Server-Sent Events (SSE) 实现实时通知推送。当有新通知时，服务端会主动推送到前端，无需轮询。

## 连接地址

```
GET /api/v1/notification/stream?token={JWT_TOKEN}
```

## 认证方式

SSE 连接使用**双重认证机制**确保兼容性：

1. **Cookie 认证（主要）**：登录时 Token 同时存储到 Cookie，SSE 请求通过 `withCredentials: true` 自动携带
2. **Query Parameter（备用）**：Token 也通过 URL 参数传递，供后端服务二次验证

```javascript
import { TokenManager } from '@/utils/token'

// TokenManager.setAccessToken() 会同时设置 localStorage 和 Cookie
const token = TokenManager.getAccessToken()
const url = `${API_BASE_URL}/notification/stream?token=${encodeURIComponent(token)}`

// withCredentials: true 让浏览器自动携带 Cookie
const eventSource = new EventSource(url, { withCredentials: true })
```

### 认证流程

```
1. 用户登录 → TokenManager.setAccessToken(token)
   ↓
2. Token 存入 localStorage + Cookie (ACCESS_TOKEN)
   ↓
3. 创建 EventSource，withCredentials: true
   ↓
4. 浏览器自动携带 Cookie → Gateway 验证通过
   ↓
5. 请求到达 notification 服务，建立 SSE 连接
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

## Vue 3 + Pinia 集成

参考 `src/stores/notification.js`，核心实现：

```javascript
import { TokenManager } from '@/utils/token'
import { APP_CONFIG } from '@/config/app.config'

const buildStreamUrl = (token) => {
  const base = APP_CONFIG.apiBaseUrl.replace(/\/$/, '')
  return token 
    ? `${base}/notification/stream?token=${encodeURIComponent(token)}` 
    : `${base}/notification/stream`
}

const connectStream = () => {
  const token = TokenManager.getAccessToken()
  const streamUrl = buildStreamUrl(token)
  
  // withCredentials: true 确保携带 Cookie
  const source = new EventSource(streamUrl, { withCredentials: true })
  
  source.addEventListener('ready', () => {
    console.log('SSE 连接成功')
    reconnectAttempts = 0
  })
  
  source.addEventListener('notify', (event) => {
    const notification = JSON.parse(event.data)
    unreadCount.value += 1
    items.value.unshift(notification)
  })
  
  source.addEventListener('heartbeat', () => {
    lastEventAt.value = new Date().toISOString()
  })
  
  source.addEventListener('error', () => {
    // 断线重连逻辑
    scheduleReconnect()
  })
}
```

## Token 管理

`src/utils/token.js` 中的 `TokenManager` 负责 Token 的存储：

```javascript
export class TokenManager {
  static setAccessToken(token) {
    // 存入 localStorage（用于 API 请求）
    localStorage.setItem('access_token', token)
    // 同时存入 Cookie（用于 SSE 连接）
    setCookie('ACCESS_TOKEN', token)
  }
  
  static getAccessToken() {
    return localStorage.getItem('access_token')
  }
  
  static clearTokens() {
    localStorage.removeItem('access_token')
    deleteCookie('ACCESS_TOKEN')
  }
}
```

## 注意事项

1. **Cookie 必须存在**：SSE 连接依赖 Cookie 认证，确保登录后 `ACCESS_TOKEN` Cookie 已设置
2. **跨域配置**：如果前后端不同域，需要正确配置 CORS 和 Cookie 的 `SameSite` 属性
3. **Token 过期处理**：Token 过期后 SSE 连接会断开，需要刷新 Token 后重连
4. **页面切换**：切换页面时不要断开连接，保持全局单例
5. **多标签页**：同一用户多个标签页会建立多个 SSE 连接，都能收到通知
6. **断线重连**：使用指数退避策略重连，避免服务器压力
7. **浏览器限制**：同一域名 SSE 连接数有限制（通常 6 个），注意复用连接

## 常见问题

### 401 Unauthorized

检查以下几点：
1. 浏览器 DevTools → Application → Cookies，确认有 `ACCESS_TOKEN`
2. Token 是否过期，尝试重新登录
3. 跨域情况下 Cookie 是否正确携带

### 连接频繁断开

1. 检查网络稳定性
2. 确认后端心跳机制正常
3. 查看是否有代理/负载均衡超时配置

## 后端接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/notification/stream` | GET | SSE 连接端点 |
| `/notification/my` | GET | 获取通知列表 |
| `/notification/unread-count` | GET | 获取未读数量 |
| `/notification/{id}/status` | PUT | 标记已读/未读 |
| `/notification/status-all` | PUT | 全部标记已读 |
