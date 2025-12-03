<template>
  <div class="modern-theme-layout" :class="{ 'low-performance': isLowPerformance }">
    <!-- 彩色侧边栏 -->
    <aside class="modern-sidebar">
      <div class="modern-sidebar-header">
        <div class="modern-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1>{{ config.name }}</h1>
        </div>
      </div>
      
      <nav class="modern-nav">
        <div class="nav-section">
          <h3 class="nav-section-title">主要功能</h3>
          <ul class="nav-menu">
            <li class="nav-item active">
              <div class="nav-icon dashboard-icon"></div>
              <span>仪表板</span>
            </li>
            <li class="nav-item">
              <div class="nav-icon analytics-icon"></div>
              <span>数据分析</span>
            </li>
            <li class="nav-item">
              <div class="nav-icon users-icon"></div>
              <span>用户管理</span>
            </li>
            <li class="nav-item">
              <div class="nav-icon projects-icon"></div>
              <span>项目管理</span>
            </li>
          </ul>
        </div>
        
        <div class="nav-section">
          <h3 class="nav-section-title">系统设置</h3>
          <ul class="nav-menu">
            <li class="nav-item">
              <div class="nav-icon settings-icon"></div>
              <span>系统配置</span>
            </li>
            <li class="nav-item">
              <div class="nav-icon security-icon"></div>
              <span>安全设置</span>
            </li>
          </ul>
        </div>
      </nav>
      
      <div class="modern-sidebar-footer">
        <div class="user-profile">
          <div class="user-avatar"></div>
          <div class="user-info">
            <div class="user-name">管理员</div>
            <div class="user-role">系统管理员</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="modern-main">
      <!-- 顶部导航栏 -->
      <header class="modern-header">
        <div class="modern-header-content">
          <div class="header-left">
            <h2 class="page-title">欢迎使用 {{ config.name }}</h2>
            <p class="page-subtitle">{{ config.description }}</p>
          </div>
          <div class="header-right">
            <div class="header-actions">
              <ThemeSwitcher />
              <button class="action-btn notification-btn">
                <div class="notification-icon"></div>
                <span class="notification-badge">3</span>
              </button>
              <button class="action-btn search-btn">
                <div class="search-icon"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- 内容区域 -->
      <div class="modern-content">
        <div class="content-wrapper">
          <!-- 快速统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card stat-card-primary">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <div class="stat-value">1,234</div>
                <div class="stat-label">总用户数</div>
              </div>
            </div>
            <div class="stat-card stat-card-secondary">
              <div class="stat-icon">📈</div>
              <div class="stat-content">
                <div class="stat-value">89.5%</div>
                <div class="stat-label">系统性能</div>
              </div>
            </div>
            <div class="stat-card stat-card-success">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <div class="stat-value">456</div>
                <div class="stat-label">完成任务</div>
              </div>
            </div>
            <div class="stat-card stat-card-warning">
              <div class="stat-icon">⚠️</div>
              <div class="stat-content">
                <div class="stat-value">12</div>
                <div class="stat-label">待处理</div>
              </div>
            </div>
          </div>

          <!-- 路由内容区域 -->
          <div class="router-content">
            <slot />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { modernThemeConfig as config } from './config'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useDevicePerformance } from '@/composables/useDevicePerformance'

// 设备性能检测
const { isLowPerformance, getOptimalSettings } = useDevicePerformance()
const settings = computed(() => getOptimalSettings())

// 根据设备性能调整动画时长
const transitionDuration = computed(() => `${settings.value.animationDuration}ms`)
</script>

