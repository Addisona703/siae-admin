<template>
  <div class="login-view" :class="{
    'theme-brand': currentTheme === 'brand',
    'theme-modern': currentTheme === 'modern',
    'theme-matrix': currentTheme === 'matrix',
    'theme-split': currentTheme === 'split'
  }">
    <!-- Theme Toggle Button -->
    <!-- <div class="theme-toggle">
      <t-button variant="text" @click="toggleTheme" class="toggle-btn">
        <t-icon
          :name="currentTheme === 'brand' ? 'user-circle' : currentTheme === 'modern' ? 'code' : currentTheme === 'matrix' ? 'view-column' : 'lock-on'" />
        <span class="toggle-text">
          {{
            currentTheme === 'brand' ? 'Modern' :
              currentTheme === 'modern' ? 'Matrix' :
                currentTheme === 'matrix' ? 'Split' : 'Brand'
          }}
        </span>
      </t-button>
    </div> -->

    <!-- Background Components -->
    <!-- <MatrixBackground v-if="currentTheme === 'matrix'" /> -->

    <!-- Login Card Components -->
    <BrandLoginCard v-if="currentTheme === 'brand'" v-model:formData="formData" :form-rules="formRules"
      :is-loading="isLoading" @submit="handleSubmit" />
    <!-- <ModernLoginCard v-if="currentTheme === 'modern'" :form-data="formData" :form-rules="formRules"
      :is-loading="isLoading" @submit="handleSubmit" />
    <MatrixLoginCard v-if="currentTheme === 'matrix'" :form-data="formData" :form-rules="formRules"
      :is-loading="isLoading" @submit="handleSubmit" />
    <SplitLoginCard v-if="currentTheme === 'split'" :form-data="formData" :form-rules="formRules"
      :is-loading="isLoading" @submit="handleSubmit" /> -->
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuthStore } from '@/stores'
import BrandLoginCard from './components/BrandLoginCard.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Theme state
const currentTheme = ref('brand')

// Form data - ensure values are always strings
const formData = reactive({
  username: '',
  password: ''
})

// Watch formData to ensure values are always strings
watch(formData, (newVal) => {
  if (typeof newVal.username !== 'string') {
    formData.username = String(newVal.username || '')
  }
  if (typeof newVal.password !== 'string') {
    formData.password = String(newVal.password || '')
  }
}, { deep: true })

// Loading state
const isLoading = ref(false)

// Form validation rules (只在提交时验证)
const formRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, message: '用户名至少3位' }
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6位' }
  ]
}

/**
 * Toggle theme
 */
