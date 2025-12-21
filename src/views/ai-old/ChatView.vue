<template>
  <div class="chat-view">
    <!-- Sidebar -->
    <ChatSidebar
      :is-open="sidebarOpen"
      :sessions="sessions"
      :current-session-id="currentSessionId"
      :user-name="userName"
      @close="sidebarOpen = false"
      @new-chat="startNewChat"
      @select="selectSession"
      @edit="openEditDialog"
      @delete="confirmDelete"
    />

    <!-- Main -->
    <main class="main">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <t-button variant="text" shape="circle" class="menu-btn" @click="sidebarOpen = true">
            <t-icon name="menu-fold" />
          </t-button>
          
          <!-- Mode Tabs -->
          <div class="mode-tabs">
            <t-button 
              :variant="currentMode === 'chat' ? 'base' : 'text'" 
              size="small"
              @click="currentMode = 'chat'"
            >
              <t-icon name="chat" /> 聊天
            </t-button>
            <t-button 
              :variant="currentMode === 'image' ? 'base' : 'text'" 
              size="small"
              @click="currentMode = 'image'"
            >
              <t-icon name="image" /> 图片
            </t-button>
            <t-button 
              :variant="currentMode === 'video' ? 'base' : 'text'" 
              size="small"
              @click="currentMode = 'video'"
            >
              <t-icon name="video" /> 视频
            </t-button>
          </div>
          
          <!-- Provider/Model Select (only for chat mode) -->
          <div v-if="currentMode === 'chat'" class="provider-model-select">
            <t-select 
              v-model="currentProvider" 
              :options="providerOptions" 
              placeholder="选择供应商"
              :loading="providersLoading"
              size="medium"
              @change="onProviderChange"
            >
              <template #prefixIcon>
                <t-icon name="server" />
              </template>
            </t-select>
            
            <t-select 
              v-model="currentModel" 
              :options="modelOptions" 
              placeholder="选择模型"
              size="medium"
              :disabled="!currentProvider"
            >
              <template #prefixIcon>
                <t-icon name="cpu" />
              </template>
            </t-select>
          </div>
        </div>
        
        <div class="header-right">
          <t-tooltip content="清空对话">
            <t-button variant="text" shape="circle" :disabled="!messages.length" @click="clearMessages">
              <t-icon name="clear" />
            </t-button>
          </t-tooltip>
        </div>
      </header>

      <!-- Chat Mode -->
      <template v-if="currentMode === 'chat'">
        <div ref="messagesRef" class="messages">
          <ChatWelcome v-if="!messages.length" @select="handleQuickAction" />
          
          <template v-else>
            <ChatMessage
              v-for="msg in messages"
              :key="msg.id"
              :message="msg"
              @regenerate="regenerateMessage(msg)"
            />
          </template>
          
          <div class="scroll-anchor" />
        </div>

        <ChatInput
          ref="inputRef"
          :loading="isSending"
          @send="sendMessage"
        />
      </template>

      <!-- Image Mode -->
      <template v-else-if="currentMode === 'image'">
        <div class="media-container">
          <div class="media-form">
            <h3>AI 图片生成</h3>
            <p class="media-desc">使用 CogView-4 模型，根据文字描述生成图片</p>
            
            <t-form :data="imageForm" layout="vertical">
              <t-form-item label="图片描述">
                <t-textarea 
                  v-model="imageForm.prompt" 
                  placeholder="描述你想要生成的图片，例如：一只可爱的橘猫在阳光下打盹"
                  :maxlength="500"
                  :autosize="{ minRows: 3, maxRows: 6 }"
                />
              </t-form-item>
              
              <t-form-item label="图片尺寸">
                <t-select v-model="imageForm.size" :options="imageSizeOptions" />
              </t-form-item>
              
              <t-form-item>
                <t-button theme="primary" :loading="imageLoading" @click="generateImage">
                  <t-icon name="image" /> 生成图片
                </t-button>
              </t-form-item>
            </t-form>
          </div>
          
          <!-- Generated Images -->
          <div v-if="generatedImages.length" class="media-results">
            <h4>生成结果</h4>
            <div class="image-grid">
              <div v-for="(img, idx) in generatedImages" :key="idx" class="image-item">
                <img :src="img.url" alt="Generated image" @click="previewImage(img.url)" />
                <div class="image-actions">
                  <t-button size="small" variant="text" @click="downloadImage(img.url)">
                    <t-icon name="download" />
                  </t-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Video Mode -->
      <template v-else-if="currentMode === 'video'">
        <div class="media-container">
          <div class="media-form">
            <h3>AI 视频生成</h3>
            <p class="media-desc">使用 CogVideoX-3 模型，根据文字描述生成视频</p>
            
            <t-form :data="videoForm" layout="vertical">
              <t-form-item label="视频描述">
                <t-textarea 
                  v-model="videoForm.prompt" 
                  placeholder="描述你想要生成的视频，例如：一只猫在草地上追逐蝴蝶"
                  :maxlength="512"
                  :autosize="{ minRows: 3, maxRows: 6 }"
                />
              </t-form-item>
              
              <div class="form-row">
                <t-form-item label="视频尺寸">
                  <t-select v-model="videoForm.size" :options="videoSizeOptions" />
                </t-form-item>
                
                <t-form-item label="视频时长">
                  <t-select v-model="videoForm.duration" :options="videoDurationOptions" />
                </t-form-item>
              </div>
              
              <div class="form-row">
                <t-form-item label="帧率">
                  <t-select v-model="videoForm.fps" :options="videoFpsOptions" />
                </t-form-item>
                
                <t-form-item label="输出模式">
                  <t-select v-model="videoForm.quality" :options="videoQualityOptions" />
                </t-form-item>
              </div>
              
              <t-form-item>
                <t-checkbox v-model="videoForm.withAudio">生成AI音效</t-checkbox>
              </t-form-item>
              
              <t-form-item>
                <t-button theme="primary" :loading="videoLoading" @click="generateVideo">
                  <t-icon name="video" /> 生成视频
                </t-button>
              </t-form-item>
            </t-form>
          </div>
          
          <!-- Video Task Status -->
          <div v-if="videoTask" class="media-results">
            <h4>生成状态</h4>
            <div class="video-task">
              <div class="task-status">
                <t-loading v-if="videoTask.status === 'PROCESSING'" size="small" />
                <t-icon v-else-if="videoTask.status === 'SUCCESS'" name="check-circle" class="success-icon" />
                <t-icon v-else-if="videoTask.status === 'FAIL'" name="close-circle" class="error-icon" />
                <span>{{ videoStatusText }}</span>
              </div>
              
              <div v-if="videoTask.videos && videoTask.videos.length" class="video-grid">
                <div v-for="(video, idx) in videoTask.videos" :key="idx" class="video-item">
                  <video :src="video.url" :poster="video.coverImageUrl" controls />
                  <div class="video-actions">
                    <t-button size="small" variant="text" @click="downloadVideo(video.url)">
                      <t-icon name="download" />
                    </t-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>

    <!-- Edit Dialog -->
    <t-dialog
      v-model:visible="editDialogVisible"
      header="编辑会话标题"
      :confirm-btn="{ content: '保存', loading: editLoading }"
      @confirm="saveTitle"
    >
      <t-input v-model="editTitle" placeholder="请输入新标题" maxlength="100" />
    </t-dialog>
    
    <!-- Image Preview -->
    <t-image-viewer v-model:visible="imagePreviewVisible" :images="[previewImageUrl]" />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { chatApi } from '@/api'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatMessage from './components/ChatMessage.vue'
