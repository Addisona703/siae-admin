# 可拖拽 Dashboard 使用指南

## 功能特性

- ✅ 可拖拽和调整大小的卡片布局
- ✅ 支持多主题切换（Brand、Ocean、Sunset）
- ✅ 编辑模式和查看模式切换
- ✅ 布局自动保存到 localStorage
- ✅ 响应式设计，支持移动端
- ✅ 基于 TDesign 的 Brand 主题风格

## 基本使用

```vue
<template>
  <DraggableDashboard
    :widgets="dashboardWidgets"
    :components="widgetComponents"
    :cols="12"
    :row-height="100"
    :editable="true"
    theme="brand"
    @layout-change="onLayoutChange"
  />
</template>

<script setup lang="ts">
import { markRaw } from 'vue'
import DraggableDashboard from '@/components/DraggableDashboard.vue'
import type { DashboardWidget } from '@/types/dashboard'
import MyWidget from './components/MyWidget.vue'

// 注册组件
const widgetComponents = {
  MyWidget: markRaw(MyWidget)
}

// 配置 widgets
const dashboardWidgets: DashboardWidget[] = [
  {
    i: 'widget-1',
    x: 0,
    y: 0,
    w: 6,
    h: 2,
    minW: 3,
    minH: 2,
    component: 'MyWidget',
    title: 'My Widget',
    props: {
      data: someData
    }
  }
]

const onLayoutChange = (layout: DashboardWidget[]) => {
  console.log('Layout changed:', layout)
}
</script>
```

## Widget 配置说明

```typescript
interface DashboardWidget {
  i: string          // 唯一标识符
  x: number          // X 坐标（网格单位）
  y: number          // Y 坐标（网格单位）
  w: number          // 宽度（网格单位，12列网格）
  h: number          // 高度（网格单位）
  minW?: number      // 最小宽度
  minH?: number      // 最小高度
  maxW?: number      // 最大宽度
  maxH?: number      // 最大高度
  static?: boolean   // 是否静态（不可拖拽和调整）
  isDraggable?: boolean    // 是否可拖拽
  isResizable?: boolean    // 是否可调整大小
  component: string        // 组件名称
  title?: string          // 卡片标题
  props?: Record<string, any>  // 传递给组件的 props
}
```

## 添加新主题

在 `src/config/dashboard-theme.ts` 中添加新主题：

```typescript
export const DASHBOARD_THEMES: Record<string, DashboardTheme> = {
  // 现有主题...
  
  // 添加新主题
  forest: {
    name: 'Forest Theme',
    widgetBackground: '#f0fff0',
    widgetBorder: '1px solid #228b22',
    widgetShadow: '0 2px 8px rgba(34, 139, 34, 0.15)',
    widgetHoverShadow: '0 4px 16px rgba(34, 139, 34, 0.25)',
    dragHandleColor: '#228b22',
    resizeHandleColor: '#90ee90'
  }
}
```

## 主题变量

主题通过 CSS 变量应用：

- `--dashboard-widget-bg`: 卡片背景色
- `--dashboard-widget-border`: 卡片边框
- `--dashboard-widget-shadow`: 卡片阴影
- `--dashboard-widget-hover-shadow`: 悬停阴影
- `--dashboard-drag-handle`: 拖拽手柄颜色
- `--dashboard-resize-handle`: 调整大小手柄颜色

## 自定义样式

可以通过覆盖 CSS 变量来自定义样式：

```css
.draggable-dashboard[data-theme="custom"] {
  --dashboard-widget-bg: #ffffff;
  --dashboard-widget-border: 1px solid #e0e0e0;
  --dashboard-widget-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## 响应式布局

Dashboard 自动适配不同屏幕尺寸：

- 桌面端：12 列网格
- 平板端：自动调整
- 移动端：控制按钮垂直排列

## 布局持久化

布局自动保存到 `localStorage`，键名为 `dashboard-layout`。

清除保存的布局：
```javascript
localStorage.removeItem('dashboard-layout')
```

## 编辑模式

- 点击 "Edit Layout" 进入编辑模式
- 拖拽卡片调整位置
- 拖拽右下角调整大小
- 点击卡片右上角 X 删除卡片
- 点击 "Save Layout" 保存布局
- 点击 "Reset" 恢复默认布局
