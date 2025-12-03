// Composable for managing loading states
import { ref } from 'vue'
import { LoadingPlugin } from 'tdesign-vue-next'

/**
 * Composable for managing loading states
 */
export function useLoading(initialState = false) {
  const loading = ref(initialState)

  const startLoading = () => {
    loading.value = true
  }

  const stopLoading = () => {
    loading.value = false
  }

  const withLoading = async (fn) => {
    startLoading()
    try {
      return await fn()
    } finally {
      stopLoading()
    }
  }

  return {
    loading,
    startLoading,
    stopLoading,
    withLoading
  }
}

/**
 * Composable for managing fullscreen loading with TDesign LoadingPlugin
 */
export function useFullscreenLoading() {
  let loadingInstance = null

  const show = (text = 'Loading...') => {
    if (loadingInstance) {
      return
    }
    loadingInstance = LoadingPlugin({
      fullscreen: true,
      text: text,
      preventScrollThrough: true
    })
  }

  const hide = () => {
    if (loadingInstance) {
      loadingInstance.hide()
      loadingInstance = null
    }
  }

  const withLoading = async (fn, text) => {
    show(text)
    try {
      return await fn()
    } finally {
      hide()
    }
  }

  return {
    show,
    hide,
    withLoading
  }
}

/**
 * Composable for managing multiple loading states
 */
export function useMultipleLoading() {
  const loadingStates = ref({})

  const setLoading = (key, value) => {
    loadingStates.value[key] = value
  }

  const isLoading = (key) => {
    return loadingStates.value[key] || false
  }

  const isAnyLoading = () => {
    return Object.values(loadingStates.value).some(value => value)
  }

  const withLoading = async (key, fn) => {
    setLoading(key, true)
    try {
      return await fn()
    } finally {
      setLoading(key, false)
    }
  }

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    withLoading
  }
}