import ChatInput from './components/ChatInput.vue'
import ChatWelcome from './components/ChatWelcome.vue'

// Refs
const messagesRef = ref(null)
const inputRef = ref(null)

// Mode: chat | image | video
const currentMode = ref('chat')

// State
const sidebarOpen = ref(false)
const currentProvider = ref('')
const currentModel = ref('')
const currentSessionId = ref(null)
const messages = ref([])
const sessions = ref([])
const isSending = ref(false)
const providersLoading = ref(false)
const providers = ref({})
const userName = ref('用户')

// Image generation state
const imageForm = ref({
  prompt: '',
  size: '1024x1024'
})
const imageLoading = ref(false)
const generatedImages = ref([])
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')

const imageSizeOptions = [
  { label: '1024×1024 (方形)', value: '1024x1024' },
  { label: '768×1344 (竖版)', value: '768x1344' },
  { label: '1344×768 (横版)', value: '1344x768' },
  { label: '864×1152', value: '864x1152' },
  { label: '1152×864', value: '1152x864' }
]

// Video generation state
const videoForm = ref({
  prompt: '',
  size: '1920x1080',
  fps: 30,
  duration: 5,
  quality: 'speed',
  withAudio: false
})
const videoLoading = ref(false)
const videoTask = ref(null)
let videoPollingTimer = null

