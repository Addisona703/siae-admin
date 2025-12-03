# 主题系统错误处理文档

## 概述

本文档描述了多主题布局系统的错误处理和用户反馈机制。该系统提供了完善的错误检测、日志记录、自动恢复和用户友好的错误提示。

## 错误类型

### ThemeErrorCode 枚举

系统定义了以下错误类型：

- `LAYOUT_LOAD_FAILED`: 主题布局组件加载失败
- `STYLE_LOAD_FAILED`: 主题样式文件加载失败
- `THEME_NOT_FOUND`: 请求的主题不存在
- `THEME_SWITCH_TIMEOUT`: 主题切换超时
- `THEME_INIT_FAILED`: 主题系统初始化失败
- `STORAGE_ACCESS_FAILED`: 无法访问本地存储
- `INVALID_THEME_CONFIG`: 主题配置无效
- `CACHE_OPERATION_FAILED`: 缓存操作失败

### ThemeError 接口

```typescript
interface ThemeError extends Error {
  code: ThemeErrorCode        // 错误代码
  themeId?: string           // 相关主题ID
  originalError?: Error      // 原始错误对象
  timestamp: number          // 错误发生时间戳
  recoverable: boolean       // 是否可恢复
  retryable: boolean        // 是否可重试
}
```

## 错误处理机制

### 1. 自动重试

系统使用指数退避算法自动重试失败的操作：

```typescript
// 默认重试配置
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,              // 最大重试次数
  retryDelay: 1000,          // 初始重试延迟（毫秒）
  backoffMultiplier: 1.5,    // 退避倍数
  timeout: 10000             // 单次操作超时时间
}
```

**重试策略**：
- 第1次重试：延迟 1000ms
- 第2次重试：延迟 1500ms
- 第3次重试：延迟 2250ms

### 2. 超时处理

所有主题加载操作都有超时限制：

- 单个资源加载超时：10秒
- 完整主题切换超时：15秒

超时后会自动触发错误处理和恢复机制。

### 3. 错误恢复

当主题切换失败时，系统会自动执行以下恢复步骤：

1. **回退到之前的主题**：尝试恢复到切换前的主题
2. **使用备用主题**：如果回退失败，切换到指定的备用主题（默认为 brand）
3. **显示错误提示**：向用户展示友好的错误信息和恢复建议

### 4. 错误日志

系统自动记录所有错误到本地存储：

```typescript
interface ThemeErrorLog {
  timestamp: number          // 错误时间戳
  code: ThemeErrorCode      // 错误代码
  message: string           // 错误消息
  themeId?: string         // 相关主题ID
  stack?: string           // 错误堆栈
  userAgent: string        // 用户代理信息
  recovered: boolean       // 是否已恢复
}
```

**日志管理**：
- 最多保存 50 条错误日志
- 自动清理旧日志
- 支持导出日志用于调试

## 用户反馈

### 1. 加载状态

主题切换时显示加载遮罩：

- **加载动画**：TDesign Loading 组件
- **进度条**：显示加载进度（0-100%）
- **状态文本**：描述当前操作（如"正在加载布局组件"）
- **阶段指示**：显示当前加载阶段（layout/style）

### 2. 错误提示

错误发生时显示详细的错误信息：

- **错误图标**：醒目的警告图标
- **错误标题**：简短的错误描述
- **错误消息**：详细的错误说明
- **恢复建议**：针对性的解决方案
- **操作按钮**：
  - "重试"按钮：重新尝试加载主题
  - "使用默认主题"按钮：切换到备用主题

### 3. 错误详情

多次失败后显示技术详情：

- 错误代码
- 错误次数
- 时间戳

## 使用方法

### 在组件中处理错误

```typescript
import { useThemeStore } from '@/stores/themeStore'
import { handleThemeError } from '@/utils/theme-error'

const themeStore = useThemeStore()

try {
  await themeStore.switchTheme('modern')
} catch (error) {
  // 错误已自动处理，可选择性添加额外逻辑
  console.error('Theme switch failed:', error)
}
```

### 监控错误

使用 `useThemeErrorMonitor` composable：

