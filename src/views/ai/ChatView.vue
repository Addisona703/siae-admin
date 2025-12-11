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
          
          <div class="model-select">
            <t-select 
              v-model="currentModel" 
              :options="modelOptions" 
              placeholder="选择模型"
              :loading="modelsLoading"
              size="medium"
            >
              <template #prefixIcon>
                <t-icon name="cpu" />
              </template>
            </t-select>
          </div>
        </div>
        
        <div class="header-right">
          <t-tooltip :content="enableThinking ? '思考模式 (qwen3:8b)' : '普通模式 (gemma3:4b)'">
            <t-switch 
              v-model="enableThinking" 
              size="medium"
              :label="['思考', '普通']"
            />
          </t-tooltip>
          <t-tooltip content="清空对话">
            <t-button variant="text" shape="circle" :disabled="!messages.length" @click="clearMessages">
              <t-icon name="clear" />
            </t-button>
          </t-tooltip>
        </div>
      </header>

      <!-- Messages -->
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

      <!-- Input -->
      <ChatInput
        ref="inputRef"
        :loading="isSending"
        @send="sendMessage"
      />
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
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { chatApi } from '@/api'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatMessage from './components/ChatMessage.vue'
import ChatInput from './components/ChatInput.vue'
import ChatWelcome from './components/ChatWelcome.vue'

// Refs
const messagesRef = ref(null)
const inputRef = ref(null)

// State
const sidebarOpen = ref(false)
const currentModel = ref('')
const currentSessionId = ref(null)
const messages = ref([])
const sessions = ref([])
const isSending = ref(false)
const modelsLoading = ref(false)
const modelOptions = ref([])
const userName = ref('用户')
const enableThinking = ref(false) // 思考模式开关

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

// Load models
const loadModels = async () => {
  modelsLoading.value = true
  try {
    const res = await chatApi.getAvailableModels()
    if (res.code === 200 && res.data?.length) {
      modelOptions.value = res.data.map(m => ({ label: m, value: m }))
      if (!currentModel.value) currentModel.value = res.data[0]
    }
  } catch (e) {
    console.error('Load models failed:', e)
  } finally {
    modelsLoading.value = false
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
      messages.value = (res.data || []).map((msg, i) => ({
        id: `${sessionId}-${i}`,
        role: msg.role,
        content: msg.content || '',
        isTyping: false
      }))
      scrollToBottom()
    }
    sidebarOpen.value = false
  } catch (e) {
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
const sendMessage = async ({ text, image, fileIds = [] }) => {
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
      isTyping: true
    })
    scrollToBottom()

    // Stream request - 传递 fileIds 和 enableThinking
    const response = await chatApi.chatStreamWithThinking({
      message: text,
      sessionId: currentSessionId.value,
      model: currentModel.value,
      fileIds: fileIds.length > 0 ? fileIds.join(',') : undefined,
      enableThinking: enableThinking.value
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = '' // 用于处理不完整的 JSON

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      // 解码并追加到缓冲区
      buffer += decoder.decode(value, { stream: true })
      
      // 尝试解析缓冲区中的完整 JSON 对象
      // 后端返回格式: {"sessionId":"xxx","type":"thinking|content","text":"...","isFinal":false}
      let startIdx = 0
      while (true) {
        const jsonStart = buffer.indexOf('{', startIdx)
        if (jsonStart === -1) break
        
        // 找到匹配的结束括号
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
        
        if (jsonEnd === -1) break // JSON 不完整，等待更多数据
        
        const jsonStr = buffer.substring(jsonStart, jsonEnd + 1)
        startIdx = jsonEnd + 1
        
        try {
          const parsed = JSON.parse(jsonStr)
          const msg = messages.value.find(m => m.id === aiMsgId)
          if (!msg) continue

          // 处理不同类型的消息
          if (parsed.type === 'thinking' && parsed.text) {
            msg.thinking += parsed.text
          } else if (parsed.type === 'content' && parsed.text) {
            msg.content += parsed.text
          } else if (parsed.type === 'done') {
            msg.isTyping = false
          }
          
          // 更新 sessionId
          if (parsed.sessionId && !currentSessionId.value) {
            currentSessionId.value = parsed.sessionId
          }
          
          scrollToBottom()
        } catch (e) {
          console.warn('JSON parse error:', e, jsonStr)
        }
      }
      
      // 保留未处理的部分
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
  // Find the user message before this AI message
  const idx = messages.value.findIndex(m => m.id === msg.id)
  if (idx > 0) {
    const userMsg = messages.value[idx - 1]
    if (userMsg.role === 'user') {
      messages.value.splice(idx, 1)
      sendMessage({ text: userMsg.content, image: userMsg.image, fileIds: userMsg.fileIds || [] })
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
  loadModels()
  loadSessions()
})

onUnmounted(() => {
  if (abortController) abortController.abort()
})
</script>


<style scoped lang="less">
@import './components/styles.less';

.chat-view {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  overflow: hidden;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  min-width: 0;
}

.header {
  height: 60px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
  flex-shrink: 0;
  
  @media (min-width: 768px) {
    padding: 0 24px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  @media (min-width: 768px) {
    display: none;
  }
}

.model-select {
  :deep(.t-select) {
    width: 160px;
    
    @media (min-width: 768px) {
      width: 180px;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  
  :deep(.t-switch) {
    --td-switch-label-font-size: 12px;
  }
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 3px;
  }
}

.scroll-anchor {
  height: 100px;
}
</style>