const videoSizeOptions = [
  { label: '1920×1080 (全高清)', value: '1920x1080' },
  { label: '1280×720 (高清)', value: '1280x720' },
  { label: '1024×1024 (方形)', value: '1024x1024' },
  { label: '720×1280 (竖版)', value: '720x1280' },
  { label: '3840×2160 (4K)', value: '3840x2160' }
]

const videoDurationOptions = [
  { label: '5秒', value: 5 },
  { label: '10秒', value: 10 }
]

const videoFpsOptions = [
  { label: '30帧', value: 30 },
  { label: '60帧', value: 60 }
]

const videoQualityOptions = [
  { label: '速度优先', value: 'speed' },
  { label: '质量优先', value: 'quality' }
]

const videoStatusText = computed(() => {
  if (!videoTask.value) return ''
  switch (videoTask.value.status) {
    case 'PROCESSING': return '生成中，请稍候...'
    case 'SUCCESS': return '生成完成'
    case 'FAIL': return '生成失败'
    default: return videoTask.value.status
  }
})

// Computed options
const providerOptions = computed(() => {
  return Object.entries(providers.value).map(([key, info]) => ({
    label: info.displayName || key,
    value: key
  }))
})

const modelOptions = computed(() => {
  if (!currentProvider.value || !providers.value[currentProvider.value]) {
    return []
  }
  const providerInfo = providers.value[currentProvider.value]
  return (providerInfo.models || []).map(m => ({ label: m, value: m }))
})

// Edit dialog
const editDialogVisible = ref(false)
const editTitle = ref('')
const editSessionId = ref(null)
const editLoading = ref(false)

// Abort controller
let abortController = null

// Scroll to bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

// Load providers
const loadProviders = async () => {
  providersLoading.value = true
  try {
    const res = await chatApi.getProviders()
    if (res.code === 200 && res.data) {
      providers.value = res.data
      const providerKeys = Object.keys(res.data)
      if (providerKeys.length && !currentProvider.value) {
        // 设置默认供应商
        currentProvider.value = providerKeys[0]
        // 设置默认模型
        const defaultModel = res.data[providerKeys[0]]?.defaultModel
        if (defaultModel) {
          currentModel.value = defaultModel
        }
      }
    }
  } catch (e) {
    console.error('Load providers failed:', e)
  } finally {
    providersLoading.value = false
  }
}

// Provider change handler
const onProviderChange = (provider) => {
  if (providers.value[provider]) {
    const defaultModel = providers.value[provider].defaultModel
    currentModel.value = defaultModel || ''
  }
}

// Load sessions
const loadSessions = async () => {
  try {
    const res = await chatApi.getSessionList(20)
    if (res.code === 200) sessions.value = res.data || []
  } catch (e) {
    console.error('Load sessions failed:', e)
  }
}

