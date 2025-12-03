// HTTP client configuration
import axios from 'axios'
import { APP_CONFIG } from '@/config/app.config'
import { TokenManager } from '@/utils/token'
import { handleApiError } from '@/utils/error'

// Base axios instance
// axios.defaults.withCredentials = true

// export const apiClient = axios.create({
//   // baseURL: APP_CONFIG.apiBaseUrl,
//   timeout: APP_CONFIG.apiTimeout,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

// Flag to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue = []

// Process failed queue after refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })

  failedQueue = []
}

// Refresh token function
const refreshAccessToken = async () => {
  const refreshToken = TokenManager.getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  try {
    const response = await axios.post(
      `${APP_CONFIG.apiBaseUrl}/auth/refresh`,
      { refreshToken },
      { timeout: APP_CONFIG.apiTimeout },
    )

    const { accessToken, expiresIn } = response.data.data
    TokenManager.setAccessToken(accessToken)
    TokenManager.setTokenExpires(expiresIn)

    return accessToken
  } catch (error) {
    TokenManager.clearTokens()
    throw error
  }
}

// Request interceptor with proactive token refresh
// apiClient.interceptors.request.use(
//   async (config) => {
//     // Skip auth for login and refresh endpoints
//     if (config.skipAuth) {
//       return config
//     }

//     const accessToken = TokenManager.getAccessToken()

//     // If no token, let the request proceed (will be handled by response interceptor)
//     if (!accessToken) {
//       return config
//     }

//     // Check if token is expiring within threshold and proactively refresh
//     if (TokenManager.isTokenExpiring(APP_CONFIG.tokenRefreshThreshold)) {
//       try {
//         // If already refreshing, wait for it to complete
//         if (isRefreshing) {
//           const newToken = await new Promise((resolve, reject) => {
//             failedQueue.push({ resolve, reject })
//           })
//           config.headers.Authorization = `Bearer ${newToken}`
//           return config
//         }

//         isRefreshing = true
//         const newToken = await refreshAccessToken()
//         processQueue(null, newToken)
//         config.headers.Authorization = `Bearer ${newToken}`
//       } catch (error) {
//         processQueue(error, null)
//         // If proactive refresh fails, continue with current token
//         // The response interceptor will handle 401 errors
//         config.headers.Authorization = `Bearer ${accessToken}`
//       } finally {
//         isRefreshing = false
//       }
//     } else {
//       // Token is still valid, use it
//       config.headers.Authorization = `Bearer ${accessToken}`
//     }

//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   },
// )

// Response interceptor with passive token refresh
// apiClient.interceptors.response.use(
//   (response) => {
//     return response
//   },
//   async (error) => {
//     const originalRequest = error.config

//     // Handle 401 errors with token refresh fallback
//     if (error.response?.status === 401 && !originalRequest.skipRefresh) {
//       // Prevent infinite loops
//       if (originalRequest._retry) {
//         TokenManager.clearTokens()
//         // Redirect to login - this will be handled by the router
//         window.location.href = '/login'
//         return Promise.reject(error)
//       }

//       originalRequest._retry = true

//       try {
//         // If already refreshing, wait for it to complete
//         if (isRefreshing) {
//           const newToken = await new Promise((resolve, reject) => {
//             failedQueue.push({ resolve, reject })
//           })
//           originalRequest.headers.Authorization = `Bearer ${newToken}`
//           return apiClient(originalRequest)
//         }

//         isRefreshing = true
//         const newToken = await refreshAccessToken()
//         processQueue(null, newToken)

//         // Retry original request with new token
//         originalRequest.headers.Authorization = `Bearer ${newToken}`
//         return apiClient(originalRequest)
//       } catch (refreshError) {
//         processQueue(refreshError, null)
//         TokenManager.clearTokens()

//         // Show user-friendly error message
//         handleApiError(refreshError, {
//           customMessage: 'Session expired, please login again',
//         })

//         // Redirect to login
//         setTimeout(() => {
//           window.location.href = '/login'
//         }, 1000)

//         return Promise.reject(refreshError)
//       } finally {
//         isRefreshing = false
//       }
//     }

//     // Skip error handler if requested
//     if (originalRequest.skipErrorHandler) {
//       return Promise.reject(error)
//     }

//     // Handle other API errors with user-friendly messages
//     if (error.response) {
//       const { status, data } = error.response
//       let message = 'Operation failed, please try again'

//       switch (status) {
//         case 400:
//           message = data?.message || 'Invalid request parameters'
//           break
//         case 403:
//           message = 'Permission denied, unable to perform this operation'
//           break
//         case 404:
//           message = 'Requested resource not found'
//           break
//         case 500:
//           message = 'Server internal error, please try again later'
//           break
//         case 502:
//         case 503:
//         case 504:
//           message = 'Service temporarily unavailable, please try again later'
//           break
//         default:
//           message = data?.message || message
//       }

//       // Create a more structured error object
//       const apiError = {
//         code: status,
//         message,
//         details: data,
//       }

//       // Use centralized error handler
//       handleApiError(
//         { ...error, apiError },
//         {
//           showMessage: true,
//         },
//       )

//       return Promise.reject({ ...error, apiError })
//     }

//     // Network errors - use centralized error handler
//     handleApiError(error, {
//       showMessage: true,
//     })

//     return Promise.reject(error)
//   },
// )

// Helper function for making API calls with proper typing
export const makeRequest = (config) => {
  // return apiClient(config).then((response) => response.data)
}

// Helper functions for different HTTP methods
export const get = (url, config) => {
  return makeRequest({ ...config, method: 'GET', url })
}

export const post = (url, data, config) => {
  return makeRequest({ ...config, method: 'POST', url, data })
}

export const put = (url, data, config) => {
  return makeRequest({ ...config, method: 'PUT', url, data })
}

export const del = (url, config) => {
  return makeRequest({ ...config, method: 'DELETE', url })
}

export const patch = (url, data, config) => {
  return makeRequest({ ...config, method: 'PATCH', url, data })
}
