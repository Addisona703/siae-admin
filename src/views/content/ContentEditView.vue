<template>
  <t-layout style="height: 100vh; display: flex; flex-direction: column; overflow: hidden;">
    <!-- 顶部导航栏 -->
    <t-header class="header-bar">
      <div class="header-left">
        <t-button variant="text" shape="square" @click="goBack" size="large">
          <template #icon><ArrowLeftIcon /></template>
        </t-button>
        
        <!-- 显示内容类型（不可切换） -->
        <div class="flex items-center gap-2">
          <div class="content-type-badge" v-if="currentType">
            <component :is="currentTypeIcon" size="16px" />
            <span>编辑{{ currentTypeName }}</span>
          </div>
        </div>
        
        <span class="text-xs text-gray-400 ml-2" v-if="lastSaved">上次保存: {{ lastSaved }}</span>
        <span class="text-xs text-gray-400 ml-2" v-else-if="loading">加载中...</span>
      </div>

      <div class="flex gap-2">
        <t-button theme="default" variant="outline" size="medium" @click="saveDraft">存草稿</t-button>
        <t-button theme="primary" @click="handleSubmit" size="medium" :loading="submitting">
          <template #icon><SendIcon /></template>
          更新{{ currentTypeName }}
        </t-button>
      </div>
    </t-header>

    <!-- 主体布局 -->
    <div class="flex-1 flex overflow-hidden" v-if="!loading">
      <!-- 左侧：主要编辑区 -->
      <main class="flex-1 flex flex-col bg-gray-50 relative min-w-0 overflow-hidden">
        <!-- 通用标题输入 -->
        <div class="px-6 py-5 shrink-0 bg-white border-b">
          <input 
            v-model="form.title" 
            type="text" 
            placeholder="请输入标题..." 
            class="w-full text-xl font-normal border-none focus:ring-0 outline-none placeholder:text-gray-300 text-gray-700"
          >
        </div>

        <!-- 文字类内容编辑区 (文章/笔记/提问) -->
        <div v-if="isTextContent" class="flex-1 flex flex-col overflow-hidden">
          <!-- 编辑模式切换栏 -->
          <div class="px-8 py-2 flex items-center justify-between bg-white border-b shrink-0 z-10">
            <div class="text-xs text-gray-400 flex items-center gap-2">
              <span v-if="form.type === 2" class="text-orange-500 bg-orange-50 px-2 py-1 rounded">提问模式</span>
              <span v-else>编辑模式</span>
            </div>
            
            <div class="flex bg-gray-100 p-0.5 rounded-md">
              <button 
                @click="switchEditorMode('word')"
                class="px-3 py-1 rounded text-xs font-medium transition-all"
                :class="editorMode === 'word' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'"
              >Word 模式</button>
              <button 
                @click="switchEditorMode('markdown')"
                class="px-3 py-1 rounded text-xs font-medium transition-all"
                :class="editorMode === 'markdown' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'"
              >Markdown</button>
            </div>
          </div>      
    <!-- 编辑器主体 -->
          <div class="flex-1 flex flex-col overflow-hidden relative">
            <!-- Word 模式 -->
            <div v-show="editorMode === 'word'" class="h-full flex flex-col">
              <!-- Word 工具栏 -->
              <div class="word-toolbar">
                <select class="toolbar-select">
                  <option>Normal</option>
                  <option>标题 1</option>
                  <option>标题 2</option>
                  <option>标题 3</option>
                </select>
                <div class="toolbar-divider"></div>
                <button class="toolbar-btn" title="加粗"><FormatHorizontalAlignCenterIcon /></button>
                <button class="toolbar-btn" title="斜体"><EditIcon /></button>
                <button class="toolbar-btn" title="下划线">U</button>
                <button class="toolbar-btn" title="删除线">S</button>
                <div class="toolbar-divider"></div>
                <button class="toolbar-btn" title="字体颜色">A</button>
                <button class="toolbar-btn" title="背景色">🎨</button>
                <div class="toolbar-divider"></div>
                <button class="toolbar-btn" title="有序列表">≡</button>
                <button class="toolbar-btn" title="无序列表">⋮</button>
                <button class="toolbar-btn" title="对齐">≣</button>
                <div class="toolbar-divider"></div>
                <button class="toolbar-btn" title="链接"><LinkIcon /></button>
                <button class="toolbar-btn" title="图片"><ImageIcon /></button>
                <button class="toolbar-btn" title="引用">❝</button>
                <button class="toolbar-btn" title="代码"><CodeIcon /></button>
              </div>
              
              <!-- 编辑区域 -->
              <div class="flex-1 overflow-y-auto bg-gray-50 p-6">
                <div class="word-paper">
                  <textarea 
                    v-model="form.content" 
                    placeholder="在此编辑内容..."
                    class="w-full h-full min-h-[600px] !border-none focus:!ring-0 !outline-none resize-none text-base leading-relaxed"
                    @input="autoSave"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Markdown 模式 -->
            <div v-show="editorMode === 'markdown'" class="h-full flex flex-col">
              <!-- Markdown 工具栏 -->
              <div class="markdown-toolbar shrink-0">
                <t-tooltip content="加粗 (Ctrl+B)">
                  <button class="markdown-btn !border-0" @click="insertMd('bold')"><FormatHorizontalAlignCenterIcon /></button>
                </t-tooltip>
                <t-tooltip content="斜体 (Ctrl+I)">
                  <button class="markdown-btn !border-0" @click="insertMd('italic')"><EditIcon /></button>
                </t-tooltip>
                <div class="!w-px !h-4 !bg-gray-300 !mx-1"></div>
                <t-tooltip content="一级标题">
                  <button class="markdown-btn !font-bold !border-0" @click="insertMd('h1')">H1</button>
                </t-tooltip>
                <t-tooltip content="二级标题">
                  <button class="markdown-btn !font-bold !border-0" @click="insertMd('h2')">H2</button>
                </t-tooltip>
                <t-tooltip content="三级标题">
                  <button class="markdown-btn !font-bold !border-0" @click="insertMd('h3')">H3</button>
                </t-tooltip>
                <div class="!w-px !h-4 !bg-gray-300 !mx-1"></div>
                <t-tooltip content="引用">
                  <button class="markdown-btn !border-0" @click="insertMd('quote')"><ChatIcon /></button>
                </t-tooltip>
                <t-tooltip content="代码块">
                  <button class="markdown-btn !border-0" @click="insertMd('code')"><CodeIcon /></button>
                </t-tooltip>
                <t-tooltip content="链接">
                  <button class="markdown-btn !border-0" @click="insertMd('link')"><LinkIcon /></button>
                </t-tooltip>
                <t-tooltip content="图片">
                  <button class="markdown-btn !border-0" @click="insertMd('image')"><ImageIcon /></button>
                </t-tooltip>
              </div>

              <!-- 编辑与预览分屏 -->
              <div class="flex-1 flex overflow-hidden">
                <div class="w-1/2 h-full border-r bg-gray-50 flex flex-col">
                  <textarea 
                    ref="mdTextarea"
                    v-model="form.content" 
                    class="w-full h-full p-6 resize-none border-none bg-transparent focus:ring-0 outline-none md-editor-textarea text-sm text-gray-700" 
                    placeholder="# 编辑你的 Markdown 内容..."
                    @input="autoSave"
                  ></textarea>
                </div>
                <div class="w-1/2 h-full bg-white prose max-w-none overflow-y-auto p-8" v-html="compiledMarkdown"></div>
              </div>
            </div>
          </div>
        </div> 
       <!-- 文件/视频编辑区 -->
        <div v-if="isFileContent" class="upload-page-wrapper">
          <div class="upload-container">
            <!-- 当前文件信息 -->
            <div v-if="form.fileUrl" class="current-file-card">
              <div class="file-info">
                <div class="file-icon-wrapper">
                  <component :is="form.type === 4 ? VideoIcon : FileIcon" class="file-icon" />
                </div>
                <div class="file-details">
                  <div class="file-name">{{ form.fileName || '当前文件' }}</div>
                  <div class="file-meta">
                    <span class="file-size">{{ form.fileSize ? formatFileSize(form.fileSize) : '未知大小' }}</span>
                    <span class="file-status">✓ 已上传</span>
                  </div>
                </div>
              </div>
              <t-button variant="text" theme="danger" @click="showReplaceUpload = true">
                替换文件
              </t-button>
            </div>

            <!-- 替换文件上传区域 -->
            <div v-if="showReplaceUpload || !form.fileUrl" class="upload-zone-wrapper">
              <t-upload
                v-model="uploadFiles"
                draggable
                theme="custom"
                :accept="form.type === 4 ? 'video/*' : '*'"
                :auto-upload="false"
                @change="handleFileChange"
              >
                <template #dragContent>
                  <div class="upload-zone">
                    <div class="upload-icon-wrapper">
                      <component :is="form.type === 4 ? VideoIcon : CloudUploadIcon" class="upload-icon" />
                    </div>
                    <h3 class="upload-title">{{ form.fileUrl ? '替换' : '上传' }}{{ currentTypeName }}</h3>
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

              <div class="flex gap-2 mt-4" v-if="form.fileUrl">
                <t-button theme="default" @click="showReplaceUpload = false">取消替换</t-button>
                <t-button theme="primary" @click="confirmReplace" :disabled="uploadFiles.length === 0">确认替换</t-button>
              </div>
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
      <aside class="w-80 bg-white border-l flex flex-col h-full overflow-y-auto z-10">
        <div class="sidebar-card">
          <h3 class="font-medium text-gray-700 mb-3 text-sm flex items-center gap-2">
            <RootListIcon size="16px" /> 发布设置
          </h3>
          <t-form label-align="top" :data="form">
            <t-form-item label="所属分类" name="categoryId">
              <t-select v-model="form.categoryId" placeholder="请选择分类" filterable>
                <t-option v-for="c in categories" :key="c.id" :value="c.id" :label="c.name"></t-option>
              </t-select>
            </t-form-item>

            <t-form-item label="标签 (Tags)" name="tags">
              <t-tag-input v-model="form.tags" placeholder="输入回车添加" />
            </t-form-item>

            <t-form-item label="摘要" name="description">
              <t-textarea v-model="form.description" placeholder="用于列表页展示..." :autosize="{ minRows: 3, maxRows: 6 }"></t-textarea>
            </t-form-item>
          </t-form>
        </div>

        <div class="sidebar-card" v-if="[0, 1, 4].includes(form.type)">
          <h3 class="font-medium text-gray-700 mb-3 text-sm flex items-center gap-2">
            <ImageIcon size="16px" /> 封面设置
          </h3>
          <div class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
            <t-upload
              v-model="coverList"
              theme="image"
              accept="image/*"
              :max="1"
              :auto-upload="false"
            ></t-upload>
            <div class="text-xs text-gray-400 mt-2">建议尺寸 16:9 <br> 支持 JPG/PNG, Max 5MB</div>
          </div>
        </div>

        <div class="sidebar-card" v-if="form.type === 2">
          <h3 class="font-medium text-gray-700 mb-3 text-sm flex items-center gap-2">
            <WalletIcon size="16px" /> 悬赏设置
          </h3>
          <div class="bg-orange-50 p-4 rounded border border-orange-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-orange-800 text-sm font-bold">悬赏积分</span>
              <span class="text-2xl font-bold text-orange-600">{{ form.questionReward || 0 }}</span>
            </div>
            <input type="range" v-model="form.questionReward" min="0" max="100" step="10" class="w-full accent-orange-500">
          </div>
        </div>
      </aside>
    </div>

    <!-- 加载状态 -->
    <div v-else class="flex-1 flex items-center justify-center">
      <t-loading size="large" text="加载内容中..." />
    </div>
  </t-layout>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { marked } from 'marked'
