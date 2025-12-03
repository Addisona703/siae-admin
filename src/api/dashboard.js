// Dashboard and logging API service
import { get, post } from './client'

export const dashboardApi = {
  // ========== Dashboard Statistics ==========

  /**
   * Get overall dashboard statistics including daily active users and registrations
   * @param days Number of days to look back (default 30)
   * @returns Promise with dashboard stats
   */
  getDashboardStats: async (days = 30) => {
    return get(`/auth/logs/dashboard/stats/${days}`)
  },

  /**
   * Get user activity statistics over time
   * @param params Date range and grouping parameters
   * @returns Promise with user activity data
   */
  getUserActivityStats: async (params) => {
    return get('/dashboard/user-activity', { params })
  },

  /**
   * Get content creation statistics over time
   * @param params Date range and grouping parameters
   * @returns Promise with content creation data
   */
  getContentCreationStats: async (params) => {
    return get('/dashboard/content-creation', { params })
  },

  /**
   * Get content creation statistics for bar chart
   * @param days Number of days to look back (default 30)
   * @returns Promise with chart data series
   */
  getContentCreationChart: async (days = 30) => {
    return get('/dashboard/charts/content-creation', { params: { days } })
  },

  /**
   * Get content type distribution for pie chart
   * @returns Promise with content type distribution data
   */
  getContentTypeDistribution: async () => {
    return get('/dashboard/content-type-distribution')
  },

  /**
   * Get popular content list
   * @param params Filter and pagination parameters
   * @returns Promise with popular content list
   */
  getPopularContent: async (params) => {
    return get('/dashboard/popular-content', { params })
  },

  /**
   * Get system health status
   * @returns Promise with system health data
   */
  getSystemHealth: async () => {
    return get('/dashboard/system-health')
  },

  /**
   * Get real-time statistics (for auto-refresh)
   * @returns Promise with real-time stats
   */
  getRealTimeStats: async () => {
    return get('/dashboard/real-time')
  },

  // ========== Login Logs ==========

  /**
   * Get paginated login logs
   * @param pageDTO Pagination and filter parameters
   * @returns Promise with paginated login logs
   */
  getLoginLogs: async (pageDTO) => {
    return post('/auth/logs/login', pageDTO)
  },

  /**
   * Get login log by ID
   * @param id Login log ID
   * @returns Promise with login log details
   */
  getLoginLogById: async (id) => {
    return get(`/logs/login/${id}`)
  },

  /**
   * Get failed login attempts (security monitoring)
   * @param params Pagination and filter parameters
   * @returns Promise with failed login attempts
   */
  getFailedLoginAttempts: async (params) => {
    return get('/logs/audit', { params })
  },

  /**
   * Get audit log by ID
   * @param id Audit log ID
   * @returns Promise with audit log details
   */
  getAuditLogById: async (id) => {
    return get(`/logs/audit/${id}`)
  },

  /**
   * Get content moderation audit records
   * @param params Pagination and filter parameters
   * @returns Promise with content audit records
   */
  getContentAuditLogs: async (params) => {
    return get('/logs/audit/content-moderation', { params })
  },

  /**
   * Get user activity audit records
   * @param params Pagination and filter parameters
   * @returns Promise with user activity audit records
   */
  getUserActivityLogs: async (params) => {
    return get('/logs/audit/user-activity', { params })
  },

  /**
   * Export audit logs to CSV
   * @param params Filter parameters for export
   * @returns Promise with CSV download URL
   */
  exportAuditLogs: async (params) => {
    return get('/logs/system', { params })
  },

  /**
   * Get system log by ID
   * @param id System log ID
   * @returns Promise with system log details
   */
  getSystemLogById: async (id) => {
    return get(`/logs/system/${id}`)
  },

  /**
   * Get error logs (level)
   * @param params Pagination and filter parameters
   * @returns Promise with error logs
   */
  getErrorLogs: async (params) => {
    return get('/logs/system/errors', { params })
  },

  /**
   * Get log level statistics
   * @param params Date range parameters
   * @returns Promise with log level distribution
   */
  getLogLevelStats: async (params) => {
    return get('/logs/system/stats', { params })
  },

  /**
   * Resolve critical event
   * @param eventId Event ID
   * @returns Promise with result
   */
  resolveCriticalEvent: async (eventId) => {
    return post(`/logs/critical-events/${eventId}/resolve`)
  }
}
