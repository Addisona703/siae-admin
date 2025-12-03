<template>
  <div class="brand-login-container">
    <!-- Full-screen Illustration Background -->
    <div class="illustration-background">
      <svg class="brand-illustration" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice">
        <!-- Sky/Background -->
        <rect width="1920" height="1080" fill="url(#skyGradient)" />

        <!-- Gradient Definitions -->
        <defs>
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0284c7;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#0369a1;stop-opacity:0.9" />
            <stop offset="100%" style="stop-color:#0284c7;stop-opacity:0.9" />
          </linearGradient>
        </defs>

        <!-- Abstract Buildings/Office -->
        <rect x="100" y="600" width="200" height="400" rx="10" fill="url(#buildingGradient)" opacity="0.8" />
        <rect x="350" y="500" width="250" height="500" rx="10" fill="url(#buildingGradient)" opacity="0.7" />
        <rect x="650" y="550" width="180" height="450" rx="10" fill="url(#buildingGradient)" opacity="0.8" />

        <!-- Windows on buildings -->
        <g opacity="0.6">
          <rect x="120" y="620" width="30" height="40" rx="3" fill="#fbbf24" class="window-light" />
          <rect x="170" y="620" width="30" height="40" rx="3" fill="#fbbf24" class="window-light" />
          <rect x="120" y="680" width="30" height="40" rx="3" fill="#fbbf24" class="window-light" />
          <rect x="170" y="680" width="30" height="40" rx="3" fill="#fbbf24" class="window-light" />

          <rect x="380" y="530" width="35" height="45" rx="3" fill="#fbbf24" class="window-light" />
          <rect x="440" y="530" width="35" height="45" rx="3" fill="#fbbf24" class="window-light" />
          <rect x="500" y="530" width="35" height="45" rx="3" fill="#fbbf24" class="window-light" />
        </g>

        <!-- Network Connections -->
        <g opacity="0.4" stroke="#7dd3fc" stroke-width="2" fill="none" stroke-dasharray="5,5">
          <path d="M 200 700 Q 500 600 800 700" class="connection-line" />
          <path d="M 475 650 Q 700 550 950 650" class="connection-line" />
          <path d="M 300 800 Q 600 700 900 800" class="connection-line" />
        </g>

        <!-- Floating Data Nodes -->
        <circle cx="500" cy="600" r="20" fill="#38bdf8" opacity="0.7" class="float-node-1" />
        <circle cx="800" cy="700" r="15" fill="#10b981" opacity="0.7" class="float-node-2" />
        <circle cx="950" cy="650" r="18" fill="#f59e0b" opacity="0.7" class="float-node-3" />
        <circle cx="300" cy="800" r="16" fill="#8b5cf6" opacity="0.7" class="float-node-1" />

        <!-- Abstract Shapes -->
        <circle cx="1600" cy="300" r="150" fill="#38bdf8" opacity="0.2" class="pulse-shape" />
        <circle cx="1700" cy="800" r="120" fill="#10b981" opacity="0.15" class="pulse-shape" />
        <circle cx="200" cy="200" r="100" fill="#f59e0b" opacity="0.15" class="pulse-shape" />
      </svg>
    </div>

    <!-- Login Card -->
    <div class="login-card-wrapper">
      <div class="login-card">
        <div class="card-header">
          <div class="brand-logo">
            <img src="/public/favicon.ico" alt="">
          </div>
          <h1 class="card-title">Welcome to SIAE</h1>
          <p class="card-subtitle">Sign in to access your dashboard</p>
        </div>

        <t-form ref="formRef" :data="plainFormData" :rules="props.formRules" :label-width="0" class="login-form"
          @submit="handleSubmit">
          <t-form-item name="username">
            <div class="input-group">
              <label class="input-label">Username</label>
              <t-input v-model="props.formData.username" type="text" class="brand-input"
                placeholder="Enter your username" :disabled="props.isLoading">
                <template #prefix-icon>
                  <t-icon name="user" />
                </template>
              </t-input>
            </div>
          </t-form-item>

          <t-form-item name="password">
            <div class="input-group">
              <label class="input-label">Password</label>
              <t-input v-model="props.formData.password" type="password" class="brand-input"
                placeholder="Enter your password" :disabled="props.isLoading" :on-enter="handleSubmit">
                <template #prefix-icon>
                  <t-icon name="lock-on" />
                </template>
              </t-input>
            </div>
          </t-form-item>

          <t-form-item>
            <t-button type="submit" theme="primary" class="login-button" :disabled="props.isLoading"
              :loading="props.isLoading" block @click.prevent="handleSubmit">
              {{ props.isLoading ? 'Logging In...' : 'Log In' }}
            </t-button>
          </t-form-item>
        </t-form>

        <div class="card-footer">
          <p class="footer-text">Powered by SIAE Platform</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

