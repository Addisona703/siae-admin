<template>
  <div class="theme-switcher-demo">
    <t-card title="主题切换器演示" :bordered="true">
      <template #actions>
        <ThemeSwitcher @theme-changed="handleThemeChanged" @theme-change-error="handleThemeChangeError" />
      </template>

      <div class="demo-content">
        <h3>当前主题信息</h3>
        <t-descriptions :data="themeInfo" bordered>
          <t-descriptions-item label="主题 ID">{{ currentTheme?.id }}</t-descriptions-item>
          <t-descriptions-item label="主题名称">{{ currentTheme?.name }}</t-descriptions-item>
          <t-descriptions-item label="主题描述">{{ currentTheme?.description }}</t-descriptions-item>
          <t-descriptions-item label="作者">{{ currentTheme?.author }}</t-descriptions-item>
          <t-descriptions-item label="版本">{{ currentTheme?.version }}</t-descriptions-item>
          <t-descriptions-item label="布局已加载">
            <t-tag :theme="currentTheme?.layoutComponent ? 'success' : 'default'">
              {{ currentTheme?.layoutComponent ? '是' : '否' }}
            </t-tag>
          </t-descriptions-item>
          <t-descriptions-item label="样式已加载">
            <t-tag :theme="currentTheme?.styleLoaded ? 'success' : 'default'">
              {{ currentTheme?.styleLoaded ? '是' : '否' }}
            </t-tag>
          </t-descriptions-item>
        </t-descriptions>

        <t-divider />

        <h3>可用主题列表</h3>
        <t-space direction="vertical" style="width: 100%">
          <t-card v-for="theme in themeList" :key="theme.id" :bordered="true"
            :class="{ 'active-theme-card': theme.id === currentThemeId }">
            <template #header>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>{{ theme.name }}</span>
                <t-tag v-if="theme.id === currentThemeId" theme="primary">当前主题</t-tag>
              </div>
            </template>
            <p>{{ theme.description }}</p>
            <template #footer>
              <t-button size="small" :disabled="theme.id === currentThemeId || isLoading"
                @click="switchToTheme(theme.id)">
                切换到此主题
              </t-button>
            </template>
          </t-card>
        </t-space>

        <t-divider />

        <h3>主题切换状态</h3>
        <t-space direction="vertical" style="width: 100%">
          <div>
            <strong>加载中：</strong>
            <t-tag :theme="isLoading ? 'warning' : 'default'">
              {{ isLoading ? '是' : '否' }}
            </t-tag>
          </div>
          <div>
            <strong>加载进度：</strong>
            <t-progress :percentage="loadingProgress" :status="isLoading ? 'active' : 'success'" />
          </div>
          <div>
            <strong>已缓存主题：</strong>
            <t-space>
              <t-tag v-for="themeId in cachedThemeIds" :key="themeId" theme="success">
                {{ themeId }}
              </t-tag>
            </t-space>
          </div>
        </t-space>
      </div>
    </t-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { MessagePlugin } from 'tdesign-vue-next'
import { ThemeSwitcher } from '@/components'

// Store
const themeStore = useThemeStore()

// Computed
const currentTheme = computed(() => themeStore.currentTheme)
const currentThemeId = computed(() => themeStore.currentThemeId)
const themeList = computed(() => themeStore.themeList)
const isLoading = computed(() => themeStore.isLoading)
const loadingProgress = computed(() => themeStore.loadingProgress)
const cachedThemeIds = computed(() => Array.from(themeStore.cachedThemes))

const themeInfo = computed(() => [
  { label: '主题 ID', value: currentTheme.value?.id },
  { label: '主题名称', value: currentTheme.value?.name },
  { label: '主题描述', value: currentTheme.value?.description },
])

// Methods
const switchToTheme = async (themeId) => {
  try {
    await themeStore.switchTheme(themeId)
    MessagePlugin.success(`已切换到 ${themeStore.currentTheme?.name} 主题`)
  } catch (error) {
    console.error('Failed to switch theme:', error)
    MessagePlugin.error('主题切换失败，请重试')
  }
}

const handleThemeChanged = (themeId) => {
  console.log('Theme changed to:', themeId)
}

const handleThemeChangeError = (error) => {
  console.error('Theme change error:', error)
}
</script>

<style scoped>
.theme-switcher-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-content {
  padding: 16px 0;
}

.demo-content h3 {
  margin: 16px 0;
  color: var(--td-text-color-primary);
}

.active-theme-card {
  border-color: var(--td-brand-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
