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
const downloadBlob = (blob, filename) => {
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
