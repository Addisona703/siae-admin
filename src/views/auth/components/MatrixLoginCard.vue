<template>
  <div class="matrix-login-form">
    <div class="form-header">
      <div class="terminal-icon">
        <t-icon name="code" color="#00ff41" />
      </div>
      <h1 class="form-title">&gt; SYSTEM_ACCESS</h1>
      <p class="form-subtitle">// Authentication Required</p>
    </div>

    <form class="login-form" @submit.prevent="handleSubmit">
      <div class="form-item">
        <div class="input-container">
          <label class="input-label">&gt; username:</label>
          <input :value="formData.username" @input="e => formData.username = e.target.value" type="text"
            class="matrix-input" :disabled="isLoading" autocomplete="username" />
        </div>
        <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
      </div>

      <div class="form-item">
        <div class="input-container">
          <label class="input-label">&gt; password:</label>
          <input :value="formData.password" @input="e => formData.password = e.target.value" type="password"
            class="matrix-input" :disabled="isLoading" autocomplete="current-password" @keyup.enter="handleSubmit" />
        </div>
        <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
      </div>

      <div class="form-item">
        <t-button type="submit" theme="success" class="access-button" :disabled="isLoading" :loading="isLoading" block
          @click.prevent="handleSubmit">
          <span class="button-text">{{ isLoading ? '&gt; AUTHENTICATING...' : '&gt; ACCESS_GRANTED' }}</span>
        </t-button>
      </div>
    </form>

    <div class="form-footer">
      <p class="footer-text">// SIAE_SECURITY_v2.0</p>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  formRules: {
    type: Object,
    default: () => ({})
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit'])

const errors = reactive({
  username: '',
  password: ''
})

const validateForm = () => {
  errors.username = ''
  errors.password = ''

  const username = String(props.formData.username || '')
  const password = String(props.formData.password || '')

  if (!username) {
    errors.username = '// ERROR: username required'
    return false
  }

  if (username.length < 3) {
    errors.username = '// ERROR: username must be at least 3 characters'
    return false
  }

  if (!password) {
    errors.password = '// ERROR: password required'
    return false
  }

  if (password.length < 6) {
    errors.password = '// ERROR: password must be at least 6 characters'
    return false
  }

  return true
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('submit')
  }
}
</script>

<style scoped lang="less">
.matrix-login-form {
  position: relative;
  z-index: 2;
  width: 90%;
  max-width: 480px;
  animation: fadeIn 0.8s ease-out;

  .form-header {
    text-align: left;
    margin-bottom: 40px;

    .terminal-icon {
      width: 50px;
      height: 50px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-start;

      :deep(.t-icon) {
        font-size: 40px;
        color: #00ff41;
        filter: drop-shadow(0 0 10px rgba(0, 255, 65, 0.8));
        animation: pulse 2s ease-in-out infinite;
      }
    }

    .form-title {
      font-size: 32px;
      font-weight: 700;
      color: #00ff41;
      margin: 0 0 12px;
      font-family: 'Courier New', monospace;
      letter-spacing: 2px;
      text-shadow: 0 0 20px rgba(0, 255, 65, 0.6);
      animation: glitch 3s infinite;
    }

    .form-subtitle {
      font-size: 14px;
      color: rgba(0, 255, 65, 0.6);
      margin: 0;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
    }
  }

  .login-form {
    .form-item {
      margin-bottom: 32px;
    }

    .input-container {
      display: flex;
      align-items: center;
      gap: 8px;

      .input-label {
        font-size: 16px;
        color: #00ff41;
        font-family: 'Courier New', 'Lucida Console', monospace;
        letter-spacing: 1px;
        text-shadow: 0 0 8px rgba(0, 255, 65, 0.4);
        white-space: nowrap;
        flex-shrink: 0;
      }

      .matrix-input {
        flex: 1;
        background: transparent;
        border: none;
        border-bottom: 1px solid rgba(0, 255, 65, 0.3);
        outline: none;
        color: #00ff41;
        caret-color: #00ff41;
        font-family: 'Courier New', 'Lucida Console', monospace;
        font-size: 16px;
        letter-spacing: 1px;
        padding: 8px 0;
        text-shadow: 0 0 5px rgba(0, 255, 65, 0.3);
        transition: border-color 0.3s ease;

        &::placeholder {
          color: transparent;
        }

        &:hover {
          border-bottom-color: rgba(0, 255, 65, 0.5);
        }

        &:focus {
          background: transparent;
          border: none;
          border-bottom: 1px solid #00ff41;
          outline: none;
          box-shadow: 0 1px 0 0 rgba(0, 255, 65, 0.5);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .error-message {
      margin-top: 8px;
      font-size: 13px;
      color: #ff0000;
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
      text-shadow: 0 0 8px rgba(255, 0, 0, 0.6);
      animation: errorBlink 0.5s ease-out;
    }
  }

  .form-footer {
    margin-top: 32px;
    text-align: left;

    .footer-text {
      font-size: 12px;
      color: rgba(0, 255, 65, 0.4);
      margin: 0;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {

  0%,
  100% {
    opacity: 0.8;
  }

  50% {
    opacity: 1;
  }
}

@keyframes glitch {

  0%,
  90%,
  100% {
    transform: translate(0);
  }

  92% {
    transform: translate(-2px, 1px);
  }

  94% {
    transform: translate(2px, -1px);
  }

  96% {
    transform: translate(-1px, 2px);
  }

  98% {
    transform: translate(1px, -2px);
  }
}

@keyframes errorBlink {

  0%,
  50%,
  100% {
    opacity: 1;
  }

  25%,
  75% {
    opacity: 0.5;
  }
}
</style>
