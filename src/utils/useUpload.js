/**
 * Vue 3 组合式 API 上传 Hook
 * 
 * @example
 * <template>
 *   <input type="file" @change="handleFileChange" />
 *   <div v-if="uploading">上传中: {{ progress }}%</div>
 *   <div v-if="result">上传成功: {{ result.url }}</div>
 * </template>
 * 
 * <script setup>
 * import { useUpload } from '@/composables/useUpload'
 * 
 * const { upload, uploading, progress, result, error, abort } = useUpload({
 *   tenantId: '1',
 *   ownerId: '1'
 * })
 * 
 * const handleFileChange = async (e) => {
 *   const file = e.target.files[0]
 *   if (file) {
 *     await upload(file)
 *   }
 * }
 * </script>
 */

import { ref, reactive } from 'vue'
import { MediaUploader, UploadStatus } from './upload-utils'

/**
 * 上传 Hook
 * @param {Object} config - 上传配置
 */
export function useUpload(config = {}) {
  const uploader = new MediaUploader(config)
  
  const uploading = ref(false)
  const progress = ref(0)
  const status = ref(UploadStatus.PENDING)
  const result = ref(null)
  const error = ref(null)
  const currentTask = ref(null)

  /**
   * 上传文件
   * @param {File} file - 文件
   * @param {Object} options - 上传选项
   */
  async function upload(file, options = {}) {
    uploading.value = true
    progress.value = 0
    status.value = UploadStatus.UPLOADING
    result.value = null
    error.value = null

    try {
      const task = await uploader.upload(file, {
        ...options,
        onProgress: (percent) => {
          progress.value = percent
          options.onProgress?.(percent)
        },
        onStatusChange: (newStatus) => {
          status.value = newStatus
          options.onStatusChange?.(newStatus)
        },
      })

      currentTask.value = task
      result.value = {
        fileId: task.fileId,
        url: task.url,
        status: task.status,
      }

      return task

    } catch (err) {
      error.value = err
      status.value = UploadStatus.FAILED
      throw err

    } finally {
      uploading.value = false
    }
  }

  /**
   * 暂停上传
   */
  function pause() {
    if (currentTask.value) {
      currentTask.value.pause()
      status.value = UploadStatus.PAUSED
    }
  }

  /**
   * 恢复上传
   */
  async function resume() {
    if (currentTask.value) {
      status.value = UploadStatus.UPLOADING
      uploading.value = true
      try {
        await currentTask.value.resume()
      } finally {
        uploading.value = false
      }
    }
  }

  /**
   * 中止上传
   */
  async function abort() {
    if (currentTask.value) {
      await currentTask.value.abort()
      status.value = UploadStatus.ABORTED
      uploading.value = false
    }
  }

  /**
   * 重置状态
   */
  function reset() {
    uploading.value = false
    progress.value = 0
    status.value = UploadStatus.PENDING
    result.value = null
    error.value = null
    currentTask.value = null
  }

  return {
    // 状态
    uploading,
    progress,
    status,
    result,
    error,
    currentTask,
    
    // 方法
    upload,
    pause,
    resume,
    abort,
    reset,
    
    // 上传器实例（高级用法）
    uploader,
  }
}

/**
 * 多文件上传 Hook
 * @param {Object} config - 上传配置
 */
export function useMultiUpload(config = {}) {
  const uploader = new MediaUploader(config)
  
  const files = reactive([])
  const uploading = ref(false)
  const totalProgress = ref(0)

  /**
   * 添加文件
   * @param {File|File[]} fileOrFiles - 文件或文件数组
   */
  function addFiles(fileOrFiles) {
    const fileList = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles]
    
    for (const file of fileList) {
      files.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        name: file.name,
        size: file.size,
        progress: 0,
        status: UploadStatus.PENDING,
        result: null,
        error: null,
        task: null,
      })
    }
  }

  /**
   * 移除文件
   * @param {string} id - 文件ID
   */
  function removeFile(id) {
    const index = files.findIndex(f => f.id === id)
    if (index > -1) {
      const item = files[index]
      if (item.task) {
        item.task.abort()
      }
      files.splice(index, 1)
    }
  }

  /**
   * 上传所有文件
   * @param {Object} options - 上传选项
   */
  async function uploadAll(options = {}) {
    uploading.value = true
    
    const pendingFiles = files.filter(f => f.status === UploadStatus.PENDING)
    
    try {
      // 串行上传（可改为并行）
      for (const item of pendingFiles) {
        item.status = UploadStatus.UPLOADING
        
        try {
          const task = await uploader.upload(item.file, {
            ...options,
            onProgress: (percent) => {
              item.progress = percent
              updateTotalProgress()
            },
            onStatusChange: (status) => {
              item.status = status
            },
          })

          item.task = task
          item.result = {
            fileId: task.fileId,
            url: task.url,
          }
          item.status = task.status

        } catch (err) {
          item.error = err
          item.status = UploadStatus.FAILED
        }
      }

    } finally {
      uploading.value = false
    }
  }

  /**
   * 更新总进度
   */
  function updateTotalProgress() {
    if (files.length === 0) {
      totalProgress.value = 0
      return
    }
    const sum = files.reduce((acc, f) => acc + f.progress, 0)
    totalProgress.value = Math.round(sum / files.length)
  }

  /**
   * 清空所有文件
   */
  function clear() {
    for (const item of files) {
      if (item.task) {
        item.task.abort()
      }
    }
    files.length = 0
    totalProgress.value = 0
  }

  /**
   * 重试失败的文件
   */
  async function retryFailed(options = {}) {
    const failedFiles = files.filter(f => f.status === UploadStatus.FAILED)
    
    for (const item of failedFiles) {
      item.status = UploadStatus.PENDING
      item.progress = 0
      item.error = null
    }

    await uploadAll(options)
  }

  return {
    // 状态
    files,
    uploading,
    totalProgress,
    
    // 方法
    addFiles,
    removeFile,
    uploadAll,
    clear,
    retryFailed,
    
    // 上传器实例
    uploader,
  }
}

export default useUpload
