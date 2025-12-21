<template>
  <div class="chat-view">
    <!-- Sidebar -->
    <div class="sidebar" :class="{ closed: !sidebarOpen }">
      <div class="sidebar-header">
        <t-button class="new-chat-btn" block @click="startNewChat">
          <template #icon><t-icon name="add" /></template>
          新对话
        </t-button>
      </div>

      <div class="session-list">
        <div class="session-group-title">最近</div>
        <div 
          v-for="s in sessions" 
          :key="s.sessionId" 
          class="session-item"
          :class="{ active: currentSessionId === s.sessionId }"
          @click="selectSession(s.sessionId)"
        >
          <t-icon name="chat" style="margin-right: 8px; font-size: 14px;" />
          {{ s.title }}
          <div class="session-actions" @click.stop>
            <t-button variant="text" size="small" shape="circle" @click="openEditDialog(s)">
              <t-icon name="edit" />
            </t-button>
            <t-button variant="text" size="small" shape="circle" @click="confirmDelete(s)">
              <t-icon name="delete" />
            </t-button>
          </div>
        </div>
      </div>
      
      <div class="sidebar-footer">
        <div class="session-item" @click="openSettings">
          <t-icon name="setting" style="margin-right: 8px;" /> 设置
        </div>
      </div>
    </div>

    <!-- Main -->
    <main class="main">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <t-button variant="text" shape="circle" class="menu-btn" @click="sidebarOpen = !sidebarOpen">
            <t-icon name="menu-fold" v-if="sidebarOpen" />
            <t-icon name="menu-unfold" v-else />
          </t-button>
          
          <span class="header-title">AI 助手</span>
          
          <!-- Provider/Model Select -->
          <div v-if="currentMode === 'chat'" class="provider-model-select">
            <t-select 
              v-model="currentProvider" 
              :options="providerOptions" 
              placeholder="供应商"
              size="small"
              :bordered="false"
              @change="onProviderChange"
            />
            <t-select 
              v-model="currentModel" 
              :options="modelOptions" 
              placeholder="模型"
              size="small"
              :bordered="false"
            />
          </div>
        </div>
        
        <div class="header-right">
          <!-- Mode Switcher -->
          <div class="mode-tabs">
            <t-button 
              v-for="mode in ['chat', 'image', 'video']"
              :key="mode"
              :theme="currentMode === mode ? 'primary' : 'default'" 
              variant="text" 
              shape="round"
              size="small"
              @click="currentMode = mode"
            >
              <template #icon>
                <t-icon :name="mode === 'chat' ? 'chat' : mode === 'image' ? 'image' : 'video'" />
              </template>
            </t-button>
          </div>
        </div>
      </header>

      <!-- Chat Mode -->
      <template v-if="currentMode === 'chat'">
        <div ref="messagesRef" class="messages">
          <!-- Welcome Screen -->
          <div v-if="!messages.length" class="welcome-screen">
            <div class="welcome-text">你好, User</div>
            <div class="welcome-sub">今天能帮到你什么？</div>
            
            <div class="suggestion-chips">
              <div class="chip" v-for="chip in suggestions" :key="chip.text" @click="inputMessage = chip.prompt">
                {{ chip.icon }} {{ chip.text }}
              </div>
            </div>
          </div>

          <!-- Message List -->
          <div v-for="msg in messages" :key="msg.id" class="message-item" :class="msg.role">
            <div class="message-avatar" v-if="msg.role === 'assistant'">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L14.3 9.4L22 12L14.3 14.6L12 22L9.7 14.6L2 12L9.7 9.4L12 2Z" fill="url(#starGrad)"/>
                <defs>
                  <linearGradient id="starGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#4285F4"/>
                    <stop offset="1" stop-color="#D96570"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div class="message-content">
              <!-- Thinking Block -->
              <div v-if="msg.thinking" class="thinking-block" @click="msg.thinkingCollapsed = !msg.thinkingCollapsed">
                <div class="thinking-header">
                  <t-icon name="lightbulb" /> 思考过程
                  <t-icon :name="msg.thinkingCollapsed ? 'chevron-down' : 'chevron-up'" />
                </div>
                <div v-show="!msg.thinkingCollapsed" class="thinking-body">{{ msg.thinking }}</div>
              </div>
              <!-- Tool Calls -->
              <div v-if="msg.toolCalls?.length" class="tool-calls">
                <div v-for="tc in msg.toolCalls" :key="tc.id" class="tool-call-item">
                  <t-icon name="tools" /> {{ tc.name }}
                  <t-tag v-if="tc.status === 'running'" theme="warning" size="small">执行中</t-tag>
                  <t-tag v-else-if="tc.success" theme="success" size="small">成功</t-tag>
                </div>
              </div>
              <!-- Content -->
              <div v-html="renderMarkdown(msg.content)"></div>
              <span v-if="msg.isTyping" class="typing-cursor"></span>
              <!-- Actions -->
              <div v-if="msg.role === 'assistant' && !msg.isTyping" class="message-actions">
                <t-button variant="text" size="small" @click="copyContent(msg.content)">
                  <t-icon name="file-copy" />
                </t-button>
                <t-button variant="text" size="small" @click="regenerateMessage(msg)">
                  <t-icon name="refresh" />
                </t-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-wrapper">
          <div class="chat-input-container" :class="{ focused: inputFocused }">
            <t-textarea
              v-model="inputMessage"
              placeholder="在这里输入提示词..."
              :autosize="{ minRows: 1, maxRows: 6 }"
              @keydown.enter.exact.prevent="handleSend"
              @focus="inputFocused = true"
              @blur="inputFocused = false"
            />
            
            <div class="send-btn-wrapper">
              <t-button 
                v-if="inputMessage.trim()"
                shape="circle" 
                theme="primary" 
                :loading="isSending" 
                @click="handleSend"
              >
                <t-icon name="arrow-up" />
              </t-button>
              <t-button v-else shape="circle" variant="text">
                <t-icon name="microphone" />
              </t-button>
            </div>
          </div>
        </div>
      </template>

      <!-- Image Mode -->
      <template v-else-if="currentMode === 'image'">
        <div class="media-container">
          <div class="media-form">
            <h3>图片工作室</h3>
            <p class="media-desc">使用 CogView-4 将文字转化为精美图片</p>
            
            <t-form layout="vertical">
              <t-form-item label="图片描述">
                <t-textarea 
                  v-model="imageForm.prompt" 
                  placeholder="一座未来城市，飞行汽车穿梭，霓虹灯闪烁，赛博朋克风格..."
                  :maxlength="500"
                />
              </t-form-item>
              
              <t-form-item label="图片比例">
                <t-select v-model="imageForm.size" :options="imageSizeOptions" />
              </t-form-item>
              
              <t-form-item>
                <t-button block theme="primary" :loading="imageLoading" @click="generateImage" class="generate-btn">
                  <t-icon name="image" /> 生成图片
                </t-button>
              </t-form-item>
            </t-form>
          </div>
          
          <div v-if="generatedImages.length" class="media-results">
            <div class="image-grid">
              <div v-for="(img, idx) in generatedImages" :key="idx" class="image-item">
                <img :src="img.url" alt="Generated" />
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Video Mode -->
      <template v-else-if="currentMode === 'video'">
        <div class="media-container">
          <div class="media-form">
            <h3>视频工作室</h3>
            <p class="media-desc">使用 CogVideoX-3 将想象变为动态视频</p>
            
            <t-form layout="vertical">
              <t-form-item label="视频描述">
                <t-textarea 
                  v-model="videoForm.prompt" 
                  placeholder="一只猫在阳光明媚的草地上追逐蝴蝶..."
                  :maxlength="512"
                />
              </t-form-item>
              
              <div class="form-row">
                <t-form-item label="分辨率">
                  <t-select v-model="videoForm.size" :options="videoSizeOptions" />
                </t-form-item>
                <t-form-item label="时长">
                  <t-select v-model="videoForm.duration" :options="videoDurationOptions" />
                </t-form-item>
              </div>
              
              <t-form-item>
                <t-checkbox v-model="videoForm.withAudio">生成音效</t-checkbox>
              </t-form-item>
              
              <t-form-item>
                <t-button block theme="primary" :loading="videoLoading" @click="generateVideo" class="generate-btn">
                  <t-icon name="video" /> 生成视频
                </t-button>
              </t-form-item>
            </t-form>
          </div>

          <div v-if="videoTask" class="media-results">
            <div class="video-status">
              <t-loading v-if="videoTask.status === 'PROCESSING'" size="small" />
              <t-icon v-else-if="videoTask.status === 'SUCCESS'" name="check-circle" class="success" />
              <span>{{ videoStatusText }}</span>
            </div>
            <div v-if="videoTask.videos?.length" class="video-grid">
              <div v-for="(video, idx) in videoTask.videos" :key="idx" class="video-item">
                <video :src="video.url" controls></video>
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
  </div>
</template>


<script setup>
import { ref, nextTick, onMounted, onUnmounted, computed } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { chatApi } from '@/api'
import { marked } from 'marked'

// Refs
const messagesRef = ref(null)

// Mode
const currentMode = ref('chat')
const sidebarOpen = ref(true)
const inputMessage = ref('')
const inputFocused = ref(false)

// State
const currentProvider = ref('')
const currentModel = ref('')
const currentSessionId = ref(null)
const messages = ref([])
const sessions = ref([])
const isSending = ref(false)
const providers = ref({})

// Suggestions
const suggestions = [
  { icon: '🇯🇵', text: '日本7天行程规划', prompt: '帮我规划一个去日本的7天行程' },
  { icon: '⚛️', text: '解释量子计算', prompt: '解释量子计算的基本原理' },
  { icon: '🐍', text: 'Python 爬虫代码', prompt: '写一段 Python 代码抓取网页' },
  { icon: '🥩', text: '红烧肉食谱', prompt: '如何制作红烧肉？' }
]

// Image state
const imageForm = ref({ prompt: '', size: '1024x1024' })
const imageLoading = ref(false)
const generatedImages = ref([])
const imageSizeOptions = [
  { label: '1:1 方形', value: '1024x1024' },
  { label: '16:9 横版', value: '1344x768' },
  { label: '9:16 竖版', value: '768x1344' }
]

// Video state
const videoForm = ref({ prompt: '', size: '1920x1080', duration: 5, withAudio: false })
const videoLoading = ref(false)
const videoTask = ref(null)
let videoPollingTimer = null
const videoSizeOptions = [{ label: '1920×1080 高清', value: '1920x1080' }]
const videoDurationOptions = [{ label: '5 秒', value: 5 }, { label: '10 秒', value: 10 }]

// Edit dialog
const editDialogVisible = ref(false)
const editTitle = ref('')
const editSessionId = ref(null)
const editLoading = ref(false)

// Computed
const providerOptions = computed(() => 
  Object.entries(providers.value).map(([k, v]) => ({ label: v.displayName || k, value: k }))
)

const modelOptions = computed(() => {
  if (!currentProvider.value || !providers.value[currentProvider.value]) return []
  return (providers.value[currentProvider.value].models || []).map(m => ({ label: m, value: m }))
})

const videoStatusText = computed(() => {
  if (!videoTask.value) return ''
  if (videoTask.value.status === 'PROCESSING') return '正在生成视频...'
  if (videoTask.value.status === 'SUCCESS') return '视频已完成'
  return videoTask.value.status
})

// Methods
const renderMarkdown = (text) => marked.parse(text || '')

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  })
}

