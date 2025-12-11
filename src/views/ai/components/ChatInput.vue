<template>
  <div class="input-area">
    <div class="input-container">
      <!-- Image Preview -->
      <Transition name="slide-up">
        <div v-if="previewImage" class="preview">
          <img :src="previewImage" alt="预览" />
          <div v-if="imageUploading" class="upload-progress">
            <t-loading size="small" />
            <span>{{ uploadProgress }}%</span>
          </div>
          <t-button v-else size="small" shape="circle" theme="danger" class="remove-btn" @click="removeImage">
            <t-icon name="close" />
          </t-button>
        </div>
      </Transition>

      <!-- Input Box -->
      <div class="input-box" :class="{ focused: isFocused }">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          :placeholder="placeholder"
          :disabled="disabled || imageUploading"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keydown.enter.exact.prevent="handleSend"
          @input="autoResize"
        />

        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-left">
            <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFile">
            
            <t-tooltip content="上传图片">
              <t-button variant="text" shape="circle" :disabled="disabled || imageUploading" @click="$refs.fileInput.click()">
                <t-icon name="image" />
              </t-button>
            </t-tooltip>
            
            <t-tooltip content="语音输入">
              <t-button variant="text" shape="circle" :disabled="disabled">
                <t-icon name="sound" />
              </t-button>
            </t-tooltip>
          </div>
          
          <div class="toolbar-right">
            <span v-if="inputText.length > 0" class="char-count">
              {{ inputText.length }}
            </span>
            <t-button 
              theme="primary" 
              shape="circle"
              size="medium"
              :disabled="!canSend" 
              :loading="loading"
              @click="handleSend"
            >
              <t-icon name="send" />
            </t-button>
          </div>
        </div>
      </div>
      
      <!-- Hint -->
      <p class="hint">AI 生成的内容可能存在错误，请注意甄别</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useUpload } from '@/utils/useUpload'

const props = defineProps({
  loading: Boolean,
  disabled: Boolean,
  placeholder: { type: String, default: '输入消息，Shift+Enter 换行...' }
})

const emit = defineEmits(['send'])

const inputText = ref('')
const previewImage = ref(null)
const uploadedFileId = ref(null) // 上传成功后的 fileId
const isFocused = ref(false)
const textareaRef = ref(null)
const fileInput = ref(null)

// 使用上传 hook
const { upload, uploading: imageUploading, progress: uploadProgress, reset: resetUpload } = useUpload({
  accessPolicy: 'PUBLIC'
})

const canSend = computed(() => {
  const hasContent = inputText.value.trim() || uploadedFileId.value
  return hasContent && !props.loading && !props.disabled && !imageUploading.value
})

const autoResize = () => {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 200) + 'px'
    }
  })
}

const handleFile = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    MessagePlugin.warning('请选择图片文件')
    return
  }
  
  if (file.size > 10 * 1024 * 1024) {
    MessagePlugin.warning('图片大小不能超过 10MB')
    return
  }
  
  // 先显示本地预览
  const reader = new FileReader()
  reader.onload = (ev) => {
    previewImage.value = ev.target.result
  }
  reader.readAsDataURL(file)
  e.target.value = ''
  
  // 上传到服务器
  try {
    const task = await upload(file)
    uploadedFileId.value = task.fileId
    MessagePlugin.success('图片上传成功')
  } catch (err) {
    console.error('图片上传失败:', err)
    MessagePlugin.error('图片上传失败: ' + (err.message || '未知错误'))
    // 上传失败，清除预览
    previewImage.value = null
    uploadedFileId.value = null
  }
}

const removeImage = () => {
  previewImage.value = null
  uploadedFileId.value = null
  resetUpload()
}

const handleSend = () => {
  if (!canSend.value) return
  
  emit('send', {
    text: inputText.value.trim(),
    image: previewImage.value,
    fileIds: uploadedFileId.value ? [uploadedFileId.value] : []
  })
  
  inputText.value = ''
  previewImage.value = null
  uploadedFileId.value = null
  resetUpload()
  nextTick(autoResize)
}

// Public method to fill input
const fillInput = (text) => {
  inputText.value = text
  nextTick(() => {
    textareaRef.value?.focus()
    autoResize()
  })
}

defineExpose({ fillInput })
</script>


<style scoped lang="less">
@import './styles.less';
</style>
