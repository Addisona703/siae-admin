// Token management utilities
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRES_KEY = 'token_expires'

export class TokenManager {
  static setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  }

  static getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  }

  static setRefreshToken(token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }

  static getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  static setTokenExpires(expiresIn) {
    const expiresAt = Date.now() + expiresIn * 1000
    localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt.toString())
  }

  static getTokenExpires() {
    const expires = localStorage.getItem(TOKEN_EXPIRES_KEY)
    return expires ? parseInt(expires, 10) : null
  }

  static isTokenExpiring(thresholdMs = 300000) {
    const expires = this.getTokenExpires()
    if (!expires) return true
    return Date.now() + thresholdMs >= expires
  }

  static clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRES_KEY)
  }

  static hasValidToken() {
    const token = this.getAccessToken()
    const expires = this.getTokenExpires()
    const now = Date.now()
    return !!(token && expires && now < expires)
  }
}
