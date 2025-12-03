// Authentication API service
import { post, get } from './client'

export const authApi = {
  /**
   * User login with email and password
   * @param credentials Login credentials (email, password)
   * @returns Promise with login response containing tokens and user info
   */
  login: async (credentials) => {
    return post('/auth/login', credentials, { skipAuth: true, skipErrorHandler: false })
  },

  /**
   * User logout - invalidates current session
   * @returns Promise with void result
   */
  logout: async () => {
    return post('/auth/logout')
  },

  /**
   * Refresh access token using refresh token
   * @param refreshToken The refresh token
   * @returns Promise with new access token and expiration
   */
  refreshToken: async (refreshToken) => {
    const request = { refreshToken }
    return post('/auth/refresh-token', request, {
      skipAuth: true,
      skipRefresh: true,
    })
  },

  /**
   * Get current user's permissions
   * @returns Promise with array of permission codes
   */
  getUserPermissions: async () => {
    return get('/auth/me')
  },

  /**
   * Get current user information
   * @returns Promise with user info
   */
  getUserInfo: async () => {
    return get('/auth/me')
  },

  /**
   * Verify if current token is valid
   * @returns Promise with boolean result
   */
  verifyToken: async () => {
    return get('/auth/me')
  },

  /**
   * Change user password
   * @param oldPassword Current password
   * @param newPassword New password
   * @returns Promise with void result
   */
  changePassword: async (oldPassword, newPassword) => {
    return post('/auth/change-password', {
      oldPassword,
      newPassword,
    })
  },
}