const loadProviders = async () => {
  try {
    const res = await chatApi.getProviders()
    if (res.code === 200 && res.data) {
      providers.value = res.data
      const keys = Object.keys(res.data)
      if (keys.length && !currentProvider.value) {
        currentProvider.value = keys[0]
        currentModel.value = res.data[keys[0]]?.defaultModel || ''
      }
    }
  } catch (e) {
    console.error('Load providers failed:', e)
  }
}

const onProviderChange = (provider) => {
  if (providers.value[provider]) {
    currentModel.value = providers.value[provider].defaultModel || ''
  }
}

const loadSessions = async () => {
  try {
    const res = await chatApi.getSessionList(20)
    if (res.code === 200) sessions.value = res.data || []
  } catch (e) {
    console.error('Load sessions failed:', e)
  }
}

const selectSession = async (sessionId) => {
  try {
    currentSessionId.value = sessionId
    const res = await chatApi.getHistory(sessionId)
    if (res.code === 200) {
      messages.value = (res.data || [])
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map((msg, i) => ({
          id: `${sessionId}-${i}`,
          role: msg.role,
          content: msg.content || '',
          toolCalls: (msg.toolCalls || []).map(tc => ({
            id: tc.id,
            name: tc.name,
            status: 'done',
            success: true
          })),
          isTyping: false
        }))
      scrollToBottom()
    }
  } catch (e) {
    MessagePlugin.error('加载历史失败')
  }
}

