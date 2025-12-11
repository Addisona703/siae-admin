<template>
  <t-layout style="height: 100vh; display: flex; flex-direction: column; overflow: hidden;">
    <!-- 顶部导航栏 -->
    <t-header class="header-bar">
      <div class="header-left">
        <t-button variant="text" shape="square" @click="goBack" size="large">
          <template #icon>
            <ArrowLeftIcon />
          </template>
        </t-button>

        <!-- 顶部 Tab 切换类型 -->
        <div class="flex items-center gap-1">
          <button v-for="type in contentTypes" :key="type.id" @click="handleTypeChange(type.value)"
            class="!px-3 !py-1.5 !text-sm flex items-center !gap-1.5 transition-all !rounded !border-0 type-btn"
            :class="form.type === type.value ? 'type-btn-active' : 'type-btn-normal'">
            <component :is="type.icon" :size="16" />
            {{ type.label }}
          </button>
        </div>

        <span class="text-xs ml-2" style="color: var(--td-text-color-disabled);" v-if="lastSaved">上次保存: {{ lastSaved
          }}</span>
        <span class="text-xs ml-2" style="color: var(--td-text-color-disabled);" v-else>草稿状态</span>
      </div>

      <div class="flex gap-2">
        <t-button theme="default" variant="outline" size="medium">存草稿</t-button>
        <t-button theme="primary" @click="handleSubmit" size="medium">
          <template #icon>
            <SendIcon />
          </template>
          发布文章
        </t-button>
      </div>
    </t-header>

    <!-- 主体布局 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 左侧：主要创作区 -->
      <main class="flex-1 flex flex-col relative min-w-0 overflow-hidden" style="background: var(--td-bg-color-page);">
        <!-- 通用标题输入 -->
        <div class="title-input-wrapper">
          <input v-model="form.title" type="text" placeholder="请输入引人注目的标题..." class="title-input">
          <div class="title-underline"></div>
        </div>

        <!-- 场景 A: 文字创作 (文章/笔记/提问) -->
        <div v-if="[0, 1, 2].includes(form.type)" class="flex-1 flex flex-col overflow-hidden">
          <!-- 编辑模式切换栏 -->
          <div class="px-8 py-2 flex items-center justify-between border-b shrink-0 z-10"
            style="background: var(--td-bg-color-container); border-color: var(--td-component-border);">
            <div class="text-xs flex items-center gap-2" style="color: var(--td-text-color-placeholder);">
              <span v-if="form.type === 2" class="px-2 py-1 rounded"
                style="color: var(--td-warning-color); background-color: var(--td-warning-color-1);">提问模式：请详细描述问题背景</span>
              <span v-else>创作模式</span>
            </div>
            <div v-if="[0, 1].includes(form.type)" class="flex p-0.5 rounded-md"
              style="background: var(--td-bg-color-component);">
              <button @click="switchEditorMode('word')"
                class="px-3 py-1 rounded text-xs font-medium transition-all editor-mode-btn"
                :class="editorMode === 'word' ? 'editor-mode-active' : 'editor-mode-normal'">Word 模式</button>
              <button @click="switchEditorMode('markdown')"
                class="px-3 py-1 rounded text-xs font-medium transition-all editor-mode-btn"
                :class="editorMode === 'markdown' ? 'editor-mode-active' : 'editor-mode-normal'">Markdown</button>
            </div>
          </div>

          <!-- 编辑器主体 -->
          <div class="flex-1 flex flex-col overflow-hidden relative">
            <!-- Word 模式 (TinyMCE 富文本编辑器) -->
            <!-- Word 模式 (TinyMCE 富文本编辑器) -->
            <div v-show="editorMode === 'word'" class="h-full flex flex-col">
              <div class="flex-1 overflow-hidden tinymce-wrapper">
                <Editor :key="appStore.isDarkTheme ? 'dark' : 'light'" v-model="form.content" :init="tinymceInit"
                  @input="autoSave" />
              </div>
            </div>

            <!-- Markdown 模式 -->
            <div v-show="editorMode === 'markdown'" class="h-full flex flex-col">
              <!-- Markdown 工具栏 -->
              <div class="markdown-toolbar shrink-0">
                <t-tooltip content="加粗 (Ctrl+B)">
                  <button class="markdown-btn !border-0" @click="insertMd('bold')">
                    <FormatHorizontalAlignCenterIcon />
                  </button>
                </t-tooltip>
                <t-tooltip content="斜体 (Ctrl+I)">
                  <button class="markdown-btn !border-0" @click="insertMd('italic')">
                    <EditIcon />
                  </button>
                </t-tooltip>
                <div class="!w-px !h-4 !mx-1" style="background: var(--td-component-border);"></div>
                <div class="!w-px !h-4 !mx-1" style="background: var(--td-component-border);"></div>
                <t-tooltip content="一级标题">
                  <button class="markdown-btn !font-bold !border-0" @click="insertMd('h1')">H1</button>
                </t-tooltip>
                <t-tooltip content="二级标题">
                  <button class="markdown-btn !font-bold !border-0" @click="insertMd('h2')">H2</button>
                </t-tooltip>
                <t-tooltip content="三级标题">
                  <button class="markdown-btn !font-bold !border-0" @click="insertMd('h3')">H3</button>
                </t-tooltip>
                <div class="!w-px !h-4 !mx-1" style="background: var(--td-component-border);"></div>
                <div class="!w-px !h-4 !mx-1" style="background: var(--td-component-border);"></div>
                <t-tooltip content="引用">
                  <button class="markdown-btn !border-0" @click="insertMd('quote')">
                    <ChatIcon />
                  </button>
                </t-tooltip>
                <t-tooltip content="代码块">
                  <button class="markdown-btn !border-0" @click="insertMd('code')">
                    <CodeIcon />
                  </button>
                </t-tooltip>
                <t-tooltip content="链接">
                  <button class="markdown-btn !border-0" @click="insertMd('link')">
                    <LinkIcon />
                  </button>
                </t-tooltip>
                <t-tooltip content="图片">
                  <button class="markdown-btn !border-0" @click="insertMd('image')">
                    <ImageIcon />
                  </button>
                </t-tooltip>
              </div>

              <!-- 编辑与预览分屏 -->
              <div class="flex-1 flex overflow-hidden">
                <div class="w-1/2 h-full border-r flex flex-col"
                  style="background: var(--td-bg-color-secondarycontainer); border-color: var(--td-component-border);">
                  <textarea ref="mdTextarea" v-model="form.content"
                    class="w-full h-full p-6 resize-none border-none bg-transparent focus:ring-0 outline-none md-editor-textarea text-sm"
                    style="color: var(--td-text-color-primary);" placeholder="# 开始你的 Markdown 写作..."
                    @input="autoSave"></textarea>
                </div>
                <div class="w-1/2 h-full prose max-w-none overflow-y-auto p-8"
                  style="background: var(--td-bg-color-container); color: var(--td-text-color-primary);"
                  v-html="compiledMarkdown"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 场景 B: 文件/视频上传 -->
        <div v-if="[3, 4].includes(form.type)" class="upload-page-wrapper">
          <div class="upload-container">
            <!-- 上传区域 -->
            <t-upload v-model="uploadFiles" draggable theme="custom" :accept="form.type === 4 ? 'video/*' : '*'"
              :auto-upload="false" @change="handleFileChange" class="w-full">
              <template #dragContent>
                <div class="upload-zone">
                  <div class="upload-icon-wrapper">
                    <component :is="form.type === 4 ? VideoIcon : CloudUploadIcon" class="upload-icon" />
                  </div>
                  <h3 class="upload-title">点击或拖拽上传{{ currentTypeName }}</h3>
                  <p class="upload-subtitle">
                    <span class="upload-hint">支持断点续传</span>
                    <span class="upload-divider">•</span>
                    <span class="upload-hint">最大 2GB</span>
                  </p>
                  <div class="upload-formats" v-if="form.type === 4">
                    <span class="format-tag">MP4</span>
                    <span class="format-tag">AVI</span>
                    <span class="format-tag">MOV</span>
                    <span class="format-tag">MKV</span>
                  </div>
                  <div class="upload-formats" v-else>
                    <span class="format-tag">PDF</span>
                    <span class="format-tag">DOC</span>
                    <span class="format-tag">ZIP</span>
                    <span class="format-tag">RAR</span>
                  </div>
                </div>
              </template>
            </t-upload>

            <!-- 已上传文件列表 -->
            <div v-if="uploadFiles.length > 0" class="uploaded-file-card">
              <div class="file-info">
                <div class="file-icon-wrapper">
                  <component :is="form.type === 4 ? VideoIcon : FileIcon" class="file-icon" />
                </div>
                <div class="file-details">
                  <div class="file-name">{{ uploadFiles[0].name }}</div>
                  <div class="file-meta">
                    <span class="file-size">{{ formatFileSize(uploadFiles[0].size) }}</span>
                    <span class="file-status">✓ 准备就绪</span>
                  </div>
                </div>
              </div>
              <t-button variant="text" shape="square" theme="danger" @click="uploadFiles = []" class="!border-0">
                <template #icon>
                  <CloseIcon />
                </template>
              </t-button>
            </div>

            <!-- 视频专属设置 -->
            <div v-if="form.type === 4" class="video-settings-card">
              <div class="settings-header">
                <SettingIcon class="settings-icon" />
                <h4 class="settings-title">视频参数设置</h4>
              </div>
              <div class="settings-grid">
                <div class="setting-item">
                  <label class="setting-label">视频时长 (秒)</label>
                  <t-input-number v-model="form.duration" theme="column" class="!w-full" />
                </div>
                <div class="setting-item">
                  <label class="setting-label">分辨率</label>
                  <t-select v-model="form.resolution" class="!w-full">
                    <t-option value="720p" label="720P (高清)"></t-option>
                    <t-option value="1080p" label="1080P (超清)"></t-option>
                    <t-option value="2k" label="2K (2560x1440)"></t-option>
                    <t-option value="4k" label="4K (极清)"></t-option>
                  </t-select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 右侧：侧边栏设置 -->
      <aside class="w-80 border-l flex flex-col h-full overflow-y-auto z-10"
        style="background: var(--td-bg-color-container); border-color: var(--td-component-border);">
        <div class="sidebar-card">
          <h3 class="font-medium mb-3 text-sm flex items-center gap-2" style="color: var(--td-text-color-primary);">
            <RootListIcon :size="16" /> 发布设置
          </h3>
          <t-form label-align="top" :data="form">
            <t-form-item label="所属分类" name="categoryId">
              <t-select v-model="form.categoryId" placeholder="请选择分类" filterable>
                <t-option v-for="c in categories" :key="c.id" :value="c.id" :label="c.name"></t-option>
              </t-select>
            </t-form-item>

            <t-form-item label="标签 (Tags)" name="tagIds">
              <t-select v-model="form.tagIds" :options="tagOptions" placeholder="输入搜索标签" multiple filterable
                :filter="filterTags" :loading="tagLoading" @search="handleTagSearch" @focus="handleTagFocus" />
            </t-form-item>

            <t-form-item label="摘要" name="description">
              <t-textarea v-model="form.description" placeholder="用于列表页展示..."
                :autosize="{ minRows: 3, maxRows: 6 }"></t-textarea>
            </t-form-item>
          </t-form>
        </div>

        <div class="sidebar-card" v-if="[0, 1, 4].includes(form.type)">
          <h3 class="font-medium mb-3 text-sm flex items-center gap-2" style="color: var(--td-text-color-primary);">
            <ImageIcon :size="16" /> 封面设置
          </h3>
          <div class="cover-upload-zone">
            <t-upload v-model="coverList" theme="image" accept="image/*" :max="1" :auto-upload="false"
              :before-upload="handleCoverBeforeUpload" @change="handleCoverChange"></t-upload>
            <div class="text-xs mt-2" style="color: var(--td-text-color-placeholder);">
              建议尺寸 16:9 <br> 支持 JPG/PNG, Max 5MB
            </div>
            <div v-if="coverUploading" class="text-xs mt-2" style="color: var(--td-brand-color);">
              上传中... {{ coverUploadProgress }}%
            </div>
          </div>
        </div>

        <div class="sidebar-card" v-if="form.type === 2">
          <h3 class="font-medium mb-3 text-sm flex items-center gap-2" style="color: var(--td-text-color-primary);">
            <WalletIcon :size="16" /> 悬赏设置
          </h3>
          <div class="p-4 rounded border"
            style="background-color: var(--td-warning-color-1); border-color: var(--td-warning-color-2);">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-bold" style="color: var(--td-warning-color-active);">悬赏积分</span>
              <span class="text-2xl font-bold" style="color: var(--td-warning-color);">{{ questionReward }}</span>
            </div>
            <input type="range" v-model="questionReward" min="0" max="100" step="10" class="w-full accent-orange-500">
          </div>
        </div>
      </aside>
    </div>
  </t-layout>
