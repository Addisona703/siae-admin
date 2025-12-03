# 主题系统设计文档

## 概述

本系统支持多主题切换，每个主题不仅包含样式配置，还包含独立的布局配置，实现真正的主题化仪表盘。

## 核心特性

### 1. 主题配置

每个主题包含两部分：

- **样式配置 (ThemeStyle)**: 颜色、阴影、边框等视觉样式
- **布局配置 (ThemeLayout)**: 网格列数、行高、间距等布局参数

### 2. 内置主题

| 主题 | 列数 | 行高 | 特点 |
|------|------|------|------|
| 品牌主题 (brand) | 12 | 100px | 标准布局，适合数据密集展示 |
| 海洋主题 (ocean) | 8 | 120px | 宽松布局，大间距 |
| 日落主题 (sunset) | 16 | 80px | 紧凑布局，适合大屏 |
| 极简主题 (minimal) | 4 | 150px | 大卡片布局 |
| 暗黑主题 (dark) | 12 | 100px | 暗色系标准布局 |

### 3. 布局自适应

切换主题时，系统会自动调整组件布局：

```typescript
// 布局适配算法
const colRatio = toTheme.cols / fromTheme.cols
widget.w = Math.round(widget.w * colRatio)
widget.x = Math.round(widget.x * colRatio)
```

## 使用方式

### 基础使用

```vue
<script setup>
import { useTheme } from '@/composables/useTheme'

const { currentTheme, setTheme, themeOptions } = useTheme()

// 切换主题
const changeTheme = (themeId) => {
  setTheme(themeId)
}
</script>
```

### 在组件中使用

```vue
<DraggableDashboard
  :widgets="widgets"
  :components="components"
  :editable="true"
  @theme-change="handleThemeChange"
/>
```

## 自定义主题

### 1. 定义主题配置

在 `src/config/dashboard-theme.ts` 中添加：

```typescript
export const DASHBOARD_THEMES: DashboardThemePreset = {
  // ... 现有主题
  
  custom: {
    id: 'custom',
    name: '自定义主题',
    description: '你的主题描述',
    style: {
      widgetBackground: '#ffffff',
      widgetBorder: '1px solid #e5e7eb',
      widgetShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      widgetHoverShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      dragHandleColor: '#6b7280',
      resizeHandleColor: '#9ca3af',
      headerBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      headerTextColor: '#ffffff'
    },
    layout: {
      cols: 10,
      rowHeight: 110,
      margin: [20, 20],
      compactType: 'vertical'
    }
  }
}
```

### 2. 主题特定样式

使用 `data-dashboard-theme` 属性添加主题特定样式：

```css
/* 全局样式 */
[data-dashboard-theme="custom"] .widget-container {
  border-radius: 12px;
}

[data-dashboard-theme="custom"] .widget-header {
  font-family: 'Custom Font', sans-serif;
}
```

## API 参考

### useTheme()

主题管理 Composable

**返回值:**

- `currentThemeId`: 当前主题 ID (ref)
- `currentTheme`: 当前主题配置 (computed)
- `availableThemes`: 所有可用主题 (computed)
- `themeOptions`: 主题选项列表 (computed)
- `setTheme(themeId)`: 切换主题
- `loadSavedTheme()`: 加载保存的主题
- `getThemeLayout(themeId?)`: 获取主题布局配置
- `adaptLayout(widgets, toThemeId)`: 适配布局到新主题

### ThemeConfig

```typescript
interface ThemeConfig {
  id: string
  name: string
  description?: string
  style: ThemeStyle
  layout: ThemeLayout
  componentOverrides?: Record<string, any>
}
```

### ThemeStyle

```typescript
interface ThemeStyle {
  widgetBackground: string
  widgetBorder: string
  widgetShadow: string
  widgetHoverShadow: string
  dragHandleColor: string
  resizeHandleColor: string
  headerBackground?: string
  headerTextColor?: string
  contentBackground?: string
}
```

### ThemeLayout

```typescript
interface ThemeLayout {
  cols: number // 网格列数
  rowHeight: number // 行高
  margin: [number, number] // 间距 [水平, 垂直]
  containerPadding?: [number, number] // 容器内边距
  compactType?: 'vertical' | 'horizontal' | null // 压缩类型
}
```

## 最佳实践

### 1. 主题持久化

主题选择会自动保存到 localStorage，页面刷新后保持：

```typescript
// 自动保存
localStorage.setItem('dashboard-theme', themeId)

// 自动加载
loadSavedTheme()
```

### 2. 布局持久化

布局配置也会保存，并在主题切换时自动适配：

```typescript
// 保存布局
localStorage.setItem('dashboard-layout', JSON.stringify(layout))

// 主题切换时适配
const adaptedLayout = adaptLayout(currentLayout, newThemeId)
```

### 3. 响应式设计

不同主题的布局参数会影响响应式行为：

- 列数少的主题（如 minimal 4列）更适合移动端
- 列数多的主题（如 sunset 16列）适合大屏展示

### 4. 性能优化

- 主题切换使用 CSS 变量，无需重新渲染组件
- 布局适配算法简单高效
- 使用 computed 缓存主题配置

## 扩展建议

### 1. 动态主题

支持用户自定义主题颜色：

```typescript
const createCustomTheme = (baseTheme, customColors) => {
  return {
    ...baseTheme,
    style: {
      ...baseTheme.style,
      ...customColors
    }
  }
}
```

### 2. 主题预览

添加主题预览功能：

```vue
<ThemePreview
  v-for="theme in availableThemes"
  :key="theme.id"
  :theme="theme"
  @select="setTheme(theme.id)"
/>
```

### 3. 主题导入导出

支持导入导出主题配置：

```typescript
const exportTheme = (themeId) => {
  const theme = DASHBOARD_THEMES[themeId]
  return JSON.stringify(theme, null, 2)
}

const importTheme = (themeJson) => {
  const theme = JSON.parse(themeJson)
  DASHBOARD_THEMES[theme.id] = theme
}
```

## 故障排查

### 主题不生效

1. 检查主题 ID 是否正确
2. 确认 CSS 变量是否正确应用
3. 查看浏览器控制台是否有错误

### 布局错乱

1. 检查列数配置是否合理
2. 确认组件的 minW/maxW 限制
3. 清除 localStorage 中的布局缓存

### 性能问题

1. 减少主题切换频率
2. 优化组件渲染性能
3. 使用虚拟滚动处理大量组件
