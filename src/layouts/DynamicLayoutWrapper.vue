<template>
  <div class="dynamic-layout-wrapper" :style="transitionVars">
    <Suspense>
      <template #default>
        <Transition name="theme-fade" mode="out-in" :duration="transitionDurations" appear>
          <component v-if="currentLayoutComponent" :is="currentLayoutComponent" :key="currentThemeKey">
            <slot />
          </component>
          <div v-else class="layout-loading-shell">
            <t-loading size="32px" />
            <p class="layout-loading-text">正在准备主题布局...</p>
          </div>
        </Transition>
      </template>

      <template #fallback>
        <div class="suspense-placeholder">
          <t-loading size="32px" />
          <p class="layout-loading-text">正在加载主题资源...</p>
        </div>
      </template>
    </Suspense>

    <!-- Loading/Error Overlay -->
    <div v-if="showOverlay" class="theme-loading-overlay" :class="{ 'is-recovering': isRecovering }">
      <div class="loading-card" :class="overlayCardClass">
        <!-- Loading State -->
        <template v-if="!hasError">
          <t-loading size="40px" />
          <p class="loading-text">{{ loadingMessage }}</p>
          <t-progress v-if="showProgressBar" :percentage="progressValue" :show-info="false" size="small"
            :theme="progressTheme" />
          <p v-if="loadingStage" class="loading-stage">{{ loadingStage }}</p>
        </template>

        <!-- Error State -->
        <template v-else>
          <div class="error-icon">⚠️</div>
          <p class="error-title">{{ errorTitle }}</p>
          <p class="error-message">{{ errorMessage }}</p>
          <p v-if="errorSuggestion" class="error-suggestion">{{ errorSuggestion }}</p>

          <div class="error-actions">
            <t-button theme="primary" size="medium" @click="handleRetry" :loading="retryLoading">
              {{ retryLoading ? '重试中...' : '重试' }}
            </t-button>
            <t-button v-if="canSwitchToFallback" theme="default" size="medium" @click="handleFallback">
              使用默认主题
            </t-button>
          </div>

          <div v-if="showErrorDetails" class="error-details">
            <p class="error-code">错误代码: {{ errorCode }}</p>
            <p class="error-count">错误次数: {{ errorCount }}</p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/themeStore'
import { useDevicePerformance } from '@/composables/useDevicePerformance'
import { getErrorMessage, getRecoverySuggestion } from '@/utils/theme-error'

const themeStore = useThemeStore()
const {
  currentThemeId,
  currentTheme,
  loadingState,
  isLoading,
  loadingProgress,
  transitionSettings,
  lastError,
  errorCount: storeErrorCount,
  isRecovering
} = storeToRefs(themeStore)

const { isLowPerformance, detectPerformance, getOptimalSettings } = useDevicePerformance()

const hasInitialized = ref(false)
const isInitializing = ref(true)
const retryLoading = ref(false)
const retryCount = ref(0)
const showErrorDetails = ref(false)

const transitionDuration = computed(() => {
  const baseDuration = transitionSettings.value?.duration ?? 300
  if (!transitionSettings.value?.adaptToPerformance) {
    return baseDuration
  }
  return isLowPerformance.value ? Math.max(150, Math.round(baseDuration * 0.6)) : baseDuration
})

const transitionDurations = computed(() => ({
  enter: transitionDuration.value,
  leave: transitionDuration.value
}))

const transitionVars = computed(() => ({
  '--theme-transition-duration': `${transitionDuration.value}ms`
}))

const showProgressBar = computed(() => {
  if (transitionSettings.value?.enableProgressBar === false) {
    return false
  }
  const optimal = getOptimalSettings()
  return optimal.enableComplexAnimations ?? true
})

const progressValue = computed(() => {
  const progress = loadingState.value?.progress ?? loadingProgress.value ?? 0
  return Math.min(100, Math.max(0, Math.round(progress)))
})

const hasError = computed(() => !!lastError.value)

const errorTitle = computed(() => {
  if (!lastError.value) return ''
  return isRecovering.value ? '正在恢复...' : '主题加载失败'
})

const errorMessage = computed(() => {
  if (!lastError.value) return ''
  return getErrorMessage(lastError.value)
})

const errorSuggestion = computed(() => {
  if (!lastError.value) return ''
  return getRecoverySuggestion(lastError.value)
})

const errorCode = computed(() => lastError.value?.code || '')

const errorCount = computed(() => storeErrorCount.value)

const canSwitchToFallback = computed(() => {
  return hasError.value && currentThemeId.value !== 'brand'
})

const loadingMessage = computed(() => {
  if (isRecovering.value) {
    return '正在恢复到之前的主题...'
  }
  return loadingState.value?.message || '正在切换主题...'
})

const loadingStage = computed(() => {
  const stage = loadingState.value?.stage
  if (!stage || stage === 'complete') return ''

  const stageNames = {
    layout: '加载布局组件',
    style: '加载主题样式'
  }

  return stageNames[stage] || ''
})

const progressTheme = computed(() => {
  return isRecovering.value ? 'warning' : 'primary'
})

const overlayCardClass = computed(() => ({
  'is-error': hasError.value,
  'is-recovering': isRecovering.value,
  'is-loading': !hasError.value
}))

const showOverlay = computed(() => {
  if (hasError.value) return true
  if (isRecovering.value) return true
  return isInitializing.value || loadingState.value?.isLoading || isLoading.value
})

const currentLayoutComponent = computed(() => currentTheme.value?.layoutComponent ?? null)
const currentThemeKey = computed(() => currentThemeId.value)

