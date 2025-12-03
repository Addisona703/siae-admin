<template>
  <div v-if="hasError" class="error-boundary">
    <t-result theme="error" title="Something went wrong" :description="errorMessage">
      <template #extra>
        <t-space>
          <t-button theme="primary" @click="handleRetry">
            <template #icon><refresh-icon /></template>
            Retry
          </t-button>
          <t-button theme="default" @click="handleGoHome">
            Go to Home
          </t-button>
        </t-space>
      </template>
    </t-result>
  </div>
  <slot v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshIcon } from 'tdesign-icons-vue-next'

const router = useRouter()

const hasError = ref(false)
const errorMessage = ref('')
const errorInfo = ref(null)

// Capture errors from child components
onErrorCaptured((err, instance, info) => {
  console.error('[ErrorBoundary] Caught error:', {
    error: err,
    component: instance?.$options?.name || 'Unknown',
    info
  })

  hasError.value = true
  errorMessage.value = err.message || 'An unexpected error occurred'
  errorInfo.value = { err, instance, info }

  // Prevent error propagation
  return false
})

const handleRetry = () => {
  hasError.value = false
  errorMessage.value = ''
  errorInfo.value = null

  // Force component re-render
  window.location.reload()
}

const handleGoHome = () => {
  hasError.value = false
  errorMessage.value = ''
  errorInfo.value = null
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 24px;
}
</style>