const startNewChat = () => {
  messages.value = []
  currentSessionId.value = null
}

const handleSend = async () => {
  const text = inputMessage.value.trim()
  if (!text || isSending.value) return

  inputMessage.value = ''
  messages.value.push({ id: Date.now(), role: 'user', content: text })
  scrollToBottom()

  isSending.value = true
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

  try {
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
      
      let startIdx = 0
      while (true) {
        const jsonStart = buffer.indexOf('{', startIdx)
        if (jsonStart === -1) break
        
        let depth = 0, jsonEnd = -1
        for (let i = jsonStart; i < buffer.length; i++) {
          if (buffer[i] === '{') depth++
          else if (buffer[i] === '}') {
            depth--
            if (depth === 0) { jsonEnd = i; break }
          }
        }
        
        if (jsonEnd === -1) break
        
        const jsonStr = buffer.substring(jsonStart, jsonEnd + 1)
        startIdx = jsonEnd + 1
        
        try {
          const parsed = JSON.parse(jsonStr)
          const msg = messages.value.find(m => m.id === aiMsgId)
          if (!msg) continue

          switch (parsed.type) {
            case 'content':
              if (parsed.text) msg.content += parsed.text
              break
            case 'thinking':
              if (parsed.text) msg.thinking = (msg.thinking || '') + parsed.text
              break
            case 'tool_call':
              if (parsed.toolCall) {
                const tc = parsed.toolCall
                if (!msg.toolCalls.find(t => t.id === tc.id)) {
                  msg.toolCalls.push({ id: tc.id, name: tc.name, status: 'running' })
                }
              }
              break
            case 'tool_result':
              if (parsed.toolResult) {
                const tc = msg.toolCalls.find(t => t.id === parsed.toolResult.toolCallId)
                if (tc) { tc.status = 'done'; tc.success = parsed.toolResult.success }
              }
              break
            case 'done':
              msg.isTyping = false
              // 确保所有工具调用状态都更新为完成
              msg.toolCalls.forEach(tc => {
                if (tc.status === 'running') {
                  tc.status = 'done'
                  tc.success = true
                }
              })
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
        } catch (e) { /* ignore parse errors */ }
      }
      
      buffer = buffer.substring(startIdx)
    }

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

const copyContent = async (content) => {
  try {
    await navigator.clipboard.writeText(content)
    MessagePlugin.success('已复制')
  } catch { MessagePlugin.error('复制失败') }
}

const regenerateMessage = (msg) => {
  const idx = messages.value.findIndex(m => m.id === msg.id)
  if (idx > 0) {
    const userMsg = messages.value[idx - 1]
    if (userMsg.role === 'user') {
      messages.value.splice(idx, 1)
      inputMessage.value = userMsg.content
      handleSend()
    }
  }
}

// Edit/Delete
const openEditDialog = (chat) => {
  editSessionId.value = chat.sessionId
  editTitle.value = chat.title || ''
  editDialogVisible.value = true
}

const saveTitle = async () => {
  if (!editTitle.value.trim()) return MessagePlugin.warning('标题不能为空')
  editLoading.value = true
  try {
    const res = await chatApi.updateSessionTitle(editSessionId.value, editTitle.value.trim())
    if (res.code === 200) {
      MessagePlugin.success('修改成功')
      editDialogVisible.value = false
      loadSessions()
    }
  } catch { MessagePlugin.error('修改失败') }
  finally { editLoading.value = false }
}

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
          if (currentSessionId.value === chat.sessionId) startNewChat()
          loadSessions()
        }
      } catch { MessagePlugin.error('删除失败') }
      dialog.destroy()
    }
  })
}

