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

        <span class="text-xs text-gray-400 ml-2" v-if="lastSaved">上次保存: {{ lastSaved }}</span>
        <span class="text-xs text-gray-400 ml-2" v-else>草稿状态</span>
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
        <div class="px-6 py-5 shrink-0 border-b"
          style="background: var(--td-bg-color-container); border-color: var(--td-component-border);">
          <input v-model="form.title" type="text" placeholder="请输入引人注目的标题..."
            class="w-full text-xl font-normal border-none focus:ring-0 outline-none"
            style="background: transparent; color: var(--td-text-color-primary);"
            :style="{ '::placeholder': { color: 'var(--td-text-color-placeholder)' } }">
        </div>

        <!-- 场景 A: 文字创作 (文章/笔记/提问) -->
        <div v-if="[0, 1, 2].includes(form.type)" class="flex-1 flex flex-col overflow-hidden">
          <!-- 编辑模式切换栏 -->
          <div class="px-8 py-2 flex items-center justify-between border-b shrink-0 z-10"
            style="background: var(--td-bg-color-container); border-color: var(--td-component-border);">
            <div class="text-xs text-gray-400 flex items-center gap-2">
              <span v-if="form.type === 2" class="text-orange-500 bg-orange-50 px-2 py-1 rounded">提问模式：请详细描述问题背景</span>
              <span v-else>创作模式</span>
            </div>
            <!--
            <div class="flex p-0.5 rounded-md" style="background: var(--td-bg-color-component);">
              <button @click="switchEditorMode('word')"
                class="px-3 py-1 rounded text-xs font-medium transition-all editor-mode-btn"
                :class="editorMode === 'word' ? 'editor-mode-active' : 'editor-mode-normal'">Word 模式</button>
              <button @click="switchEditorMode('markdown')"
                class="px-3 py-1 rounded text-xs font-medium transition-all editor-mode-btn"
                :class="editorMode === 'markdown' ? 'editor-mode-active' : 'editor-mode-normal'">Markdown</button>
            </div> -->
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
                <button class="toolbar-btn" title="加粗">
                  <FormatHorizontalAlignCenterIcon />
                </button>
                <button class="toolbar-btn" title="斜体">
                  <EditIcon />
                </button>
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
                <button class="toolbar-btn" title="链接">
                  <LinkIcon />
                </button>
                <button class="toolbar-btn" title="图片">
                  <ImageIcon />
                </button>
                <button class="toolbar-btn" title="引用">❝</button>
                <button class="toolbar-btn" title="代码">
                  <CodeIcon />
                </button>
              </div>

              <!-- 编辑区域 -->
              <div class="flex-1 overflow-y-auto p-6" style="background: var(--td-bg-color-page);">
                <div class="word-paper">
                  <textarea v-model="form.content" placeholder="在此输入正文内容..."
                    class="w-full h-full min-h-[600px] !border-none focus:!ring-0 !outline-none resize-none text-base leading-relaxed"
                    style="background: transparent; color: var(--td-text-color-primary);" @input="autoSave"></textarea>
                </div>
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
                <div class="w-1/2 h-full border-r bg-gray-50 flex flex-col">
                  <textarea ref="mdTextarea" v-model="form.content"
                    class="w-full h-full p-6 resize-none border-none bg-transparent focus:ring-0 outline-none md-editor-textarea text-sm text-gray-700"
                    placeholder="# 开始你的 Markdown 写作..." @input="autoSave"></textarea>
                </div>
                <div class="w-1/2 h-full bg-white prose max-w-none overflow-y-auto p-8" v-html="compiledMarkdown"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 场景 B: 文件/视频上传 -->
        <div v-if="[3, 4].includes(form.type)" class="upload-page-wrapper">
          <div class="upload-container">
            <!-- 上传区域 -->
            <t-upload v-model="uploadFiles" draggable theme="custom" :accept="form.type === 4 ? 'video/*' : '*'"
              :auto-upload="false" @change="handleFileChange">
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
          <h3 class="font-medium text-gray-700 mb-3 text-sm flex items-center gap-2">
            <RootListIcon :size="16" /> 发布设置
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
              <t-textarea v-model="form.description" placeholder="用于列表页展示..."
                :autosize="{ minRows: 3, maxRows: 6 }"></t-textarea>
            </t-form-item>
          </t-form>
        </div>

        <div class="sidebar-card" v-if="[0, 1, 4].includes(form.type)">
          <h3 class="font-medium text-gray-700 mb-3 text-sm flex items-center gap-2">
            <ImageIcon :size="16" /> 封面设置
          </h3>
          <div
            class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
            <t-upload v-model="coverList" theme="image" accept="image/*" :max="1" :auto-upload="false"></t-upload>
            <div class="text-xs text-gray-400 mt-2">建议尺寸 16:9 <br> 支持 JPG/PNG, Max 5MB</div>
          </div>
        </div>

        <div class="sidebar-card" v-if="form.type === 2">
          <h3 class="font-medium text-gray-700 mb-3 text-sm flex items-center gap-2">
            <WalletIcon :size="16" /> 悬赏设置
          </h3>
          <div class="bg-orange-50 p-4 rounded border border-orange-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-orange-800 text-sm font-bold">悬赏积分</span>
              <span class="text-2xl font-bold text-orange-600">{{ questionReward }}</span>
            </div>
            <input type="range" v-model="questionReward" min="0" max="100" step="10" class="w-full accent-orange-500">
          </div>
        </div>
      </aside>
    </div>
  </t-layout>
