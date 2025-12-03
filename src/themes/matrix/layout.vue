<template>
  <div class="matrix-theme-layout" :class="{ 'low-performance': isLowPerformance }">
    <div class="matrix-background">
      <div class="digital-rain layer-1"></div>
      <div class="digital-rain layer-2"></div>
      <div class="matrix-grid"></div>
      <div class="scanline"></div>
    </div>

    <header class="matrix-header">
      <div class="header-left">
        <div class="matrix-logo">
          <span class="logo-bracket">[</span>
          <span class="logo-text">{{ config.name }}</span>
          <span class="logo-bracket">]</span>
        </div>
        <div class="header-status">
          <span class="status-indicator"></span>
          <span>STATUS: ONLINE</span>
        </div>
      </div>
      <div class="header-right">
        <div class="matrix-theme-switcher">
          <ThemeSwitcher />
        </div>
        <div class="header-info">
          <span class="info-label">ACTIVE NODES</span>
          <span class="info-value">256</span>
        </div>
        <div class="header-info">
          <span class="info-label">LATENCY</span>
          <span class="info-value">8ms</span>
        </div>
        <div class="header-info">
          <span class="info-label">SECURITY</span>
          <span class="info-value secure">ENABLED</span>
        </div>
      </div>
    </header>

    <div class="matrix-body">
      <aside class="matrix-sidebar">
        <div class="sidebar-section">
          <div class="section-title">CORE MODULES</div>
          <ul class="nav-list">
            <li class="nav-item active">
              <span class="nav-prefix">01</span>
              <span class="nav-label">系统监控</span>
              <span class="nav-suffix">/MON</span>
            </li>
            <li class="nav-item">
              <span class="nav-prefix">02</span>
              <span class="nav-label">入侵检测</span>
              <span class="nav-suffix">/IDS</span>
            </li>
            <li class="nav-item">
              <span class="nav-prefix">03</span>
              <span class="nav-label">节点同步</span>
              <span class="nav-suffix">/SYNC</span>
            </li>
            <li class="nav-item">
              <span class="nav-prefix">04</span>
              <span class="nav-label">流量分析</span>
              <span class="nav-suffix">/NET</span>
            </li>
          </ul>
        </div>

        <div class="sidebar-section">
          <div class="section-title">NETWORK LOG</div>
          <div class="sidebar-log">
            <div class="log-line">&gt; handshake established</div>
            <div class="log-line">&gt; route map synchronized</div>
            <div class="log-line">&gt; firewall status: stable</div>
            <div class="log-line">&gt; intrusion attempts: 0</div>
          </div>
        </div>
      </aside>

      <main class="matrix-main">
        <section class="matrix-terminal">
          <div class="terminal-header">REALTIME TERMINAL // MATRIX</div>
          <div class="terminal-body">
            <div class="terminal-line">&gt; boot sequence complete</div>
            <div class="terminal-line">&gt; welcome operator</div>
            <div class="terminal-line">&gt; current theme: {{ config.name }}</div>
            <div class="terminal-line">&gt; description: {{ config.description }}</div>
          </div>
        </section>

        <section class="matrix-content">
          <div class="matrix-welcome">
            <h2>欢迎使用 {{ config.name }}</h2>
            <p>{{ config.description }}</p>
          </div>

          <div class="matrix-stats-grid">
            <div class="matrix-card card-primary">
              <div class="card-title">ACTIVE CONNECTIONS</div>
              <div class="card-value">1,024</div>
              <div class="card-footer">STABILITY: 99.9%</div>
            </div>
            <div class="matrix-card card-secondary">
              <div class="card-title">SECURITY LEVEL</div>
              <div class="card-value">4.7</div>
              <div class="card-footer">ENCRYPTION: AES-512</div>
            </div>
            <div class="matrix-card card-tertiary">
              <div class="card-title">SYNC STATUS</div>
              <div class="card-value">UP TO DATE</div>
              <div class="card-footer">LAST CHECK: 00:03:12</div>
            </div>
          </div>

          <div class="matrix-router-content">
            <slot />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { matrixThemeConfig as config } from './config'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useDevicePerformance } from '@/composables/useDevicePerformance'

