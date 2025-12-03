# 🚀 Dashboard 可拖拽布局 - 快速启动

## 已完成的改造

✅ 安装 `vue-grid-layout@3.0.0-beta1` 依赖  
✅ 创建 `DraggableDashboard.vue` 可拖拽容器组件  
✅ 创建主题配置系统（支持 Brand、Ocean、Sunset 三个主题）  
✅ 更新 `DashboardView.vue` 使用新的可拖拽布局  
✅ 添加完整的 TypeScript 类型定义  
✅ 创建使用文档和演示页面  

## 启动项目

```bash
cd siae-frontend
npm install
npm run dev
```

访问 Dashboard 页面即可看到可拖拽的卡片布局。

## 功能演示

### 1. 查看模式（默认）
- 卡片固定位置，不可拖拽
- 可以正常查看数据

### 2. 编辑模式
点击右上角 "Edit Layout" 按钮进入编辑模式：
- 🖱️ 拖拽卡片调整位置
- 📏 拖拽右下角调整大小
- ❌ 点击卡片右上角 X 删除卡片
- 💾 点击 "Save Layout" 保存布局
- 🔄 点击 "Reset" 恢复默认布局

### 3. 主题切换
使用右上角的主题选择器切换主题：
- **Brand Theme** - TDesign 品牌主题（默认）
- **Ocean Theme** - 海洋蓝色主题
- **Sunset Theme** - 日落橙色主题

## 文件结构

```
siae-frontend/
├── src/
│   ├── components/
│   │   └── DraggableDashboard.vue      # 可拖拽容器组件
│   ├── config/
│   │   └── dashboard-theme.ts          # 主题配置
│   ├── types/
│   │   ├── dashboard.ts                # Dashboard 类型定义
│   │   └── vue-grid-layout.d.ts        # vue-grid-layout 类型声明
│   └── views/
│       └── dashboard/
│           └── DashboardView.vue       # Dashboard 页面（已更新）
├── doc/
│   ├── dashboard-usage.md              # 使用指南
│   └── dashboard-demo.html             # 演示页面
├── DASHBOARD_REFACTOR.md               # 改造说明
└── QUICK_START.md                      # 本文档
```

## 核心代码示例

### Widget 配置

```typescript
const dashboardWidgets = [
  {
    i: 'user-stats',           // 唯一 ID
    x: 0,                      // X 坐标（0-11）
    y: 0,                      // Y 坐标
    w: 12,                     // 宽度（1-12）
    h: 2,                      // 高度
    minW: 6,                   // 最小宽度
    minH: 2,                   // 最小高度
    component: 'UserStatsCard', // 组件名
    title: 'User Statistics',  // 标题
    props: {                   // 传递给组件的 props
      activeUsersData: data1,
      registrationsData: data2
    }
  }
]
```

### 组件注册

```typescript
import { markRaw } from 'vue'
import UserStatsCard from './components/UserStatsCard.vue'

const widgetComponents = {
  UserStatsCard: markRaw(UserStatsCard)
}
```

## 添加新 Widget

### 步骤 1: 创建组件

```vue
<!-- src/views/dashboard/components/MyNewWidget.vue -->
<template>
  <div class="my-widget">
    <h3>{{ title }}</h3>
    <p>{{ data }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  data: any
}>()
</script>
```

### 步骤 2: 注册组件

```typescript
// DashboardView.vue
import MyNewWidget from './components/MyNewWidget.vue'

const widgetComponents = {
  // ... 现有组件
  MyNewWidget: markRaw(MyNewWidget)
}
```

### 步骤 3: 添加到布局

```typescript
const dashboardWidgets = computed(() => [
  // ... 现有 widgets
  {
    i: 'my-new-widget',
    x: 0,
    y: 6,
    w: 6,
    h: 2,
    component: 'MyNewWidget',
    title: 'My New Widget',
    props: {
      title: 'Hello',
      data: myData.value
    }
  }
])
```

## 添加新主题

编辑 `src/config/dashboard-theme.ts`：

```typescript
export const DASHBOARD_THEMES: Record<string, DashboardTheme> = {
  // ... 现有主题
  
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

主题会自动出现在选择器中！

## 布局持久化

布局自动保存到 `localStorage`，键名为 `dashboard-layout`。

### 清除保存的布局

在浏览器控制台执行：
```javascript
localStorage.removeItem('dashboard-layout')
```

然后刷新页面即可恢复默认布局。

## 常见问题

### Q: 如何禁用某个卡片的拖拽？
A: 在 widget 配置中设置 `static: true` 或 `isDraggable: false`

### Q: 如何设置卡片的最小/最大尺寸？
A: 使用 `minW`, `minH`, `maxW`, `maxH` 属性

### Q: 如何禁用编辑功能？
A: 在 `DraggableDashboard` 组件上设置 `:editable="false"`

### Q: 如何自定义网格列数？
A: 使用 `:cols` 属性，默认为 12

### Q: 如何调整卡片高度单位？
A: 使用 `:row-height` 属性，默认为 100px

## 性能优化建议

1. 使用 `markRaw()` 包裹组件避免响应式开销
2. 大数据量时考虑虚拟滚动
3. 避免在 widget props 中传递大对象
4. 使用 `computed` 而不是 `ref` 来计算 widgets 配置

## 下一步

- 查看 [完整文档](./DASHBOARD_REFACTOR.md)
- 阅读 [使用指南](./doc/dashboard-usage.md)
- 打开 [演示页面](./doc/dashboard-demo.html)
- 开始添加你的自定义 Widget！

## 技术支持

如有问题，请查看：
- [vue-grid-layout 文档](https://github.com/jbaysolutions/vue-grid-layout)
- [TDesign Vue Next 文档](https://tdesign.tencent.com/vue-next/overview)
