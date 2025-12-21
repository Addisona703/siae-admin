<template>
  <div class="login-view">
    <!-- 炫酷背景 -->
    <div class="cyber-background">
      <!-- 动态网格 -->
      <div class="grid-container">
        <div class="grid-line" v-for="i in 20" :key="'v-' + i" :style="{ left: `${i * 5}%` }"></div>
        <div class="grid-line horizontal" v-for="i in 20" :key="'h-' + i" :style="{ top: `${i * 5}%` }"></div>
      </div>

      <!-- 光束效果 -->
      <div class="light-beams">
        <div class="beam beam-1"></div>
        <div class="beam beam-2"></div>
        <div class="beam beam-3"></div>
      </div>

      <!-- 粒子效果 -->
      <div class="particles">
        <div class="particle" v-for="i in 30" :key="'p-' + i" 
          :style="{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }"></div>
      </div>

      <!-- 发光圆环 -->
      <div class="glow-rings">
        <div class="ring ring-1"></div>
        <div class="ring ring-2"></div>
        <div class="ring ring-3"></div>
      </div>

      <!-- 渐变叠加 -->
      <div class="gradient-overlay"></div>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo-wrapper">
          <img src="/favicon.ico" alt="Logo" class="logo" />
        </div>
        <h1>SIAE 管理后台</h1>
        <p>请登录您的账户</p>
      </div>

      <t-form ref="formRef" :data="formData" :rules="formRules" :label-width="0" @submit="handleSubmit">
        <t-form-item name="username">
          <t-input v-model="formData.username" placeholder="用户名" size="large" :disabled="isLoading">
            <template #prefix-icon>
              <t-icon name="user" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item name="password">
          <t-input v-model="formData.password" type="password" placeholder="密码" size="large" :disabled="isLoading"
            @enter="handleSubmit">
            <template #prefix-icon>
              <t-icon name="lock-on" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item>
          <t-button theme="primary" size="large" block :loading="isLoading" @click="handleSubmit">
            {{ isLoading ? '登录中...' : '登 录' }}
          </t-button>
        </t-form-item>
      </t-form>

      <!-- 第三方登录 -->
      <div class="oauth-section">
        <t-divider>
          <span class="divider-text">其他方式登录</span>
        </t-divider>
        <div class="oauth-buttons">
          <t-tooltip content="QQ登录">
            <div class="oauth-btn qq" @click="handleOAuthLogin('qq')">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29.43 2.239 0 6.29.256 6.29-.43 0-.687-1.77-1.182-1.77-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z"/>
              </svg>
            </div>
          </t-tooltip>
          <t-tooltip content="GitHub登录">
            <div class="oauth-btn github" @click="handleOAuthLogin('github')">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </div>
          </t-tooltip>
          <t-tooltip content="Gitee登录">
            <div class="oauth-btn gitee" @click="handleOAuthLogin('gitee')">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.5h-7c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5h5.5V7H9.5C7.57 7 6 8.57 6 10.5v5C6 17.43 7.57 19 9.5 19h7c.28 0 .5-.22.5-.5v-1.5c0-.28-.22-.5-.5-.5z"/>
              </svg>
            </div>
          </t-tooltip>
        </div>
      </div>

      <div class="login-footer">
        <span>Powered by SIAE Platform</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin, LoadingPlugin } from 'tdesign-vue-next'
import { useAuthStore } from '@/stores'
import { get } from '@/api/client'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref()
const isLoading = ref(false)

const formData = reactive({
  username: '',
  password: '',
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, message: '用户名至少3位' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6位' },
  ],
}