// Start new chat
const startNewChat = () => {
  messages.value = []
  currentSessionId.value = null
  sidebarOpen.value = false
}

// Select session
const selectSession = async (sessionId) => {
  try {
    currentSessionId.value = sessionId
    const res = await chatApi.getHistory(sessionId)
    
    if (res.code === 200) {
      // 过滤掉 system 消息，只显示 user 和 assistant
      messages.value = (res.data || [])
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map((msg, i) => ({
          id: `${sessionId}-${i}`,
          role: msg.role,
          content: msg.content || '',
          isTyping: false
        }))
      scrollToBottom()
    }
    sidebarOpen.value = false
  } catch (e) {
    console.error('Load history failed:', e)
    MessagePlugin.error('加载历史失败')
  }
}

// Clear messages
const clearMessages = () => {
  messages.value = []
}

// Handle quick action
const handleQuickAction = (prompt) => {
  inputRef.value?.fillInput(prompt)
}

// Send message
const sendMessage = async ({ text, image }) => {
  if (isSending.value) return

  // Add user message
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: text,
    image,
    isTyping: false
  })
  scrollToBottom()

  isSending.value = true

  try {
    // Close existing stream
    if (abortController) abortController.abort()
    abortController = new AbortController()

    // Add AI placeholder
    const aiMsgId = Date.now() + 1
    messages.value.push({
      id: aiMsgId,
      role: 'assistant',
      content: '',
      thinking: '',
      toolCalls: [],
      isTyping: true
    })
    scrollToBottom()

    // Stream request using unified API
    const response = await chatApi.chatUnified({
      message: text,
      sessionId: currentSessionId.value,
      provider: currentProvider.value,
      model: currentModel.value,
      enableTools: true
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      
      // 解析JSON响应
      let startIdx = 0
      while (true) {
        const jsonStart = buffer.indexOf('{', startIdx)
        if (jsonStart === -1) break
        
        let depth = 0
        let jsonEnd = -1
        for (let i = jsonStart; i < buffer.length; i++) {
          if (buffer[i] === '{') depth++
          else if (buffer[i] === '}') {
            depth--
            if (depth === 0) {
              jsonEnd = i
              break
            }
          }
        }
        
        if (jsonEnd === -1) break
        
        const jsonStr = buffer.substring(jsonStart, jsonEnd + 1)
        startIdx = jsonEnd + 1
        
        try {
          const parsed = JSON.parse(jsonStr)
          const msg = messages.value.find(m => m.id === aiMsgId)
          if (!msg) continue

          // 处理不同类型的响应
          switch (parsed.type) {
            case 'content':
              if (parsed.text) {
                msg.content += parsed.text
              }
              break
              
            case 'thinking':
              if (parsed.text) {
                msg.thinking = (msg.thinking || '') + parsed.text
              }
              break
              
            case 'tool_call':
              if (parsed.toolCall) {
                const tc = parsed.toolCall
                // 添加或更新工具调用
                const existingIdx = msg.toolCalls.findIndex(t => t.id === tc.id)
                if (existingIdx === -1) {
                  msg.toolCalls.push({
                    id: tc.id,
                    name: tc.name,
                    arguments: tc.arguments,
                    status: 'running',
                    result: undefined,
                    success: undefined,
                    error: undefined
                  })
                }
              }
              break
              
            case 'tool_result':
              if (parsed.toolResult) {
                const tr = parsed.toolResult
                const tc = msg.toolCalls.find(t => t.id === tr.toolCallId)
                if (tc) {
                  tc.status = 'done'
                  tc.result = tr.result
                  tc.success = tr.success
                  tc.error = tr.error
                }
              }
              break
              
            case 'done':
              msg.isTyping = false
              break
              
            case 'error':
              msg.isTyping = false
              msg.content = parsed.text || '发生错误，请重试'
              break
          }
          
          if (parsed.sessionId && !currentSessionId.value) {
            currentSessionId.value = parsed.sessionId
          }
          
          scrollToBottom()
        } catch (e) {
          console.warn('JSON parse error:', e, jsonStr)
        }
      }
      
      buffer = buffer.substring(startIdx)
    }

    // Done
    const msg = messages.value.find(m => m.id === aiMsgId)
    if (msg) msg.isTyping = false
    loadSessions()

  } catch (e) {
    console.error('Send failed:', e)
    const aiMsg = messages.value.find(m => m.isTyping)
    if (aiMsg) {
      aiMsg.isTyping = false
      if (!aiMsg.content) aiMsg.content = '抱歉，发生了错误，请重试。'
    }
    MessagePlugin.error('发送失败')
  } finally {
    isSending.value = false
  }
}