async function ensureThemeAssets(themeId) {
  if (!themeId) return
  const theme = currentTheme.value

  console.log('[DynamicLayoutWrapper] Ensuring theme assets for:', themeId)

  try {
    if (!theme?.layoutComponent) {
      console.log('[DynamicLayoutWrapper] Loading layout component...')
      await themeStore.loadThemeLayout(themeId)
    }
    if (!theme?.styleLoaded) {
      console.log('[DynamicLayoutWrapper] Loading theme style...')
      await themeStore.loadThemeStyle(themeId)
    }
    console.log('[DynamicLayoutWrapper] Theme assets ensured successfully')
  } catch (error) {
    console.error('[DynamicLayoutWrapper] Failed to ensure theme assets:', error)
    throw error
  }
}

async function initializeTheme() {
  console.log('[DynamicLayoutWrapper] Initializing theme...')

  try {
    await themeStore.initializeTheme()
    await ensureThemeAssets(currentThemeId.value)
    hasInitialized.value = true
    retryCount.value = 0
    console.log('[DynamicLayoutWrapper] Theme initialized successfully')
  } catch (error) {
    console.error('[DynamicLayoutWrapper] Theme initialization failed:', error)
    throw error
  } finally {
    isInitializing.value = false
  }
}

async function handleRetry() {
  if (retryLoading.value) return

  console.log('[DynamicLayoutWrapper] Retry attempt:', retryCount.value + 1)

  retryLoading.value = true
  retryCount.value++

  try {
    if (!hasInitialized.value) {
      await initializeTheme()
    } else {
      // Retry loading current theme
      await themeStore.switchTheme(currentThemeId.value, {
        timeout: 15000,
        fallbackTheme: 'brand'
      })
    }

    console.log('[DynamicLayoutWrapper] Retry successful')
  } catch (error) {
    console.error('[DynamicLayoutWrapper] Retry failed:', error)

    // Show error details after multiple failures
    if (retryCount.value >= 2) {
      showErrorDetails.value = true
    }
  } finally {
    retryLoading.value = false
  }
}

async function handleFallback() {
  console.log('[DynamicLayoutWrapper] Switching to fallback theme: brand')

  try {
    await themeStore.switchTheme('brand')
    retryCount.value = 0
    showErrorDetails.value = false
  } catch (error) {
    console.error('[DynamicLayoutWrapper] Fallback theme switch failed:', error)
  }
}

watch(currentThemeId, async (newThemeId, oldThemeId) => {
  if (!hasInitialized.value) return
  if (newThemeId && newThemeId !== oldThemeId) {
    console.log('[DynamicLayoutWrapper] Theme changed:', oldThemeId, '->', newThemeId)
    retryCount.value = 0
    showErrorDetails.value = false

    try {
      await ensureThemeAssets(newThemeId)
    } catch (error) {
      console.error('[DynamicLayoutWrapper] Failed to switch theme:', error)
    }
  }
})

// Watch for error recovery
watch(lastError, (newError, oldError) => {
  if (oldError && !newError) {
    console.log('[DynamicLayoutWrapper] Error recovered')
    retryCount.value = 0
    showErrorDetails.value = false
  }
})

onMounted(async () => {
  console.log('[DynamicLayoutWrapper] Component mounted')
  detectPerformance()
  await initializeTheme()
})
</script>

<style scoped>
.dynamic-layout-wrapper {
  position: relative;
  min-height: 100vh;
  width: 100%;
}

.layout-loading-shell {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: rgba(31, 42, 58, 0.65);
}

.layout-loading-text {
  font-size: 0.9rem;
  letter-spacing: 0.1em;
}

.suspense-placeholder {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: rgba(31, 42, 58, 0.6);
}

.theme-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  background: rgba(15, 23, 42, 0.35);
  transition: background 0.3s ease;
}

.theme-loading-overlay.is-recovering {
  background: rgba(255, 152, 0, 0.15);
}

.loading-card {
  min-width: 280px;
  max-width: 480px;
  padding: 2rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.loading-card.is-error {
  border: 2px solid rgba(244, 67, 54, 0.4);
  background: rgba(255, 255, 255, 0.98);
  gap: 1.25rem;
}

.loading-card.is-recovering {
  border: 2px solid rgba(255, 152, 0, 0.4);
  background: rgba(255, 248, 225, 0.98);
}

.loading-text {
  margin: 0;
  font-size: 0.95rem;
  text-align: center;
  letter-spacing: 0.08em;
  font-weight: 500;
}

.loading-stage {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.6);
  text-align: center;
}

.error-icon {
  font-size: 3rem;
  line-height: 1;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-10px);
  }

  75% {
    transform: translateX(10px);
  }
}

.error-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(244, 67, 54, 0.9);
  text-align: center;
}

.error-message {
  margin: 0;
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.75);
  text-align: center;
  line-height: 1.5;
}

.error-suggestion {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.6);
  text-align: center;
  font-style: italic;
  padding: 0.5rem 1rem;
  background: rgba(15, 23, 42, 0.05);
  border-radius: 8px;
}

.error-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.error-details {
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.05);
  border-radius: 8px;
  width: 100%;
  font-size: 0.8rem;
  color: rgba(15, 23, 42, 0.6);
}

.error-code,
.error-count {
  margin: 0.25rem 0;
  text-align: center;
}

.theme-fade-enter-active,
.theme-fade-leave-active {
  transition: opacity var(--theme-transition-duration, 300ms) cubic-bezier(0.4, 0, 0.2, 1),
    transform var(--theme-transition-duration, 300ms) cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-fade-enter-from,
.theme-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.theme-fade-leave-from,
.theme-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {

  .theme-fade-enter-active,
  .theme-fade-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
