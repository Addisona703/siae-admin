// Token 管理工具
const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRES_KEY = 'token_expires'
const ACCESS_TOKEN_COOKIE = 'ACCESS_TOKEN'

// Cookie 工具函数
const setCookie = (name, value, days = 7) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  // 设置 SameSite=Lax 以支持跨域 SSE 请求
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export class TokenManager {
  static setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
    // 同时设置 Cookie，用于 SSE 连接认证
    setCookie(ACCESS_TOKEN_COOKIE, token)
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
    // 同时清除 Cookie
    deleteCookie(ACCESS_TOKEN_COOKIE)
  }

  static hasValidToken() {
    const token = this.getAccessToken()
    const expires = this.getTokenExpires()
    const now = Date.now()
    return !!(token && expires && now < expires)
  }
}
