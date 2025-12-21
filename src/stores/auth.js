import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'

import { TokenManager } from '@/utils/token'
import { authApi } from '@/api/auth'

const USER_INFO_KEY = 'user_info'

// Helper functions for user info storage
const saveUserInfo = (info) => {
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(info))
}

const loadUserInfo = () => {
  const stored = localStorage.getItem(USER_INFO_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

const clearUserInfo = () => {
  localStorage.removeItem(USER_INFO_KEY)
}

export const useAuthStore = defineStore('auth', () => {
  // State - try to load from localStorage first
  const userInfo = ref(loadUserInfo())
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => {
    return !!(userInfo.value && TokenManager.hasValidToken())
  })

  const currentUser = computed(() => userInfo.value)

  // Actions
  const login = async (credentials) => {
    try {
      isLoading.value = true
      console.log('Auth Store - 开始登录请求')
      const result = await authApi.login(credentials)
      console.log('Auth Store - 登录响应:', result)

      // Store tokens first
      console.log('Auth Store - 完整响应结构:', JSON.stringify(result, null, 2))
      console.log('Auth Store - result.data:', result.data)
      console.log('Auth Store - result.data.accessToken:', result.data?.accessToken)
      
      const tokenData = result.data
      if (!tokenData?.accessToken) {
        console.error('Auth Store - 响应中没有 accessToken!')
        throw new Error('登录响应格式错误：缺少 accessToken')
      }
      
      TokenManager.setAccessToken(tokenData.accessToken)
      TokenManager.setRefreshToken(tokenData.refreshToken)
      TokenManager.setTokenExpires(tokenData.expiresIn)
      
      console.log('Auth Store - Token 已保存，验证:', {
        savedAccessToken: localStorage.getItem('access_token')?.substring(0, 20) + '...',
        savedRefreshToken: localStorage.getItem('refresh_token')?.substring(0, 20) + '...',
        savedExpires: localStorage.getItem('token_expires'),
      })

      // Fetch complete user info from /me endpoint
      console.log('Auth Store - 获取完整用户信息...')
      const userResult = await authApi.getUserInfo()
      console.log('Auth Store - 用户信息响应:', userResult)

      const userData = userResult.data
      userInfo.value = userData
      saveUserInfo(userData)
      console.log('Auth Store - 用户信息已保存:', userInfo.value)
      console.log('Auth Store - 认证状态:', isAuthenticated.value)

      // Initialize permissions
      const { usePermissionStore } = await import('./permission')
      const permissionStore = usePermissionStore()
      permissionStore.initializePermissions()
      console.log('Auth Store - 权限已初始化')
    } catch (error) {
      console.error('Auth Store - 登录失败:', error)
      // Clear any partial state
      // await logout()
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    try {
      // Call logout API if user is authenticated
      if (isAuthenticated.value) {
        await authApi.logout()
      }
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed', error)
    } finally {
      // Clear local state
      userInfo.value = null
      TokenManager.clearTokens()
      clearUserInfo()

      // Clear permissions
      const { usePermissionStore } = await import('./permission')
      const permissionStore = usePermissionStore()
      permissionStore.clearPermissions()
    }
  }

  const refreshToken = async () => {
    try {
      const refreshTokenValue = TokenManager.getRefreshToken()
      if (!refreshTokenValue) {
        return false
      }

      const result = await authApi.refreshToken(refreshTokenValue)

      // Update tokens
      TokenManager.setAccessToken(result.data.accessToken)
      TokenManager.setTokenExpires(result.data.expiresIn)

      return true
    } catch (error) {
      // Refresh failed, clear tokens and user info
      await logout()
      return false
    }
  }

  const initializeAuth = async () => {
    // console.log('[Auth] initializeAuth called')

    // 先尝试从 localStorage 加载用户信息
    const storedUserInfo = loadUserInfo()
    if (storedUserInfo) {
      userInfo.value = storedUserInfo
    }

    // 检查是否有 token（不管是否过期）
    const hasToken = TokenManager.getAccessToken()
    const hasRefreshToken = TokenManager.getRefreshToken()

    if (!hasToken && !hasRefreshToken) {
      clearUserInfo()
      userInfo.value = null
      return
    }

    // 如果 access token 过期但有 refresh token，尝试刷新
    if (!TokenManager.hasValidToken() && hasRefreshToken) {
      const refreshed = await refreshToken()
      if (!refreshed) {
        return
      }
    }

    // 现在应该有有效的 token 了，获取用户信息
    if (TokenManager.hasValidToken()) {
      // 初始化权限
      if (storedUserInfo) {
        const { usePermissionStore } = await import('./permission')
        const permissionStore = usePermissionStore()
        permissionStore.initializePermissions()
      }

      try {
        // 从 API 获取最新用户信息
        const result = await authApi.getUserInfo()
        userInfo.value = result.data
        saveUserInfo(result.data)

        // 更新权限
        const { usePermissionStore } = await import('./permission')
        const permissionStore = usePermissionStore()
        permissionStore.initializePermissions()
      } catch (error) {
        console.error('[Auth] getUserInfo failed:', error)
        // 获取用户信息失败，但不清除本地存储的信息（可能只是网络问题）
        // 只有在没有本地用户信息时才登出
        if (!storedUserInfo) {
          await logout()
        }
      }
    }
  }

  const updateUserInfo = (newUserInfo) => {
    userInfo.value = newUserInfo
    saveUserInfo(newUserInfo)
  }

  // OAuth 登录时设置 tokens
  const setTokens = async (accessToken, refreshToken) => {
    TokenManager.setAccessToken(accessToken)
    if (refreshToken) {
      TokenManager.setRefreshToken(refreshToken)
    }
    
    // 获取用户信息
    try {
      const result = await authApi.getUserInfo()
      userInfo.value = result.data
      saveUserInfo(result.data)
      
      // 初始化权限
      const { usePermissionStore } = await import('./permission')
      const permissionStore = usePermissionStore()
      permissionStore.initializePermissions()
    } catch (error) {
      console.error('OAuth setTokens - 获取用户信息失败:', error)
      throw error
    }
  }

  return {
    // State
    userInfo,
    isLoading,
    // Getters
    isAuthenticated,
    currentUser,

    // Actions
    login,
    logout,
    refreshToken,
    initializeAuth,
    updateUserInfo,
    setTokens,
  }
})
