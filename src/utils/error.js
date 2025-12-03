// Error handling utilities
import { MessagePlugin, NotifyPlugin } from 'tdesign-vue-next'

/**
 * Handle API errors with user-friendly messages
 */
export function handleApiError(error, options = {}) {
  const {
    showMessage = true,
    showNotification = false,
    duration = 3000,
    onRetry,
    customMessage,
  } = options

  let message = customMessage || 'Operation failed, please try again'
  let title = 'Error'

  // Extract error information
  if (error?.response?.data) {
    const { data } = error.response
    message = data.message || data.error || message
    title = data.title || title
  } else if (error?.message) {
    message = error.message
  }

  // Network errors
  if (!error?.response) {
    message = 'Network error, please check your connection'
    title = 'Connection Error'
  }

  // Show error message
  if (showMessage) {
    MessagePlugin.error({
      content: message,
      duration,
      closeBtn: true,
      onCloseBtnClick: onRetry,
    })
  }

  // Show notification for important errors
  if (showNotification) {
    NotifyPlugin.error({
      title,
      content: message,
      duration,
      closeBtn: true,
      onCloseBtnClick: onRetry,
    })
  }

  // Log error for debugging
  if (import.meta.env.DEV) {
    console.error('[API Error]', {
      message,
      error,
      options,
    })
  }
}

/**
 * Setup global error handler
 */
export function setupGlobalErrorHandler() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Prevent default error handling
    event.preventDefault()
    
    // Show user-friendly message
    handleApiError(event.reason, {
      showMessage: true,
      customMessage: 'An unexpected error occurred',
    })
  })

  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    // Prevent default error handling for non-critical errors
    if (!event.error?.critical) {
      event.preventDefault()
    }
  })
}

/**
 * Create error with additional context
 */
export function createError(message, context = {}) {
  const error = new Error(message)
  Object.assign(error, context)
  return error
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error) {
  return !error?.response && error?.request
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error) {
  return error?.response?.status === 401
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error) {
  return error?.response?.status === 403
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error) {
  return error?.response?.status === 404
}

/**
 * Check if error is a server error
 */
export function isServerError(error) {
  return error?.response?.status >= 500
}
