<template>
  <div class="split-login-container">
    <!-- Left Panel - Login Form -->
    <div class="left-panel">
      <div class="form-wrapper">
        <div class="form-header">
          <div class="logo">
            <t-icon name="secured" />
          </div>
          <h1 class="form-title">Admin Portal</h1>
          <p class="form-subtitle">Sign in to continue</p>
        </div>

        <t-form ref="formRef" :data="plainFormData" :rules="formRules" :label-width="0" class="login-form"
          @submit="handleSubmit">
          <t-form-item name="username">
            <div class="input-group">
              <label class="input-label">Username</label>
              <t-input v-model="props.formData.username" type="text" class="split-input"
                placeholder="Enter your username" :disabled="props.isLoading" />
            </div>
          </t-form-item>

          <t-form-item name="password">
            <div class="input-group">
              <label class="input-label">Password</label>
              <t-input v-model="props.formData.password" type="password" class="split-input"
                placeholder="Enter password" :disabled="props.isLoading" :on-enter="handleSubmit" />
            </div>
          </t-form-item>

          <t-form-item>
            <t-button type="submit" theme="success" class="signin-button" :disabled="props.isLoading"
              :loading="props.isLoading" block @click.prevent="handleSubmit">
              {{ props.isLoading ? 'Signing In...' : 'Sign In' }}
            </t-button>
          </t-form-item>
        </t-form>

        <div class="form-footer">
          <p class="footer-text">SIAE Security System v2.0</p>
        </div>
      </div>
    </div>

    <!-- Divider Line -->
    <div class="divider-line"></div>

    <!-- Right Panel - Matrix Rain -->
    <div class="right-panel">
      <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

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

const formRef = ref()

// Create a plain object for t-form to avoid Proxy issues
const plainFormData = computed(() => ({
  username: props.formData.username,
  password: props.formData.password
}))
const matrixCanvas = ref(null)
let animationId = null

const handleSubmit = async () => {
  const validateResult = await formRef.value?.validate()
  if (validateResult === true) {
    emit('submit')
  }
}

// Matrix rain animation for right panel
onMounted(() => {
  if (!matrixCanvas.value) return

  const canvas = matrixCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const fontSize = 14
  const columns = Math.floor(canvas.width / fontSize)
  const drops = []

  for (let i = 0; i < columns; i++) {
    drops[i] = Math.random() * -100
  }

  const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'
  const chars = matrixChars.split('')

  const draw = () => {
    if (!ctx || !canvas) return

    ctx.fillStyle = 'rgba(18, 18, 18, 0.05)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = `${fontSize}px monospace`

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      if (!char) continue

      const x = i * fontSize
      const dropValue = drops[i]
      if (dropValue === undefined) continue

      const y = dropValue * fontSize

      if (dropValue * fontSize > 0 && dropValue * fontSize < canvas.height) {
        // Bright green at head
        ctx.fillStyle = '#00ff41'
        ctx.fillText(char, x, y)

        // Dimmer trail
        ctx.fillStyle = 'rgba(0, 255, 65, 0.5)'
        ctx.fillText(char, x, y - fontSize)

        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fillText(char, x, y - fontSize * 2)
      }

      if (dropValue * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0
      } else {
        drops[i] = dropValue + 1
      }
    }

    animationId = requestAnimationFrame(draw)
  }

  draw()
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
})
</script>

<style scoped lang="less">
.split-login-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  z-index: 2;
}

// Left Panel - Login Form
.left-panel {
  width: 50%;
  height: 100%;
  background: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  animation: slideInLeft 0.8s ease-out;

  .form-wrapper {
    width: 100%;
    max-width: 420px;

    .form-header {
      margin-bottom: 48px;

      .logo {
        width: 60px;
        height: 60px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 255, 65, 0.1);
        border-radius: 12px;

        :deep(.t-icon) {
          font-size: 32px;
          color: #00ff41;
        }
      }

      .form-title {
        font-size: 32px;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 12px;
        letter-spacing: -0.5px;
      }

      .form-subtitle {
        font-size: 16px;
        color: rgba(255, 255, 255, 0.6);
        margin: 0;
        font-weight: 400;
      }
    }

    .login-form {
      :deep(.t-form__item) {
        margin-bottom: 28px;
      }

      .input-group {
        width: 100%;

        .input-label {
          display: block;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 8px;
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        :deep(.split-input) {
          width: 100%;

          .t-input__wrap {
            width: 100%;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            border-radius: 8px !important;
            transition: all 0.3s ease !important;

            &:hover {
              border-color: rgba(0, 255, 65, 0.3) !important;
              background: rgba(255, 255, 255, 0.08) !important;
            }
          }

          .t-input__inner {
            width: 100%;
            color: #151313 !important;
            background: transparent !important;
            letter-spacing: 0.3px;
            height: 48px;
            padding: 0 16px;

            &::placeholder {
              color: rgba(255, 255, 255, 0.4) !important;
            }
          }

          &.t-is-focused {
            .t-input__wrap {
              border-color: #00ff41 !important;
              background: rgba(0, 255, 65, 0.05) !important;
              box-shadow: 0 0 0 3px rgba(0, 255, 65, 0.1) !important;
            }
          }
        }
      }
    }

    .form-footer {
      margin-top: 40px;
      text-align: center;

      .footer-text {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.4);
        margin: 0;
        letter-spacing: 0.5px;
      }
    }
  }
}

// Divider Line
.divider-line {
  width: 2px;
  height: 100%;
  background: linear-gradient(to bottom,
      transparent 0%,
      #00ff41 20%,
      #00ff41 80%,
      transparent 100%);
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.6),
    0 0 40px rgba(0, 255, 65, 0.3);
  animation: glow 2s ease-in-out infinite;
  z-index: 3;
}

// Right Panel - Matrix Rain
.right-panel {
  width: 50%;
  height: 100%;
  background: #121212;
  position: relative;
  overflow: hidden;
  animation: slideInRight 0.8s ease-out;

  .matrix-canvas {
    width: 100%;
    height: 100%;
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes glow {

  0%,
  100% {
    opacity: 0.8;
    box-shadow: 0 0 20px rgba(0, 255, 65, 0.6),
      0 0 40px rgba(0, 255, 65, 0.3);
  }

  50% {
    opacity: 1;
    box-shadow: 0 0 30px rgba(0, 255, 65, 0.8),
      0 0 60px rgba(0, 255, 65, 0.5);
  }
}

// Responsive Design
@media (max-width: 1024px) {
  .split-login-container {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    height: 50%;
  }

  .divider-line {
    width: 100%;
    height: 2px;
  }

  .left-panel {
    padding: 40px 30px;
  }
}

@media (max-width: 768px) {
  .left-panel {
    padding: 30px 20px;

    .form-wrapper {
      max-width: 100%;

      .form-header {
        margin-bottom: 32px;

        .logo {
          width: 50px;
          height: 50px;

          :deep(.t-icon) {
            font-size: 28px;
          }
        }

        .form-title {
          font-size: 28px;
        }

        .form-subtitle {
          font-size: 14px;
        }
      }
    }
  }
}
</style>