const handleSubmit = async () => {
  const validateResult = await formRef.value?.validate()
  if (validateResult !== true) return

  try {
    isLoading.value = true
    await authStore.login(formData)
    MessagePlugin.success('登录成功')

    const redirect = route.query.redirect || '/dashboard'
    const targetPath = redirect === '/' ? '/dashboard' : redirect
    await router.replace(targetPath)
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '登录失败'
    MessagePlugin.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}

// 第三方登录
const handleOAuthLogin = async (provider) => {
  const loading = LoadingPlugin({
    text: '正在跳转到授权页面...',
    attach: 'body',
    fullscreen: true,
  })

  try {
    const res = await get('/auth/oauth/login', { params: { provider }, skipAuth: true })
    if (res?.data?.authUrl) {
      window.location.href = res.data.authUrl
    } else {
      MessagePlugin.error(res?.message || '获取授权链接失败')
    }
  } catch (error) {
    console.error('OAuth login error:', error)
    MessagePlugin.error('第三方登录失败，请稍后重试')
  } finally {
    loading.hide()
  }
}

// 处理 OAuth 回调
const handleOAuthCallback = async () => {
  console.log('handleOAuthCallback 执行了', window.location.search)
  const urlParams = new URLSearchParams(window.location.search)
  const isOAuthCallback = urlParams.get('oauth_callback')
  console.log('isOAuthCallback:', isOAuthCallback, 'needRegister:', urlParams.get('need_register'))

  if (isOAuthCallback === 'true') {
    const needRegister = urlParams.get('need_register')
    const provider = urlParams.get('provider')

    if (needRegister === 'true') {
      // 新用户，需要完善信息
      const tempToken = urlParams.get('temp_token')
      const nickname = urlParams.get('nickname')
      const avatar = urlParams.get('avatar')

      // 存储临时信息
      sessionStorage.setItem('oauth_temp', JSON.stringify({
        tempToken,
        nickname: decodeURIComponent(nickname || ''),
        avatar: decodeURIComponent(avatar || ''),
        provider
      }))
      // 清除 URL 参数并跳转到绑定页面
      window.history.replaceState({}, document.title, window.location.pathname)
      await router.replace('/oauth/bind')
    } else {
      // 已绑定用户，直接登录
      const accessToken = urlParams.get('access_token')
      const refreshToken = urlParams.get('refresh_token')

      if (accessToken) {
        // 存储 token
        authStore.setTokens(accessToken, refreshToken)
        MessagePlugin.success('登录成功')
        // 清除 URL 参数
        window.history.replaceState({}, document.title, window.location.pathname)
        // 跳转到首页
        await router.replace('/dashboard')
      }
    }
  }
}

onMounted(() => {
  handleOAuthCallback()
})
</script>

<style scoped lang="less">
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  background: #0a0e27;

  html[theme-mode='light'] & {
    background: #1a1f3a;
  }
}

// 炫酷赛博背景
.cyber-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

// 动态网格
.grid-container {
  position: absolute;
  inset: 0;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.grid-line {
  position: absolute;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(102, 126, 234, 0.3) 50%,
    transparent 100%
  );
  animation: gridPulse 3s ease-in-out infinite;

  &.horizontal {
    width: 100%;
    height: 1px;
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(102, 126, 234, 0.3) 50%,
      transparent 100%
    );
  }

  &:nth-child(odd) {
    animation-delay: -1.5s;
  }

  html[theme-mode='dark'] & {
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(102, 126, 234, 0.2) 50%,
      transparent 100%
    );

    &.horizontal {
      background: linear-gradient(
        to right,
        transparent 0%,
        rgba(102, 126, 234, 0.2) 50%,
        transparent 100%
      );
    }
  }
}

// 光束效果
.light-beams {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.beam {
  position: absolute;
  width: 2px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(102, 126, 234, 0.8),
    rgba(118, 75, 162, 0.8),
    transparent
  );
  filter: blur(2px);
  animation: beamMove 8s linear infinite;

  &.beam-1 {
    left: 20%;
    animation-delay: 0s;
  }

  &.beam-2 {
    left: 50%;
    animation-delay: -3s;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(43, 164, 113, 0.8),
      rgba(102, 126, 234, 0.8),
      transparent
    );
  }

  &.beam-3 {
    left: 80%;
    animation-delay: -6s;
    background: linear-gradient(
      to bottom,
      transparent,
      rgba(237, 123, 47, 0.8),
      rgba(118, 75, 162, 0.8),
      transparent
    );
  }
}

// 粒子效果
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(102, 126, 234, 0.8);
  border-radius: 50%;
  box-shadow: 
    0 0 10px rgba(102, 126, 234, 0.8),
    0 0 20px rgba(102, 126, 234, 0.4);
  animation: particleFloat 5s ease-in-out infinite;

  &:nth-child(3n) {
    background: rgba(118, 75, 162, 0.8);
    box-shadow: 
      0 0 10px rgba(118, 75, 162, 0.8),
      0 0 20px rgba(118, 75, 162, 0.4);
  }

  &:nth-child(3n+1) {
    background: rgba(43, 164, 113, 0.8);
    box-shadow: 
      0 0 10px rgba(43, 164, 113, 0.8),
      0 0 20px rgba(43, 164, 113, 0.4);
  }
}