// Regenerate message
const regenerateMessage = (msg) => {
  const idx = messages.value.findIndex(m => m.id === msg.id)
  if (idx > 0) {
    const userMsg = messages.value[idx - 1]
    if (userMsg.role === 'user') {
      messages.value.splice(idx, 1)
      sendMessage({ text: userMsg.content, image: userMsg.image })
    }
  }
}

// Edit dialog
const openEditDialog = (chat) => {
  editSessionId.value = chat.sessionId
  editTitle.value = chat.title || ''
  editDialogVisible.value = true
}

const saveTitle = async () => {
  if (!editTitle.value.trim()) {
    MessagePlugin.warning('标题不能为空')
    return
  }
  
  editLoading.value = true
  try {
    const res = await chatApi.updateSessionTitle(editSessionId.value, editTitle.value.trim())
    if (res.code === 200) {
      MessagePlugin.success('修改成功')
      editDialogVisible.value = false
      loadSessions()
    }
  } catch {
    MessagePlugin.error('修改失败')
  } finally {
    editLoading.value = false
  }
}

// Delete session
const confirmDelete = (chat) => {
  const dialog = DialogPlugin.confirm({
    header: '删除确认',
    body: `确定删除「${chat.title}」？`,
    confirmBtn: { content: '删除', theme: 'danger' },
    onConfirm: async () => {
      try {
        const res = await chatApi.deleteSession(chat.sessionId)
        if (res.code === 200) {
          MessagePlugin.success('已删除')
          if (currentSessionId.value === chat.sessionId) {
            messages.value = []
            currentSessionId.value = null
          }
          loadSessions()
        }
      } catch {
        MessagePlugin.error('删除失败')
      }
      dialog.destroy()
    }
  })
}

// Lifecycle
onMounted(() => {
  loadProviders()
  loadSessions()
})

onUnmounted(() => {
  if (abortController) abortController.abort()
  if (videoPollingTimer) clearInterval(videoPollingTimer)
})

// Image generation
const generateImage = async () => {
  if (!imageForm.value.prompt.trim()) {
    MessagePlugin.warning('请输入图片描述')
    return
  }
  
  imageLoading.value = true
  try {
    const res = await chatApi.generateImage({
      prompt: imageForm.value.prompt,
      size: imageForm.value.size,
      model: 'cogview-4-250304'
    })
    
    if (res.code === 200 && res.data?.data) {
      generatedImages.value = res.data.data
      MessagePlugin.success('图片生成成功')
    } else {
      MessagePlugin.error(res.msg || '图片生成失败')
    }
  } catch (e) {
    console.error('Image generation failed:', e)
    MessagePlugin.error('图片生成失败')
  } finally {
    imageLoading.value = false
  }
}

const previewImage = (url) => {
  previewImageUrl.value = url
  imagePreviewVisible.value = true
}

const downloadImage = (url) => {
  const link = document.createElement('a')
  link.href = url
  link.download = `ai-image-${Date.now()}.png`
  link.target = '_blank'
  link.click()
}