const openSettings = () => MessagePlugin.info('设置功能开发中')

// Image
const generateImage = async () => {
  if (!imageForm.value.prompt.trim()) return MessagePlugin.warning('请输入图片描述')
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
  } catch { MessagePlugin.error('图片生成失败') }
  finally { imageLoading.value = false }
}

// Video
const generateVideo = async () => {
  if (!videoForm.value.prompt.trim()) return MessagePlugin.warning('请输入视频描述')
  videoLoading.value = true
  videoTask.value = null
  try {
    const res = await chatApi.generateVideo({
      prompt: videoForm.value.prompt,
      size: videoForm.value.size,
      duration: videoForm.value.duration,
      withAudio: videoForm.value.withAudio,
      model: 'cogvideox-3'
    })
    if (res.code === 200 && res.data?.taskId) {
      videoTask.value = { taskId: res.data.taskId, status: 'PROCESSING', videos: [] }
      MessagePlugin.success('视频生成任务已提交')
      startVideoPolling(res.data.taskId)
    } else {
      MessagePlugin.error(res.msg || '视频生成失败')
    }
  } catch { MessagePlugin.error('视频生成失败') }
  finally { videoLoading.value = false }
}

const startVideoPolling = (taskId) => {
  if (videoPollingTimer) clearInterval(videoPollingTimer)
  videoPollingTimer = setInterval(async () => {
    try {
      const res = await chatApi.getVideoResult(taskId)
      if (res.code === 200 && res.data) {
        videoTask.value = {
          taskId,
          status: res.data.taskStatus,
          videos: res.data.videoResult || []
        }
        if (res.data.taskStatus === 'SUCCESS' || res.data.taskStatus === 'FAIL') {
          clearInterval(videoPollingTimer)
          videoPollingTimer = null
          if (res.data.taskStatus === 'SUCCESS') MessagePlugin.success('视频生成完成')
          else MessagePlugin.error('视频生成失败')
        }
      }
    } catch (e) { console.error('Video polling failed:', e) }
  }, 5000)
}

