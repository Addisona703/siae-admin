// Composable for user feedback (messages, notifications, dialogs)
import { MessagePlugin, NotifyPlugin, DialogPlugin } from 'tdesign-vue-next'

/**
 * Composable for user feedback
 */
export function useFeedback() {
  // Message methods
  const showSuccess = (content, options = {}) => {
    MessagePlugin.success({
      content,
      duration: options.duration || 3000,
      closeBtn: options.closeBtn !== false
    })
  }

  const showError = (content, options = {}) => {
    MessagePlugin.error({
      content,
      duration: options.duration || 3000,
      closeBtn: options.closeBtn !== false
    })
  }

  const showWarning = (content, options = {}) => {
    MessagePlugin.warning({
      content,
      duration: options.duration || 3000,
      closeBtn: options.closeBtn !== false
    })
  }

  const showInfo = (content, options = {}) => {
    MessagePlugin.info({
      content,
      duration: options.duration || 3000,
      closeBtn: options.closeBtn !== false
    })
  }

  // Notification methods
  const notifySuccess = (title, content, options = {}) => {
    NotifyPlugin.success({
      title,
      content,
      duration: options.duration || 3000,
      closeBtn: options.closeBtn !== false,
      placement: options.placement || 'top-right'
    })
  }

  const notifyError = (title, content, options = {}) => {
    NotifyPlugin.error({
      title,
      content,
      duration: options.duration || 3000,
      closeBtn: options.closeBtn !== false,
      placement: options.placement || 'top-right'
    })
  }

  const notifyWarning = (title, content, options = {}) => {
    NotifyPlugin.warning({
      title,
      content,
      duration: options.duration || 3000,
      closeBtn: options.closeBtn !== false,
      placement: options.placement || 'top-right'
    })
  }

  const notifyInfo = (title, content, options = {}) => {
    NotifyPlugin.info({
      title,
      content,
      duration: options.duration || 3000,
      closeBtn: options.closeBtn !== false,
      placement: options.placement || 'top-right'
    })
  }

  // Confirmation dialog
  const confirm = async (options) => {
    return new Promise((resolve) => {
      const dialog = DialogPlugin.confirm({
        header: options.title || '确认',
        body: options.content || '',
        confirmBtn: options.confirmText || '确定',
        cancelBtn: options.cancelText || '取消',
        theme: options.theme || 'default',
        onConfirm: async () => {
          if (options.onConfirm) {
            await options.onConfirm()
          }
          dialog.hide()
          resolve(true)
        },
        onCancel: () => {
          if (options.onCancel) {
            options.onCancel()
          }
          dialog.hide()
          resolve(false)
        }
      })
    })
  }

  // Alert dialog
  const alert = async (content, title) => {
    return new Promise((resolve) => {
      const dialog = DialogPlugin.alert({
        header: title || '提示',
        body: content,
        confirmBtn: '确定',
        onConfirm: () => {
          dialog.hide()
          resolve()
        }
      })
    })
  }

  return {
    // Messages
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Notifications
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    
    // Dialogs
    confirm,
    alert
  }
}

/**
 * Composable for operation feedback (combines loading and feedback)
 */
export function useOperationFeedback() {
  const feedback = useFeedback()

  const executeWithFeedback = async (operation, options = {}) => {
    try {
      // Show confirmation if needed
      if (options.confirmMessage) {
        const confirmed = await feedback.confirm({
          title: options.confirmTitle || '确认',
          content: options.confirmMessage
        })
        if (!confirmed) {
          return null
        }
      }

      // Execute operation
      const result = await operation()

      // Show success message
      if (options.successMessage) {
        feedback.showSuccess(options.successMessage)
      }

      return result
    } catch (error) {
      // Show error message
      const errorMsg = options.errorMessage || error?.message || 'Operation failed'
      feedback.showError(errorMsg)
      throw error
    }
  }

  return {
    ...feedback,
    executeWithFeedback
  }
}
