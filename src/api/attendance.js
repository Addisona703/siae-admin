// Attendance management API service
import { get, post, put, del } from './client'

// 考勤服务基础路径（通过网关访问）
const BASE_PATH = '/attendance'

export const attendanceApi = {
  // ========== Leave Request Management ==========

  /**
   * Get pending leave approvals (requires APPROVE permission)
   * @param pageDTO Pagination parameters
   * @returns Promise with paginated pending leaves
   */
  getPendingLeaves: async (pageDTO) => {
    return post(`${BASE_PATH}/leaves/pending`, pageDTO)
  },

  /**
   * Get leave request by ID
   * @param id Leave request ID
   * @returns Promise with leave detail (LeaveRequestDetailVO)
   */
  getLeaveById: async (id) => {
    return get(`${BASE_PATH}/leaves/${id}`)
  },

  /**
   * Approve or reject leave request
   * @param id Leave request ID
   * @param approvalData LeaveApprovalDTO {approved: Boolean, reason: String}
   * @returns Promise with void result
   */
  approveLeave: async (id, approvalData) => {
    return post(`${BASE_PATH}/leaves/${id}/approve`, approvalData)
  },

  /**
   * Advanced query with filters
   * @param pageDTO Pagination and filter parameters
   * @returns Promise with paginated leave list
   */
  getLeaveRequestPage: async (pageDTO) => {
    return post(`${BASE_PATH}/leaves/page`, pageDTO)
  },

  /**
   * Create leave request
   * @param dto LeaveRequestCreateDTO
   * @returns Promise with created leave request
   */
  createLeaveRequest: async (dto) => {
    return post(`${BASE_PATH}/leaves`, dto)
  },

  /**
   * Update leave request
   * @param id Leave request ID
   * @param dto LeaveRequestUpdateDTO
   * @returns Promise with updated leave request
   */
  updateLeaveRequest: async (id, dto) => {
    return put(`${BASE_PATH}/leaves/${id}`, dto)
  },

  /**
   * Cancel leave request
   * @param id Leave request ID
   * @returns Promise with result
   */
  cancelLeaveRequest: async (id) => {
    return post(`${BASE_PATH}/leaves/${id}/cancel`)
  },

  /**
   * Get my leave history
   * @param pageDTO Pagination and filter parameters
   * @returns Promise with paginated leave list
   */
  getMyLeaves: async (pageDTO) => {
    return post(`${BASE_PATH}/leaves/my-leaves`, pageDTO)
  },

  // ========== Attendance Rule Management ==========

  /**
   * Create attendance rule
   * @param dto AttendanceRuleCreateDTO
   * @returns Promise with created rule
   */
  createRule: async (dto) => {
    return post(`${BASE_PATH}/rules`, dto)
  },

  /**
   * Update attendance rule
   * @param id Rule ID
   * @param dto AttendanceRuleUpdateDTO
   * @returns Promise with updated rule
   */
  updateRule: async (id, dto) => {
    return put(`${BASE_PATH}/rules/${id}`, dto)
  },

  /**
   * Delete attendance rule
   * @param id Rule ID
   * @returns Promise with result
   */
  deleteRule: async (id) => {
    return del(`${BASE_PATH}/rules/${id}`)
  },

  /**
   * Get attendance rule list
   * @param status Rule status filter (optional)
   * @param attendanceType Attendance type filter (optional)
   * @param targetType Target type filter (optional)
   * @returns Promise with rule list
   */
  getRuleList: async (status, attendanceType, targetType) => {
    return get(`${BASE_PATH}/rules`, { params: { status, attendanceType, targetType } })
  },

  /**
   * Get attendance rule detail
   * @param id Rule ID
   * @returns Promise with rule detail (AttendanceRuleDetailVO)
   */
  getRuleDetail: async (id) => {
    return get(`${BASE_PATH}/rules/${id}`)
  },

  /**
   * Enable attendance rule
   * @param id Rule ID
   * @returns Promise with result
   */
  enableRule: async (id) => {
    return post(`${BASE_PATH}/rules/${id}/enable`)
  },

  /**
   * Disable attendance rule
   * @param id Rule ID
   * @returns Promise with result
   */
  disableRule: async (id) => {
    return post(`${BASE_PATH}/rules/${id}/disable`)
  },

  // ========== Attendance Record Management ==========

  /**
   * Get attendance record page with filters
   * @param pageDTO AttendanceQueryDTO with pagination and filters
   * @returns Promise with paginated attendance records
   */
  getRecordPage: async (pageDTO) => {
    return post(`${BASE_PATH}/records/page`, pageDTO)
  },

  /**
   * Get attendance record detail
   * @param id Record ID
   * @returns Promise with record detail (AttendanceRecordDetailVO)
   */
  getRecordDetail: async (id) => {
    return get(`${BASE_PATH}/records/${id}`)
  },

  /**
   * Export attendance records
   * @param params Export parameters (startDate, endDate, userId, status, format)
   * @returns Promise with blob file
   */
  exportRecords: async (params) => {
    return get(`${BASE_PATH}/records/export`, { params, responseType: 'blob' })
  },

  // ========== Attendance Statistics ==========

  /**
   * Get personal attendance statistics
   * @param userId User ID
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Promise with personal statistics (AttendanceStatisticsVO)
   */
  getPersonalStatistics: async (userId, startDate, endDate) => {
    return get(`${BASE_PATH}/statistics/personal/${userId}`, { params: { startDate, endDate } })
  },

  /**
   * Get department attendance statistics
   * @param departmentId Department ID
   * @param startDate Start date (YYYY-MM-DD)
   * @param endDate End date (YYYY-MM-DD)
   * @returns Promise with department statistics (DepartmentStatisticsVO)
   */
  getDepartmentStatistics: async (departmentId, startDate, endDate) => {
    return get(`${BASE_PATH}/statistics/department/${departmentId}`, { params: { startDate, endDate } })
  },

  /**
   * Generate attendance report
   * @param dto Report generation parameters
   * @returns Promise with generated report
   */
  generateReport: async (dto) => {
    return post(`${BASE_PATH}/statistics/report`, dto)
  },

  /**
   * Export attendance report
   * @param params Export parameters (reportId, format)
   * @returns Promise with blob file
   */
  exportReport: async (params) => {
    return get(`${BASE_PATH}/statistics/report/export`, { params, responseType: 'blob' })
  },

  // ========== Anomaly Handling ==========

  /**
   * Get anomaly page with filters
   * @param pageDTO AnomalyQueryDTO with pagination and filters
   * @returns Promise with paginated anomaly records
   */
  getAnomalyPage: async (pageDTO) => {
    return post(`${BASE_PATH}/anomalies/page`, pageDTO)
  },

  /**
   * Get anomaly detail
   * @param id Anomaly ID
   * @returns Promise with anomaly detail (AttendanceAnomalyVO)
   */
  getAnomalyDetail: async (id) => {
    return get(`${BASE_PATH}/anomalies/${id}`)
  },

  /**
   * Get unresolved anomalies
   * @param pageDTO Pagination parameters
   * @returns Promise with paginated unresolved anomalies
   */
  getUnresolvedAnomalies: async (pageDTO) => {
    return post(`${BASE_PATH}/anomalies/unresolved`, pageDTO)
  },

  /**
   * Handle anomaly
   * @param id Anomaly ID
   * @param dto AnomalyHandleDTO {resolution: String, remark: String}
   * @returns Promise with result
   */
  handleAnomaly: async (id, dto) => {
    return post(`${BASE_PATH}/anomalies/${id}/handle`, dto)
  }
}
