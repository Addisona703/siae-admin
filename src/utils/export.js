// Enhanced CSV export utilities

/**
 * Export data to CSV with advanced options
 * @param {Array<Object>} data - Data to export
 * @param {string} filename - Output filename
 * @param {Object} options - Export options
 */
export const exportToCSV = (data, filename, options = {}) => {
  if (data.length === 0) {
    console.warn('No data to export')
    return
  }

  const firstRow = data[0]
  if (!firstRow) return

  const {
    headers = {},
    excludeColumns = [],
    dateFormat = 'YYYY-MM-DD HH:mm:ss',
    encoding = 'utf-8'
  } = options

  // Get all columns, excluding specified ones
  const allColumns = Object.keys(firstRow).filter(key => !excludeColumns.includes(key))
  
  // Create header row
  const headerRow = allColumns.map(col => headers[col] || col)
  
  // Create data rows
  const dataRows = data.map(row => 
    allColumns.map(col => {
      let value = row[col]
      
      // Handle different data types
      if (value === null || value === undefined) {
        return ''
      }
      
      // Format dates
      if (value instanceof Date) {
        value = formatDateForExport(value, dateFormat)
      } else if (typeof value === 'string' && isDateString(value)) {
        value = formatDateForExport(new Date(value), dateFormat)
      }
      
      // Handle arrays and objects
      if (Array.isArray(value)) {
        value = value.join('; ')
      } else if (typeof value === 'object') {
        value = JSON.stringify(value)
      }
      
      // Escape CSV special characters
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      
      return stringValue
    })
  )

  // Combine header and data
  const csvContent = [headerRow, ...dataRows]
    .map(row => row.join(','))
    .join('\n')

  // Add BOM for UTF-8 encoding to ensure proper display in Excel
  const BOM = encoding === 'utf-8' ? '\uFEFF' : ''
  const blob = new Blob([BOM + csvContent], { 
    type: `text/csv;charset=${encoding}` 
  })

  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`)
}

/**
 * Export data to Excel-compatible CSV
 * @param {Array<Object>} data - Data to export
 * @param {string} filename - Output filename
 * @param {Object} options - Export options
 */
export const exportToExcelCSV = (data, filename, options = {}) => {
  exportToCSV(data, filename, {
    ...options,
    encoding: 'utf-8'
  })
}

/**
 * Export JSON data
 * @param {*} data - Data to export
 * @param {string} filename - Output filename
 * @param {boolean} pretty - Pretty print JSON
 */
export const exportToJSON = (data, filename, pretty = true) => {
  const jsonString = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
  const blob = new Blob([jsonString], { type: 'application/json' })
  downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`)
}

/**
 * Export plain text
 * @param {string} content - Text content
 * @param {string} filename - Output filename
 */
export const exportToText = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  downloadBlob(blob, filename.endsWith('.txt') ? filename : `${filename}.txt`)
}

/**
 * Download blob
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Output filename
 */
export const downloadBlob = (blob, filename) => {
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 100)
  } else {
    // Fallback for older browsers
    window.open(URL.createObjectURL(blob))
  }
}

/**
 * 根据 URL 下载文件
 * @param {string} url - 文件 URL
 * @param {string} filename - 文件名（可选）
 * @param {boolean} forceDownload - 是否强制下载（不在浏览器中预览）
 */
export const downloadFile = async (url, filename = '', forceDownload = false) => {
  if (!url) {
    console.error('下载失败：URL 为空')
    return
  }

  try {
    if (forceDownload) {
      // 强制下载：通过 fetch 获取 Blob，然后触发下载
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      
      // 如果没有提供文件名，尝试从响应头获取
      if (!filename) {
        const contentDisposition = response.headers.get('content-disposition')
        if (contentDisposition) {
          filename = extractFilenameFromHeader(contentDisposition)
        }
        
        // 如果还是没有文件名，从 URL 中提取
        if (!filename) {
          filename = url.split('/').pop() || 'download'
        }
      }
      
      downloadBlob(blob, filename)
    } else {
      // 普通下载：在新窗口打开（浏览器会根据 MIME 类型决定预览或下载）
      window.open(url, '_blank')
    }
  } catch (error) {
    console.error('下载文件失败:', error)
    throw error
  }
}

/**
 * 根据文件扩展名判断是否应该强制下载
 * @param {string} filename - 文件名或 URL
 * @returns {boolean} 是否应该强制下载
 */
export const shouldForceDownload = (filename) => {
  if (!filename) return false
  
  const ext = filename.toLowerCase().split('.').pop()
  
  // 这些类型的文件浏览器通常会预览，如果需要下载应该强制
  const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'txt', 'json', 'xml']
  
  return previewableExtensions.includes(ext)
}

/**
 * 从 Content-Disposition 响应头中提取文件名
 * @param {string} contentDisposition - Content-Disposition 响应头
 * @returns {string} 文件名
 */
export const extractFilenameFromHeader = (contentDisposition) => {
  if (!contentDisposition) return ''
  
  // 尝试匹配 filename*=UTF-8''xxx 格式（RFC 5987）
  let match = contentDisposition.match(/filename\*=UTF-8''(.+)/i)
  if (match && match[1]) {
    return decodeURIComponent(match[1])
  }
  
  // 尝试匹配 filename="xxx" 或 filename=xxx 格式
  match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/i)
  if (match && match[1]) {
    return match[1].replace(/['"]/g, '')
  }
  
  return ''
}

/**
 * Format date for export
 * @param {Date} date - Date to format
 * @param {string} format - Date format string
 * @returns {string} Formatted date string
 */
const formatDateForExport = (date, format) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * Check if string is a date
 * @param {string} value - String to check
 * @returns {boolean} Whether string is a date
 */
const isDateString = (value) => {
  // Check for common date formats
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{4}\/\d{2}\/\d{2}/, // YYYY/MM/DD
    /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY
  ]
  
  return datePatterns.some(pattern => pattern.test(value)) && !isNaN(Date.parse(value))
}

/**
 * Prepare log data for export with proper formatting
 * @param {Array} logs - Log data
 * @returns {Array} Formatted log data
 */
export const prepareLogDataForExport = (logs) => {
  return logs.map(log => ({
    '时间': log.createdAt || log.loginAt || log.timestamp,
    '用户': log.username || log.user?.username || '',
    '操作': log.action || log.status || '',
    'IP地址': log.ipAddress || '',
    '状态': log.status || '',
    '详情': log.details || log.failureReason || log.message || '',
    '用户代理': log.userAgent || '',
    '位置': log.location || ''
  }))
}