```typescript
import { useThemeErrorMonitor } from '@/composables/useThemeErrorMonitor'

const {
  errorCount,
  errorRate,
  recoveryRate,
  startMonitoring,
  exportLogs
} = useThemeErrorMonitor()

// 开始监控
startMonitoring(5000) // 每5秒刷新一次

// 导出日志
exportLogs()
```

### 调试面板

在开发环境中使用调试面板：

```vue
<template>
  <ThemeErrorDebugPanel :show="showDebugPanel" @close="showDebugPanel = false" />
</template>

<script setup>
import ThemeErrorDebugPanel from '@/components/ThemeErrorDebugPanel.vue'
import { ref } from 'vue'

const showDebugPanel = ref(true)
</script>
```

## API 参考

### 错误处理函数

#### createThemeError

创建主题错误对象：

```typescript
function createThemeError(
  code: ThemeErrorCode,
  message: string,
  themeId?: string,
  originalError?: Error
): ThemeError
```

#### handleThemeError

处理主题错误并显示用户反馈：

```typescript
function handleThemeError(
  error: ThemeError,
  options?: {
    showMessage?: boolean
    showNotification?: boolean
    onRetry?: () => void | Promise<void>
  }
): void
```

#### retryOperation

使用重试机制执行操作：

```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T>
```

#### withTimeout

为操作添加超时限制：

```typescript
async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  errorMessage?: string
): Promise<T>
```

### 日志管理函数

#### getErrorLogs

获取所有错误日志：

```typescript
function getErrorLogs(): ThemeErrorLog[]
```

#### clearErrorLogs

清空错误日志：

```typescript
function clearErrorLogs(): void
```

#### getErrorStatistics

获取错误统计信息：

```typescript
function getErrorStatistics(): {
  total: number
  byCode: Record<string, number>
  recovered: number
  recent: ThemeErrorLog[]
}
```

## 最佳实践

### 1. 错误预防

- 在切换主题前验证主题是否存在
- 使用预加载机制减少加载失败
- 定期清理缓存避免缓存损坏

### 2. 错误处理

- 始终提供备用主题选项
- 为用户提供清晰的错误信息和解决方案
- 记录错误日志用于问题排查

### 3. 用户体验

- 显示加载进度让用户了解状态
- 提供重试选项而不是直接失败
- 在恢复过程中保持界面响应

### 4. 调试和监控

- 在开发环境启用调试面板
- 定期检查错误统计
- 导出日志用于问题分析

## 配置选项

### 超时配置

```typescript
// 在 themeStore.ts 中修改
const THEME_LOAD_TIMEOUT = 10000      // 资源加载超时
const THEME_SWITCH_TIMEOUT = 15000    // 主题切换超时
```

### 重试配置

```typescript
// 在 themeStore.ts 中修改
const MAX_LOAD_RETRIES = 3            // 最大重试次数
const RETRY_DELAY = 1000              // 重试延迟
```

### 日志配置

```typescript
// 在 theme-error.ts 中修改
const MAX_ERROR_LOGS = 50             // 最大日志数量
```

## 故障排除

### 常见问题

**Q: 主题切换总是超时**
A: 检查网络连接，增加超时时间，或使用预加载

**Q: 错误恢复失败**
A: 确保备用主题（brand）可用且正确配置

**Q: 日志无法保存**
A: 检查浏览器是否允许本地存储，清理存储空间

**Q: 重试次数过多**
A: 检查主题文件是否存在，验证构建配置

## 性能影响

错误处理系统的性能开销：

- **内存占用**：约 50KB（包含日志）
- **CPU 开销**：可忽略（仅在错误发生时）
- **存储占用**：约 10-20KB（本地存储）

## 未来改进

计划中的功能：

- [ ] 错误上报到服务器
- [ ] 智能错误预测
- [ ] 自动性能优化建议
- [ ] 错误趋势分析
- [ ] A/B 测试支持

## 相关文档

- [主题系统设计文档](../specs/multi-theme-layout/design.md)
- [主题系统需求文档](../specs/multi-theme-layout/requirements.md)
- [主题系统实现计划](../specs/multi-theme-layout/tasks.md)
