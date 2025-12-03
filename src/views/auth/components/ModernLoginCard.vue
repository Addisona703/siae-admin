<template>
  <div class="analytics-split-container">
    <!-- Left Panel - Login Form -->
    <div class="left-panel">
      <div class="form-wrapper">
        <div class="form-header">
          <div class="logo">
            <t-icon name="dashboard" />
          </div>
          <h1 class="form-title">Welcome Back</h1>
          <p class="form-subtitle">Sign in to continue to your dashboard</p>
        </div>

        <t-form ref="formRef" :data="plainFormData" :rules="formRules" :label-width="0" class="login-form"
          @submit="handleSubmit">
          <t-form-item name="username">
            <div class="input-group">
              <label class="input-label">Username</label>
              <t-input v-model="props.formData.username" type="text" class="modern-input"
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
              <t-input v-model="props.formData.password" type="password" class="modern-input"
                placeholder="Enter your password" :disabled="props.isLoading" :on-enter="handleSubmit">
                <template #prefix-icon>
                  <t-icon name="lock-on" />
                </template>
              </t-input>
            </div>
          </t-form-item>

          <t-form-item>
            <t-button type="submit" theme="warning" class="login-button" :disabled="props.isLoading"
              :loading="props.isLoading" block @click.prevent="handleSubmit">
              {{ props.isLoading ? 'Signing In...' : 'Login' }}
            </t-button>
          </t-form-item>
        </t-form>

        <div class="form-footer">
          <p class="footer-text">© 2024 SIAE. All rights reserved.</p>
        </div>
      </div>
    </div>

    <!-- Right Panel - Illustration -->
    <div class="right-panel">
      <div class="illustration-container">
        <!-- Abstract Teamwork Illustration -->
        <svg class="illustration" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
          <!-- Background Circle -->
          <circle cx="300" cy="300" r="250" fill="#f0f9ff" opacity="0.5" />

          <!-- Team Members -->
          <!-- Person 1 -->
          <circle cx="200" cy="250" r="40" fill="#0ea5e9" />
          <rect x="170" y="295" width="60" height="80" rx="10" fill="#0ea5e9" />

          <!-- Person 2 -->
          <circle cx="300" cy="220" r="45" fill="#f97316" />
          <rect x="265" y="270" width="70" height="90" rx="10" fill="#f97316" />

          <!-- Person 3 -->
          <circle cx="400" cy="250" r="40" fill="#8b5cf6" />
          <rect x="370" y="295" width="60" height="80" rx="10" fill="#8b5cf6" />

          <!-- Data Charts -->
          <!-- Bar Chart -->
          <rect x="150" y="420" width="30" height="60" rx="5" fill="#0ea5e9" opacity="0.7" />
          <rect x="190" y="400" width="30" height="80" rx="5" fill="#0ea5e9" opacity="0.7" />
          <rect x="230" y="430" width="30" height="50" rx="5" fill="#0ea5e9" opacity="0.7" />

          <!-- Pie Chart -->
          <circle cx="450" cy="450" r="50" fill="none" stroke="#f97316" stroke-width="20" stroke-dasharray="157 314" />
          <circle cx="450" cy="450" r="50" fill="none" stroke="#8b5cf6" stroke-width="20" stroke-dasharray="94 314"
            stroke-dashoffset="-157" />

          <!-- Connection Lines -->
          <line x1="200" y1="250" x2="300" y2="220" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="5,5" />
          <line x1="300" y1="220" x2="400" y2="250" stroke="#cbd5e1" stroke-width="3" stroke-dasharray="5,5" />

          <!-- Floating Elements -->
          <circle cx="120" cy="180" r="15" fill="#f97316" opacity="0.6" class="float-1" />
          <circle cx="480" cy="150" r="20" fill="#0ea5e9" opacity="0.6" class="float-2" />
          <circle cx="500" cy="350" r="12" fill="#8b5cf6" opacity="0.6" class="float-3" />
        </svg>

        <div class="illustration-text">
          <h2>Collaborate & Analyze</h2>
          <p>Work together with your team to make data-driven decisions</p>
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
.analytics-split-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  z-index: 2;
}

// Left Panel - Login Form
.left-panel {
  width: 45%;
  height: 100%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  animation: slideInLeft 0.8s ease-out;

  .form-wrapper {
    width: 100%;
    max-width: 420px;

    .form-header {
      margin-bottom: 40px;

      .logo {
        width: 56px;
        height: 56px;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);

        :deep(.t-icon) {
          font-size: 28px;
          color: #ffffff;
        }
      }

      .form-title {
        font-size: 32px;
        font-weight: 700;
        color: #1e293b;
        margin: 0 0 8px;
        letter-spacing: -0.5px;
      }

      .form-subtitle {
        font-size: 15px;
        color: #64748b;
        margin: 0;
        font-weight: 400;
        line-height: 1.5;
      }
    }

    .login-form {
      :deep(.t-form__item) {
        margin-bottom: 24px;
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

        :deep(.modern-input) {
          width: 100%;

          .t-input__wrap {
            width: 100%;
          }

          .t-input__inner {
            width: 100%;
          }
        }
      }
    }

    .form-footer {
      margin-top: 32px;
      text-align: center;

      .footer-text {
        font-size: 13px;
        color: #94a3b8;
        margin: 0;
      }
    }
  }
}

// Right Panel - Illustration
.right-panel {
  width: 55%;
  height: 100%;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  animation: slideInRight 0.8s ease-out;

  .illustration-container {
    text-align: center;
    max-width: 500px;

    .illustration {
      width: 100%;
      max-width: 400px;
      height: auto;
      margin-bottom: 32px;
      filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1));

      .float-1 {
        animation: float 3s ease-in-out infinite;
      }

      .float-2 {
        animation: float 4s ease-in-out infinite 0.5s;
      }

      .float-3 {
        animation: float 3.5s ease-in-out infinite 1s;
      }
    }

    .illustration-text {
      h2 {
        font-size: 28px;
        font-weight: 700;
        color: #0f172a;
        margin: 0 0 12px;
        letter-spacing: -0.5px;
      }

      p {
        font-size: 16px;
        color: #475569;
        margin: 0;
        line-height: 1.6;
      }
    }
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-20px);
  }
}

// Responsive Design
@media (max-width: 1024px) {
  .analytics-split-container {
    flex-direction: column;
  }

  .left-panel,
  .right-panel {
    width: 100%;
    height: 50%;
  }

  .left-panel {
    padding: 40px 30px;
  }

  .right-panel {
    padding: 40px 30px;

    .illustration-container {
      .illustration {
        max-width: 300px;
      }

      .illustration-text {
        h2 {
          font-size: 24px;
        }

        p {
          font-size: 14px;
        }
      }
    }
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
          width: 48px;
          height: 48px;

          :deep(.t-icon) {
            font-size: 24px;
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

  .right-panel {
    .illustration-container {
      .illustration {
        max-width: 250px;
      }
    }
  }
}
</style>