// Lifecycle
onMounted(() => { loadProviders(); loadSessions() })
onUnmounted(() => { if (videoPollingTimer) clearInterval(videoPollingTimer) })
</script>


<style scoped lang="less">
/* Gemini Dark Theme */
@bg-main: #131314;
@bg-sidebar: #1E1F20;
@bg-input: #28292A;
@bg-hover: #2D2E2F;
@text-main: #E3E3E3;
@text-muted: #A8A8A8;
@text-dim: #767777;
@border-color: #38393A;
@accent-color: #A8C7FA;

.chat-view {
  display: flex;
  height: 100vh;
  background: @bg-main;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: @bg-sidebar;
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 12px;
  box-sizing: border-box;
  
  &.closed {
    width: 0;
    padding: 0;
    opacity: 0;
    overflow: hidden;
  }
}

.sidebar-header {
  padding: 8px 0 20px 0;
}

.new-chat-btn {
  background: @bg-input !important;
  color: @text-muted !important;
  border: none !important;
  border-radius: 24px !important;
  justify-content: flex-start !important;
  padding-left: 16px !important;
  height: 48px !important;
  font-size: 14px !important;
  
  &:hover {
    background: #333435 !important;
    color: @text-main !important;
  }
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.session-group-title {
  font-size: 12px;
  color: @text-dim;
  padding: 8px 12px;
  margin-top: 8px;
}

.session-item {
  padding: 10px 16px;
  border-radius: 20px;
  cursor: pointer;
  color: @text-main;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  transition: background 0.2s;
  display: flex;
  align-items: center;

  &:hover {
    background: @bg-hover;
    
    .session-actions {
      opacity: 1;
    }
  }

  &.active {
    background: #004A77;
    color: #D3E3FD;
    font-weight: 500;
  }
}

.session-actions {
  margin-left: auto;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
  
  .t-button {
    color: @text-muted;
    &:hover { color: @text-main; }
  }
}

.sidebar-footer {
  margin-top: auto;
  padding: 12px 0;
}

/* Main */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: @bg-main;
  min-width: 0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -10%;
    left: -10%;
    width: 50%;
    height: 50%;
    background: radial-gradient(circle, rgba(66, 133, 244, 0.08) 0%, rgba(0,0,0,0) 70%);
    pointer-events: none;
    z-index: 0;
  }
}