</template>


<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { marked } from 'marked'
import Editor from '@tinymce/tinymce-vue'
import {
  ArrowLeftIcon,
  SendIcon,
  ArticleIcon,
  BookIcon,
  HelpCircleIcon,
  FileIcon,
  VideoIcon,
  CloudUploadIcon,
  SettingIcon,
  RootListIcon,
  ImageIcon,
  WalletIcon,
  ChatIcon,
  CodeIcon,
  LinkIcon,
  CloseIcon
} from 'tdesign-icons-vue-next'
import { contentApi } from '@/api/content'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { MediaUploader } from '@/utils/upload-utils'
import {
  createImageUploadHandler,
  getTinymceConfig,
  convertImagesToMediaProtocol
} from '@/utils/tinymce-utils'

const router = useRouter()
const appStore = useAppStore()
const authStore = useAuthStore()

// 媒体上传器实例
const mediaUploader = new MediaUploader({
  baseUrl: '/api/v1/media',
  tenantId: 'admin',
})

// 内容类型定义
const contentTypes = [
  { id: 0, value: 0, label: '文章', icon: ArticleIcon },
  { id: 1, value: 1, label: '笔记', icon: BookIcon },
  { id: 2, value: 2, label: '问题', icon: HelpCircleIcon },
  { id: 3, value: 3, label: '文件', icon: FileIcon },
  { id: 4, value: 4, label: '视频', icon: VideoIcon },
]

