<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { RouterView } from 'vue-router'
import { useAppStore, useNotificationStore } from '@/stores'

const appStore = useAppStore()
const notificationStore = useNotificationStore()

// 监听主题变化，添加/移除 dark-mode 类
watch(() => appStore.isDarkTheme, (isDark) => {
  if (isDark) {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }
}, { immediate: true })

onMounted(async () => {
  await appStore.initializeApp()
  await notificationStore.bootstrap()

  // 初始化时设置主题类
  if (appStore.isDarkTheme) {
    document.body.classList.add('dark-mode')
  }
})

onUnmounted(() => {
  notificationStore.resetState()
  appStore.cleanup()
})
</script>

<template>
  <div id="app-container">
    <RouterView />
  </div>
</template>

<style lang="less">
// Global styles
* {
  user-select: none;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden; // 完全禁用滚动
}

html {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--td-bg-color-page);
  color: var(--td-text-color-primary);
  transform: translate3d(0, 0, 0);
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden; // 禁用 app 滚动
}

#app-container {
  width: 100%;
  height: 100vh;
  overflow: hidden; // 禁用容器滚动
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
}

// 隐藏所有滚动条
* {
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE/Edge

  &::-webkit-scrollbar {
    display: none; // Chrome/Safari
  }
}

// Selection styles with theme support
::selection {
  background-color: rgba(102, 126, 234, 0.3);
  color: var(--td-text-color-primary);
}

// Dark theme selection
html[theme-mode='dark'] ::selection {
  background-color: rgba(102, 126, 234, 0.5);
}

// Link styles
a {
  color: var(--td-brand-color);
  text-decoration: none;
  transition: color 0.15s ease-out;

  &:hover {
    color: var(--td-brand-color-hover);
  }
}

// Focus styles
button,
input,
textarea,
select {
  &:focus {
    outline: none;
  }
}

// Disable text selection for buttons
button {
  user-select: none;
}

// Disable all transitions during theme switching
html.theme-switching * {
  transition: none !important;
  animation: none !important;
}

// View Transition API optimization with GPU acceleration
::view-transition-old(root),
::view-transition-new(root) {
  animation: none !important;
  mix-blend-mode: normal;
  transform: translate3d(0, 0, 0);
  will-change: clip-path;
}

::view-transition-old(root) {
  z-index: 1;
}

::view-transition-new(root) {
  z-index: 2;
}

::view-transition-group(root) {
  animation-duration: 0.4s;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

// Prevent transition on page load
.no-transition * {
  transition: none !important;
}

// Optimize specific transitions - only animate transform and opacity for better performance
.optimized-transition {
  transition-property: transform, opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-out;
  will-change: transform, opacity;
}
</style>
