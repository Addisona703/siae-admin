// Enhanced date formatting utilities

/**
 * Format date with various patterns
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return ''
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export const formatRelativeTime = (date) => {
  const now = new Date()
  const target = new Date(date)
  const diffMs = now.getTime() - target.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffSeconds < 60) {
    return '刚刚'
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 30) {
    return `${diffDays}天前`
  } else if (diffMonths < 12) {
    return `${diffMonths}个月前`
  } else {
    return `${diffYears}年前`
  }
}

/**
 * Get date range for common periods
 */
export const getDateRange = (period) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (period) {
    case 'today':
      return {
        start: formatDate(today, 'YYYY-MM-DD 00:00:00'),
        end: formatDate(today, 'YYYY-MM-DD 23:59:59')
      }
    
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return {
        start: formatDate(yesterday, 'YYYY-MM-DD 00:00:00'),
        end: formatDate(yesterday, 'YYYY-MM-DD 23:59:59')
      }
    }
    
    case 'week': {
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      return {
        start: formatDate(weekStart, 'YYYY-MM-DD 00:00:00'),
        end: formatDate(today, 'YYYY-MM-DD 23:59:59')
      }
    }
    
    case 'month': {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      return {
        start: formatDate(monthStart, 'YYYY-MM-DD 00:00:00'),
        end: formatDate(today, 'YYYY-MM-DD 23:59:59')
      }
    }
    
    case 'quarter': {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3
      const quarterStart = new Date(now.getFullYear(), quarterMonth, 1)
      return {
        start: formatDate(quarterStart, 'YYYY-MM-DD 00:00:00'),
        end: formatDate(today, 'YYYY-MM-DD 23:59:59')
      }
    }
    
    case 'year': {
      const yearStart = new Date(now.getFullYear(), 0, 1)
      return {
        start: formatDate(yearStart, 'YYYY-MM-DD 00:00:00'),
        end: formatDate(today, 'YYYY-MM-DD 23:59:59')
      }
    }
    
    default:
      return {
        start: formatDate(today, 'YYYY-MM-DD 00:00:00'),
        end: formatDate(today, 'YYYY-MM-DD 23:59:59')
      }
  }
}

/**
 * Check if date is valid
 */
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Parse date string with fallback
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null
  
  const date = new Date(dateStr)
  return isValidDate(date) ? date : null
}

/**
 * Calculate age from birth date
 */
export const calculateAge = (birthDate) => {
  const birth = new Date(birthDate)
  const now = new Date()
  
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Format duration in milliseconds to human readable
 */
export const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天${hours % 24}小时`
  } else if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

/**
 * Check if date is in range
 */
export const isDateInRange = (date, start, end) => {
  const targetDate = new Date(date)
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  return targetDate >= startDate && targetDate <= endDate
}