// 表单数据
const form = reactive({
  title: '',
  type: 0,
  content: '',
  categoryId: null,
  tagIds: [],
  description: '',
  duration: 0,
  resolution: '1080p'
})

// 编辑器状态
const editorMode = ref('word')
const lastSaved = ref(null)
const uploadFiles = ref([])
const coverList = ref([])
const questionReward = ref(0)
const mdTextarea = ref(null)
const coverUploading = ref(false)
const coverUploadProgress = ref(0)
const coverFileId = ref(null) // 存储封面的 fileId
const mainFileId = ref(null) // 存储主文件的 fileId (用于文件/视频类型)

// 存储上传的图片映射 (临时URL -> fileId)
const uploadedImages = ref(new Map())

// 自动保存定时器
let autoSaveTimer = null

// TinyMCE 图片上传处理函数
const imageUploadHandler = createImageUploadHandler({
  mediaUploader,
  getUserId: () => authStore.currentUser?.userId,
  uploadedImages: uploadedImages.value,
})

// TinyMCE 配置
const tinymceInit = computed(() =>
  getTinymceConfig({
    isDark: appStore.isDarkTheme,
    imageUploadHandler,
  })
)

// 分类数据
const categories = ref([])

// 标签数据
const tagOptions = ref([])
const tagLoading = ref(false)
const allTags = ref([]) // 缓存所有标签

// 加载标签列表
const fetchTags = async () => {
  tagLoading.value = true
  try {
    const res = await contentApi.getTagPage({
      pageNum: 1,
      pageSize: 100,
      params: {}
    })
    if (res.code === 200 && res.data) {
      allTags.value = res.data.records || []
      tagOptions.value = allTags.value.map(tag => ({
        label: tag.name,
        value: tag.id
      }))
    }
  } catch (e) {
    console.error('获取标签列表失败:', e)
  } finally {
    tagLoading.value = false
  }
}

// 标签搜索过滤
const filterTags = (search, option) => {
  return option.label.toLowerCase().includes(search.toLowerCase())
}

// 标签搜索处理
const handleTagSearch = (search) => {
  if (!search) {
    tagOptions.value = allTags.value.map(tag => ({
      label: tag.name,
      value: tag.id
    }))
    return
  }
  // 本地过滤
  tagOptions.value = allTags.value
    .filter(tag => tag.name.toLowerCase().includes(search.toLowerCase()))
    .map(tag => ({
      label: tag.name,
      value: tag.id
    }))
}

// 标签获取焦点时加载
const handleTagFocus = () => {
  if (allTags.value.length === 0) {
    fetchTags()
  }
}

