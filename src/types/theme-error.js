// Theme-specific error types (JavaScript constants)

/**
 * Theme error codes
 */
export const ThemeErrorCode = {
  LAYOUT_LOAD_FAILED: 'LAYOUT_LOAD_FAILED',
  STYLE_LOAD_FAILED: 'STYLE_LOAD_FAILED',
  THEME_NOT_FOUND: 'THEME_NOT_FOUND',
  THEME_SWITCH_TIMEOUT: 'THEME_SWITCH_TIMEOUT',
  THEME_INIT_FAILED: 'THEME_INIT_FAILED',
  STORAGE_ACCESS_FAILED: 'STORAGE_ACCESS_FAILED',
  INVALID_THEME_CONFIG: 'INVALID_THEME_CONFIG',
  CACHE_OPERATION_FAILED: 'CACHE_OPERATION_FAILED'
}

/**
 * @typedef {Object} ThemeError
 * @property {string} code - Error code from ThemeErrorCode
 * @property {string} message - Error message
 * @property {*} [details] - Additional error details
 */

export default ThemeErrorCode
