// AI Chat API service
import { get, post, put, del } from './client'
import { apiClient } from './client'

export const chatApi = {
  /**
   * Synchronous chat - send message and wait for complete AI response
   * @param request Chat request object
   * @param request.sessionId Session ID (optional, creates new session if not provided)
   * @param request.message User message content
   * @param request.fileIds Array of file IDs to attach (optional)
   * @returns Promise with chat response containing AI reply and tool call info
   */
  chat: async (request) => {
    return post('/ai/chat', request)
  },

  /**
   * Stream chat using Server-Sent Events (SSE)
   * Returns AI response in real-time streaming format
   * @param params Query parameters
   * @param params.message User message content (required)
   * @param params.sessionId Session ID (optional)
   * @param params.model Model name (optional, uses default if not provided)
   * @param params.fileIds Comma-separated file IDs (optional)
   * @returns Object with reader and response for streaming
   */
  chatStream: async (params) => {
    const queryParams = new URLSearchParams()
    queryParams.append('message', params.message)
    if (params.sessionId) queryParams.append('sessionId', params.sessionId)
    if (params.model) queryParams.append('model', params.model)
    if (params.fileIds) queryParams.append('fileIds', params.fileIds)

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
   * Stream chat with thinking process using Server-Sent Events (SSE)
   * Returns AI response including thinking process in real-time
   * @param params Query parameters
   * @param params.message User message content (required)
   * @param params.sessionId Session ID (optional)
   * @param params.model Model name (optional, uses default if not provided)
   * @param params.fileIds Comma-separated file IDs (optional)
   * @param params.enableThinking Enable thinking mode (optional, default false)
   * @returns Object with reader and response for streaming
   */
  chatStreamWithThinking: async (params) => {
    const queryParams = new URLSearchParams()
    queryParams.append('message', params.message)
    if (params.sessionId) queryParams.append('sessionId', params.sessionId)
    if (params.model) queryParams.append('model', params.model)
    if (params.fileIds) queryParams.append('fileIds', params.fileIds)
    // 传递 enableThinking 参数
    queryParams.append('enableThinking', params.enableThinking ? 'true' : 'false')

    const token = localStorage.getItem('accessToken')
    const url = `${apiClient.defaults.baseURL}/ai/chat/stream/thinking?${queryParams.toString()}`
    
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
   * Clear session and delete all message records
   * @param sessionId Session ID
   * @returns Promise with void result
   */
  clearSession: async (sessionId) => {
    return del(`/ai/sessions/${sessionId}`)
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
   * Get available AI models
   * @returns Promise with array of available model names
   */
  getAvailableModels: async () => {
    return get('/ai/models')
  },

  /**
   * Delete a chat session
   * @param sessionId Session ID to delete
   * @returns Promise with void result
   */
  deleteSession: async (sessionId) => {
    return del(`/ai/sessions/${sessionId}/delete`)
  },

  /**
   * Update session title
   * @param sessionId Session ID
   * @param title New title
   * @returns Promise with void result
   */
  updateSessionTitle: async (sessionId, title) => {
    return put(`/ai/sessions/${sessionId}/title`, { title })
  }
}