const fetchCategories = async () => {
  try {
    // 使用 getCategoryPage 获取分类列表
    const res = await contentApi.getCategoryPage({
      page: 1,
      size: 100 // 获取所有分类
    })
    // 处理分页响应结构: { code: 200, data: { records: [...] } }
    if (res.code === 200 && res.data) {
      categories.value = res.data.records || res.data || []
    } else if (res.records) {
      // 兼容直接返回分页数据的情况
      categories.value = res.records
    } else {
      categories.value = []
    }
  } catch (e) {
    console.error('获取分类列表失败:', e)
    categories.value = []
  }
}

onMounted(() => {
  fetchCategories()
})

// 计算属性
const currentTypeName = computed(() => {
  const target = contentTypes.find(t => t.value === form.type)
  return target ? target.label : '内容'
})

const compiledMarkdown = computed(() => {
  return marked.parse(form.content || '')
})

// 方法
const handleTypeChange = (val) => {
  form.type = val
  form.content = ''
  uploadFiles.value = []

  // 提问模式强制使用 Markdown，其他模式默认 Word
  if (val === 2) {
    editorMode.value = 'markdown'
  } else if ([0, 1].includes(val)) {
    editorMode.value = 'word'
  }
}

const switchEditorMode = (mode) => {
  editorMode.value = mode
}

const insertMd = (type) => {
  const textarea = mdTextarea.value
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = form.content || ''
  const selection = text.substring(start, end)

  let insert = ''
  let offset = 0

  switch (type) {
    case 'bold':
      insert = `**${selection || '粗体文本'}**`
      offset = selection ? 0 : 2
      break
    case 'italic':
      insert = `*${selection || '斜体文本'}*`
      offset = selection ? 0 : 1
      break
    case 'h1':
      insert = `# ${selection || '一级标题'}`
      break
    case 'h2':
      insert = `## ${selection || '二级标题'}`
      break
    case 'h3':
      insert = `### ${selection || '三级标题'}`
      break
    case 'quote':
      insert = `> ${selection || '引用文本'}`
      break
    case 'code':
      insert = selection.includes('\n') ? `\n\`\`\`\n${selection}\n\`\`\`\n` : `\`${selection || '代码'}\``
      break
    case 'link':
      insert = `[${selection || '链接描述'}](url)`
      break
    case 'image':
      insert = `![${selection || '图片描述'}](url)`
      break
  }

  const newText = text.substring(0, start) + insert + text.substring(end)
  form.content = newText

  nextTick(() => {
    textarea.focus()
    if (!selection && (type === 'bold' || type === 'italic')) {
      textarea.setSelectionRange(start + Math.floor(insert.length / 2), start + Math.floor(insert.length / 2))
    } else {
      textarea.setSelectionRange(start + insert.length, start + insert.length)
    }
  })
  autoSave()
}

const handleFileChange = (val) => {
  if (val && val.length > 0 && !form.title) {
    form.title = val[0].name.split('.')[0]
  }
}

// 封面上传前校验
const handleCoverBeforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage) {
    MessagePlugin.warning('只能上传图片文件')
    return false
  }
  if (!isLt5M) {
    MessagePlugin.warning('封面图片大小不能超过 5MB')
    return false
  }
  return true
}

// 封面选择变化时上传
const handleCoverChange = async (val) => {
  if (!val || val.length === 0) {
    coverFileId.value = null
    return
  }

  const file = val[0].raw
  if (!file) return

  coverUploading.value = true
  coverUploadProgress.value = 0

  try {
    const userId = authStore.currentUser?.userId

    const task = await mediaUploader.upload(file, {
      ownerId: userId ? String(userId) : '',
      accessPolicy: 'PUBLIC',
      bizTags: ['content-cover'],
      onProgress: (percent) => {
        coverUploadProgress.value = percent
      },
    })

    coverFileId.value = task.fileId
    MessagePlugin.success('封面上传成功')
  } catch (error) {
    console.error('封面上传失败:', error)
    MessagePlugin.error('封面上传失败: ' + (error.message || '未知错误'))
    coverList.value = []
    coverFileId.value = null
  } finally {
    coverUploading.value = false
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 防抖自动保存
const autoSave = () => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  autoSaveTimer = setTimeout(() => {
    const now = new Date()
    lastSaved.value = `${now.getHours()}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()}`
    // 可以在这里添加实际的草稿保存逻辑
  }, 2000) // 2秒防抖
}

// 内容类型映射 (数字 -> 字符串)
const typeMap = {
  0: 'article',
  1: 'note',
  2: 'question',
  3: 'file',
  4: 'video',
}

const handleSubmit = async () => {
  if (!form.title) {
    MessagePlugin.warning('请输入标题')
    return
  }

  if (!form.categoryId) {
    MessagePlugin.warning('请选择分类')
    return
  }

  if (!form.description) {
    MessagePlugin.warning('请输入摘要')
    return
  }

  MessagePlugin.loading('发布中...')

  try {
    // 处理内容，将图片URL转换为 media://{fileId} 格式
    const processedContent = convertImagesToMediaProtocol(form.content, uploadedImages.value)

    // 获取当前用户ID
    const userId = authStore.currentUser?.userId

    // 构建后端期望的数据结构
    const submitData = {
      title: form.title,
      type: typeMap[form.type] || 'article',
      description: form.description,
      coverFileId: coverFileId.value || null,
      uploadedBy: userId,
      categoryId: form.categoryId,
      tagIds: form.tagIds || [],
      status: 'PENDING', // 待审核状态
      detail: {
        content: processedContent,
      },
    }

    console.log('Submit Data:', submitData)

    // 调用发布API
    const res = await contentApi.publishContent(submitData)

    if (res.code === 200) {
      MessagePlugin.success('发布成功！')

      // 清空上传图片映射
      uploadedImages.value.clear()
      coverFileId.value = null

      // 返回内容列表
      router.push('/content/list')
    } else {
      MessagePlugin.error(res.message || '发布失败')
    }

  } catch (error) {
    console.error('发布失败:', error)
    MessagePlugin.error('发布失败: ' + (error.message || '未知错误'))
  }
}

const goBack = () => {
  router.back()
}
</script>


<style scoped>
/* ========== CSS 变量定义 ========== */
:root {
  --transition-base: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
  
  /* 深色主题颜色 */
  --dark-bg-primary: #1a1d2e;
  --dark-bg-secondary: #22273b;
  --dark-bg-tertiary: #2a2f45;
  --dark-border: #363b52;
  --dark-text-primary: #e4e6eb;
  --dark-text-secondary: #a0a3b5;
  --dark-text-disabled: #6b6f85;
}

/* ========== 顶部导航栏 ========== */
.header-bar {
  background: var(--dark-bg-secondary, var(--td-bg-color-container));
  padding: 0 clamp(16px, 4vw, 24px);
  height: 56px;
  border-bottom: 1px solid var(--dark-border, var(--td-component-border));
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 50;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: clamp(8px, 2vw, 12px);
  flex: 1;
  min-width: 0;
}

/* 类型切换按钮 */
.type-btn {
  cursor: pointer;
  transition: var(--transition-base);
  position: relative;
  white-space: nowrap;
}

.type-btn::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--td-brand-color);
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.type-btn-active {
  color: var(--td-brand-color) !important;
  background: var(--td-brand-color-light) !important;
  font-weight: 500;
}