</template>


<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { marked } from 'marked'
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
  tags: [],
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

// 分类数据
const categories = [
  { id: 1, name: '后端开发' },
  { id: 2, name: '前端技术' },
  { id: 3, name: '生活随笔' },
  { id: 4, name: '资源分享' }
]

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

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const autoSave = () => {
  const now = new Date()
  lastSaved.value = `${now.getHours()}:${now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()}`
}

const handleSubmit = () => {
  if (!form.title) {
    MessagePlugin.warning('请输入标题')
    return
  }
  MessagePlugin.loading('发布中...', 1000)
  setTimeout(() => {
    MessagePlugin.success('发布成功！')
    console.log('Submit Data:', { ...form })
  }, 1000)
}

const goBack = () => {
  router.back()
}
</script>


<style scoped>
/* 顶部导航栏 */
.header-bar {
  background: var(--td-bg-color-container);
  padding: 0 24px;
  height: 56px;
  border-bottom: 1px solid var(--td-component-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 50;
}

/* 类型切换按钮 */
.type-btn {
  cursor: pointer;
}

.type-btn-active {
  color: var(--td-brand-color) !important;
  background: var(--td-brand-color-light) !important;
}

.type-btn-normal {
  color: var(--td-text-color-secondary) !important;
  background: transparent !important;
}

.type-btn-normal:hover {
  background: var(--td-bg-color-container-hover) !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 编辑器区域样式 */
.editor-container {
  height: calc(100vh - 64px);
}

/* 编辑模式切换按钮 */
.editor-mode-btn {
  cursor: pointer;
  border: none;
}

.editor-mode-active {
  color: var(--td-brand-color) !important;
  background: var(--td-bg-color-container) !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.editor-mode-normal {
  color: var(--td-text-color-secondary) !important;
  background: transparent !important;
}

.editor-mode-normal:hover {
  background: var(--td-bg-color-container-hover) !important;
}

/* Word 工具栏 */
.word-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-component-border);
}

.toolbar-select {
  padding: 4px 8px;
  border: 1px solid var(--td-component-border);
  border-radius: 4px;
  font-size: 14px;
  color: var(--td-text-color-primary);
  background: var(--td-bg-color-container);
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
  background: var(--td-bg-color-container);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 0 auto;
  padding: 32px 48px;
  border-radius: 2px;
}

/* Markdown 模式样式 */
.markdown-toolbar {
  background: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-component-border);
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
  background: var(--td-bg-color-container);
  padding: 18px 20px;
  border-bottom: 1px solid var(--td-component-border);
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

/* 已上传文件卡片 */
.uploaded-file-card {
  background: white;
  border: 1px solid #e5e7eb;
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
  border-color: #0052d9;
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
</style>
