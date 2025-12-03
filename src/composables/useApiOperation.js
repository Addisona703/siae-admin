// Composable for handling API operations with loading and error states
import { ref } from 'vue'
import { handleApiError } from '@/utils/error'
import { MessagePlugin } from 'tdesign-vue-next'

/**
 * Composable for handling API operations with automatic loading and error states
 */
export function useApiOperation(apiFunction, options = {}) {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  const {
    successMessage,
    showSuccessMessage = false,
    onSuccess,
    onError,
    onFinally,
    ...errorOptions
  } = options

  const execute = async (...args) => {
    loading.value = true
    error.value = null

    try {
      const result = await apiFunction(...args)
      data.value = result

      // Show success message if configured
      if (showSuccessMessage && successMessage) {
        MessagePlugin.success({
          content: successMessage,
          duration: 3000
        })
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(result)
      }

      return result
    } catch (err) {
      error.value = err

      // Handle error with centralized error handler
      handleApiError(err, errorOptions)

      // Call error callback
      if (onError) {
        onError(err)
      }

      return null
    } finally {
      loading.value = false

      // Call finally callback
      if (onFinally) {
        onFinally()
      }
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}

/**
 * Composable for handling multiple API operations in parallel
 */
export function useParallelApiOperations(apiOperations, options = {}) {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  const {
    successMessage,
    showSuccessMessage = false,
    onSuccess,
    onError,
    onFinally,
    ...errorOptions
  } = options

  const execute = async (...args) => {
    loading.value = true
    error.value = null

    try {
      const results = await Promise.all(
        apiOperations.map(operation => operation(...args))
      )
      data.value = results

      // Show success message if configured
      if (showSuccessMessage && successMessage) {
        MessagePlugin.success({
          content: successMessage,
          duration: 3000
        })
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(results)
      }

      return results
    } catch (err) {
      error.value = err

      // Handle error with centralized error handler
      handleApiError(err, errorOptions)

      // Call error callback
      if (onError) {
        onError(err)
      }

      return null
    } finally {
      loading.value = false

      // Call finally callback
      if (onFinally) {
        onFinally()
      }
    }
  }

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}
