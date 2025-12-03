<template>
  <div class="split-theme-layout" :class="{ 'low-performance': isLowPerformance }">
    <aside class="split-sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="logo-mark">S</div>
          <div class="logo-text">
            <span class="logo-title">{{ config.name }}</span>
            <span class="logo-subtitle">PRO SUITE</span>
          </div>
        </div>
        <div class="sidebar-status">
          <span class="status-dot"></span>
          <span class="status-label">SYSTEM READY</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="section-title">工作区</div>
          <ul class="nav-list">
            <li class="nav-item active">
              <div class="item-label">项目总览</div>
              <div class="item-shortcut">CTRL + 1</div>
            </li>
            <li class="nav-item">
              <div class="item-label">资源调度</div>
              <div class="item-shortcut">CTRL + 2</div>
            </li>
            <li class="nav-item">
              <div class="item-label">团队协作</div>
              <div class="item-shortcut">CTRL + 3</div>
            </li>
          </ul>
        </div>

        <div class="nav-section">
          <div class="section-title">配置管理</div>
          <ul class="nav-list">
            <li class="nav-item">
              <div class="item-label">访问控制</div>
              <div class="item-shortcut">ALT + A</div>
            </li>
            <li class="nav-item">
              <div class="item-label">性能监控</div>
              <div class="item-shortcut">ALT + P</div>
            </li>
          </ul>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="footer-card">
          <div class="footer-title">当前进度</div>
          <div class="footer-value">76%</div>
          <div class="footer-meta">项目健康: 正常</div>
        </div>
      </div>
    </aside>

    <div class="split-divider">
      <div class="divider-glow"></div>
    </div>

    <main class="split-main">
      <header class="main-header">
        <div class="header-titles">
          <h1>欢迎使用 {{ config.name }}</h1>
          <p>{{ config.description }}</p>
        </div>
        <div class="header-actions">
          <ThemeSwitcher />
          <button class="split-ghost-btn">保存视图</button>
          <button class="split-primary-btn">新建任务</button>
        </div>
      </header>

      <section class="main-overview">
        <div class="overview-card primary">
          <div class="card-label">活跃项目</div>
          <div class="card-value">18</div>
          <div class="card-meta">同比提升 12%</div>
        </div>
        <div class="overview-card">
          <div class="card-label">团队在线</div>
          <div class="card-value">42</div>
          <div class="card-meta">关键岗位覆盖 95%</div>
        </div>
        <div class="overview-card">
          <div class="card-label">解决工单</div>
          <div class="card-value">312</div>
          <div class="card-meta">本周新增 48</div>
        </div>
      </section>

      <section class="main-content">
        <div class="content-panel">
          <div class="panel-header">
            <div class="panel-title">实时数据</div>
            <div class="panel-meta">自动刷新: 开启</div>
          </div>
          <div class="panel-body">
            <slot />
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { splitThemeConfig as config } from './config'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useDevicePerformance } from '@/composables/useDevicePerformance'

// 设备性能检测
const { isLowPerformance, getOptimalSettings } = useDevicePerformance()
const settings = computed(() => getOptimalSettings())

// 根据设备性能调整动画时长
const transitionDuration = computed(() => `${settings.value.animationDuration}ms`)
</script>