.type-btn-active::after {
  width: 60%;
}

.type-btn-normal {
  color: var(--td-text-color-secondary) !important;
  background: transparent !important;
}

.type-btn-normal:hover {
  background: var(--td-bg-color-container-hover) !important;
  color: var(--td-text-color-primary) !important;
  transform: translateY(-1px);
}

.type-btn-normal:active {
  transform: translateY(0);
}

/* ========== 编辑器区域 ========== */
.editor-container {
  height: calc(100vh - 64px);
}

/* 编辑模式切换按钮 */
.editor-mode-btn {
  cursor: pointer;
  border: none;
  transition: var(--transition-base);
  position: relative;
  overflow: hidden;
}

.editor-mode-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--td-brand-color);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.editor-mode-active {
  color: var(--td-brand-color) !important;
  background: var(--td-bg-color-container) !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 82, 217, 0.1);
  font-weight: 500;
}

.editor-mode-normal {
  color: var(--td-text-color-secondary) !important;
  background: transparent !important;
}

.editor-mode-normal:hover {
  background: var(--td-bg-color-container-hover) !important;
  color: var(--td-text-color-primary) !important;
}

.editor-mode-normal:active {
  transform: scale(0.98);
}

/* ========== TinyMCE 编辑器 ========== */
.tinymce-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.tinymce-wrapper :deep(.tox-tinymce) {
  border: none !important;
  border-radius: 0 !important;
  height: 100% !important;
  transition: var(--transition-base);
}

