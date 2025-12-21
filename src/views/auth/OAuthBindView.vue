<template>
  <div class="oauth-bind-view">
    <!-- 背景 -->
    <div class="cyber-background">
      <div class="gradient-overlay"></div>
    </div>

    <div class="bind-card">
      <div class="bind-header">
        <div class="avatar-wrapper">
          <img v-if="oauthInfo.avatar" :src="oauthInfo.avatar" alt="头像" class="avatar" />
          <t-icon v-else name="user-circle" size="64px" />
        </div>
        <h2>完善账号信息</h2>
        <p>欢迎通过 {{ providerName }} 登录，请设置您的账号信息</p>
      </div>

      <t-form ref="formRef" :data="formData" :rules="formRules" :label-width="0" @submit="handleSubmit">
        <t-form-item name="username">
          <t-input v-model="formData.username" placeholder="用户名（3-20个字符）" size="large" :disabled="isLoading">
            <template #prefix-icon>
              <t-icon name="user" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item name="email">
          <t-input v-model="formData.email" placeholder="邮箱（选填）" size="large" :disabled="isLoading">
            <template #prefix-icon>
              <t-icon name="mail" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item name="password">
          <t-input v-model="formData.password" type="password" placeholder="密码（选填，6-20个字符）" size="large" :disabled="isLoading">
            <template #prefix-icon>
              <t-icon name="lock-on" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item>
          <t-button theme="primary" size="large" block :loading="isLoading" @click="handleSubmit">
            {{ isLoading ? '注册中...' : '完成注册' }}
          </t-button>
        </t-form-item>
      </t-form>

      <div class="bind-footer">
        <t-button variant="text" @click="handleCancel">返回登录</t-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuthStore } from '@/stores'
import { post } from '@/api/client'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref()
const isLoading = ref(false)

const oauthInfo = reactive({
  tempToken: '',
  nickname: '',
  avatar: '',
  provider: ''
})

const formData = reactive({
  username: '',
  email: '',
  password: ''
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间' }
  ],
  email: [
    { email: true, message: '请输入正确的邮箱格式' }
  ],
  password: [
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间' }
  ]
}

const providerName = computed(() => {
  const names = { qq: 'QQ', github: 'GitHub', gitee: 'Gitee' }
  return names[oauthInfo.provider] || '第三方平台'
})

const handleSubmit = async () => {
  const validateResult = await formRef.value?.validate()
  if (validateResult !== true) return

  if (!oauthInfo.tempToken) {
    MessagePlugin.error('授权信息已过期，请重新登录')
    router.replace('/login')
    return
  }

  try {
    isLoading.value = true
    const res = await post('/auth/oauth/register', {
      tempToken: oauthInfo.tempToken,
      username: formData.username,
      email: formData.email || undefined,
      password: formData.password || undefined
    }, { skipAuth: true })

    if (res?.data?.accessToken) {
      authStore.setTokens(res.data.accessToken, res.data.refreshToken)
      sessionStorage.removeItem('oauth_temp')
      MessagePlugin.success('注册成功')
      await router.replace('/dashboard')
    } else {
      MessagePlugin.error(res?.message || '注册失败')
    }
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '注册失败'
    MessagePlugin.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  sessionStorage.removeItem('oauth_temp')
  router.replace('/login')
}

onMounted(() => {
  const stored = sessionStorage.getItem('oauth_temp')
  if (!stored) {
    MessagePlugin.warning('请先进行第三方授权')
    router.replace('/login')
    return
  }

  try {
    const data = JSON.parse(stored)
    oauthInfo.tempToken = data.tempToken
    oauthInfo.nickname = data.nickname
    oauthInfo.avatar = data.avatar
    oauthInfo.provider = data.provider
    // 预填充用户名
    formData.username = data.nickname || ''
  } catch {
    MessagePlugin.error('授权信息解析失败')
    router.replace('/login')
  }
})
</script>

<style scoped lang="less">
.oauth-bind-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  background: #0a0e27;
}

.cyber-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.15) 0%, transparent 50%);
}

.bind-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  position: relative;
  z-index: 10;

  html[theme-mode='dark'] & {
    background: rgba(20, 25, 40, 0.85);
  }
}

.bind-header {
  text-align: center;
  margin-bottom: 32px;

  .avatar-wrapper {
    margin-bottom: 16px;
  }

  .avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    border: 3px solid rgba(102, 126, 234, 0.3);
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0 0 8px;
  }

  p {
    font-size: 14px;
    color: var(--td-text-color-placeholder);
    margin: 0;
  }
}

.bind-footer {
  text-align: center;
  margin-top: 16px;
}

:deep(.t-form-item) {
  margin-bottom: 20px;
}

:deep(.t-input) {
  border-radius: 12px;
}

:deep(.t-button) {
  border-radius: 12px;
}
</style>