/* Header */
.header {
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  position: relative;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-btn {
  color: @text-muted;
  &:hover {
    color: @text-main;
    background: rgba(255,255,255,0.05);
  }
}

.header-title {
  font-weight: 500;
  font-size: 18px;
  color: @text-main;
}

.provider-model-select {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 12px;
  
  :deep(.t-select) {
    width: 120px;
    
    .t-input {
      background: transparent !important;
      border: none !important;
      
      &__inner {
        color: @text-muted;
        font-size: 13px;
      }
    }
  }
}

.mode-tabs {
  background: @bg-sidebar;
  padding: 4px;
  border-radius: 100px;
  display: flex;
  gap: 2px;
  border: 1px solid @border-color;
  
  .t-button {
    border-radius: 100px;
  }
}

/* Messages */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  gap: 32px;
  position: relative;
  z-index: 1;
}

.message-item {
  display: flex;
  gap: 16px;
  max-width: 850px;
  margin: 0 auto;
  width: 100%;
  padding: 0 24px;
  box-sizing: border-box;
  animation: fadeIn 0.3s ease-out forwards;

  &.user {
    flex-direction: row-reverse;
    
    .message-content {
      background: @bg-input;
      color: @text-main;
      border-radius: 24px 4px 24px 24px;
      padding: 14px 20px;
      max-width: 70%;
    }
    
    .message-avatar { display: none; }
  }

  &.assistant .message-content {
    background: transparent;
    padding: 0;
    max-width: 100%;
    line-height: 1.6;
    font-size: 16px;
    color: @text-main;
  }
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4px;
  color: #4facfe;
}

.thinking-block {
  color: @text-muted;
  font-size: 13px;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: rgba(66, 133, 244, 0.05);
  border-radius: 8px;
  border-left: 3px solid #4285F4;
  cursor: pointer;
  
  .thinking-header {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .thinking-body {
    margin-top: 8px;
    white-space: pre-wrap;
    font-family: monospace;
  }
}

.tool-calls {
  margin-bottom: 12px;
}

.tool-call-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: #667eea;
  margin-bottom: 4px;
}

.message-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  
  .message-item:hover & {
    opacity: 1;
  }
  
  .t-button {
    color: @text-dim;
    &:hover { color: @text-muted; }
  }
}

.typing-cursor {
  display: inline-block;
  width: 8px;
  height: 16px;
  background: @accent-color;
  border-radius: 4px;
  animation: blink 1s infinite;
  vertical-align: middle;
  margin-left: 4px;
}

/* Welcome Screen */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: left;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
}

.welcome-text {
  font-size: 56px;
  font-weight: 500;
  line-height: 1.2;
  background: linear-gradient(to right, #4facfe 0%, #00f2fe 50%, #fff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
  align-self: flex-start;
}

.welcome-sub {
  font-size: 56px;
  font-weight: 500;
  color: #444746;
  margin-bottom: 40px;
  align-self: flex-start;
  line-height: 1.2;
}

.suggestion-chips {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  width: 100%;
  padding-bottom: 10px;
}

.chip {
  background: @bg-input;
  padding: 12px 16px;
  border-radius: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s;
  border: 1px solid transparent;
  color: @text-main;
  font-size: 14px;
  
  &:hover {
    background: @bg-hover;
  }
}

/* Input Area */
.chat-input-wrapper {
  padding: 0 24px 24px;
  background: transparent;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 20;
}

.chat-input-container {
  width: 100%;
  max-width: 850px;
  position: relative;
  background: @bg-input;
  border-radius: 32px;
  transition: background 0.3s, box-shadow 0.3s;
  border: 1px solid transparent;
  overflow: hidden;
  
  &.focused {
    background: @bg-hover;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.1);
  }
  
  :deep(.t-textarea) {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
  }
  
  :deep(.t-textarea__inner) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: @text-main !important;
    padding: 16px 50px 16px 24px !important;
    font-size: 16px !important;
    line-height: 1.5 !important;
    border-radius: 0 !important;
    
    &:focus { box-shadow: none !important; }
  }
}