.tinymce-wrapper :deep(.tox-editor-header) {
  border-bottom: 1px solid var(--td-component-border) !important;
  background: var(--td-bg-color-container) !important;
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tinymce-wrapper :deep(.tox-toolbar-overlord) {
  background: var(--td-bg-color-container) !important;
}

.tinymce-wrapper :deep(.tox-toolbar__primary) {
  background: var(--td-bg-color-container) !important;
  padding: 8px 12px;
}

.tinymce-wrapper :deep(.tox-tbtn) {
  transition: var(--transition-base);
  border-radius: 4px;
}

.tinymce-wrapper :deep(.tox-tbtn:hover) {
  background: var(--td-bg-color-container-hover) !important;
}

.tinymce-wrapper :deep(.tox-edit-area) {
  background: var(--td-bg-color-page) !important;
  padding: 24px;
}

.tinymce-wrapper :deep(.tox-edit-area__iframe) {
  background: var(--td-bg-color-container) !important;
}

/* ========== Markdown 编辑器 ========== */
.markdown-toolbar {
  background: var(--dark-bg-secondary, var(--td-bg-color-container));
  border-bottom: 1px solid var(--dark-border, var(--td-component-border));
  padding: 8px 16px;
  display: flex;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.markdown-btn {
  padding: 6px 10px !important;
  border-radius: 6px !important;
  color: var(--td-text-color-secondary) !important;
  cursor: pointer !important;
  transition: var(--transition-base) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  background: transparent !important;
  position: relative;
  min-width: 32px;
  min-height: 32px;
}

.markdown-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 6px;
  background: var(--td-brand-color);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.markdown-btn:hover {
  background-color: var(--td-bg-color-container-hover) !important;
  color: var(--td-brand-color) !important;
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.markdown-btn:hover::after {
  opacity: 0.05;
}

.markdown-btn:active {
  transform: translateY(0);
}

.md-editor-textarea {
  font-family: 'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace;
  line-height: 1.7;
  letter-spacing: 0.01em;
  transition: var(--transition-base);
}

.md-editor-textarea:focus {
  outline: none;
  box-shadow: inset 0 0 0 2px rgba(0, 82, 217, 0.1);
}

/* ========== Markdown 预览样式 ========== */
.prose {
  scroll-behavior: smooth;
}

.prose :deep(h1) {
  font-size: 2em;
  font-weight: 700;
  margin-bottom: 0.5em;
  margin-top: 0.5em;
  border-bottom: 2px solid var(--td-component-border);
  padding-bottom: 0.3em;
  color: var(--td-text-color-primary);
  line-height: 1.3;
}

.prose :deep(h2) {
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 0.5em;
  margin-top: 1.2em;
  color: var(--td-text-color-primary);
  line-height: 1.4;
}

.prose :deep(h3) {
  font-size: 1.25em;
  font-weight: 600;
  margin-bottom: 0.5em;
  margin-top: 1em;
  color: var(--td-text-color-primary);
  line-height: 1.4;
}

.prose :deep(p) {
  margin-bottom: 1.2em;
  line-height: 1.7;
  color: var(--td-text-color-primary);
}

.prose :deep(ul),
.prose :deep(ol) {
  padding-left: 1.8em;
  margin-bottom: 1.2em;
  color: var(--td-text-color-primary);
  line-height: 1.7;
}

.prose :deep(ul) {
  list-style-type: disc;
}

.prose :deep(ol) {
  list-style-type: decimal;
}

.prose :deep(li) {
  margin-bottom: 0.4em;
}

.prose :deep(blockquote) {
  border-left: 4px solid var(--td-brand-color);
  padding: 12px 16px;
  margin: 1.5em 0;
  background: var(--td-bg-color-secondarycontainer);
  border-radius: 0 8px 8px 0;
  color: var(--td-text-color-secondary);
  font-style: italic;
}

.prose :deep(code) {
  background: var(--td-bg-color-secondarycontainer);
  padding: 3px 6px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.88em;
  color: var(--td-error-color);
  border: 1px solid var(--td-component-border);
}

.prose :deep(pre) {
  background: #1e293b;
  color: #e2e8f0;
  padding: 16px 20px;
  border-radius: 10px;
  overflow-x: auto;
  margin: 1.5em 0;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.prose :deep(pre code) {
  background: transparent;
  padding: 0;
  border: none;
  color: inherit;
  font-size: 0.9em;
}

.prose :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1.5em 0;
  box-shadow: var(--shadow-md);
  transition: var(--transition-smooth);
}

.prose :deep(img:hover) {
  transform: scale(1.02);
  box-shadow: var(--shadow-lg);
}

.prose :deep(a) {
  color: var(--td-brand-color);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: var(--transition-base);
}

.prose :deep(a:hover) {
  border-bottom-color: var(--td-brand-color);
}

.prose :deep(hr) {
  border: none;
  border-top: 2px solid var(--td-component-border);
  margin: 2em 0;
}

.prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.prose :deep(th),
.prose :deep(td) {
  padding: 12px 16px;
  border: 1px solid var(--td-component-border);
  text-align: left;
}

.prose :deep(th) {
  background: var(--td-bg-color-secondarycontainer);
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.prose :deep(tr:hover) {
  background: var(--td-bg-color-container-hover);
}

/* ========== 侧边栏 ========== */
.sidebar-card {
  background: var(--dark-bg-secondary, var(--td-bg-color-container));
  padding: 20px 24px;
  border-bottom: 1px solid var(--dark-border, var(--td-component-border));
  transition: var(--transition-base);
}

.sidebar-card:hover {
  background: var(--dark-bg-tertiary, var(--td-bg-color-container-hover));
}

.sidebar-card h3 {
  transition: var(--transition-base);
  color: var(--dark-text-primary, var(--td-text-color-primary)) !important;
}

.sidebar-card:hover h3 {
  color: #4a90e2 !important;
}

/* ========== 标题输入区域 ========== */
.title-input-wrapper {
  position: relative;
  padding: 24px 32px;
  background: var(--dark-bg-primary, var(--td-bg-color-container));
  border-bottom: 1px solid var(--dark-border, var(--td-component-border));
  transition: var(--transition-base);
}

.title-input-wrapper:focus-within {
  background: var(--dark-bg-secondary, var(--td-bg-color-container-hover));
  box-shadow: inset 0 -2px 0 var(--td-brand-color);
}

.title-input {
  width: 100%;
  font-size: clamp(18px, 3vw, 24px);
  font-weight: 500;
  border: none;
  outline: none;
  background: transparent;
  color: var(--dark-text-primary, var(--td-text-color-primary));
  padding: 8px 0;
  transition: var(--transition-base);
  letter-spacing: 0.02em;
}

.title-input::placeholder {
  color: var(--dark-text-disabled, var(--td-text-color-placeholder));
  font-weight: 400;
}

.title-input:focus {
  transform: translateY(-2px);
}

.title-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #4a90e2, #5ba3f5);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.title-input:focus~.title-underline {
  width: 100%;
}

/* ========== 上传区域 ========== */
.upload-page-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 5vw, 40px);
  background: var(--td-bg-color-page);
  overflow-y: auto;
}

.upload-container {
  width: 100%;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px;
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 上传区域 */
.upload-zone {
  border: 3px dashed var(--td-component-border);
  border: 3px dashed var(--td-component-border);
  border-radius: 16px;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--td-bg-color-container);
  background: var(--td-bg-color-container);
  position: relative;
  min-height: 320px;
}

.upload-zone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 82, 217, 0.02) 0%, rgba(0, 82, 217, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.upload-zone:hover {
  border-color: var(--td-brand-color);
  border-color: var(--td-brand-color);
  border-style: solid;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.upload-zone:hover::before {
  opacity: 1;
}

.upload-icon-wrapper {
  width: 72px;
  height: 72px;
  background: var(--td-brand-color);
  background: var(--td-brand-color);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.upload-zone:hover .upload-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 24px rgba(0, 82, 217, 0.3);
}

.upload-icon {
  font-size: 36px !important;
  color: white !important;
}

.upload-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  color: var(--td-text-color-primary);
  margin-bottom: 6px;
}

.upload-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--td-text-color-secondary);
  color: var(--td-text-color-secondary);
  font-size: 13px;
  margin-bottom: 16px;
}

.upload-hint {
  color: var(--td-text-color-secondary);
  color: var(--td-text-color-secondary);
}

