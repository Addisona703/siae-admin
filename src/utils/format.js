// 通用格式化工具

/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Format number with thousand separators
 */
export const formatNumber = (num) => {
  return num.toLocaleString('zh-CN')
}

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format currency (Chinese Yuan)
 */
export const formatCurrency = (amount) => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Format phone number with mask
 */
export const formatPhoneMask = (phone) => {
  if (!phone || phone.length < 7) return phone
  
  // 手机号 (11位)
  if (phone.length === 11) {
    return `${phone.substring(0, 3)}****${phone.substring(7)}`
  }
  
  // 座机或其他
  const lastFour = phone.substring(phone.length - 4)
  const prefix = phone.substring(0, phone.length - 7)
  return `${prefix}***${lastFour}`
}

/**
 * Format email with mask
 */
export const formatEmailMask = (email) => {
  if (!email || !email.includes('@')) return email
  
  const [username, domain] = email.split('@')
  if (!username || !domain || username.length < 3) return email
  
  const maskedUsername = username.substring(0, 2) + '***'
  return `${maskedUsername}@${domain}`
}

/**
 * Format ID card with mask
 */
export const formatIdCardMask = (idCard) => {
  if (!idCard || idCard.length < 10) return idCard
  
  return `${idCard.substring(0, 6)}********${idCard.substring(idCard.length - 4)}`
}

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Convert camelCase to kebab-case
 */
export const camelToKebab = (str) => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}

/**
 * Convert kebab-case to camelCase
 */
export const kebabToCamel = (str) => {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Generate random string
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Generate UUID v4
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout = null
  
  return (...args) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle = false
  
  return (...args) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
  return obj
}

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}