<style scoped>
.split-theme-layout {
  display: grid;
  grid-template-columns: 320px 16px 1fr;
  min-height: 100vh;
  background: linear-gradient(90deg, #0d1117 0%, #0d1117 50%, #f4f6fb 50%, #f4f6fb 100%);
  color: #1f2a3a;
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
}

.split-sidebar {
  background: #0d1117;
  color: #f7faff;
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  box-shadow: 12px 0 40px rgba(13, 17, 23, 0.4);
  position: relative;
  z-index: 2;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-mark {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.2), rgba(82, 196, 26, 0.5));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #52c41a;
  letter-spacing: 0.1em;
  box-shadow: 0 12px 30px rgba(82, 196, 26, 0.18);
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.logo-title {
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.logo-subtitle {
  font-size: 0.72rem;
  letter-spacing: 0.35em;
  opacity: 0.55;
}

.sidebar-status {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: rgba(82, 196, 26, 0.1);
  color: rgba(247, 250, 255, 0.75);
  letter-spacing: 0.18em;
  font-size: 0.75rem;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #52c41a;
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.75);
  animation: pulse 2.4s ease-in-out infinite;
}

.low-performance .status-dot {
  animation: none;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 0.78rem;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: rgba(247, 250, 255, 0.45);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nav-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.9rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  cursor: pointer;
  transition: all v-bind(transitionDuration) ease;
  color: rgba(247, 250, 255, 0.75);
}

.nav-item .item-label {
  font-size: 0.92rem;
  letter-spacing: 0.06em;
}

.nav-item .item-shortcut {
  font-size: 0.7rem;
  letter-spacing: 0.24em;
  opacity: 0.5;
}

.nav-item:hover {
  background: rgba(82, 196, 26, 0.12);
  color: #f7faff;
  transform: translateX(6px);
}

.nav-item.active {
  background: rgba(82, 196, 26, 0.18);
  color: #f7faff;
  box-shadow: 0 12px 30px rgba(82, 196, 26, 0.25);
}

.sidebar-footer {
  margin-top: auto;
}

.footer-card {
  border-radius: 16px;
  padding: 1.5rem;
  background: linear-gradient(160deg, rgba(82, 196, 26, 0.08), rgba(82, 196, 26, 0.18));
  border: 1px solid rgba(82, 196, 26, 0.2);
  box-shadow: 0 18px 35px rgba(82, 196, 26, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.footer-title {
  font-size: 0.8rem;
  letter-spacing: 0.28em;
  color: rgba(247, 250, 255, 0.55);
}

.footer-value {
  font-size: 1.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.footer-meta {
  font-size: 0.75rem;
  letter-spacing: 0.16em;
  color: rgba(247, 250, 255, 0.55);
}

.split-divider {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d1117;
  z-index: 1;
}

.divider-glow {
  width: 2px;
  height: 70%;
  background: linear-gradient(180deg, rgba(82, 196, 26, 0), rgba(82, 196, 26, 0.85), rgba(82, 196, 26, 0));
  box-shadow: 0 0 22px rgba(82, 196, 26, 0.65);
  border-radius: 999px;
}

.split-main {
  background: #f4f6fb;
  padding: 2.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
  position: relative;
  z-index: 0;
}

.main-header {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
  align-items: flex-start;
}

.header-titles h1 {
  margin: 0 0 0.6rem;
  font-size: 2rem;
  color: #1f2a3a;
  letter-spacing: 0.08em;
}

.header-titles p {
  margin: 0;
  color: rgba(31, 42, 58, 0.65);
  letter-spacing: 0.05em;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.split-ghost-btn,
.split-primary-btn {
  border-radius: 999px;
  padding: 0.65rem 1.5rem;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  font-weight: 500;
  cursor: pointer;
  transition: all v-bind(transitionDuration) ease;
  border: 1px solid transparent;
}

.split-ghost-btn {
  background: transparent;
  border-color: rgba(13, 17, 23, 0.1);
  color: #1f2a3a;
}

.split-ghost-btn:hover {
  border-color: rgba(13, 17, 23, 0.3);
  transform: translateY(-1px);
}

.split-primary-btn {
  background: linear-gradient(135deg, #2f54eb, #5470ff);
  color: #fff;
  box-shadow: 0 12px 24px rgba(47, 84, 235, 0.18);
}

.split-primary-btn:hover {
  box-shadow: 0 16px 30px rgba(47, 84, 235, 0.28);
  transform: translateY(-1px);
}

.main-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.4rem;
}

.overview-card {
  background: #fff;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid rgba(31, 42, 58, 0.05);
}

.overview-card.primary {
  border: 1px solid rgba(47, 84, 235, 0.28);
  box-shadow: 0 18px 35px rgba(47, 84, 235, 0.12);
}

.card-label {
  font-size: 0.78rem;
  letter-spacing: 0.3em;
  color: rgba(31, 42, 58, 0.45);
  text-transform: uppercase;
}

.card-value {
  font-size: 1.9rem;
  font-weight: 600;
  color: #1f2a3a;
  letter-spacing: 0.08em;
}

.card-meta {
  font-size: 0.85rem;
  color: rgba(31, 42, 58, 0.55);
}

.main-content {
  display: flex;
  flex-direction: column;
}

.content-panel {
  background: #fff;
  border-radius: 22px;
  border: 1px solid rgba(31, 42, 58, 0.05);
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(31, 42, 58, 0.06);
}

.panel-title {
  font-size: 0.85rem;
  letter-spacing: 0.32em;
  color: rgba(31, 42, 58, 0.6);
  text-transform: uppercase;
}

.panel-meta {
  font-size: 0.8rem;
  color: rgba(31, 42, 58, 0.45);
}

.panel-body {
  padding: 2rem;
  color: #1f2a3a;
  min-height: 320px;
}

/* 响应式设计 - 大屏 */
@media (max-width: 1280px) {
  .split-theme-layout {
    grid-template-columns: 280px 12px 1fr;
  }

  .split-sidebar {
    padding: 2rem 1.5rem;
  }

  .split-main {
    padding: 2rem 2.5rem;
  }
  
  .main-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 响应式设计 - 平板 */
@media (max-width: 1024px) {
  .split-theme-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    background: linear-gradient(180deg, #0d1117 0%, #0d1117 45%, #f4f6fb 45%, #f4f6fb 100%);
    min-width: 320px; /* 防止布局崩塌 */
  }

  .split-sidebar {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 2rem;
    padding: 1.5rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .sidebar-nav {
    flex-direction: row;
    gap: 2rem;
    overflow-x: auto;
  }
  
  .nav-section {
    min-width: max-content;
  }

  .split-divider {
    display: none;
  }
  
  .split-main {
    padding: 2rem;
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 900px) {
  .split-sidebar {
    flex-direction: column;
    gap: 1.5rem;
  }

  .sidebar-nav {
    flex-direction: column;
    gap: 1.5rem;
  }

  .main-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .header-titles h1 {
    font-size: 1.75rem;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-actions button {
    flex: 1;
    min-width: 120px;
  }
  
  .main-overview {
    grid-template-columns: 1fr;
  }
}

/* 响应式设计 - 小屏手机 */
@media (max-width: 640px) {
  .split-sidebar {
    padding: 1.5rem 1.25rem;
  }

  .split-main {
    padding: 1.75rem 1.25rem;
    gap: 1.75rem;
  }
  
  .sidebar-logo {
    gap: 0.75rem;
  }
  
  .logo-mark {
    width: 38px;
    height: 38px;
  }
  
  .logo-title {
    font-size: 1.1rem;
  }
  
  .sidebar-status {
    padding: 0.4rem 0.65rem;
    font-size: 0.7rem;
  }
  
  .nav-item {
    padding: 0.75rem 0.875rem;
  }
  
  .item-label {
    font-size: 0.85rem;
  }
  
  .item-shortcut {
    display: none;
  }
  
  .header-titles h1 {
    font-size: 1.5rem;
  }
  
  .header-titles p {
    font-size: 0.9rem;
  }

  .overview-card {
    border-radius: 16px;
    padding: 1.25rem;
  }
  
  .card-value {
    font-size: 1.6rem;
  }

  .content-panel {
    border-radius: 18px;
  }
  
  .panel-header {
    padding: 1.25rem 1.5rem;
  }
  
  .panel-body {
    padding: 1.5rem;
  }
  
  .footer-card {
    padding: 1.25rem;
  }
}

/* 响应式设计 - 超小屏 */
@media (max-width: 480px) {
  .split-sidebar {
    padding: 1.25rem 1rem;
  }
  
  .split-main {
    padding: 1.5rem 1rem;
  }
  
  .logo-title {
    font-size: 1rem;
  }
  
  .logo-subtitle {
    font-size: 0.65rem;
  }
  
  .header-titles h1 {
    font-size: 1.25rem;
  }
  
  .split-ghost-btn,
  .split-primary-btn {
    padding: 0.55rem 1.25rem;
    font-size: 0.85rem;
  }
  
  .overview-card {
    padding: 1rem;
  }
  
  .card-label {
    font-size: 0.7rem;
  }
  
  .card-value {
    font-size: 1.4rem;
  }
  
  .panel-header {
    padding: 1rem 1.25rem;
  }
  
  .panel-body {
    padding: 1.25rem;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .nav-item,
  .split-ghost-btn,
  .split-primary-btn {
    min-height: 44px; /* 触摸目标最小尺寸 */
  }
  
  .split-theme-layout {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* 移除悬停效果，使用激活状态 */
  .nav-item:hover,
  .split-ghost-btn:hover,
  .split-primary-btn:hover {
    transform: none;
  }
  
  .nav-item:active {
    background: rgba(82, 196, 26, 0.25);
    transform: scale(0.98);
  }
  
  .split-ghost-btn:active {
    border-color: rgba(31, 42, 58, 0.4);
    transform: scale(0.95);
  }
  
  .split-primary-btn:active {
    transform: scale(0.95);
  }
}

/* 高 DPI 屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .logo-title,
  .header-titles h1,
  .card-value {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .divider-glow {
    will-change: transform;
  }
}

/* 横屏模式优化 */
@media (max-width: 768px) and (orientation: landscape) {
  .split-sidebar {
    flex-direction: row;
    padding: 1.25rem 1.5rem;
  }
  
  .sidebar-nav {
    flex-direction: row;
    gap: 1.5rem;
  }
  
  .split-main {
    padding: 1.5rem 2rem;
  }
  
  .main-overview {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 防止布局崩塌 */
.split-theme-layout {
  min-width: 320px;
  max-width: 100vw;
  overflow-x: hidden;
}

.split-sidebar,
.split-main {
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.overview-card,
.content-panel {
  min-width: 0;
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
  
  .status-dot {
    animation: none;
  }
  
  .nav-item:hover,
  .split-ghost-btn:hover,
  .split-primary-btn:hover {
    transform: none;
  }
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(82, 196, 26, 0.75);
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 2px rgba(82, 196, 26, 0.35);
    opacity: 0.6;
  }
}
</style>
