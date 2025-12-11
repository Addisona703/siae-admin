<template>
  <div :class="['message', message.role]">
    <!-- AI Avatar -->
    <div v-if="message.role === 'assistant'" class="avatar ai">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    </div>

    <!-- Content -->
    <div class="content">
      <span v-if="message.role === 'assistant'" class="sender">AI Assistant</span>
      
      <div :class="['bubble', message.role]">
        <!-- Image -->
        <div v-if="message.image" class="image-wrap">
          <img :src="message.image" alt="附件" @click="$emit('preview-image', message.image)" />
        </div>
        
        <!-- Extracted Images from content (for history messages) -->
        <div v-if="extractedImages.length > 0" class="extracted-images">
          <div v-for="(imgUrl, idx) in extractedImages" :key="idx" class="image-wrap">
            <img :src="imgUrl" alt="历史图片" @click="$emit('preview-image', imgUrl)" />
          </div>
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
import { ref, computed, watch } from 'vue'
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

const toggleThinking = () => {
  thinkingCollapsed.value = !thinkingCollapsed.value
}

// 监听 isTyping 变化，AI思考完成后自动折叠思考区域
watch(() => props.message.isTyping, (newVal, oldVal) => {
  // 当从 typing (true) 变为完成 (false) 时，自动折叠思考区域
  if (oldVal === true && newVal === false && props.message.thinking) {
    setTimeout(() => {
      thinkingCollapsed.value = true
    }, 500) // 延迟 0.5 秒后折叠，让用户看到完整的思考过程
  }
})

// 从消息内容中提取图片URL
const extractedImages = computed(() => {
  if (!props.message.content) return []
  
  // 匹配 http/https 开头的图片URL
  const urlPattern = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|bmp)(\?[^\s]*)?)/gi
  const matches = props.message.content.match(urlPattern)
  
  return matches || []
})

// 使用 marked 渲染 Markdown（移除图片URL，避免重复显示）
const renderedContent = computed(() => {
  if (!props.message.content) return ''
  
  let content = props.message.content
  
  // 移除已提取的图片URL，避免在文本中重复显示
  if (extractedImages.value.length > 0) {
    extractedImages.value.forEach(url => {
      content = content.replace(url, '')
    })
  }
  
  return marked.parse(content.trim())
})

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(props.message.content)
    MessagePlugin.success('已复制到剪贴板')
  } catch {
    MessagePlugin.error('复制失败')
  }
}
</script>


<style scoped lang="less">
@import './styles.less';
</style>