// Video generation
const generateVideo = async () => {
  if (!videoForm.value.prompt.trim()) {
    MessagePlugin.warning('请输入视频描述')
    return
  }
  
  videoLoading.value = true
  videoTask.value = null
  
  try {
    const res = await chatApi.generateVideo({
      prompt: videoForm.value.prompt,
      size: videoForm.value.size,
      fps: videoForm.value.fps,
      duration: videoForm.value.duration,
      quality: videoForm.value.quality,
      withAudio: videoForm.value.withAudio,
      model: 'cogvideox-3'
    })
    
    if (res.code === 200 && res.data?.taskId) {
      videoTask.value = {
        taskId: res.data.taskId,
        status: 'PROCESSING',
        videos: []
      }
      MessagePlugin.success('视频生成任务已提交')
      startVideoPolling(res.data.taskId)
    } else {
      MessagePlugin.error(res.msg || '视频生成失败')
    }
  } catch (e) {
    console.error('Video generation failed:', e)
    MessagePlugin.error('视频生成失败')
  } finally {
    videoLoading.value = false
  }
}

const startVideoPolling = (taskId) => {
  if (videoPollingTimer) clearInterval(videoPollingTimer)
  
  videoPollingTimer = setInterval(async () => {
    try {
      const res = await chatApi.getVideoResult(taskId)
      
      if (res.code === 200 && res.data) {
        const { taskStatus, videoResult } = res.data
        
        videoTask.value = {
          taskId,
          status: taskStatus,
          videos: videoResult || []
        }
        
        if (taskStatus === 'SUCCESS' || taskStatus === 'FAIL') {
          clearInterval(videoPollingTimer)
          videoPollingTimer = null
          
          if (taskStatus === 'SUCCESS') {
            MessagePlugin.success('视频生成完成')
          } else {
            MessagePlugin.error('视频生成失败')
          }
        }
      }
    } catch (e) {
      console.error('Video polling failed:', e)
    }
  }, 5000) // Poll every 5 seconds
}

const downloadVideo = (url) => {
  const link = document.createElement('a')
  link.href = url
  link.download = `ai-video-${Date.now()}.mp4`
  link.target = '_blank'
  link.click()
}
</script>


<style scoped lang="less">
@import './components/styles.less';

.chat-view {
  display: flex;
  height: 100vh;
  background: @bg-main;
  overflow: hidden;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: @bg-main;
  min-width: 0;
  position: relative;
}

.header {
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(to bottom, @bg-main 60%, transparent);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  
  @media (min-width: 768px) {
    padding: 0 24px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
}

.menu-btn {
  color: @text-muted;
  
  &:hover {
    color: @text-main;
    background: @bg-hover;
  }
  
  @media (min-width: 768px) {
    display: none;
  }
}

.provider-model-select {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(46, 45, 43, 0.5);
  backdrop-filter: blur(8px);
  padding: 4px 8px;
  border-radius: 20px;
  border: 1px solid @border-light;
  
  :deep(.t-select) {
    width: 110px;
    
    .t-input {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      
      &__inner {
        color: @text-muted;
        font-size: 12px;
      }
    }
    
    .t-input__prefix {
      color: @text-dim;
    }
    
    @media (min-width: 768px) {
      width: 130px;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .t-button {
    color: @text-muted;
    
    &:hover {
      color: @text-main;
      background: @bg-hover;
    }
  }
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 80px 0 160px;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #403E3B;
    border-radius: 10px;
    
    &:hover {
      background: #52504D;
    }
  }
}

.scroll-anchor {
  height: 40px;
}

// TDesign 组件深色主题覆盖
:deep(.t-dialog) {
  .t-dialog__header {
    color: @text-main;
  }
  
  .t-dialog__body {
    background: @bg-card;
  }
}

:deep(.t-input) {
  background: @bg-input !important;
  border-color: @border-color !important;
  
  &__inner {
    color: @text-main !important;
    
    &::placeholder {
      color: @text-dim !important;
    }
  }
  
  &--focused {
    border-color: #52504D !important;
    box-shadow: 0 0 0 2px rgba(82, 80, 77, 0.3) !important;
  }
}

:deep(.t-select-input) {
  .t-input {
    background: @bg-input !important;
    border-color: @border-color !important;
  }
}

:deep(.t-popup__content) {
  background: @bg-card !important;
  border: 1px solid @border-color !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4) !important;
}

:deep(.t-select__list) {
  background: @bg-card !important;
}

:deep(.t-select-option) {
  color: @text-muted !important;
  
  &:hover {
    background: @bg-hover !important;
    color: @text-main !important;
  }
  
  &.t-is-selected {
    background: @accent-light !important;
    color: @accent-color !important;
  }
}

:deep(.t-tooltip__content) {
  background: @bg-card !important;
  color: @text-main !important;
  border: 1px solid @border-color !important;
}

:deep(.t-loading) {
  color: @accent-color !important;
}

// Mode tabs
.mode-tabs {
  display: flex;
  gap: 2px;
  background: rgba(46, 45, 43, 0.5);
  backdrop-filter: blur(8px);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid @border-light;
  flex-shrink: 0;
  
  .t-button {
    color: @text-muted;
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    
    &:hover {
      color: @text-main;
      background: @bg-hover;
    }
    
    &.t-button--variant-base {
      background: @accent-light;
      color: @accent-color;
    }
  }
}

// Media container
.media-container {
  flex: 1;
  overflow-y: auto;
  padding: 80px 24px 40px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 80px 16px 24px;
  }
}