const handleSubmit = async () => {
  const validateResult = await formRef.value?.validate()
  if (validateResult === true) {
    emit('submit')
  }
}
</script>

<style scoped lang="less">
.brand-login-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

// Full-screen Illustration Background
.illustration-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;

  .brand-illustration {
    width: 100%;
    height: 100%;
    object-fit: cover;

    .window-light {
      animation: windowBlink 3s ease-in-out infinite;
    }

    .connection-line {
      animation: dashMove 20s linear infinite;
    }

    .float-node-1 {
      animation: floatNode 4s ease-in-out infinite;
    }

    .float-node-2 {
      animation: floatNode 5s ease-in-out infinite 1s;
    }

    .float-node-3 {
      animation: floatNode 4.5s ease-in-out infinite 0.5s;
    }

    .pulse-shape {
      animation: pulseGrow 6s ease-in-out infinite;
    }
  }
}

// Login Card
.login-card-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  padding: 40px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3),
    0 0 100px rgba(14, 165, 233, 0.2);
  animation: cardFadeIn 0.8s ease-out;

  .card-header {
    text-align: center;
    margin-bottom: 36px;

    .brand-logo {
      width: 64px;
      height: 64px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      // background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      border-radius: 16px;
      // box-shadow: 0 8px 20px rgba(14, 165, 233, 0.4);

      :deep(.t-icon) {
        font-size: 32px;
        color: #ffffff;
      }
    }

    .card-title {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 8px;
      letter-spacing: -0.5px;
    }

    .card-subtitle {
      font-size: 15px;
      color: #64748b;
      margin: 0;
      font-weight: 400;
    }
  }

  .login-form {
    :deep(.t-form__item) {
      margin-bottom: 20px;
    }

    .input-group {
      width: 100%;

      .input-label {
        display: block;
        font-size: 14px;
        color: #475569;
        margin-bottom: 8px;
        font-weight: 500;
      }

      // :deep(.brand-input) {
      //   width: 100%;

      //   .t-input__wrap {
      //     width: 100%;
      //   }

      //   .t-input__inner {
      //     width: 100%;
      //   }
      // }
    }
  }

  .card-footer {
    margin-top: 28px;
    text-align: center;

    .footer-text {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
    }
  }
}

// Animations
@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes windowBlink {

  0%,
  100% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }
}

@keyframes dashMove {
  to {
    stroke-dashoffset: -100;
  }
}

@keyframes floatNode {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-30px);
  }
}

@keyframes pulseGrow {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.2;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
}

// Responsive Design
@media (max-width: 768px) {
  .login-card {
    max-width: 100%;
    padding: 36px 28px;

    .card-header {
      margin-bottom: 28px;

      .brand-logo {
        width: 56px;
        height: 56px;

        :deep(.t-icon) {
          font-size: 28px;
        }
      }

      .card-title {
        font-size: 24px;
      }

      .card-subtitle {
        font-size: 14px;
      }
    }
  }
}
</style>