// 设备性能检测
const { isLowPerformance, getOptimalSettings } = useDevicePerformance()
const settings = computed(() => getOptimalSettings())

// 根据设备性能调整动画时长和效果
const transitionDuration = computed(() => `${settings.value.animationDuration}ms`)
const enableComplexAnimations = computed(() => settings.value.enableComplexAnimations)
const digitalRainOpacity = computed(() => isLowPerformance.value ? '0.15' : '0.35')
</script>

<style scoped>
.matrix-theme-layout {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #050505;
  color: #c7f9cc;
  font-family: 'Share Tech Mono', 'Courier New', monospace;
  overflow: hidden;
}

.matrix-background {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 20% 20%, rgba(0, 255, 0, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(0, 200, 0, 0.2) 0%, transparent 55%),
    #020202;
  overflow: hidden;
  z-index: -3;
}

.digital-rain {
  position: absolute;
  left: 0;
  width: 100%;
  height: 300%;
  background-image: linear-gradient(180deg, rgba(0, 255, 0, 0.12) 0%, rgba(0, 0, 0, 0) 60%);
  background-size: 3px 80px;
  animation: matrixRain 14s linear infinite;
  opacity: 0.35;
}

.low-performance .digital-rain {
  opacity: 0.15;
  animation: none;
}

.digital-rain.layer-2 {
  animation-duration: 20s;
  background-size: 2px 60px;
  opacity: 0.25;
  filter: blur(1px);
}

.low-performance .digital-rain.layer-2 {
  animation: none;
  opacity: 0.1;
}

.matrix-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(0, 100, 0, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 100, 0, 0.15) 1px, transparent 1px);
  background-size: 70px 70px;
  opacity: 0.2;
}

.scanline {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0) 0, rgba(0, 255, 0, 0.02) 2px, rgba(0, 0, 0, 0.03) 4px);
  mix-blend-mode: screen;
  animation: scanlineMove 6s linear infinite;
  opacity: 0.4;
}

.low-performance .scanline {
  animation: none;
  opacity: 0.2;
}

.matrix-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2.5rem;
  border-bottom: 1px solid rgba(0, 255, 0, 0.2);
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0, 255, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 5;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.matrix-logo {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #8dff8d;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.4);
}

.logo-bracket {
  color: rgba(0, 255, 0, 0.8);
}

.header-status {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  color: rgba(0, 255, 0, 0.75);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00ff6a;
  box-shadow: 0 0 10px rgba(0, 255, 106, 0.8), 0 0 20px rgba(0, 255, 106, 0.4);
  animation: statusPulse 2.2s ease-in-out infinite;
}

.header-right {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.matrix-theme-switcher {
  margin-right: 0.5rem;
}

.header-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(0, 255, 0, 0.25);
  border-radius: 8px;
  background: rgba(0, 15, 0, 0.6);
  box-shadow: inset 0 0 12px rgba(0, 255, 0, 0.15);
}

.info-label {
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  color: rgba(0, 255, 0, 0.55);
}

.info-value {
  font-size: 1rem;
  color: #e2ffe2;
  letter-spacing: 0.18em;
}

.info-value.secure {
  color: #00ff6a;
  text-shadow: 0 0 12px rgba(0, 255, 106, 0.6);
}

.matrix-body {
  flex: 1;
  display: flex;
  position: relative;
}

