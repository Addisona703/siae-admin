# ThemeSwitcher Component

## 概述

`ThemeSwitcher` 是一个用于切换应用主题的 Vue 组件。它使用 TDesign 的 Dropdown 组件提供用户友好的主题选择界面。

## 功能特性

- ✅ 显示所有可用主题的列表
- ✅ 显示每个主题的名称和描述
- ✅ 高亮显示当前激活的主题
- ✅ 支持主题切换的加载状态
- ✅ 提供成功和错误消息反馈
- ✅ 完整的 TypeScript 类型支持
- ✅ 自定义事件通知

## 使用方法

### 基础用法

```vue
<template>
  <ThemeSwitcher />
</template>

<script setup lang="ts">
import { ThemeSwitcher } from '@/components'
</script>
```

### 监听主题切换事件

```vue
<template>
  <ThemeSwitcher 
    @theme-changed="handleThemeChanged"
    @theme-change-error="handleThemeChangeError"
  />
</template>

<script setup lang="ts">
import { ThemeSwitcher } from '@/components'

const handleThemeChanged = (themeId: string) => {
  console.log('Theme changed to:', themeId)
  // 执行自定义逻辑
}

const handleThemeChangeError = (error: Error) => {
  console.error('Theme change failed:', error)
  // 处理错误
}
</script>
```

### 在导航栏中使用

```vue
<template>
  <header class="app-header">
    <div class="logo">My App</div>
    <nav class="nav-menu">
      <!-- 其他导航项 -->
    </nav>
    <div class="header-actions">
      <ThemeSwitcher />
    </div>
  </header>
</template>
```

## Props

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| showDescription | boolean | true | 是否显示主题描述（预留，当前版本始终显示） |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| theme-changed | (themeId: string) | 主题切换成功时触发 |
| theme-change-error | (error: Error) | 主题切换失败时触发 |

## 样式定制

组件使用 TDesign 的 CSS 变量，可以通过覆盖这些变量来定制样式：

```css
/* 自定义主题切换器样式 */
.theme-switcher-dropdown {
  /* 自定义下拉菜单样式 */
}

.theme-item-active {
  /* 自定义激活主题项样式 */
}
```

## 依赖

- `tdesign-vue-next`: TDesign UI 组件库
- `tdesign-icons-vue-next`: TDesign 图标库
- `@/stores/themeStore`: 主题状态管理 Store

## 注意事项

1. 确保在使用组件前已初始化 `themeStore`
2. 组件会自动处理加载状态和错误提示
3. 主题切换是异步操作，会显示加载指示器
4. 如果切换到当前主题，不会执行任何操作

## 示例

完整的使用示例请参考 `src/views/ThemeSwitcherDemo.vue` 文件。

## 相关文件

- 组件实现: `src/components/ThemeSwitcher.vue`
- 主题 Store: `src/stores/themeStore.ts`
- 主题类型定义: `src/types/layout-theme.ts`
- 主题配置: `src/themes/*/config.ts`
