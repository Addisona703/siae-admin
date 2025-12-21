<template>
  <div :class="['message', message.role]">
    <!-- AI Avatar -->
    <div v-if="message.role === 'assistant'" class="avatar ai">
      <span style="font-family: serif; font-weight: bold; font-size: 16px;">S</span>
    </div>

    <!-- Content -->
    <div class="content">
      <span v-if="message.role === 'assistant'" class="sender">SIAE AI</span>
      
      <div :class="['bubble', message.role]">
        <!-- Image -->
        <div v-if="message.image" class="image-wrap">
          <img 
            :src="message.image" 
            alt="附件" 
            @click="$emit('preview-image', message.image)"
            @error="handleImageError($event)"
          />
        </div>
        
        <!-- Thinking -->
        <div v-if="message.thinking" class="thinking">
          <div class="thinking-header" @click="toggleThinking">
            <t-icon name="lightbulb" />
            <span>思考过程</span>
            <t-icon :name="thinkingCollapsed ? 'chevron-down' : 'chevron-up'" class="toggle-icon" />
          </div>
          <Transition name="collapse">
            <div v-show="!thinkingCollapsed" class="thinking-body">
              {{ message.thinking }}
            </div>
          </Transition>
        </div>

        <!-- Tool Calls -->
        <div v-if="message.toolCalls && message.toolCalls.length > 0" class="tool-calls">
          <div v-for="(tc, idx) in message.toolCalls" :key="tc.id || idx" class="tool-call-item">
            <div class="tool-call-header" @click="toggleToolCall(tc.id)">
              <t-icon name="tools" />
              <span class="tool-name">{{ tc.name }}</span>
              <t-tag v-if="tc.status === 'running'" theme="warning" size="small">执行中...</t-tag>
              <t-tag v-else-if="tc.success" theme="success" size="small">成功</t-tag>
              <t-tag v-else-if="tc.success === false" theme="danger" size="small">失败</t-tag>
              <t-icon :name="toolCallsCollapsed[tc.id] ? 'chevron-down' : 'chevron-up'" class="toggle-icon" />
            </div>
            <Transition name="collapse">
              <div v-show="!toolCallsCollapsed[tc.id]" class="tool-call-body">
                <div v-if="tc.arguments" class="tool-section">
                  <span class="tool-label">参数:</span>
                  <pre class="tool-code">{{ formatJson(tc.arguments) }}</pre>
                </div>
                <div v-if="tc.result !== undefined" class="tool-section">
                  <span class="tool-label">结果:</span>
                  <pre class="tool-code">{{ formatJson(tc.result) }}</pre>
                </div>
                <div v-if="tc.error" class="tool-section tool-error">
                  <span class="tool-label">错误:</span>
                  <span>{{ tc.error }}</span>
                </div>
              </div>
            </Transition>
          </div>
        </div>
        
        <!-- Text -->
        <div v-if="message.content" class="text" v-html="renderedContent" />
        
        <!-- Typing Cursor -->
        <span v-if="message.isTyping && !message.content" class="typing-indicator">
          <span></span><span></span><span></span>
        </span>
        <span v-else-if="message.isTyping" class="cursor" />
      </div>
      
      <!-- Actions -->
      <div v-if="message.role === 'assistant' && !message.isTyping" class="actions">
        <t-tooltip content="复制">
          <t-button variant="text" size="small" shape="circle" @click="copyContent">
            <t-icon name="file-copy" />
          </t-button>
        </t-tooltip>
        <t-tooltip content="重新生成">
          <t-button variant="text" size="small" shape="circle" @click="$emit('regenerate')">
            <t-icon name="refresh" />
          </t-button>
        </t-tooltip>
      </div>
    </div>

    <!-- User Avatar -->
    <div v-if="message.role === 'user'" class="avatar user">
      <t-icon name="user" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, reactive } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { marked } from 'marked'
import hljs from 'highlight.js'

// 配置 marked
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true,
  gfm: true
})

const props = defineProps({
  message: { type: Object, required: true }
})

defineEmits(['preview-image', 'regenerate'])

const thinkingCollapsed = ref(false)
const toolCallsCollapsed = reactive({})

const toggleThinking = () => {
  thinkingCollapsed.value = !thinkingCollapsed.value
}

const toggleToolCall = (id) => {
  toolCallsCollapsed[id] = !toolCallsCollapsed[id]
}

// 格式化 JSON 显示
const formatJson = (data) => {
  if (typeof data === 'string') {
    try {
      return JSON.stringify(JSON.parse(data), null, 2)
    } catch {
      return data
    }
  }
  return JSON.stringify(data, null, 2)
}

// 监听 isTyping 变化，AI思考完成后自动折叠思考区域
watch(() => props.message.isTyping, (newVal, oldVal) => {
  // 当从 typing (true) 变为完成 (false) 时，自动折叠思考区域
  if (oldVal === true && newVal === false && props.message.thinking) {
    setTimeout(() => {
      thinkingCollapsed.value = true
    }, 500) // 延迟 0.5 秒后折叠，让用户看到完整的思考过程
  }
  // 自动折叠已完成的工具调用
  if (oldVal === true && newVal === false && props.message.toolCalls) {
    setTimeout(() => {
      props.message.toolCalls.forEach(tc => {
        if (tc.id) toolCallsCollapsed[tc.id] = true
      })
    }, 500)
  }
})

// 使用 marked 渲染 Markdown
const renderedContent = computed(() => {
  if (!props.message.content) return ''
  return marked.parse(props.message.content.trim())
})

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    MessagePlugin.success('已复制到剪贴板')
  } catch {
    MessagePlugin.error('复制失败')
  }
}

// 图片加载失败时隐藏图片
const handleImageError = (event) => {
  event.target.style.display = 'none'
}
</script>


<style scoped lang="less">
@import './styles.less';
</style>
