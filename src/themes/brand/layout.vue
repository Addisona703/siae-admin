<template>
  <div class="brand-theme-layout" :class="{ 'low-performance': isLowPerformance }">
    <!-- 全屏背景 -->
    <div class="brand-background">
      <div class="brand-overlay"></div>
    </div>
    
    <!-- 毛玻璃导航栏 -->
    <header class="brand-header">
      <div class="brand-nav-container">
        <div class="brand-logo">
          <h1>{{ config.name }}</h1>
        </div>
        <nav class="brand-nav">
          <div class="nav-item">首页</div>
          <div class="nav-item">产品</div>
          <div class="nav-item">服务</div>
          <div class="nav-item">关于</div>
        </nav>
        <div class="brand-theme-switcher">
          <ThemeSwitcher />
        </div>
      </div>
    </header>

    <!-- 主内容区域 - 毛玻璃卡片 -->
    <main class="brand-main">
      <div class="brand-content-card">
        <div class="brand-welcome">
          <h2>欢迎使用 {{ config.name }}</h2>
          <p>{{ config.description }}</p>
        </div>
        
        <!-- 路由内容插槽 -->
        <div class="brand-router-content">
          <slot />
        </div>
      </div>
    </main>

    <!-- 侧边栏 -->
    <aside class="brand-sidebar">
      <div class="brand-sidebar-card">
        <div class="sidebar-section">
          <h3>快速导航</h3>
          <ul class="sidebar-menu">
            <li class="menu-item">仪表板</li>
            <li class="menu-item">数据分析</li>
            <li class="menu-item">用户管理</li>
            <li class="menu-item">系统设置</li>
          </ul>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { brandThemeConfig as config } from './config'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useDevicePerformance } from '@/composables/useDevicePerformance'

// 设备性能检测
const { isLowPerformance, getOptimalSettings } = useDevicePerformance()
const settings = computed(() => getOptimalSettings())

// 根据设备性能调整动画时长
const transitionDuration = computed(() => `${settings.value.animationDuration}ms`)
const enableComplexAnimations = computed(() => settings.value.enableComplexAnimations)
</script>

<style scoped>
.brand-theme-layout {
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main";
  grid-template-columns: 280px 1fr;
  grid-template-rows: 70px 1fr;
  overflow: hidden;
}

/* 全屏背景 */
.brand-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: -2;
}

.brand-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
  animation: backgroundShift 20s ease-in-out infinite;
}

.low-performance .brand-background::before {
  animation: none;
}

.brand-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: -1;
}

/* 毛玻璃导航栏 */
.brand-header {
  grid-area: header;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 100;
}

.brand-nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 2rem;
  gap: 2rem;
}

.brand-theme-switcher {
  margin-left: auto;
}

.brand-logo h1 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-nav {
  display: flex;
  gap: 2rem;
}

.nav-item {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all v-bind(transitionDuration) ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateY(-1px);
}

/* 侧边栏 */
.brand-sidebar {
  grid-area: sidebar;
  padding: 1.5rem;
}

.brand-sidebar-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.sidebar-section h3 {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  color: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all v-bind(transitionDuration) ease;
  margin-bottom: 0.5rem;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

/* 主内容区域 */
.brand-main {
  grid-area: main;
  padding: 1.5rem;
  overflow-y: auto;
}

.brand-content-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  min-height: calc(100vh - 140px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.brand-welcome {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand-welcome h2 {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-welcome p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.6;
}

.brand-router-content {
  color: white;
}

/* 响应式设计 - 平板 */
@media (max-width: 1024px) {
  .brand-theme-layout {
    grid-template-areas: 
      "header"
      "main";
    grid-template-columns: 1fr;
    grid-template-rows: 70px 1fr;
    min-width: 320px; /* 防止布局崩塌 */
  }
  
  .brand-sidebar {
    display: none;
  }
  
  .brand-nav {
    display: none;
  }
  
  .brand-nav-container {
    gap: 1rem;
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 768px) {
  .brand-nav-container {
    padding: 0 1rem;
    flex-wrap: wrap;
  }
  
  .brand-logo h1 {
    font-size: 1.2rem;
  }
  
  .brand-main {
    padding: 1rem;
  }
  
  .brand-content-card {
    padding: 1.5rem;
    border-radius: 12px;
    min-height: calc(100vh - 110px);
  }
  
  .brand-welcome h2 {
    font-size: 1.5rem;
  }
  
  .brand-welcome p {
    font-size: 1rem;
  }
}

/* 响应式设计 - 小屏手机 */
@media (max-width: 480px) {
  .brand-header {
    height: auto;
    min-height: 60px;
  }
  
  .brand-theme-layout {
    grid-template-rows: auto 1fr;
  }
  
  .brand-nav-container {
    padding: 0.75rem;
  }
  
  .brand-logo h1 {
    font-size: 1rem;
  }
  
  .brand-main {
    padding: 0.75rem;
  }
  
  .brand-content-card {
    padding: 1rem;
    border-radius: 8px;
  }
  
  .brand-welcome h2 {
    font-size: 1.25rem;
  }
  
  .brand-welcome p {
    font-size: 0.9rem;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .nav-item,
  .menu-item {
    min-height: 44px; /* 触摸目标最小尺寸 */
    padding: 0.875rem 1rem;
  }
  
  .brand-nav-container {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* 移除悬停效果，使用激活状态 */
  .nav-item:hover,
  .menu-item:hover {
    transform: none;
  }
  
  .nav-item:active,
  .menu-item:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.98);
  }
}

/* 高 DPI 屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .brand-logo h1,
  .brand-welcome h2 {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .brand-background::before {
    will-change: transform;
  }
}

/* 横屏模式优化 */
@media (max-width: 768px) and (orientation: landscape) {
  .brand-header {
    height: 60px;
  }
  
  .brand-theme-layout {
    grid-template-rows: 60px 1fr;
  }
  
  .brand-content-card {
    min-height: calc(100vh - 90px);
  }
}

/* 防止布局崩塌 */
.brand-theme-layout {
  min-width: 320px;
  max-width: 100vw;
  overflow-x: hidden;
}

.brand-content-card {
  min-width: 0; /* 防止内容溢出 */
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 动画效果 */
@keyframes backgroundShift {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.1) rotate(2deg);
  }
}

/* 减少动画模式 - 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  .brand-background::before {
    animation: none;
  }
  
  .nav-item:hover,
  .menu-item:hover {
    transform: none;
  }
}

/* 滚动条样式 */
.brand-main::-webkit-scrollbar {
  width: 6px;
}

.brand-main::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.brand-main::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.brand-main::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>