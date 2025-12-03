// Authentication related types (JSDoc definitions for JavaScript)

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} accessToken - JWT access token
 * @property {string} refreshToken - JWT refresh token
 * @property {number} expiresIn - Token expiration time in seconds
 * @property {UserInfo} userInfo - User information
 */

/**
 * @typedef {Object} UserInfo
 * @property {number} id - User ID
 * @property {string} username - Username
 * @property {string} email - User email
 * @property {string} [avatar] - Avatar URL
 * @property {Array<string>} roles - User roles
 * @property {Array<string>} permissions - User permissions
 */

export default {}
