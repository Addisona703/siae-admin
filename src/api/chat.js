// AI Chat API service
import { get, put, del } from './client'
import { apiClient } from './client'

export const chatApi = {
  /**
   * Unified chat using Server-Sent Events (SSE)
   * Supports content, thinking, tool calls and tool results
   * Response types:
   * - type=content: Normal content
   * - type=thinking: Reasoning process (e.g., DeepSeek)
   * - type=tool_call: Tool call request
   * - type=tool_result: Tool execution result
   * - type=done: Completion
   * - type=error: Error
   * @param params Query parameters
   * @param params.message User message content (required)
   * @param params.sessionId Session ID (optional)
   * @param params.provider Provider name (optional)
   * @param params.model Model name (optional)
   * @param params.enableTools Enable tool calls (default: true)
   * @returns Response object for streaming
   */
  chatUnified: async (params) => {
    const queryParams = new URLSearchParams()
    queryParams.append('message', params.message)
    if (params.sessionId) queryParams.append('sessionId', params.sessionId)
    if (params.provider) queryParams.append('provider', params.provider)
    if (params.model) queryParams.append('model', params.model)
    queryParams.append('enableTools', params.enableTools !== false ? 'true' : 'false')

    const token = localStorage.getItem('accessToken')
    const url = `${apiClient.defaults.baseURL}/ai/chat/unified?${queryParams.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  },

  /**
   * Stream chat using Server-Sent Events (SSE) - Basic version
   * Returns AI response in real-time streaming format
   * @param params Query parameters
   * @param params.message User message content (required)
   * @param params.sessionId Session ID (optional)
   * @param params.provider Provider name (optional, uses default if not provided)
   * @param params.model Model name (optional, uses provider default if not provided)
   * @returns Response object for streaming
   */
  chatStream: async (params) => {
    const queryParams = new URLSearchParams()
    queryParams.append('message', params.message)
    if (params.sessionId) queryParams.append('sessionId', params.sessionId)
    if (params.provider) queryParams.append('provider', params.provider)
    if (params.model) queryParams.append('model', params.model)

    const token = localStorage.getItem('accessToken')
    const url = `${apiClient.defaults.baseURL}/ai/chat/stream?${queryParams.toString()}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'text/event-stream',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  },

  /**
   * Get conversation history for a specific session
   * @param sessionId Session ID
   * @returns Promise with array of chat messages
   */
  getHistory: async (sessionId) => {
    return get(`/ai/sessions/${sessionId}/history`)
  },

  /**
   * Get current user's session list (lightweight, without message content)
   * @param limit Number of sessions to return (default: 20)
   * @returns Promise with array of session list items
   */
  getSessionList: async (limit = 20) => {
    return get('/ai/sessions', { params: { limit } })
  },

  /**
   * Get available providers and their models
   * @returns Promise with provider info map
   */
  getProviders: async () => {
    return get('/ai/providers')
  },

  /**
   * Delete a chat session
   * @param sessionId Session ID to delete
   * @returns Promise with void result
   */
  deleteSession: async (sessionId) => {
    return del(`/ai/sessions/${sessionId}`)
  },

  /**
   * Update session title
   * @param sessionId Session ID
   * @param title New title
   * @returns Promise with void result
   */
  updateSessionTitle: async (sessionId, title) => {
    return put(`/ai/sessions/${sessionId}/title`, { title })
  },

  /**
   * Generate image using CogView-4
   * @param params Image generation parameters
   * @param params.prompt Image description prompt (required)
   * @param params.model Model name (default: cogview-4-250304)
   * @param params.size Image size (default: 1024x1024)
   * @param params.n Number of images (default: 1)
   * @returns Promise with generated image URLs
   */
  generateImage: async (params) => {
    const { post } = await import('./client')
    return post('/ai/media/image', params)
  },

  /**
   * Generate video using CogVideoX-3 (async)
   * @param params Video generation parameters
   * @param params.prompt Video description prompt (required)
   * @param params.model Model name (default: cogvideox-3)
   * @param params.imageUrl Reference image URL (optional)
   * @param params.size Video size (default: 1920x1080)
   * @param params.fps Frame rate 30 or 60 (default: 30)
   * @param params.withAudio Include AI audio (default: false)
   * @param params.quality Output mode: quality or speed (default: speed)
   * @param params.duration Video duration 5 or 10 seconds (default: 5)
   * @returns Promise with task ID
   */
  generateVideo: async (params) => {
    const { post } = await import('./client')
    return post('/ai/media/video', params)
  },

  /**
   * Get video generation result
   * @param taskId Task ID from generateVideo
   * @returns Promise with video result (status and URLs)
   */
  getVideoResult: async (taskId) => {
    return get(`/ai/media/video/${taskId}`)
  }
}
