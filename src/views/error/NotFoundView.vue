<template>
  <div class="not-found-page" @mousemove="handleMouseMove">
    <!-- 动态背景光效 -->
    <div class="bg-glow" :style="{ background: `radial-gradient(800px circle at ${mouseX}px ${mouseY}px, rgba(20, 30, 50, 0.4), transparent 40%)` }"></div>
    
    <!-- 网格纹理 -->
    <div class="grid-bg"></div>

    <!-- 顶部状态栏 -->
    <header class="top-bar">
      <div class="status">
        <span class="status-dot"></span>
        SYSTEM_OFFLINE
      </div>
      <div class="err-code">ERR_CODE: 404</div>
    </header>

    <!-- 核心内容区 -->
    <main class="main-content">
      <!-- Logo 展示容器 -->
      <div class="logo-container">
        <!-- 装饰圆环 -->
        <div class="deco-ring ring-1"></div>
        <div class="deco-ring ring-2"></div>

        <!-- 主 Logo 区域 -->
        <div class="logo-wrapper">
          <!-- 核心光晕 -->
          <div class="logo-glow"></div>

          <div class="logo-box">
            <!-- 扫描线 -->
            <div class="scan-line"></div>
            
            <!-- Logo 图标 -->
            <div class="logo-icon">
              <t-icon name="error-circle" size="64px" />
            </div>
          </div>

          <!-- 倒影 -->
          <div class="logo-reflection">
            <t-icon name="error-circle" size="64px" />
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      <div class="error-info">
        <div class="deco-line"></div>

        <h1 class="error-code">404</h1>
        
        <div class="error-text">
          <h2 class="error-title">Object Not Found</h2>
          <p class="error-desc">
            > The requested resource could not be located.<br>
            > Please recalibrate your navigation or return to base.
          </p>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <button class="btn-primary" @click="goHome">
            <span class="btn-dot"></span>
            Return Home
            <div class="btn-shine"></div>
          </button>

          <button class="btn-secondary" @click="goBack">
            [ GO_BACK ]
          </button>
        </div>
      </div>
    </main>

    <!-- 底部装饰 -->
    <div class="bottom-line"></div>
    <div class="bottom-info">
      ID: {{ randomId }}<br>
      LOC: NULL_SECTOR
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const mouseX = ref(0)
const mouseY = ref(0)
const randomId = ref('')

const handleMouseMove = (e) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

const goHome = () => {
  router.push('/dashboard')
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  randomId.value = Math.random().toString(36).substring(2, 15).toUpperCase()
})
</script>

<style scoped lang="less">
.not-found-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #030303;
  color: #fff;
  overflow: hidden;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

// 动态背景光效
.bg-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: opacity 0.5s;
}

// 网格纹理
.grid-bg {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
  opacity: 0.4;
  pointer-events: none;
}

// 顶部状态栏
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  opacity: 0.6;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
  color: #9ca3af;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  animation: pulse 2s infinite;
}

.err-code {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: #6b7280;
}

// 主内容区
.main-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 900px;
  padding: 0 16px;
}

// Logo 容器
.logo-container {
  position: relative;

  &:hover {
    .deco-ring {
      opacity: 1;
    }
  }
}

.deco-ring {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  opacity: 0;
  transition: all 0.7s;

  &.ring-1 {
    inset: -32px;
    transform: rotate(45deg) scale(0.75);
    animation: pulse 3s infinite;
  }

  &.ring-2 {
    inset: -48px;
    border-style: dashed;
    transform: rotate(-12deg) scale(0.9);
    transition-duration: 1s;
  }
}

.logo-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 6s ease-in-out infinite;
}

.logo-glow {
  position: absolute;
  inset: 0;
  background: rgba(59, 130, 246, 0.2);
  filter: blur(60px);
  border-radius: 50%;
}

.logo-box {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.scan-line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to bottom, 
    transparent, 
    rgba(56, 189, 248, 0.5) 50%, 
    rgba(56, 189, 248, 0.8) 51%, 
    transparent
  );
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.5);
  z-index: 20;
  animation: scan 3s linear infinite;
}

.logo-icon {
  color: #fff;
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.3));
  transition: transform 0.5s;

  .logo-container:hover & {
    transform: scale(1.1);
  }
}

.logo-reflection {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scaleY(-1) translateY(-10px);
  opacity: 0.3;
  filter: blur(2px);
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));
  color: #fff;
}

// 错误信息
.error-info {
  margin-top: 64px;
  text-align: center;
  position: relative;
}

.deco-line {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent);
  margin-top: -48px;
}

.error-code {
  font-size: 80px;
  font-weight: 700;
  letter-spacing: -0.05em;
  background: linear-gradient(to bottom, #fff, rgba(255, 255, 255, 0.4));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
  line-height: 1;

  @media (min-width: 768px) {
    font-size: 112px;
  }
}

.error-text {
  margin-bottom: 32px;
}

.error-title {
  font-size: 20px;
  font-weight: 500;
  color: #e5e7eb;
  margin: 0 0 8px;

  @media (min-width: 768px) {
    font-size: 24px;
  }
}

.error-desc {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.8;
  max-width: 400px;
  margin: 0 auto;
}

// 操作按钮
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-top: 32px;
}

.btn-primary {
  position: relative;
  padding: 12px 24px;
  background: #fff;
  color: #000;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.3s;

  &:hover {
    background: #e5e7eb;

    .btn-dot {
      width: 8px;
    }

    .btn-shine {
      transform: translateX(200%);
    }
  }
}

.btn-dot {
  width: 4px;
  height: 4px;
  background: #000;
  border-radius: 50%;
  transition: width 0.3s;
}

.btn-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5), transparent);
  transform: translateX(-200%);
  transition: transform 0.5s;
}

.btn-secondary {
  padding: 12px 24px;
  background: transparent;
  color: #9ca3af;
  font-size: 14px;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: #fff;
    border-color: rgba(255, 255, 255, 0.3);
  }
}

// 底部装饰
.bottom-line {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.bottom-info {
  position: absolute;
  bottom: 0;
  right: 40px;
  padding: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #374151;
  user-select: none;
  text-align: right;
}

// 动画
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
</style>
