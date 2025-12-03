// Logging and audit related types (JSDoc definitions for JavaScript)

/**
 * @typedef {Object} AuditLog
 * @property {number} id - Log ID
 * @property {string} action - Action performed
 * @property {string} ipAddress - IP address
 * @property {string} userAgent - User agent string
 * @property {string} createdAt - Creation time
 * @property {Object} [details] - Additional details
 */

/**
 * @typedef {Object} LoginLog
 * @property {number} id - Log ID
 * @property {string} username - Username
 * @property {string} status - Login status
 * @property {string} ipAddress - IP address
 * @property {string} loginAt - Login time
 * @property {string} [failureReason] - Failure reason if failed
 */

export default {}