import { contentApi } from '@/api/content'
import type { ContentUpdateDTO, CategoryVO } from '@/types'
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
  FormatHorizontalAlignCenterIcon,
  EditIcon,
  ChatIcon,
  CodeIcon,
  LinkIcon,
  CloseIcon
} from 'tdesign-icons-vue-next'

const router = useRouter()
const route = useRoute()

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
  id: null as number | null,
  title: '',
  type: 0,
  content: '',
  categoryId: null as number | null,
  tags: [] as string[],
  description: '',
  duration: 0,
  resolution: '1080p',
  questionReward: 0,
  fileUrl: '',
  fileName: '',
  fileSize: 0,
  coverUrl: ''
})

// 状态管理
const loading = ref(true)
const submitting = ref(false)
const editorMode = ref('word')
const lastSaved = ref<string | null>(null)
const uploadFiles = ref<any[]>([])
const coverList = ref<any[]>([])
const showReplaceUpload = ref(false)
const mdTextarea = ref<HTMLTextAreaElement | null>(null)

// 分类数据
const categories = ref<CategoryVO[]>([])

// 计算属性
const currentType = computed(() => {
  return contentTypes.find(t => t.value === form.type)
})

const currentTypeName = computed(() => currentType.value?.label || '内容')
const currentTypeIcon = computed(() => currentType.value?.icon || ArticleIcon)

