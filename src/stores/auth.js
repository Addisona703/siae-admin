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

      // Store tokens
      TokenManager.setAccessToken(result.data.accessToken)
      TokenManager.setRefreshToken(result.data.refreshToken)
      TokenManager.setTokenExpires(result.data.expiresIn)
      console.log('Auth Store - Token 已保存')

      // Handle different response formats from backend
      // Backend might return userInfo nested object or flat properties
      const responseData = result.data
      const userData = responseData.userInfo || {
        id: responseData.id || null,
        username: responseData.username,
        email: responseData.email,
        avatar: responseData.avatar,
        roles: responseData.roles,
        permissions: responseData.permissions,
      }
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
      await logout()
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
    // Check if we have valid tokens
    if (TokenManager.hasValidToken()) {
      // Try to load user info from localStorage first
      const storedUserInfo = loadUserInfo()
      if (storedUserInfo) {
        userInfo.value = storedUserInfo
        // Initialize permissions from stored user info
        const { usePermissionStore } = await import('./permission')
        const permissionStore = usePermissionStore()
        permissionStore.initializePermissions()
      }

      try {
        // Fetch fresh user info from API
        const result = await authApi.getUserInfo()
        userInfo.value = result.data
        saveUserInfo(result.data)

        // Update permissions with fresh data
        const { usePermissionStore } = await import('./permission')
        const permissionStore = usePermissionStore()
        permissionStore.initializePermissions()
      } catch (error) {
        // If fetching user info fails, clear tokens
        await logout()
      }
    } else {
      // No valid token, clear any stored user info
      clearUserInfo()
    }
  }

  const updateUserInfo = (newUserInfo) => {
    userInfo.value = newUserInfo
    saveUserInfo(newUserInfo)
  }

  return {
    // State
    userInfo: null,
    isLoading: false,
    // Getters
    isAuthenticated,
    currentUser,

    // Actions
    login,
    logout,
    refreshToken,
    initializeAuth,
    updateUserInfo,
  }
})
