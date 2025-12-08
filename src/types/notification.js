// 通知相关类型 (JavaScript JSDoc 定义)

/**
 * @typedef {Object} NotificationVO
 * @property {number} id - Notification ID
 * @property {string} title - Notification title
 * @property {string} content - Notification content
 * @property {string} type - Notification type
 * @property {boolean} isRead - Read status
 * @property {string} createdAt - Creation time
 */

/**
 * @typedef {Object} MessagePublishRequest
 * @property {string} title - Message title
 * @property {string} content - Message content
 * @property {Array<number>} [targetUserIds] - Target user IDs
 * @property {boolean} [sendToAll] - Send to all users
 */

export default {}
