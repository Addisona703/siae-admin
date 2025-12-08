/**
 * TinyMCE 编辑器工具函数
 * 封装 TinyMCE 配置和图片上传处理
 */

// TinyMCE 核心和插件导入
import 'tinymce/tinymce'
import 'tinymce/themes/silver'
import 'tinymce/icons/default'
import 'tinymce/models/dom'
// 插件
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/table'
import 'tinymce/plugins/code'
import 'tinymce/plugins/codesample'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/wordcount'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/autosave'
import 'tinymce/plugins/quickbars'

/**
 * 创建图片上传处理函数
 * @param {Object} options - 配置选项
 * @param {Object} options.mediaUploader - MediaUploader 实例
 * @param {Function} options.getUserId - 获取用户ID的函数
 * @param {Map} options.uploadedImages - 存储上传图片映射的 Map (可选)
 * @returns {Function} TinyMCE 图片上传处理函数
 */
export function createImageUploadHandler(options) {
  const { mediaUploader, getUserId, uploadedImages } = options

  return async (blobInfo, progress) => {
    const file = blobInfo.blob()

    try {
      const userId = getUserId?.()

      const task = await mediaUploader.upload(file, {
        ownerId: userId ? String(userId) : '',
        accessPolicy: 'PUBLIC',
        bizTags: ['content-image'],
        onProgress: (percent) => {
          progress(percent)
        },
      })

      // 如果提供了 uploadedImages Map，存储映射关系
      if (uploadedImages) {
        uploadedImages.set(task.url, task.fileId)
      }

      return task.url
    } catch (error) {
      console.error('图片上传失败:', error)
      throw new Error('图片上传失败: ' + (error.message || '未知错误'))
    }
  }
}

/**
 * 获取 TinyMCE 编辑器配置
 * @param {Object} options - 配置选项
 * @param {boolean} options.isDark - 是否为暗色主题
 * @param {Function} options.imageUploadHandler - 图片上传处理函数
 * @param {string} options.placeholder - 占位符文本 (可选)
 * @param {string} options.height - 编辑器高度 (可选，默认 '100%')
 * @returns {Object} TinyMCE 初始化配置
 */
export function getTinymceConfig(options) {
  const {
    isDark = false,
    imageUploadHandler,
    placeholder = '在此输入正文内容...',
    height = '100%',
  } = options

  const lightContentStyle = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      padding: 20px;
    }
    .img-float-left { float: left; margin: 0 15px 10px 0; }
    .img-float-right { float: right; margin: 0 0 10px 15px; }
    .img-center { display: block; margin: 10px auto; }
  `

  const darkContentStyle = `
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      padding: 20px;
      background-color: #1a1f3a;
      color: #e0e6ed;
    }
    .img-float-left { float: left; margin: 0 15px 10px 0; }
    .img-float-right { float: right; margin: 0 0 10px 15px; }
    .img-center { display: block; margin: 10px auto; }
  `

  return {
    height,
    language: 'zh_CN',
    language_url: '/tinymce/langs/zh_CN.js',
    skin_url: isDark ? '/tinymce/skins/ui/oxide-dark' : '/tinymce/skins/ui/oxide',
    content_css: isDark
      ? '/tinymce/skins/content/dark/content.css'
      : '/tinymce/skins/content/default/content.css',
    plugins:
      'lists link image table code codesample fullscreen wordcount preview searchreplace autolink autosave quickbars',
    toolbar:
      'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table codesample | code fullscreen preview',
    menubar: 'file edit view insert format tools table',
    branding: false,
    promotion: false,
    resize: false,
    placeholder,
    content_style: isDark ? darkContentStyle : lightContentStyle,
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote',
    quickbars_insert_toolbar: 'quickimage quicktable',
    autosave_interval: '30s',
    autosave_prefix: 'tinymce-autosave-{path}{query}-{id}-',
    autosave_restore_when_empty: true,
    // 图片上传配置
    images_upload_handler: imageUploadHandler,
    automatic_uploads: true,
    images_reuse_filename: true,
    file_picker_types: 'image',
    // 图片高级选项
    image_advtab: true,
    image_caption: true,
    image_class_list: [
      { title: '无', value: '' },
      { title: '左浮动', value: 'img-float-left' },
      { title: '右浮动', value: 'img-float-right' },
      { title: '居中', value: 'img-center' },
    ],
    image_toolbar: 'alignleft aligncenter alignright | imageoptions',
  }
}

/**
 * 将内容中的图片URL替换为 media://{fileId} 格式
 * @param {string} content - 原始内容
 * @param {Map} uploadedImages - 上传图片映射 (url -> fileId)
 * @returns {string} 处理后的内容
 */
export function convertImagesToMediaProtocol(content, uploadedImages) {
  if (!content || !uploadedImages || uploadedImages.size === 0) {
    return content
  }

  let result = content

  uploadedImages.forEach((fileId, url) => {
    // 转义URL中的特殊字符用于正则匹配
    const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escapedUrl, 'g')
    result = result.replace(regex, `media://${fileId}`)
  })

  return result
}

export default {
  createImageUploadHandler,
  getTinymceConfig,
  convertImagesToMediaProtocol,
}