.upload-divider {
  color: var(--td-component-border);
  color: var(--td-component-border);
}

.upload-formats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.format-tag {
  padding: 4px 12px;
  background: var(--td-bg-color-secondarycontainer);
  border: 1px solid var(--td-component-border);
  background: var(--td-bg-color-secondarycontainer);
  border: 1px solid var(--td-component-border);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--td-text-color-secondary);
  color: var(--td-text-color-secondary);
  transition: all 0.2s;
}

.upload-zone:hover .format-tag {
  background: var(--td-brand-color-light);
  border-color: var(--td-brand-color);
  color: var(--td-brand-color);
  background: var(--td-brand-color-light);
  border-color: var(--td-brand-color);
  color: var(--td-brand-color);
}

/* 已上传文件卡片 */
.uploaded-file-card {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-component-border);
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-component-border);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.uploaded-file-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--td-brand-color);
  border-color: var(--td-brand-color);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.file-icon-wrapper {
  width: 48px;
  height: 48px;
  background: var(--td-bg-color-secondarycontainer);
  background: var(--td-bg-color-secondarycontainer);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon {
  font-size: 24px !important;
  color: var(--td-text-color-secondary) !important;
  color: var(--td-text-color-secondary) !important;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  color: var(--td-text-color-primary);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.file-size {
  color: var(--td-text-color-secondary);
  color: var(--td-text-color-secondary);
}

.file-status {
  color: var(--td-success-color);
  color: var(--td-success-color);
  font-weight: 500;
}

/* 视频设置卡片 */
.video-settings-card {
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-component-border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-smooth);
  animation: fadeInUp 0.5s ease-out 0.1s both;
}

.video-settings-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--td-brand-color);
  transform: translateY(-2px);
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--td-component-border);
  position: relative;
}

.settings-header::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: var(--td-brand-color);
  transition: width 0.3s ease;
}

.video-settings-card:hover .settings-header::after {
  width: 120px;
}

.settings-icon {
  font-size: 20px !important;
  color: var(--td-brand-color) !important;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }
}

.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  letter-spacing: 0.02em;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  background: var(--td-bg-color-secondarycontainer);
  transition: var(--transition-base);
}

.setting-item:hover {
  background: var(--td-bg-color-container-hover);
  transform: translateX(4px);
}

.setting-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--td-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.cover-upload-zone {
  background: var(--td-bg-color-secondarycontainer);
  border: 2px dashed var(--td-component-border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: var(--transition-smooth);
  position: relative;
  overflow: hidden;
}

.cover-upload-zone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(0, 82, 217, 0.03), rgba(0, 82, 217, 0.08));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-upload-zone:hover {
  border-color: var(--td-brand-color);
  border-style: solid;
  transform: scale(1.02);
  box-shadow: var(--shadow-sm);
}

.cover-upload-zone:hover::before {
  opacity: 1;
}

/* ========== 响应式设计 ========== */
@media (max-width: 1024px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  aside {
    width: 300px !important;
  }
}

@media (max-width: 768px) {
  .header-bar {
    padding: 0 12px;
    height: auto;
    min-height: 56px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .header-left {
    flex-wrap: wrap;
  }

  .type-btn {
    font-size: 12px !important;
    padding: 6px 10px !important;
  }

  .title-input-wrapper {
    padding: 16px 20px;
  }

  .markdown-toolbar {
    padding: 6px 12px;
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  aside {
    position: fixed;
    right: -100%;
    top: 0;
    height: 100vh;
    width: 100% !important;
    max-width: 400px;
    z-index: 100;
    transition: right 0.3s ease;
  }

  aside.mobile-open {
    right: 0;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.2);
  }
}

/* ========== 滚动条美化 ========== */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--td-component-border) transparent;
}

*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: var(--td-component-border);
  border-radius: 4px;
  transition: var(--transition-base);
}

*::-webkit-scrollbar-thumb:hover {
  background: var(--td-text-color-placeholder);
}

/* ========== 加载动画 ========== */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }

  100% {
    background-position: 1000px 0;
  }
}

.loading-shimmer {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(90deg,
      var(--td-bg-color-container) 0%,
      var(--td-bg-color-container-hover) 50%,
      var(--td-bg-color-container) 100%);
  background-size: 1000px 100%;
}

/* ========== 焦点可见性 ========== */
*:focus-visible {
  outline: 2px solid var(--td-brand-color);
  outline-offset: 2px;
  border-radius: 4px;
}

button:focus-visible,
.type-btn:focus-visible,
.markdown-btn:focus-visible {
  outline: 2px solid var(--td-brand-color);
  outline-offset: 2px;
}

/* ========== 选择文本样式 ========== */
::selection {
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
}

::-moz-selection {
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
}

/* ========== 悬赏滑块美化 ========== */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg,
      var(--td-warning-color-2) 0%,
      var(--td-warning-color) 100%);
  outline: none;
  transition: var(--transition-base);
}

input[type="range"]:hover {
  box-shadow: 0 2px 8px rgba(255, 153, 0, 0.3);
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--td-warning-color);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: var(--transition-base);
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(255, 153, 0, 0.4);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--td-warning-color);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: var(--transition-base);
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(255, 153, 0, 0.4);
}

/* ========== 按钮增强 ========== */
.t-button {
  transition: var(--transition-base) !important;
}

.t-button:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm) !important;
}

.t-button:active {
  transform: translateY(0);
}

/* ========== Fix TDesign Upload Component ========== */
:deep(.t-upload__dragger) {
  width: 100%;
  height: auto !important;
  overflow: visible !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
}

:deep(.t-upload) {
  width: 100%;
  overflow: visible !important;
}

:deep(.t-upload__card-item) {
  transition: var(--transition-smooth) !important;
}