.matrix-sidebar {
  width: 280px;
  padding: 2rem 1.75rem;
  border-right: 1px solid rgba(0, 255, 0, 0.15);
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  box-shadow: 10px 0 35px rgba(0, 255, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.section-title {
  font-size: 0.8rem;
  letter-spacing: 0.3em;
  margin-bottom: 1.5rem;
  color: rgba(0, 255, 0, 0.6);
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.5rem;
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, rgba(0, 255, 0, 0.7), rgba(0, 255, 0, 0));
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
  grid-template-columns: 40px 1fr 50px;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid rgba(0, 255, 0, 0.1);
  border-radius: 6px;
  background: rgba(0, 10, 0, 0.65);
  color: rgba(0, 255, 0, 0.6);
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: all v-bind(transitionDuration) ease;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(0, 255, 0, 0.2), rgba(0, 255, 0, 0));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.nav-item:hover,
.nav-item.active {
  color: #d6ffd6;
  border-color: rgba(0, 255, 0, 0.35);
  box-shadow: 0 0 18px rgba(0, 255, 0, 0.25);
  transform: translateX(6px);
}

.nav-item:hover::before,
.nav-item.active::before {
  opacity: 1;
}

.nav-prefix,
.nav-suffix {
  font-size: 0.75rem;
  opacity: 0.6;
}

.nav-label {
  font-size: 0.85rem;
}

.sidebar-log {
  background: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(0, 255, 0, 0.2);
  border-radius: 8px;
  padding: 1rem;
  min-height: 120px;
  box-shadow: inset 0 0 20px rgba(0, 255, 0, 0.12);
}

.log-line {
  font-size: 0.75rem;
  color: rgba(0, 255, 0, 0.6);
  letter-spacing: 0.16em;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.log-line:last-child {
  margin-bottom: 0;
}

.matrix-main {
  flex: 1;
  padding: 2.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  position: relative;
}

.matrix-terminal {
  border: 1px solid rgba(0, 255, 0, 0.35);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.75);
  box-shadow: 0 0 25px rgba(0, 255, 0, 0.15);
  overflow: hidden;
}

.terminal-header {
  padding: 0.9rem 1.2rem;
  font-size: 0.75rem;
  letter-spacing: 0.28em;
  background: rgba(0, 255, 0, 0.08);
  border-bottom: 1px solid rgba(0, 255, 0, 0.2);
}

.terminal-body {
  padding: 1.2rem;
  display: grid;
  gap: 0.6rem;
  font-size: 0.85rem;
  color: rgba(205, 255, 205, 0.85);
}

.terminal-line {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  letter-spacing: 0.1em;
}

.terminal-line::before {
  content: '◊';
  color: rgba(0, 255, 0, 0.6);
}

.matrix-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.matrix-welcome {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(0, 255, 0, 0.25);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.65);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.12);
}

.matrix-welcome h2 {
  margin: 0;
  font-size: 1.75rem;
  color: #f1fff1;
  letter-spacing: 0.16em;
  text-shadow: 0 0 12px rgba(0, 255, 0, 0.3);
}

.matrix-welcome p {
  margin: 0;
  color: rgba(199, 249, 204, 0.7);
  letter-spacing: 0.12em;
}

.matrix-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.matrix-card {
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(0, 255, 0, 0.2);
  background: rgba(0, 0, 0, 0.7);
  box-shadow: 0 0 22px rgba(0, 255, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
}

.matrix-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 255, 0, 0.15), rgba(0, 0, 0, 0));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.matrix-card:hover::after {
  opacity: 1;
}

.card-title {
  font-size: 0.8rem;
  letter-spacing: 0.25em;
  color: rgba(0, 255, 0, 0.6);
}

.card-value {
  font-size: 1.8rem;
  color: #d9ffd9;
  letter-spacing: 0.1em;
  text-shadow: 0 0 12px rgba(0, 255, 0, 0.3);
}

.card-footer {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  color: rgba(0, 255, 0, 0.55);
}

.card-primary {
  border-color: rgba(0, 255, 0, 0.35);
}

.card-secondary {
  border-color: rgba(127, 255, 127, 0.35);
}

.card-tertiary {
  border-color: rgba(0, 190, 0, 0.35);
}

.matrix-router-content {
  border: 1px solid rgba(0, 255, 0, 0.2);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.8);
  padding: 1.75rem;
  min-height: 320px;
  box-shadow: inset 0 0 30px rgba(0, 255, 0, 0.12);
  color: #defede;
}

