/**
 * SIAE Media 文件上传工具类
 * 支持单文件上传、分片上传、断点续传、秒传
 * 
 * @example
 * // Vue 中使用
 * import { MediaUploader } from '@/utils/upload-utils'
 * 
 * const uploader = new MediaUploader({
 *   baseUrl: '/api/v1/media',
 *   tenantId: '1',
 *   ownerId: '1'
 * })
 * 
 * // 简单上传
 * const result = await uploader.upload(file, {
 *   onProgress: (percent) => console.log(`${percent}%`)
 * })
 * 
 * // 分片上传大文件
 * const result = await uploader.upload(largeFile, {
 *   multipart: true,
 *   onProgress: (percent) => console.log(`${percent}%`)
 * })
 */

// 默认配置
const DEFAULT_CONFIG = {
  baseUrl: '/api/v1/media',
  tenantId: 'ai',
  ownerId: '',
  accessPolicy: 'PUBLIC',
  chunkSize: 10 * 1024 * 1024, // 10MB
  multipartThreshold: 100 * 1024 * 1024, // 100MB 自动启用分片
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 60000,
}

/**
 * 计算文件 SHA256（用于秒传）
 */
async function calculateSHA256(file) {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 计算分片 SHA256
 */
async function calculateChunkSHA256(chunk) {
  const buffer = await chunk.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 延迟函数
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 上传状态枚举
 */
export const UploadStatus = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ABORTED: 'aborted',
  PAUSED: 'paused',
}

/**
 * 上传任务类（用于断点续传）
 */
class UploadTask {
  constructor(file, options, uploader) {
    this.file = file
    this.options = options
    this.uploader = uploader
    this.uploadId = null
    this.fileId = null
    this.status = UploadStatus.PENDING
    this.progress = 0
    this.parts = []
    this.completedParts = []
    this.abortController = null
    this.error = null
  }

  /**
   * 暂停上传
   */
  pause() {
    if (this.status === UploadStatus.UPLOADING) {
      this.status = UploadStatus.PAUSED
      if (this.abortController) {
        this.abortController.abort()
      }
    }
  }

  /**
   * 恢复上传
   */
  async resume() {
    if (this.status === UploadStatus.PAUSED && this.uploadId) {
      this.status = UploadStatus.UPLOADING
      return this.uploader._resumeUpload(this)
    }
  }

  /**
   * 中止上传
   */
  async abort() {
    this.status = UploadStatus.ABORTED
    if (this.abortController) {
      this.abortController.abort()
    }
    if (this.uploadId) {
      await this.uploader._abortUpload(this.uploadId)
    }
  }
}

/**
 * 媒体上传器
 */
export class MediaUploader {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * 设置配置
   */
  setConfig(config) {
    this.config = { ...this.config, ...config }
  }

  /**
   * 上传文件（自动判断单文件/分片上传）
   * 
   * @param {File} file - 要上传的文件
   * @param {Object} options - 上传选项
   * @param {Function} options.onProgress - 进度回调 (percent: number) => void
   * @param {Function} options.onStatusChange - 状态变化回调 (status: string) => void
   * @param {boolean} options.multipart - 强制使用分片上传
   * @param {boolean} options.enableDedup - 启用秒传（需要计算SHA256）
   * @param {string} options.accessPolicy - 访问策略 PUBLIC/PRIVATE
   * @param {Object} options.bizTags - 业务标签
   * @param {Object} options.ext - 扩展信息
   * @returns {Promise<UploadTask>}
   */
  async upload(file, options = {}) {
    const task = new UploadTask(file, options, this)
    
    try {
      task.status = UploadStatus.UPLOADING
      options.onStatusChange?.(task.status)

      // 判断是否使用分片上传
      const useMultipart = options.multipart || file.size > this.config.multipartThreshold

      // 计算 SHA256（用于秒传）
      let checksum = null
      if (options.enableDedup && file.size < 100 * 1024 * 1024) { // 小于100MB才计算
        checksum = { sha256: await calculateSHA256(file) }
      }

      // 1. 初始化上传
      const initResult = await this._initUpload(file, {
        ...options,
        multipart: useMultipart,
        checksum,
      })

      task.uploadId = initResult.uploadId
      task.fileId = initResult.fileId
      task.parts = initResult.parts || []

      // 秒传成功
      if (!initResult.uploadId && initResult.fileId) {
        task.status = UploadStatus.COMPLETED
        task.progress = 100
        task.url = initResult.url
        options.onProgress?.(100)
        options.onStatusChange?.(task.status)
        return task
      }

      // 2. 执行上传
      if (useMultipart) {
        await this._uploadMultipart(task, options)
      } else {
        await this._uploadSingle(task, options)
      }

      // 3. 完成上传
      const completeResult = await this._completeUpload(task)
      
      task.url = completeResult.url
      task.status = completeResult.status === 'PROCESSING' 
        ? UploadStatus.PROCESSING 
        : UploadStatus.COMPLETED
      task.progress = 100
      
      options.onProgress?.(100)
      options.onStatusChange?.(task.status)

      return task

    } catch (error) {
      task.status = UploadStatus.FAILED
      task.error = error
      options.onStatusChange?.(task.status)
      throw error
    }
  }

  /**
   * 创建上传任务（用于断点续传场景）
   */
  createTask(file, options = {}) {
    return new UploadTask(file, options, this)
  }

  /**
   * 初始化上传
   */
  async _initUpload(file, options) {
    const body = {
      filename: file.name,
      size: file.size,
      mime: file.type || 'application/octet-stream',
      tenantId: options.tenantId || this.config.tenantId,
      ownerId: options.ownerId || this.config.ownerId,
      accessPolicy: options.accessPolicy || this.config.accessPolicy,
      bizTags: options.bizTags || null,
      ext: options.ext || null,
      checksum: options.checksum || null,
    }

    if (options.multipart) {
      body.multipart = {
        enabled: true,
        partSize: options.chunkSize || this.config.chunkSize,
      }
    }

    const response = await this._fetch('/uploads/init', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    return response.data
  }

  /**
   * 单文件上传
   */
  async _uploadSingle(task, options) {
    const partInfo = task.parts[0]
    if (!partInfo || !partInfo.url) {
      throw new Error('未获取到上传URL')
    }

    task.abortController = new AbortController()

    await this._uploadToPresignedUrl(partInfo.url, task.file, {
      signal: task.abortController.signal,
      onProgress: (percent) => {
        task.progress = percent
        options.onProgress?.(percent)
      },
    })
  }

  /**
   * 分片上传
   */
  async _uploadMultipart(task, options) {
    const file = task.file
    const chunkSize = options.chunkSize || this.config.chunkSize
    const totalParts = task.parts.length

    task.abortController = new AbortController()
    task.completedParts = []

    // 并发上传分片（限制并发数为3）
    const concurrency = 3
    let currentIndex = 0
    let completedCount = 0

    const uploadPart = async (partInfo) => {
      const partNumber = partInfo.partNumber
      const start = (partNumber - 1) * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      // 带重试的上传
      let retries = 0
      while (retries < this.config.maxRetries) {
        try {
          if (task.status === UploadStatus.PAUSED || task.status === UploadStatus.ABORTED) {
            return null
          }

          const etag = await this._uploadChunkToPresignedUrl(partInfo.url, chunk, {
            signal: task.abortController.signal,
          })

          completedCount++
          const progress = Math.round((completedCount / totalParts) * 100)
          task.progress = progress
          options.onProgress?.(progress)

          return { partNumber, etag }

        } catch (error) {
          if (error.name === 'AbortError') {
            return null
          }
          retries++
          if (retries >= this.config.maxRetries) {
            throw error
          }
          await delay(this.config.retryDelay * retries)
        }
      }
    }

    // 使用队列控制并发
    const results = []
    const executing = []

    for (const partInfo of task.parts) {
      const promise = uploadPart(partInfo).then(result => {
        if (result) {
          results.push(result)
          task.completedParts.push(result)
        }
        executing.splice(executing.indexOf(promise), 1)
      })
      
      executing.push(promise)

      if (executing.length >= concurrency) {
        await Promise.race(executing)
      }
    }

    await Promise.all(executing)

    if (task.status === UploadStatus.PAUSED || task.status === UploadStatus.ABORTED) {
      return
    }

    // 按分片编号排序
    task.completedParts.sort((a, b) => a.partNumber - b.partNumber)
  }

  /**
   * 恢复上传（断点续传）
   */
  async _resumeUpload(task) {
    const options = task.options

    try {
      // 刷新上传URL
      const refreshResult = await this._refreshUpload(task.uploadId)
      
      // 找出未完成的分片
      const completedPartNumbers = new Set(task.completedParts.map(p => p.partNumber))
      const remainingParts = refreshResult.parts.filter(
        p => !completedPartNumbers.has(p.partNumber)
      )

      if (remainingParts.length === 0) {
        // 所有分片已完成，直接完成上传
        const completeResult = await this._completeUpload(task)
        task.url = completeResult.url
        task.status = UploadStatus.COMPLETED
        task.progress = 100
        options.onProgress?.(100)
        options.onStatusChange?.(task.status)
        return task
      }

      // 继续上传剩余分片
      task.parts = remainingParts
      task.abortController = new AbortController()

      const file = task.file
      const chunkSize = options.chunkSize || this.config.chunkSize
      const totalParts = refreshResult.parts.length

      for (const partInfo of remainingParts) {
        if (task.status === UploadStatus.PAUSED || task.status === UploadStatus.ABORTED) {
          return task
        }

        const partNumber = partInfo.partNumber
        const start = (partNumber - 1) * chunkSize
        const end = Math.min(start + chunkSize, file.size)
        const chunk = file.slice(start, end)

        const etag = await this._uploadChunkToPresignedUrl(partInfo.url, chunk, {
          signal: task.abortController.signal,
        })

        task.completedParts.push({ partNumber, etag })
        
        const progress = Math.round((task.completedParts.length / totalParts) * 100)
        task.progress = progress
        options.onProgress?.(progress)
      }

      // 完成上传
      task.completedParts.sort((a, b) => a.partNumber - b.partNumber)
      const completeResult = await this._completeUpload(task)
      
      task.url = completeResult.url
      task.status = completeResult.status === 'PROCESSING' 
        ? UploadStatus.PROCESSING 
        : UploadStatus.COMPLETED
      task.progress = 100
      
      options.onProgress?.(100)
      options.onStatusChange?.(task.status)

      return task

    } catch (error) {
      if (error.name !== 'AbortError') {
        task.status = UploadStatus.FAILED
        task.error = error
        options.onStatusChange?.(task.status)
      }
      throw error
    }
  }

  /**
   * 完成上传
   */
  async _completeUpload(task) {
    const body = {}

    // 分片上传需要提供分片信息
    if (task.completedParts && task.completedParts.length > 0) {
      body.parts = task.completedParts.map(p => ({
        partNumber: p.partNumber,
        etag: p.etag,
      }))
    }

    const response = await this._fetch(`/uploads/${task.uploadId}/complete`, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    return response.data
  }

  /**
   * 刷新上传URL
   */
  async _refreshUpload(uploadId) {
    const response = await this._fetch(`/uploads/${uploadId}/refresh`, {
      method: 'POST',
    })
    return response.data
  }

  /**
   * 中止上传
   */
  async _abortUpload(uploadId) {
    try {
      await this._fetch(`/uploads/${uploadId}/abort`, {
        method: 'POST',
      })
    } catch (error) {
      console.warn('Abort upload failed:', error)
    }
  }

  /**
   * 查询上传状态
   */
  async getUploadStatus(uploadId) {
    const response = await this._fetch(`/uploads/${uploadId}`, {
      method: 'GET',
    })
    return response.data
  }

  /**
   * 查询文件信息
   */
  async getFileInfo(fileId) {
    const response = await this._fetch(`/files/${fileId}`, {
      method: 'GET',
    })
    return response.data
  }

  /**
   * 上传到预签名URL（单文件，带进度）
   */
  async _uploadToPresignedUrl(url, file, options = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && options.onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100)
          options.onProgress(percent)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.getResponseHeader('ETag'))
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error('Network error'))
      xhr.ontimeout = () => reject(new Error('Upload timeout'))

      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          xhr.abort()
          reject(new DOMException('Aborted', 'AbortError'))
        })
      }

      xhr.open('PUT', url)
      xhr.timeout = this.config.timeout
      xhr.send(file)
    })
  }

  /**
   * 上传分片到预签名URL
   */
  async _uploadChunkToPresignedUrl(url, chunk, options = {}) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // 获取 ETag（MinIO 返回的）
          let etag = xhr.getResponseHeader('ETag')
          if (etag) {
            // 移除引号
            etag = etag.replace(/"/g, '')
          }
          resolve(etag)
        } else {
          reject(new Error(`Upload chunk failed: ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error('Network error'))
      xhr.ontimeout = () => reject(new Error('Upload timeout'))

      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          xhr.abort()
          reject(new DOMException('Aborted', 'AbortError'))
        })
      }

      xhr.open('PUT', url)
      xhr.timeout = this.config.timeout
      xhr.send(chunk)
    })
  }

  /**
   * 封装 fetch 请求
   */
  async _fetch(path, options = {}) {
    const url = `${this.config.baseUrl}${path}`
    
    const headers = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...options.headers,
    }

    // 添加租户ID到请求头
    if (this.config.tenantId) {
      headers['X-Tenant-Id'] = this.config.tenantId
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `Request failed: ${response.status}`)
    }

    return response.json()
  }
}

// 默认导出单例
export const mediaUploader = new MediaUploader()

export default MediaUploader