:deep(.t-upload__card-item:hover) {
  transform: scale(1.02);
  box-shadow: var(--shadow-md) !important;
}

/* ========== 表单项美化 ========== */
:deep(.t-form-item) {
  margin-bottom: 20px;
}

:deep(.t-form__label) {
  font-weight: 500;
  color: var(--td-text-color-primary);
  margin-bottom: 8px;
}

:deep(.t-input),
:deep(.t-textarea),
:deep(.t-select) {
  transition: var(--transition-base) !important;
}

:deep(.t-input:hover),
:deep(.t-textarea:hover),
:deep(.t-select:hover) {
  border-color: var(--td-brand-color) !important;
}

:deep(.t-input:focus),
:deep(.t-textarea:focus) {
  box-shadow: 0 0 0 2px rgba(0, 82, 217, 0.1) !important;
}

/* ========== 标签选择器美化 ========== */
:deep(.t-tag) {
  transition: var(--transition-base) !important;
}

:deep(.t-tag:hover) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* ========== 深色主题全局覆盖 ========== */
.t-layout {
  background: var(--dark-bg-primary, var(--td-bg-color-page)) !important;
}

main {
  background: var(--dark-bg-primary, var(--td-bg-color-page)) !important;
}

aside {
  background: var(--dark-bg-secondary, var(--td-bg-color-container)) !important;
  border-color: var(--dark-border, var(--td-component-border)) !important;
}

/* 编辑器背景 */
.tinymce-wrapper :deep(.tox-edit-area) {
  background: var(--dark-bg-primary, var(--td-bg-color-page)) !important;
}

.tinymce-wrapper :deep(.tox-edit-area__iframe) {
  background: var(--dark-bg-primary, var(--td-bg-color-container)) !important;
}

.tinymce-wrapper :deep(.tox-editor-header) {
  background: var(--dark-bg-secondary, var(--td-bg-color-container)) !important;
  border-color: var(--dark-border, var(--td-component-border)) !important;
}

.tinymce-wrapper :deep(.tox-toolbar-overlord),
.tinymce-wrapper :deep(.tox-toolbar__primary) {
  background: var(--dark-bg-secondary, var(--td-bg-color-container)) !important;
}

/* Markdown 编辑区 */
.md-editor-textarea {
  background: var(--dark-bg-primary, var(--td-bg-color-secondarycontainer)) !important;
  color: var(--dark-text-primary, var(--td-text-color-primary)) !important;
}

/* 上传区域深色 */
.upload-zone {
  background: var(--dark-bg-secondary, var(--td-bg-color-container));
  border-color: var(--dark-border, var(--td-component-border));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.uploaded-file-card {
  background: var(--dark-bg-secondary, var(--td-bg-color-container));
  border-color: var(--dark-border, var(--td-component-border));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.video-settings-card {
  background: var(--dark-bg-secondary, var(--td-bg-color-container));
  border-color: var(--dark-border, var(--td-component-border));
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.upload-title,
.file-name,
.settings-title {
  color: var(--dark-text-primary, var(--td-text-color-primary)) !important;
}

.upload-subtitle,
.file-size,
.setting-label {
  color: var(--dark-text-secondary, var(--td-text-color-secondary)) !important;
}

/* 封面上传区 */
.cover-upload-zone {
  background: var(--dark-bg-tertiary, var(--td-bg-color-secondarycontainer));
  border-color: var(--dark-border, var(--td-component-border));
}

/* 表单组件深色 */
:deep(.t-input),
:deep(.t-textarea),
:deep(.t-select) {
  background: var(--dark-bg-tertiary, var(--td-bg-color-container)) !important;
  border-color: var(--dark-border, var(--td-component-border)) !important;
  color: var(--dark-text-primary, var(--td-text-color-primary)) !important;
}

:deep(.t-input__inner),
:deep(.t-textarea__inner) {
  background: transparent !important;
  color: var(--dark-text-primary, var(--td-text-color-primary)) !important;
}

:deep(.t-select__wrap) {
  background: var(--dark-bg-tertiary, var(--td-bg-color-container)) !important;
}

/* 按钮深色 */
:deep(.t-button--variant-outline) {
  border-color: var(--dark-border, var(--td-component-border)) !important;
  color: var(--dark-text-primary, var(--td-text-color-primary)) !important;
}

:deep(.t-button--variant-outline:hover) {
  background: var(--dark-bg-tertiary, var(--td-bg-color-container-hover)) !important;
}

/* 编辑模式切换栏 */
.px-8.py-2 {
  background: var(--dark-bg-secondary, var(--td-bg-color-container)) !important;
  border-color: var(--dark-border, var(--td-component-border)) !important;
}

/* Markdown 预览区 */
.prose {
  background: var(--dark-bg-secondary, var(--td-bg-color-container)) !important;
  color: var(--dark-text-primary, var(--td-text-color-primary)) !important;
}

/* 设置项背景 */
.setting-item {
  background: var(--dark-bg-tertiary, var(--td-bg-color-secondarycontainer)) !important;
}

.setting-item:hover {
  background: var(--dark-bg-primary, var(--td-bg-color-container-hover)) !important;
}

/* 文件图标包装器 */
.file-icon-wrapper {
  background: var(--dark-bg-tertiary, var(--td-bg-color-secondarycontainer)) !important;
}

/* 格式标签 */
.format-tag {
  background: var(--dark-bg-tertiary, var(--td-bg-color-secondarycontainer)) !important;
  border-color: var(--dark-border, var(--td-component-border)) !important;
  color: var(--dark-text-secondary, var(--td-text-color-secondary)) !important;
}

/* ========== 暗色模式优化 ========== */
@media (prefers-color-scheme: dark) {
  .upload-zone {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  .uploaded-file-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  .video-settings-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }
}
</style>