/* 响应式设计 - 大屏 */
@media (max-width: 1200px) {
  .matrix-body {
    flex-direction: column;
  }

  .matrix-sidebar {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    gap: 2rem;
    padding: 1.5rem;
  }
  
  .sidebar-section {
    min-width: 250px;
  }

  .matrix-main {
    padding: 2rem 1.5rem;
  }
  
  .matrix-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 响应式设计 - 平板 */
@media (max-width: 900px) {
  .matrix-header {
    padding: 1.25rem 1.5rem;
    flex-direction: column;
    gap: 1.25rem;
    align-items: flex-start;
  }

  .header-left {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  
  .header-info {
    flex: 1;
    min-width: 120px;
  }

  .matrix-sidebar {
    display: none;
  }
  
  .matrix-logo {
    font-size: 1.25rem;
  }
}

/* 响应式设计 - 移动端 */
@media (max-width: 640px) {
  .matrix-header {
    padding: 1rem 1.25rem;
  }
  
  .matrix-logo {
    font-size: 1rem;
  }
  
  .header-status {
    font-size: 0.75rem;
  }
  
  .header-info {
    padding: 0.5rem 0.75rem;
  }
  
  .info-label {
    font-size: 0.65rem;
  }
  
  .info-value {
    font-size: 0.9rem;
  }

  .matrix-main {
    padding: 1.5rem 1.25rem;
    gap: 2rem;
  }

  .matrix-stats-grid {
    grid-template-columns: 1fr;
  }

  .matrix-terminal {
    font-size: 0.85rem;
  }
  
  .terminal-header {
    padding: 0.75rem 1rem;
    font-size: 0.7rem;
  }
  
  .terminal-body {
    padding: 1rem;
    font-size: 0.8rem;
  }
  
  .matrix-welcome h2 {
    font-size: 1.5rem;
  }
  
  .matrix-card {
    padding: 1.25rem;
  }
  
  .card-value {
    font-size: 1.5rem;
  }
}

/* 响应式设计 - 小屏手机 */
@media (max-width: 480px) {
  .matrix-header {
    padding: 0.875rem 1rem;
  }
  
  .matrix-logo {
    font-size: 0.9rem;
  }
  
  .header-status {
    display: none;
  }
  
  .header-right {
    gap: 0.5rem;
  }
  
  .header-info {
    padding: 0.4rem 0.6rem;
    min-width: 100px;
  }
  
  .matrix-main {
    padding: 1.25rem 1rem;
    gap: 1.5rem;
  }
  
  .matrix-terminal {
    border-radius: 8px;
  }
  
  .terminal-body {
    gap: 0.5rem;
  }
  
  .matrix-welcome {
    padding: 1.25rem;
  }
  
  .matrix-welcome h2 {
    font-size: 1.25rem;
  }
  
  .matrix-card {
    padding: 1rem;
  }
  
  .matrix-router-content {
    padding: 1.5rem;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .nav-item,
  .header-info {
    min-height: 44px; /* 触摸目标最小尺寸 */
  }
  
  .matrix-theme-layout {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* 移除悬停效果，使用激活状态 */
  .nav-item:hover,
  .matrix-card:hover {
    transform: none;
  }
  
  .nav-item:active {
    border-color: rgba(0, 255, 0, 0.5);
    transform: scale(0.98);
  }
  
  .matrix-card:active {
    transform: scale(0.98);
  }
}

/* 高 DPI 屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .matrix-logo,
  .matrix-welcome h2,
  .card-value {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .digital-rain {
    will-change: transform;
  }
}

/* 横屏模式优化 */
@media (max-width: 768px) and (orientation: landscape) {
  .matrix-header {
    padding: 0.875rem 1.25rem;
  }
  
  .matrix-main {
    padding: 1.25rem;
  }
  
  .matrix-stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 防止布局崩塌 */
.matrix-theme-layout {
  min-width: 320px;
  max-width: 100vw;
  overflow-x: hidden;
}

.matrix-main,
.matrix-sidebar {
  min-width: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.matrix-card,
.matrix-terminal,
.matrix-router-content {
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
  
  .digital-rain,
  .scanline,
  .status-indicator {
    animation: none;
  }
  
  .nav-item:hover,
  .matrix-card:hover {
    transform: none;
  }
}

@keyframes matrixRain {
  0% {
    transform: translateY(-66%);
  }
  100% {
    transform: translateY(0%);
  }
}

@keyframes scanlineMove {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

@keyframes statusPulse {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(0, 255, 106, 0.8), 0 0 20px rgba(0, 255, 106, 0.4);
  }
  50% {
    box-shadow: 0 0 4px rgba(0, 255, 106, 0.4), 0 0 12px rgba(0, 255, 106, 0.2);
  }
}
</style>