// 发光圆环
.glow-rings {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid;
  animation: ringExpand 6s ease-out infinite;

  &.ring-1 {
    width: 300px;
    height: 300px;
    top: 20%;
    left: 10%;
    border-color: rgba(102, 126, 234, 0.3);
    animation-delay: 0s;
  }

  &.ring-2 {
    width: 400px;
    height: 400px;
    bottom: 10%;
    right: 15%;
    border-color: rgba(118, 75, 162, 0.3);
    animation-delay: -2s;
  }

  &.ring-3 {
    width: 250px;
    height: 250px;
    top: 50%;
    right: 20%;
    border-color: rgba(43, 164, 113, 0.3);
    animation-delay: -4s;
  }
}

// 渐变叠加
.gradient-overlay {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(43, 164, 113, 0.1) 0%, transparent 50%);
  animation: gradientShift 10s ease-in-out infinite;
}

// 登录卡片
.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  backdrop-filter: blur(20px) saturate(180%);
  position: relative;
  z-index: 10;
  animation: cardFadeIn 0.6s ease-out;

  html[theme-mode='dark'] & {
    background: rgba(20, 25, 40, 0.85);
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 36px;

  .logo-wrapper {
    display: inline-block;
    padding: 16px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-radius: 20px;
    margin-bottom: 20px;
    animation: logoFloat 3s ease-in-out infinite;

    html[theme-mode='dark'] & {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
    }
  }

  .logo {
    width: 64px;
    height: 64px;
    display: block;
    filter: drop-shadow(0 4px 12px rgba(102, 126, 234, 0.3));
  }

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--td-text-color-primary);
    margin: 0 0 8px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;

    html[theme-mode='dark'] & {
      background: linear-gradient(135deg, #8b9eff 0%, #9d7bc2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  p {
    font-size: 14px;
    color: var(--td-text-color-placeholder);
    margin: 0;
  }
}

.login-footer {
  text-align: center;
  margin-top: 28px;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  opacity: 0.8;
}

// 第三方登录样式
.oauth-section {
  margin-top: 24px;

  .divider-text {
    font-size: 12px;
    color: var(--td-text-color-placeholder);
  }
}

.oauth-buttons {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.oauth-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #fff;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px) scale(1.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);

    &::before {
      opacity: 1;
    }
  }

  &:active {
    transform: translateY(-2px) scale(1.02);
  }

  &.qq {
    background: linear-gradient(135deg, #12B7F5, #0099FF);
    box-shadow: 0 4px 12px rgba(18, 183, 245, 0.4);

    &::before {
      background: linear-gradient(135deg, #0099FF, #12B7F5);
    }
  }

  &.github {
    background: linear-gradient(135deg, #333, #24292e);
    box-shadow: 0 4px 12px rgba(36, 41, 46, 0.4);

    &::before {
      background: linear-gradient(135deg, #24292e, #333);
    }

    html[theme-mode='dark'] & {
      background: linear-gradient(135deg, #444, #555);
      box-shadow: 0 4px 12px rgba(68, 68, 68, 0.4);
    }
  }

  &.gitee {
    background: linear-gradient(135deg, #C71D23, #E03E3E);
    box-shadow: 0 4px 12px rgba(199, 29, 35, 0.4);

    &::before {
      background: linear-gradient(135deg, #E03E3E, #C71D23);
    }
  }

  svg {
    position: relative;
    z-index: 1;
  }
}

// 表单项间距优化
:deep(.t-form-item) {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

// 输入框优化
:deep(.t-input) {
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  html[theme-mode='dark'] & {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);

    &:hover {
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    &:focus-within {
      border-color: var(--td-brand-color);
      background: rgba(255, 255, 255, 0.08);
    }
  }
}

// 按钮优化
:deep(.t-button) {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

// 动画定义
@keyframes gridPulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes beamMove {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}

@keyframes particleFloat {
  0%, 100% {
    transform: translate(0, 0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    transform: translate(20px, -50px);
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translate(40px, -100px);
    opacity: 0;
  }
}

@keyframes ringExpand {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes gradientShift {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(30px, 30px);
  }
}

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
