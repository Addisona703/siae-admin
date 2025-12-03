# Dashboard 可拖拽布局改造

## 改造概述

将原有的固定布局 Dashboard 改造为可拖拽、可调整大小的卡片布局系统，支持多主题切换和布局持久化。

## 新增文件

### 1. 核心组件
- `src/components/DraggableDashboard.vue` - 可拖拽 Dashboard 容器组件

### 2. 类型定义
- `src/types/dashboard.ts` - Dashboard 相关类型定义（扩展）
- `src/types/vue-grid-layout.d.ts` - vue-grid-layout 库的类型声明

### 3. 配置文件
- `src/config/dashboard-theme.ts` - 主题配置（支持扩展）

### 4. 文档
- `doc/dashboard-usage.md` - 使用指南
- `DASHBOARD_REFACTOR.md` - 本文档

## 技术栈

- **vue-grid-layout** (v3.0.0-beta1) - Vue 3 网格布局库
- **TDesign Vue Next** - UI 组件库
- **TypeScript** - 类型安全

## 核心功能

### 1. 可拖拽布局
- 拖拽卡片调整位置
- 拖拽右下角调整大小
- 网格对齐
- 碰撞检测

### 2. 主题系统
内置三个主题，可轻松扩展：

- **Brand Theme** - 基于 TDesign 的品牌主题（默认）
- **Ocean Theme** - 海洋蓝色主题
- **Sunset Theme** - 日落橙色主题

### 3. 编辑模式
- 查看模式：只读，不可拖拽
- 编辑模式：可拖拽、调整大小、删除卡片
- 一键保存/重置布局

### 4. 布局持久化
- 自动保存到 localStorage
- 页面刷新后恢复布局
- 支持重置为默认布局

### 5. 响应式设计
- 桌面端：12 列网格
- 平板端：自动适配
- 移动端：控制按钮垂直排列

## 使用方式

### 基本用法

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
import MyWidget from './components/MyWidget.vue'

const widgetComponents = {
  MyWidget: markRaw(MyWidget)
}

const dashboardWidgets = [
  {
    i: 'widget-1',
    x: 0,
    y: 0,
    w: 6,
    h: 2,
    component: 'MyWidget',
    title: 'My Widget',
    props: { data: someData }
  }
]
</script>
```

### 添加新主题

在 `src/config/dashboard-theme.ts` 中添加：

```typescript
export const DASHBOARD_THEMES: Record<string, DashboardTheme> = {
  // ... 现有主题
  
  myTheme: {
    name: 'My Theme',
    widgetBackground: '#ffffff',
    widgetBorder: '1px solid #e0e0e0',
    widgetShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    widgetHoverShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    dragHandleColor: '#0052d9',
    resizeHandleColor: '#4787f0'
  }
}
```

## Widget 配置

```typescript
interface DashboardWidget {
  i: string          // 唯一 ID
  x: number          // X 坐标（0-11）
  y: number          // Y 坐标
  w: number          // 宽度（1-12）
  h: number          // 高度
  minW?: number      // 最小宽度
  minH?: number      // 最小高度
  maxW?: number      // 最大宽度
  maxH?: number      // 最大高度
  static?: boolean   // 是否静态（不可移动）
  isDraggable?: boolean    // 是否可拖拽
  isResizable?: boolean    // 是否可调整大小
  component: string        // 组件名称
  title?: string          // 卡片标题
  props?: Record<string, any>  // 组件 props
}
```

## 主题 CSS 变量

```css
--dashboard-widget-bg           /* 卡片背景 */
--dashboard-widget-border       /* 卡片边框 */
--dashboard-widget-shadow       /* 卡片阴影 */
--dashboard-widget-hover-shadow /* 悬停阴影 */
--dashboard-drag-handle         /* 拖拽手柄颜色 */
--dashboard-resize-handle       /* 调整大小手柄颜色 */
```

## 扩展性

### 1. 添加新 Widget
1. 创建 Vue 组件
2. 在 `widgetComponents` 中注册
3. 在 `dashboardWidgets` 中配置

### 2. 添加新主题
1. 在 `dashboard-theme.ts` 中添加主题配置
2. 主题会自动出现在选择器中

### 3. 自定义样式
通过覆盖 CSS 变量或添加自定义类名

## 注意事项

1. **组件注册**：使用 `markRaw()` 包裹组件以避免响应式开销
2. **唯一 ID**：每个 widget 必须有唯一的 `i` 属性
3. **网格系统**：默认 12 列，宽度 `w` 范围 1-12
4. **高度单位**：`rowHeight` 默认 100px，`h` 为倍数

## 兼容性

- Vue 3.5+
- Node.js 20.19+ / 22.12+
- 现代浏览器（Chrome, Firefox, Safari, Edge）

## 性能优化

- 使用 `markRaw()` 避免不必要的响应式
- CSS transforms 实现流畅动画
- 布局变化防抖
- 按需加载组件

## 未来扩展

- [ ] 添加更多内置主题
- [ ] 支持暗黑模式
- [ ] Widget 库/市场
- [ ] 拖拽添加新 Widget
- [ ] 导出/导入布局配置
- [ ] 多布局方案切换
- [ ] 权限控制（不同用户不同布局）

## 参考资料

- [vue-grid-layout 文档](https://github.com/jbaysolutions/vue-grid-layout)
- [TDesign Vue Next 文档](https://tdesign.tencent.com/vue-next/overview)
- [使用指南](./doc/dashboard-usage.md)