const isTextContent = computed(() => [0, 1, 2].includes(form.type))
const isFileContent = computed(() => [3, 4].includes(form.type))

const compiledMarkdown = computed(() => {
  return marked.parse(form.content || '')
})

// 初始化数据
onMounted(async () => {
  const contentId = route.params.id || route.query.id
  const contentType = route.query.type
  
  if (!contentId) {
    MessagePlugin.error('缺少内容ID参数')
    router.back()
    return
  }

  try {
    // 加载分类和内容数据
    await Promise.all([
      loadCategories(),
      loadContentData(contentId as string, contentType as string)
    ])
  } catch (error) {
    MessagePlugin.error('加载数据失败')
    console.error('Load data error:', error)
  } finally {
    loading.value = false
  }
})

// 加载分类数据
const loadCategories = async () => {
  try {
    const pageDTO = {
      pageNum: 1,
      pageSize: 100,
      params: { enable: 1 }
    }
    const res = await contentApi.getCategoryPage(pageDTO)
    if (res.code === 200 && res.data) {
      categories.value = res.data.records || []
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 类型映射：后端字符串 -> 前端数字
const typeStringToNumber: Record<string, number> = {
  'article': 0,
  'note': 1,
  'question': 2,
  'file': 3,
  'video': 4
}

// 加载内容数据
const loadContentData = async (id: string, type?: string) => {
  try {
    const contentId = parseInt(id)
    const res = await contentApi.getContentById(contentId)
    
    if (res.code === 200 && res.data) {
      const content = res.data
      const detail = content.detail
      
      // 转换类型：字符串 -> 数字
      const contentType = typeof content.type === 'string' 
        ? typeStringToNumber[content.type] ?? 0
        : content.type
      
      // 填充基本信息
      form.id = content.id || null
      form.title = content.title || ''
      form.type = contentType
      form.categoryId = content.categoryId || null
      form.tags = (content as any).tagIds ? (content as any).tagIds.map((id: number) => id.toString()) : []
      form.description = content.description || ''
      
      // 根据类型填充详细信息
      if (detail) {
        const detailData = detail as any
        
        // 文字类内容 (文章/笔记/问题)
        if ([0, 1, 2].includes(contentType)) {
          form.content = detailData.content || ''
          
          // 问题特有字段
          if (contentType === 2 && detailData.reward !== undefined) {
            form.questionReward = detailData.reward || 0
          }
          
          // 封面 (文章和笔记可能有封面)
          if (detailData.coverUrl) {
            form.coverUrl = detailData.coverUrl
            coverList.value = [{
              url: detailData.coverUrl,
              name: 'cover.jpg'
            }]
          }
        } 
        // 文件类内容
        else if (contentType === 3) {
          form.fileUrl = detailData.filePath || detailData.fileUrl || ''
          form.fileName = detailData.fileName || ''
          form.fileSize = detailData.fileSize || 0
        }
        // 视频类内容
        else if (contentType === 4) {
          form.fileUrl = detailData.videoUrl || detailData.fileUrl || ''
          form.fileName = form.title // 视频使用标题作为文件名
          form.duration = detailData.duration || 0
          form.resolution = detailData.resolution || '1080p'
          
          // 视频封面
          if (detailData.coverUrl) {
            form.coverUrl = detailData.coverUrl
            coverList.value = [{
              url: detailData.coverUrl,
              name: 'cover.jpg'
            }]
          }
        }
      }
      
      console.log('加载的内容数据:', form)
    } else {
      MessagePlugin.error(res.message || '加载内容失败')
      router.back()
    }
  } catch (error: any) {
    console.error('加载内容失败:', error)
    MessagePlugin.error(error.message || '加载内容失败')
    router.back()
  }
}

// Methods
const switchEditorMode = (mode: string) => {
  editorMode.value = mode
}

const insertMd = (type: string) => {
  const textarea = mdTextarea.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = form.content || ''
  const selection = text.substring(start, end)
  
  let insert = ''

  switch (type) {
    case 'bold':
      insert = `**${selection || '粗体文本'}**`
      break
    case 'italic':
      insert = `*${selection || '斜体文本'}*`
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
    textarea.setSelectionRange(start + insert.length, start + insert.length)
  })
  autoSave()
}

const handleFileChange = (val: any[]) => {
  if (val && val.length > 0) {
    uploadFiles.value = val
  }
}

const confirmReplace = () => {
  if (uploadFiles.value.length > 0) {
    // 这里应该上传新文件并更新 form.fileUrl 等
    MessagePlugin.success('文件替换成功')
    showReplaceUpload.value = false
    uploadFiles.value = []
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const autoSave = () => {
  const now = new Date()
  lastSaved.value = `${now.getHours()}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()}`
  // 这里可以实现自动保存逻辑
}

const saveDraft = async () => {
  if (!form.id) {
    MessagePlugin.warning('内容ID不存在')
    return
  }

  try {
    MessagePlugin.loading('保存草稿中...')
    
    const updateData: ContentUpdateDTO = {
      id: form.id!,
      title: form.title || '未命名',
      type: form.type,
      categoryId: form.categoryId || undefined,
      description: form.description,
      status: 0, // 草稿状态
      ...buildContentFields()
    }
    
    const res = await contentApi.editContent(updateData)
    
    if (res.code === 200) {
      MessagePlugin.success('草稿保存成功')
      autoSave()
    } else {
      MessagePlugin.error(res.message || '保存草稿失败')
    }
  } catch (error: any) {
    console.error('保存草稿失败:', error)
    MessagePlugin.error(error.message || '保存草稿失败')
  }
}

// 构建内容字段
const buildContentFields = () => {
  const fields: any = {}
  
  if (form.type === 0) {
    // 文章
    fields.articleContent = form.content
  } else if (form.type === 1) {
    // 笔记
    fields.noteContent = form.content
  } else if (form.type === 2) {
    // 问题
    fields.questionContent = form.content
  } else if (form.type === 3 || form.type === 4) {
    // 文件/视频
    fields.fileUrl = form.fileUrl
    fields.fileName = form.fileName
  }
  
  return fields
}

const handleSubmit = async () => {
  if (!form.id) {
    MessagePlugin.warning('内容ID不存在')
    return
  }

  if (!form.title) {
    MessagePlugin.warning('请输入标题')
    return
  }

  if (isTextContent.value && !form.content) {
    MessagePlugin.warning('请输入内容')
    return
  }

  if (isFileContent.value && !form.fileUrl && uploadFiles.value.length === 0) {
    MessagePlugin.warning('请上传文件')
    return
  }

  try {
    submitting.value = true
    MessagePlugin.loading('更新中...')
    
    const updateData: ContentUpdateDTO = {
      id: form.id!,
      title: form.title,
      type: form.type,
      categoryId: form.categoryId || undefined,
      description: form.description,
      status: 2, // 已发布状态
      ...buildContentFields()
    }
    
    const res = await contentApi.editContent(updateData)
    
    if (res.code === 200) {
      MessagePlugin.success('更新成功！')
      // 跳转回内容列表
      setTimeout(() => {
        router.push({ name: 'ContentList' })
      }, 1000)
    } else {
      MessagePlugin.error(res.message || '更新失败')
    }
  } catch (error: any) {
    console.error('更新失败:', error)
    MessagePlugin.error(error.message || '更新失败')
  } finally {
    submitting.value = false
  }
}

const goBack = () => {
  router.back()
}
</script><style 
scoped>
/* 顶部导航栏 */
.header-bar {
  background: white;
  padding: 0 24px;
  height: 56px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 内容类型标识 */
.content-type-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* Word 工具栏 */
.word-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.toolbar-select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: white;
  cursor: pointer;
  outline: none;
}

.toolbar-select:hover {
  border-color: #0052d9;
}

.toolbar-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
  border-radius: 4px !important;
  color: #666 !important;
  font-size: 16px !important;
  font-weight: bold !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.toolbar-btn:hover {
  background: #f3f4f6 !important;
  color: #0052d9 !important;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #e5e7eb;
  margin: 0 4px;
}

/* Word 模式模拟纸张效果 */
.word-paper {
  width: 100%;
  max-width: 800px;
  min-height: 100%;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 0 auto;
  padding: 32px 48px;
  border-radius: 2px;
}

/* Markdown 模式样式 */
.markdown-toolbar {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 6px 16px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.markdown-btn {
  padding: 4px 8px !important;
  border-radius: 4px !important;
  color: #666 !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  background: transparent !important;
}

.markdown-btn:hover {
  background-color: #f3f4f6 !important;
  color: #0052d9 !important;
}

.md-editor-textarea {
  font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  line-height: 1.6;
}

/* Markdown 预览样式 */
.prose :deep(h1) {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 0.5em;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.3em;
}

.prose :deep(h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 1em;
}

.prose :deep(h3) {
  font-size: 1.25em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 1em;
}

.prose :deep(p) {
  margin-bottom: 1em;
  line-height: 1.6;
}

.prose :deep(ul) {
  list-style-type: disc;
  padding-left: 1.5em;
  margin-bottom: 1em;
}

.prose :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin-bottom: 1em;
}

.prose :deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1em;
  color: #6b7280;
  margin: 1em 0;
}

.prose :deep(code) {
  background: #f1f5f9;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
}

.prose :deep(pre) {
  background: #1e293b;
  color: #fff;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}

.prose :deep(img) {
  max-width: 100%;
  border-radius: 4px;
  margin: 1em 0;
}

.prose :deep(a) {
  color: #0052d9;
  text-decoration: underline;
}

/* 侧边栏 */
.sidebar-card {
  background: #fff;
  padding: 18px 20px;
  border-bottom: 1px solid #e5e7eb;
}

/* 当前文件卡片 */
.current-file-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon {
  font-size: 24px !important;
  color: #6b7280 !important;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
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
  color: #6b7280;
}

.file-status {
  color: #10b981;
  font-weight: 500;
}

/* 上传页面包装器 */
.upload-page-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  overflow-y: auto;
}

/* 上传容器 */
.upload-container {
  width: 100%;
  max-width: 650px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  padding: 8px;
}

.upload-zone-wrapper {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* 上传区域 */
.upload-zone {
  border: 3px dashed #d1d5db;
  border-radius: 16px;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  position: relative;
  overflow: hidden;
  min-height: 280px;
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
  border-color: #0052d9;
  border-style: solid;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 82, 217, 0.15);
}

.upload-zone:hover::before {
  opacity: 1;
}

.upload-icon-wrapper {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #0052d9 0%, #0084ff 100%);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(0, 82, 217, 0.2);
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
  color: #1f2937;
  margin-bottom: 6px;
}

.upload-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 16px;
}

.upload-hint {
  color: #6b7280;
}

.upload-divider {
  color: #d1d5db;
}

.upload-formats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.format-tag {
  padding: 4px 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.upload-zone:hover .format-tag {
  background: #e7f3ff;
  border-color: #0052d9;
  color: #0052d9;
}

/* 视频设置卡片 */
.video-settings-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
}

.settings-icon {
  font-size: 18px !important;
  color: #0052d9 !important;
}

.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}
</style>