.send-btn-wrapper {
  position: absolute;
  right: 8px;
  bottom: 8px;
  
  .t-button--theme-primary {
    background: @text-main;
    color: @bg-main;
    border: none;
  }
  
  .t-button--variant-text {
    color: @text-main;
  }
}

/* Media Forms */
.media-container {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.media-form {
  background: @bg-sidebar;
  border: 1px solid @border-color;
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  padding: 24px;
  
  h3 {
    color: @text-main;
    margin: 0 0 8px;
    font-size: 18px;
  }
  
  .media-desc {
    color: @text-muted;
    margin-bottom: 24px;
    font-size: 14px;
  }
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    
    :deep(.t-form__item) {
      min-width: 0;
    }
    
    :deep(.t-select) {
      width: 100%;
    }
  }
  
  :deep(.t-form__label) {
    color: @text-muted;
  }
  
  :deep(.t-textarea__inner),
  :deep(.t-input__inner) {
    background: @bg-input !important;
    border-color: @border-color !important;
    color: @text-main !important;
  }
  
  :deep(.t-select .t-input) {
    background: @bg-input !important;
    border-color: @border-color !important;
  }
  
  :deep(.t-checkbox__label) {
    color: @text-muted;
  }
}

.generate-btn {
  border-radius: 20px !important;
  height: 44px !important;
  background: #D3E3FD !important;
  color: #041E49 !important;
  border: none !important;
}

.media-results {
  background: @bg-sidebar;
  border: 1px solid @border-color;
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  padding: 24px;
}

.image-grid, .video-grid {
  display: grid;
  gap: 16px;
}

.image-item img, .video-item video {
  width: 100%;
  border-radius: 12px;
}

.video-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: @text-muted;
  
  .success { color: #4facfe; }
}

/* Markdown Content */
.message-item.assistant .message-content {
  :deep(p) { margin: 10px 0; line-height: 1.7; }
  :deep(ul), :deep(ol) { margin: 10px 0; padding-left: 24px; }
  :deep(li) { margin: 6px 0; }
  :deep(code) {
    background: @bg-hover;
    padding: 3px 8px;
    border-radius: 6px;
    font-family: 'Fira Code', monospace;
    font-size: 13px;
    color: @accent-color;
  }
  :deep(pre) {
    background: #1a1918;
    padding: 18px;
    border-radius: 12px;
    overflow-x: auto;
    margin: 14px 0;
    border: 1px solid @border-color;
    
    code {
      background: none;
      padding: 0;
      color: #e2e8f0;
    }
  }
  :deep(blockquote) {
    margin: 14px 0;
    padding: 10px 18px;
    border-left: 3px solid @accent-color;
    background: @bg-hover;
    border-radius: 0 10px 10px 0;
    color: @text-muted;
  }
  :deep(a) {
    color: @accent-color;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
  :deep(strong) { color: @text-main; font-weight: 600; }
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    
    th, td {
      border: 1px solid @border-color;
      padding: 10px 14px;
      text-align: left;
    }
    th { background: @bg-hover; color: @text-main; }
  }
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: #444746;
  border-radius: 4px;
  &:hover { background: #5E5E5E; }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* TDesign Overrides */
:deep(.t-dialog) {
  .t-dialog__header { color: @text-main; }
  .t-dialog__body { background: @bg-sidebar; }
}

:deep(.t-input) {
  background: @bg-input !important;
  border-color: @border-color !important;
  
  &__inner {
    color: @text-main !important;
    &::placeholder { color: @text-dim !important; }
  }
}

:deep(.t-popup__content) {
  background: @bg-sidebar !important;
  border: 1px solid @border-color !important;
}

:deep(.t-select__list) {
  background: @bg-sidebar !important;
}

:deep(.t-select-option) {
  color: @text-muted !important;
  &:hover { background: @bg-hover !important; color: @text-main !important; }
  &.t-is-selected { background: #004A77 !important; color: @accent-color !important; }
}
</style>