.media-form {
  background: @bg-card;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid @border-color;
  
  h3 {
    color: @text-main;
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 500;
  }
  
  .media-desc {
    color: @text-muted;
    font-size: 14px;
    margin: 0 0 20px;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    
    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }
  
  :deep(.t-form__item) {
    margin-bottom: 16px;
  }
  
  :deep(.t-form__label) {
    color: @text-muted;
    font-size: 13px;
  }
  
  :deep(.t-textarea) {
    .t-textarea__inner {
      background: @bg-input !important;
      border-color: @border-color !important;
      color: @text-main !important;
      
      &::placeholder {
        color: @text-dim !important;
      }
      
      &:focus {
        border-color: #52504D !important;
      }
    }
  }
  
  :deep(.t-select) {
    .t-input {
      background: @bg-input !important;
      border-color: @border-color !important;
    }
    
    .t-input__inner {
      color: @text-main !important;
    }
  }
  
  :deep(.t-checkbox) {
    .t-checkbox__label {
      color: @text-muted;
    }
  }
  
  :deep(.t-button--theme-primary) {
    background: @accent-color !important;
    border-color: @accent-color !important;
    
    &:hover {
      background: @accent-hover !important;
      border-color: @accent-hover !important;
    }
  }
}

.media-results {
  margin-top: 24px;
  background: @bg-card;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid @border-color;
  
  h4 {
    color: @text-main;
    margin: 0 0 16px;
    font-size: 16px;
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: @bg-input;
  
  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.02);
    }
  }
  
  .image-actions {
    position: absolute;
    bottom: 8px;
    right: 8px;
    
    .t-button {
      background: rgba(0, 0, 0, 0.6);
      color: white;
      
      &:hover {
        background: rgba(0, 0, 0, 0.8);
      }
    }
  }
}

.video-task {
  .task-status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: @text-muted;
    margin-bottom: 16px;
    
    .success-icon {
      color: #52c41a;
    }
    
    .error-icon {
      color: #ff4d4f;
    }
  }
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.video-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: @bg-input;
  
  video {
    width: 100%;
    aspect-ratio: 16/9;
    object-fit: cover;
  }
  
  .video-actions {
    position: absolute;
    bottom: 8px;
    right: 8px;
    
    .t-button {
      background: rgba(0, 0, 0, 0.6);
      color: white;
      
      &:hover {
        background: rgba(0, 0, 0, 0.8);
      }
    }
  }
}
</style>
