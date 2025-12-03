// Form validation utilities

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone validation regex (supports various formats)
const PHONE_REGEX = /^(\+?86)?1[3-9]\d{9}$/

// Password strength regex (at least 8 chars, contains letter and number)
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/

// Username regex (alphanumeric and underscore, 3-20 chars)
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/

// Student ID regex (typically 8-12 digits)
const STUDENT_ID_REGEX = /^\d{8,12}$/

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (message = '此字段为必填项') => ({
    required: true,
    message,
    trigger: 'change'
  }),

  email: (message = '请输入有效的邮箱地址') => ({
    type: 'email',
    message,
    trigger: 'change'
  }),

  phone: (message = '请输入有效的手机号码') => ({
    pattern: PHONE_REGEX,
    message,
    trigger: 'change'
  }),

  password: (message = '密码至少8位，包含字母和数字') => ({
    pattern: PASSWORD_REGEX,
    message,
    trigger: 'change'
  }),

  username: (message = '用户名只能包含字母、数字和下划线，长度3-20位') => ({
    pattern: USERNAME_REGEX,
    message,
    trigger: 'change'
  }),

  studentId: (message = '请输入有效的学号（8-12位数字）') => ({
    pattern: STUDENT_ID_REGEX,
    message,
    trigger: 'change'
  }),

  minLength: (min, message) => ({
    min,
    message: message || `长度不能少于${min}个字符`,
    trigger: 'change'
  }),

  maxLength: (max, message) => ({
    max,
    message: message || `长度不能超过${max}个字符`,
    trigger: 'change'
  }),

  range: (min, max, message) => ({
    min,
    max,
    message: message || `长度应在${min}到${max}个字符之间`,
    trigger: 'change'
  }),

  number: (message = '请输入有效的数字') => ({
    type: 'number',
    message,
    trigger: 'change'
  }),

  integer: (message = '请输入有效的整数') => ({
    type: 'integer',
    message,
    trigger: 'change'
  }),

  url: (message = '请输入有效的URL地址') => ({
    type: 'url',
    message,
    trigger: 'change'
  }),

  custom: (validator, message) => ({
    validator,
    message,
    trigger: 'change'
  })
}

/**
 * Validation helper functions
 */
export const ValidationHelpers = {
  isEmail: (value) => EMAIL_REGEX.test(value),
  
  isPhone: (value) => PHONE_REGEX.test(value),
  
  isPassword: (value) => PASSWORD_REGEX.test(value),
  
  isUsername: (value) => USERNAME_REGEX.test(value),
  
  isStudentId: (value) => STUDENT_ID_REGEX.test(value),
  
  isEmpty: (value) => {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === 'object') return Object.keys(value).length === 0
    return false
  },
  
  isValidLength: (value, min, max) => {
    const length = value ? value.length : 0
    return length >= min && length <= max
  },
  
  isNumeric: (value) => {
    return !isNaN(Number(value)) && !isNaN(parseFloat(value))
  },
  
  isInteger: (value) => {
    return Number.isInteger(Number(value))
  },
  
  isUrl: (value) => {
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Custom validators for specific business logic
 */
export const CustomValidators = {
  // Validate password confirmation
  confirmPassword: (originalPassword) => {
    return (rule, value) => {
      return new Promise((resolve, reject) => {
        if (value !== originalPassword) {
          reject(new Error('两次输入的密码不一致'))
        } else {
          resolve()
        }
      })
    }
  },

  // Validate unique username (would need API call)
  uniqueUsername: (checkFn) => {
    return async (rule, value) => {
      if (!value) return
      const isUnique = await checkFn(value)
      if (!isUnique) {
        throw new Error('用户名已存在')
      }
    }
  },

  // Validate unique email (would need API call)
  uniqueEmail: (checkFn) => {
    return async (rule, value) => {
      if (!value) return
      const isUnique = await checkFn(value)
      if (!isUnique) {
        throw new Error('邮箱已被使用')
      }
    }
  },

  // Validate date range
  dateRange: (startDate, endDate) => {
    return (rule, value) => {
      return new Promise((resolve, reject) => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const current = new Date(value)
        
        if (current < start || current > end) {
          reject(new Error(`日期应在${startDate}到${endDate}之间`))
        } else {
          resolve()
        }
      })
    }
  },

  // Validate file size
  fileSize: (maxSizeInMB) => {
    return (rule, value) => {
      return new Promise((resolve, reject) => {
        if (!value) {
          resolve()
          return
        }
        
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024
        if (value.size > maxSizeInBytes) {
          reject(new Error(`文件大小不能超过${maxSizeInMB}MB`))
        } else {
          resolve()
        }
      })
    }
  },

  // Validate file type
  fileType: (allowedTypes) => {
    return (rule, value) => {
      return new Promise((resolve, reject) => {
        if (!value) {
          resolve()
          return
        }
        
        const fileType = value.type
        if (!allowedTypes.includes(fileType)) {
          reject(new Error(`只允许上传${allowedTypes.join('、')}格式的文件`))
        } else {
          resolve()
        }
      })
    }
  }
}