const toggleTheme = () => {
  const themes = ['brand', 'modern', 'matrix', 'split']
  const currentIndex = themes.indexOf(currentTheme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  const nextTheme = themes[nextIndex]
  if (nextTheme) {
    currentTheme.value = nextTheme
  }
}

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  try {
    isLoading.value = true

    await authStore.login(formData)

    MessagePlugin.success('登录成功，欢迎回来！')

    // Wait a bit for the success message to be visible
    await new Promise(resolve => setTimeout(resolve, 800))

    // Get redirect path from query or default to dashboard
    const redirect = route.query.redirect || '/dashboard'
    const targetPath = redirect === '/' ? '/dashboard' : redirect

    // Use replace instead of push to avoid keeping login page in history
    await router.replace(targetPath)
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '登录失败，请检查用户名和密码'
    MessagePlugin.error(errorMessage)
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="less">
.login-view {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0ea5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: background 0.5s ease;

  // Modern Theme
  &.theme-modern {
    background: #ffffff;
    padding: 0;
    align-items: stretch;
    justify-content: stretch;
  }

  // Matrix Theme
  &.theme-matrix {
    background: #000000;
    justify-content: center;
  }

  // Split Theme
  &.theme-split {
    background: #121212;
    padding: 0;
    align-items: stretch;
    justify-content: stretch;
  }
}

// Theme Toggle Button
.theme-toggle {
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;

  :deep(.toggle-btn) {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: rgba(255, 255, 255, 0.05) !important;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 8px !important;
    color: rgba(255, 255, 255, 0.8) !important;
    transition: all 0.3s ease !important;
    cursor: pointer;

    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      border-color: rgba(255, 255, 255, 0.2) !important;
      color: #ffffff !important;
      transform: translateY(-2px) !important;
    }

    .t-icon {
      font-size: 18px;
      color: inherit !important;
      filter: none !important;
    }

    .toggle-text {
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
  }
}
</style>

<style lang="less">
// 全局覆盖登录页中的 TDesign 组件样式（非 scoped）
.login-view {

  // 覆盖所有 t-input 组件 - Brand Theme
  &.theme-brand {
    .t-input {
      width: 100% !important;

      .t-input__wrap {
        width: 100% !important;
        height: 48px !important;
        border-radius: 12px !important;
        border: 1.5px solid #e2e8f0 !important;
        background: #ffffff !important;
        transition: all 0.3s ease !important;

        &:hover {
          border-color: #cbd5e1 !important;
        }
      }

      .t-input__inner {
        width: 100% !important;
        height: 48px !important;
        padding-left: 44px !important;
        font-size: 15px !important;
        color: #1e293b !important;

        &::placeholder {
          color: #94a3b8 !important;
        }
      }

      .t-input__prefix {
        left: 14px !important;

        .t-icon {
          font-size: 18px !important;
          color: #64748b !important;
          filter: none !important;
        }
      }

      &.t-is-focused {
        .t-input__wrap {
          border-color: #0ea5e9 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1) !important;
        }

        .t-input__prefix .t-icon {
          color: #0ea5e9 !important;
        }
      }

      &.t-is-disabled {
        opacity: 0.5 !important;
        cursor: not-allowed !important;
      }
    }
  }

  // 覆盖所有 t-button 组件 - Brand Theme
  &.theme-brand {
    .t-button:not(.toggle-btn) {
      height: 48px !important;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%) !important;
      border: none !important;
      border-radius: 12px !important;
      color: #ffffff !important;
      font-size: 15px !important;
      font-weight: 600 !important;
      letter-spacing: 0.3px !important;
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4) !important;
      transition: all 0.3s ease !important;
      text-shadow: none !important;

      &:hover:not(.t-is-disabled) {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
        box-shadow: 0 6px 16px rgba(14, 165, 233, 0.5) !important;
        transform: translateY(-2px) !important;
      }

      &:active:not(.t-is-disabled) {
        transform: translateY(0) !important;
      }

      &.t-is-disabled {
        opacity: 0.6 !important;
        background: linear-gradient(135deg, #7dd3fc 0%, #38bdf8 100%) !important;
      }

      .t-button__text {
        position: relative !important;
        z-index: 2 !important;
      }
    }
  }

  // 覆盖表单错误提示
  .t-form__item {
    &.t-is-error {
      .t-input {
        .t-input__wrap {
          border-color: rgba(255, 77, 79, 0.5) !important;
          background: rgba(255, 77, 79, 0.05) !important;
          box-shadow: 0 0 15px rgba(255, 77, 79, 0.2) !important;
        }
      }
    }

    .t-input__tips {
      margin-top: 8px !important;
      font-size: 13px !important;
      color: #ff4d4f !important;
      background: rgba(255, 77, 79, 0.1) !important;
      border: 1px solid rgba(255, 77, 79, 0.3) !important;
      border-radius: 8px !important;
      padding: 6px 12px !important;
      letter-spacing: 0.5px !important;
      text-shadow: 0 0 8px rgba(255, 77, 79, 0.5) !important;
      animation: errorAppear 0.3s ease-out !important;

      &.t-input__tips--error,
      &.t-is-error {
        color: #ff4d4f !important;
        background: rgba(255, 77, 79, 0.1) !important;
        border-color: rgba(255, 77, 79, 0.3) !important;
      }
    }
  }

  // 覆盖 t-icon 样式 - Brand Theme
  &.theme-brand {
    .t-icon:not(.toggle-btn .t-icon):not(.t-input__prefix .t-icon) {
      color: #0ea5e9 !important;
      filter: none !important;
    }
  }

  // Matrix Theme Overrides
  &.theme-matrix {
    .t-input {
      .t-input__wrap {
        background: transparent !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;

        &:hover {
          border: none !important;
          box-shadow: none !important;
        }
      }

      .t-input__inner {
        color: #00ff41 !important;
        background: transparent !important;
        border: none !important;
        caret-color: #00ff41 !important;
        font-family: 'Courier New', 'Lucida Console', monospace !important;
        font-size: 16px !important;
        letter-spacing: 1px !important;
        padding: 8px 0 !important;
        text-shadow: 0 0 5px rgba(0, 255, 65, 0.3) !important;

        &::placeholder {
          color: transparent !important;
        }
      }

      &.t-is-focused {
        .t-input__wrap {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
      }

      &.t-is-disabled {
        opacity: 0.4 !important;
      }
    }

    .t-button:not(.toggle-btn) {
      --ripple-color: rgba(0, 255, 65, 0.3) !important;
      background: transparent !important;
      border: 2px solid #00ff41 !important;
      border-radius: 0 !important;
      color: #00ff41 !important;
      font-family: 'Courier New', monospace !important;
      font-weight: 700 !important;
      letter-spacing: 2px !important;
      text-shadow: 0 0 10px rgba(0, 255, 65, 0.8) !important;
      transition: all 0.3s ease !important;

      &:hover:not(.t-is-disabled) {
        --ripple-color: rgba(0, 255, 65, 0.3) !important;
        background: rgba(0, 255, 65, 0.1) !important;
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.6),
          inset 0 0 20px rgba(0, 255, 65, 0.1) !important;
        border-color: #00ff41 !important;
        color: #00ff41 !important;
        transform: translateY(0) !important;
      }

      &:active:not(.t-is-disabled) {
        --ripple-color: rgba(0, 255, 65, 0.3) !important;
        background: rgba(0, 255, 65, 0.2) !important;
        border-color: #00ff41 !important;
        color: #00ff41 !important;
      }

      &:focus:not(.t-is-disabled) {
        --ripple-color: rgba(0, 255, 65, 0.3) !important;
        background: rgba(0, 255, 65, 0.15) !important;
        border-color: #00ff41 !important;
        color: #00ff41 !important;
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.6) !important;
      }

      &.t-is-disabled {
        opacity: 0.4 !important;
        border-color: rgba(0, 255, 65, 0.3) !important;
      }

      // 覆盖 TDesign 的波纹效果颜色
      &::after {
        background-color: rgba(0, 255, 65, 0.3) !important;
      }

      .t-button__text {
        color: #00ff41 !important;
      }

      // 覆盖所有可能的状态
      &.t-is-active,
      &.t-is-loading {
        --ripple-color: rgba(0, 255, 65, 0.3) !important;
        background: rgba(0, 255, 65, 0.2) !important;
        border-color: #00ff41 !important;
        color: #00ff41 !important;
      }
    }

    // 所有图标都是绿色（除了切换按钮）
    .matrix-login-form .t-icon,
    .terminal-icon .t-icon,
    .form-header .t-icon,
    .t-icon:not(.toggle-btn .t-icon) {
      color: #00ff41 !important;
      filter: drop-shadow(0 0 10px rgba(0, 255, 65, 0.8)) !important;
    }

    .t-form__item {
      &.t-is-error {
        .t-input {
          .t-input__wrap {
            border-color: #ff0000 !important;
            box-shadow: 0 0 15px rgba(255, 0, 0, 0.4) !important;
          }
        }
      }

      .t-input__tips {
        background: rgba(255, 0, 0, 0.1) !important;
        border: 1px solid rgba(255, 0, 0, 0.4) !important;
        border-radius: 0 !important;
        color: #ff0000 !important;
        font-family: 'Courier New', monospace !important;
        text-shadow: 0 0 8px rgba(255, 0, 0, 0.6) !important;
      }
    }
  }

  // Split Theme Overrides
  &.theme-split {
    .t-input {
      .t-input__wrap {
        background: rgba(255, 255, 255, 0.05) !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        border-radius: 8px !important;
        transition: all 0.3s ease !important;

        &:hover {
          border-color: rgba(0, 255, 65, 0.3) !important;
          background: rgba(255, 255, 255, 0.08) !important;
        }
      }

      .t-input__inner {
        color: #ffffff !important;
        background: transparent !important;
        letter-spacing: 0.3px !important;

        &::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }
      }

      &.t-is-focused {
        .t-input__wrap {
          border-color: #00ff41 !important;
          background: rgba(0, 255, 65, 0.05) !important;
          box-shadow: 0 0 0 3px rgba(0, 255, 65, 0.1) !important;
        }
      }

      &.t-is-disabled {
        opacity: 0.5 !important;
      }
    }

    .t-button:not(.toggle-btn) {
      background: #00ff41 !important;
      border: none !important;
      border-radius: 8px !important;
      color: #000000 !important;
      font-weight: 600 !important;
      letter-spacing: 0.5px !important;
      transition: all 0.3s ease !important;
      height: 48px !important;

      &:hover:not(.t-is-disabled) {
        background: #00cc34 !important;
        box-shadow: 0 4px 12px rgba(0, 255, 65, 0.3) !important;
        transform: translateY(-1px) !important;
      }

      &:active:not(.t-is-disabled) {
        transform: translateY(0) !important;
      }

      &.t-is-disabled {
        opacity: 0.5 !important;
        background: rgba(0, 255, 65, 0.3) !important;
      }
    }

    .t-icon:not(.toggle-btn .t-icon) {
      color: #00ff41 !important;
      filter: none !important;
    }

    .t-form__item {
      &.t-is-error {
        .t-input {
          .t-input__wrap {
            border-color: #ff4d4f !important;
            background: rgba(255, 77, 79, 0.05) !important;
          }
        }
      }

      .t-input__tips {
        background: rgba(255, 77, 79, 0.1) !important;
        border: 1px solid rgba(255, 77, 79, 0.3) !important;
        border-radius: 6px !important;
        color: #ff4d4f !important;
        text-shadow: none !important;
      }
    }
  }

  // Modern Theme Overrides
  &.theme-modern {

    // 切换按钮样式
    .theme-toggle {
      .toggle-btn {
        background: rgba(15, 23, 42, 0.05) !important;
        border: 1px solid rgba(15, 23, 42, 0.1) !important;
        color: #475569 !important;

        &:hover {
          background: rgba(15, 23, 42, 0.1) !important;
          border-color: rgba(15, 23, 42, 0.2) !important;
          color: #1e293b !important;
        }

        .t-icon {
          color: inherit !important;
        }
      }
    }

    .t-input {
      .t-input__wrap {
        height: 48px !important;
        border-radius: 12px !important;
        border: 1.5px solid #e2e8f0 !important;
        background: #f8fafc !important;
        transition: all 0.3s ease !important;

        &:hover {
          border-color: #cbd5e1 !important;
          background: #ffffff !important;
        }
      }

      .t-input__inner {
        height: 48px !important;
        padding-left: 44px !important;
        font-size: 15px !important;
        color: #1e293b !important;

        &::placeholder {
          color: #94a3b8 !important;
        }
      }

      .t-input__prefix {
        left: 14px !important;

        .t-icon {
          font-size: 18px !important;
          color: #64748b !important;
          filter: none !important;
        }
      }

      &.t-is-focused {
        .t-input__wrap {
          border-color: #0ea5e9 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1) !important;
        }

        .t-input__prefix .t-icon {
          color: #0ea5e9 !important;
        }
      }
    }

    .t-button:not(.toggle-btn) {
      height: 48px !important;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
      border: none !important;
      border-radius: 12px !important;
      font-size: 15px !important;
      font-weight: 600 !important;
      letter-spacing: 0.3px !important;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3) !important;
      transition: all 0.3s ease !important;
      text-shadow: none !important;

      &:hover:not(.t-is-disabled) {
        background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%) !important;
        box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4) !important;
        transform: translateY(-2px) !important;
      }

      &:active:not(.t-is-disabled) {
        transform: translateY(0) !important;
      }

      &.t-is-disabled {
        opacity: 0.6 !important;
        background: linear-gradient(135deg, #fb923c 0%, #f97316 100%) !important;
      }
    }

    .t-icon:not(.toggle-btn .t-icon):not(.t-input__prefix .t-icon) {
      color: #0ea5e9 !important;
      filter: none !important;
    }
  }
}

@keyframes errorAppear {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
