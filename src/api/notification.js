// Notification API service
import { get, post, put, del } from './client'

export const notificationApi = {
  // ========== Email Verification ==========

  /**
   * Send email verification code
   * @param email Email address
   * @returns Promise with result
   */
  sendEmailCode: async (email) => {
    return post('/notification/email/code/send', null, { 
      params: { email }
    })
  },

  /**
   * Verify email code
   * @param email Email address
   * @param code Verification code
   * @returns Promise with result
   */
  verifyEmailCode: async (email, code) => {
    return post('/notification/email/code/verify', {
      email,
      code
    })
  },

  // ========== Notification Management ==========

  /**
   * Send notification to user
   * @param notificationData Notification data
   * @returns Promise with notification ID
   */
  sendNotification: async (notificationData) => {
    return post('/notification/send', notificationData)
  },

  /**
   * Get my notifications
   * @param params Pagination and filter parameters
   * @returns Promise with paginated notifications
   */
  getMyNotifications: async (params) => {
    return get('/notification/my', { params })
  },

  /**
   * Get unread notification count
   * @returns Promise with unread count
   */
  getUnreadCount: async () => {
    return get('/notification/unread-count')
  },

  /**
   * Mark notification as read
   * @param id Notification ID
   * @returns Promise with result
   */
  markAsRead: async (id) => {
    return put(`/notification/${id}/read`)
  },

  /**
   * Mark all notifications as read
   * @returns Promise with result
   */
  markAllAsRead: async () => {
    return put('/notification/read-all')
  },

  /**
   * Delete notification
   * @param id Notification ID
   * @returns Promise with result
   */
  deleteNotification: async (id) => {
    return del(`/notification/${id}`)
  },

  // ========== Email Log Management ==========

  /**
   * Get email send logs
   * @param params Query parameters
   * @returns Promise with paginated email logs
   */
  getEmailLogs: async (params) => {
    return get('/notification/email/logs', { params })
  },

  /**
   * Retry sending email
   * @param id Email log ID
   * @returns Promise with result
   */
  retryEmail: async (id) => {
    return post(`/notification/email/logs/${id}/retry`)
  },

  // ========== SMS Log Management ==========

  /**
   * Get SMS send logs
   * @param params Query parameters
   * @returns Promise with paginated SMS logs
   */
  getSmsLogs: async (params) => {
    return get('/notification/sms/logs', { params })
  },

  /**
   * Retry sending SMS
   * @param id SMS log ID
   * @returns Promise with result
   */
  retrySms: async (id) => {
    return post(`/notification/sms/logs/${id}/retry`)
  },

  // ========== Email Template Testing ==========

  /**
   * Test register code email template
   * @param params Template parameters
   * @returns Promise with result
   */
  testRegisterCodeTemplate: async (params) => {
    return post('/notification/email/template/test/register-code', null, { params })
  },

  /**
   * Test login code email template
   * @param params Template parameters
   * @returns Promise with result
   */
  testLoginCodeTemplate: async (params) => {
    return post('/notification/email/template/test/login-code', null, { params })
  },

  /**
   * Test system notice email template
   * @param params Template parameters
   * @returns Promise with result
   */
  testSystemNoticeTemplate: async (params) => {
    return post('/notification/email/template/test/system-notice', null, { params })
  },

  /**
   * Test comment reply email template
   * @param params Template parameters
   * @returns Promise with result
   */
  testCommentReplyTemplate: async (params) => {
    return post('/notification/email/template/test/comment-reply', null, { params })
  },

  /**
   * Test content audit email template
   * @param params Template parameters
   * @returns Promise with result
   */
  testContentAuditTemplate: async (params) => {
    return post('/notification/email/template/test/content-audit', null, { params })
  },

  /**
   * Test activity invite email template
   * @param params Template parameters
   * @returns Promise with result
   */
  testActivityInviteTemplate: async (params) => {
    return post('/notification/email/template/test/activity-invite', null, { params })
  },

  /**
   * Test activity reminder email template
   * @param params Template parameters
   * @returns Promise with result
   */
  testActivityReminderTemplate: async (params) => {
    return post('/notification/email/template/test/activity-reminder', null, { params })
  },

  // ========== Message Publishing ==========

  /**
   * Broadcast system notification
   * @param data System notification data
   * @returns Promise with result
   */
  broadcastSystemNotification: async (data) => {
    return post('/notification/system/broadcast', data)
  },

  /**
   * Send batch emails
   * @param data Email data
   * @returns Promise with result
   */
  sendBatchEmails: async (data) => {
    return post('/notification/email/batch', data)
  },

  /**
   * Send batch SMS
   * @param data SMS data
   * @returns Promise with result
   */
  sendBatchSms: async (data) => {
    return post('/notification/sms/batch', data)
  }
}
