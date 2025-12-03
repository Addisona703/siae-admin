<template>
  <div class="not-found-view">
    <div class="error-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">页面未找到</h2>
      <p class="error-description">抱歉，您访问的页面不存在</p>
      <t-button theme="primary" size="large" @click="goHome">
        <template #icon><t-icon name="home" /></template>
        返回首页
      </t-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped lang="less">
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--td-bg-color-page);
}

.error-content {
  text-align: center;
  padding: 48px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: var(--td-brand-color);
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 24px 0 16px;
}

.error-description {
  font-size: 16px;
  color: var(--td-text-color-secondary);
  margin: 0 0 32px;
}
</style>