<style scoped>
.modern-theme-layout {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 彩色侧边栏 */
.modern-sidebar {
  width: 280px;
  background: linear-gradient(180deg, #722ed1 0%, #9254de 50%, #b37feb 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.modern-sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.modern-sidebar-header {
  padding: 2rem 1.5rem 1.5rem;
  position: relative;
  z-index: 1;
}

.modern-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-icon svg {
  width: 24px;
  height: 24px;
}

.modern-logo h1 {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 导航菜单 */
.modern-nav {
  flex: 1;
  padding: 0 1.5rem;
  position: relative;
  z-index: 1;
}

.nav-section {
  margin-bottom: 2rem;
}

.nav-section-title {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 1rem 0;
  padding: 0 1rem;
}

.nav-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all v-bind(transitionDuration) ease;
  margin-bottom: 0.5rem;
  position: relative;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-weight: 500;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: white;
  border-radius: 2px;
}

/* 导航图标 */
.nav-icon {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.dashboard-icon { background: linear-gradient(135deg, #ff6b6b, #ee5a24); }
.analytics-icon { background: linear-gradient(135deg, #4ecdc4, #44a08d); }
.users-icon { background: linear-gradient(135deg, #45b7d1, #96c93d); }
.projects-icon { background: linear-gradient(135deg, #f9ca24, #f0932b); }
.settings-icon { background: linear-gradient(135deg, #6c5ce7, #a29bfe); }
.security-icon { background: linear-gradient(135deg, #fd79a8, #fdcb6e); }

/* 侧边栏底部 */
.modern-sidebar-footer {
  padding: 1.5rem;
  position: relative;
  z-index: 1;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  position: relative;
}

.user-avatar::after {
  content: '👤';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
}

.user-info {
  flex: 1;
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.user-role {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
}

/* 主内容区域 */
.modern-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 24px 0 0 0;
  overflow: hidden;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.05);
}

/* 顶部导航栏 */
.modern-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  padding: 2rem 2.5rem 1.5rem;
}

.modern-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  color: #1a202c;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.page-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.action-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all v-bind(transitionDuration) ease;
  position: relative;
}

.action-btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.notification-btn .notification-icon {
  width: 20px;
  height: 20px;
  background: #722ed1;
  border-radius: 4px;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ff4757;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.search-btn .search-icon {
  width: 20px;
  height: 20px;
  background: #13c2c2;
  border-radius: 4px;
}

/* 内容区域 */
.modern-content {
  flex: 1;
  padding: 2rem 2.5rem;
  background: #f8fafc;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
}

/* 统计卡片网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all v-bind(transitionDuration) ease;
  border-left: 4px solid transparent;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card-primary { border-left-color: #722ed1; }
.stat-card-secondary { border-left-color: #13c2c2; }
.stat-card-success { border-left-color: #52c41a; }
.stat-card-warning { border-left-color: #faad14; }

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f8fafc;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
}

/* 路由内容区域 */
.router-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

/* 响应式设计 - 平板 */
@media (max-width: 1024px) {
  .modern-theme-layout {
    flex-direction: column;
    min-width: 320px; /* 防止布局崩塌 */
  }
  
  .modern-sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    background: linear-gradient(90deg, #722ed1 0%, #9254de 50%, #b37feb 100%);
    padding: 1rem 1.5rem;
  }
  
  .modern-sidebar-header {
    padding: 1rem;
  }
  
  .modern-nav {
    flex: 1;
    padding: 1rem;
    display: flex;
    gap: 2rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  .nav-section {
    margin-bottom: 0;
    min-width: max-content;
  }
  
  .nav-menu {
    display: flex;
    gap: 0.5rem;
  }
  
  .nav-item {
    margin-bottom: 0;
    white-space: nowrap;
  }
  
  .modern-sidebar-footer {
    padding: 1rem;
  }
  
  .modern-main {
    border-radius: 0;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 768px) {
  .modern-header {
    padding: 1.5rem 1rem 1rem;
  }
  
  .modern-header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-subtitle {
    font-size: 0.9rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .modern-content {
    padding: 1.5rem 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .router-content {
    padding: 1.5rem;
  }
  
  .modern-nav {
    display: none;
  }
  
  .modern-sidebar-footer {
    display: none;
  }
  
  .modern-logo h1 {
    font-size: 1.2rem;
  }
}

/* 响应式设计 - 小屏手机 */
@media (max-width: 480px) {
  .modern-sidebar {
    padding: 0.75rem 1rem;
  }
  
  .modern-sidebar-header {
    padding: 0.75rem;
  }
  
  .logo-icon {
    width: 36px;
    height: 36px;
  }
  
  .modern-logo h1 {
    font-size: 1rem;
  }
  
  .modern-header {
    padding: 1rem 0.75rem;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .modern-content {
    padding: 1rem 0.75rem;
  }
  
  .stat-card {
    padding: 1.25rem;
  }
  
  .stat-icon {
    font-size: 1.5rem;
    width: 50px;
    height: 50px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .router-content {
    padding: 1.25rem;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .nav-item,
  .action-btn {
    min-height: 44px; /* 触摸目标最小尺寸 */
    min-width: 44px;
  }
  
  .stat-card {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* 移除悬停效果，使用激活状态 */
  .nav-item:hover,
  .action-btn:hover,
  .stat-card:hover {
    transform: none;
  }
  
  .nav-item:active {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(0.98);
  }
  
  .action-btn:active {
    background: #cbd5e1;
    transform: scale(0.95);
  }
  
  .stat-card:active {
    transform: scale(0.98);
  }
}

/* 高 DPI 屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .modern-logo h1,
  .page-title {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .nav-icon {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* 横屏模式优化 */
@media (max-width: 768px) and (orientation: landscape) {
  .modern-sidebar {
    padding: 0.75rem 1rem;
  }
  
  .modern-header {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 防止布局崩塌 */
.modern-theme-layout {
  min-width: 320px;
  max-width: 100vw;
  overflow-x: hidden;
}

.modern-content {
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.stat-card,
.router-content {
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
  
  .nav-item:hover,
  .action-btn:hover,
  .stat-card:hover {
    transform: none;
  }
}

/* 滚动条样式 */
.modern-content::-webkit-scrollbar {
  width: 6px;
}

.modern-content::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.modern-content::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.modern-content::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>