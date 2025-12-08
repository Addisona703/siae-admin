<template>
  <div class="login-view">
    <div class="login-card">
      <div class="login-header">
        <img src="/favicon.ico" alt="Logo" class="logo" />
        <h1>SIAE 管理后台</h1>
        <p>请登录您的账户</p>
      </div>

      <t-form ref="formRef" :data="formData" :rules="formRules" :label-width="0" @submit="handleSubmit">
        <t-form-item name="username">
          <t-input v-model="formData.username" placeholder="用户名" size="large" :disabled="isLoading">
            <template #prefix-icon>
              <t-icon name="user" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item name="password">
          <t-input
            v-model="formData.password"
            type="password"
            placeholder="密码"
            size="large"
            :disabled="isLoading"
            @enter="handleSubmit"
          >
            <template #prefix-icon>
              <t-icon name="lock-on" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item>
          <t-button theme="primary" size="large" block :loading="isLoading" @click="handleSubmit">
            {{ isLoading ? '登录中...' : '登 录' }}
          </t-button>
        </t-form-item>
      </t-form>

      <div class="login-footer">
        <span>Powered by SIAE Platform</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuthStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref()
const isLoading = ref(false)

const formData = reactive({
  username: '',
  password: '',
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 3, message: '用户名至少3位' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6位' },
  ],
}

const handleSubmit = async () => {
  const validateResult = await formRef.value?.validate()
  if (validateResult !== true) return

  try {
    isLoading.value = true
    await authStore.login(formData)
    MessagePlugin.success('登录成功')

    const redirect = route.query.redirect || '/dashboard'
    const targetPath = redirect === '/' ? '/dashboard' : redirect
    await router.replace(targetPath)
  } catch (error) {
    const errorMessage = error?.response?.data?.message || error?.message || '登录失败'
    MessagePlugin.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="less">
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;

  .logo {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }

  h1 {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px;
  }

  p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 12px;
  color: #999;
}

:deep(.t-form__item) {
  margin-bottom: 20px;
}

:deep(.t-input) {
  height: 44px;
}

:deep(.t-button) {
  height: 44px;
  font-size: 16px;
}
</style>
