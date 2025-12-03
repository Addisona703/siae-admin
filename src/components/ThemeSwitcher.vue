<template>
  <t-dropdown :disabled="isLoading" placement="bottom-right" trigger="click"
    :popup-props="{ overlayClassName: 'theme-switcher-dropdown' }">
    <t-button variant="text" :loading="isLoading">
      <template #icon>
        <palette-icon />
      </template>
      {{ currentTheme?.name || '选择主题' }}
      <template #suffix>
        <chevron-down-icon />
      </template>
    </t-button>

    <t-dropdown-menu>
      <t-dropdown-item v-for="theme in themeList" :key="theme.id" :value="theme.id"
        :class="{ 'theme-item-active': theme.id === currentThemeId }" @click="handleThemeSwitch(theme.id)">
        <div class="theme-item">
          <div class="theme-item-header">
            <span class="theme-item-name">{{ theme.name }}</span>
            <check-icon v-if="theme.id === currentThemeId" class="theme-item-check" />
          </div>
          <div class="theme-item-description">{{ theme.description }}</div>
        </div>
      </t-dropdown-item>
    </t-dropdown-menu>
  </t-dropdown>
</template>

<script setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  PaletteIcon,
  ChevronDownIcon,
  CheckIcon
} from 'tdesign-icons-vue-next'

// Props
const props = defineProps({
  showDescription: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['theme-changed', 'theme-change-error'])

// Store
const themeStore = useThemeStore()

// Computed
const currentTheme = computed(() => themeStore.currentTheme)
const currentThemeId = computed(() => themeStore.currentThemeId)
const themeList = computed(() => themeStore.themeList)
const isLoading = computed(() => themeStore.isLoading)

// Methods
const handleThemeSwitch = async (themeId) => {
  // Don't switch if already current theme
  if (themeId === currentThemeId.value) {
    return
  }

  try {
    await themeStore.switchTheme(themeId)

    // Show success message
    MessagePlugin.success({
      content: `已切换到 ${themeStore.currentTheme?.name} 主题`,
      duration: 2000
    })

    // Emit theme changed event
    emit('theme-changed', themeId)
  } catch (error) {
    console.error('Failed to switch theme:', error)

    // Show error message
    MessagePlugin.error({
      content: '主题切换失败，请重试',
      duration: 3000
    })

    // Emit error event
    emit('theme-change-error', error)
  }
}
</script>

<style scoped>
/* Theme item styling */
.theme-item {
  padding: 0.25rem 0;
  min-width: 200px;
}

.theme-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.theme-item-name {
  font-weight: 500;
  font-size: 14px;
  color: var(--td-text-color-primary);
}

.theme-item-description {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  line-height: 1.4;
}

.theme-item-check {
  color: var(--td-brand-color);
  font-size: 16px;
  flex-shrink: 0;
}

/* Active theme item */
:deep(.theme-item-active) {
  background-color: var(--td-bg-color-container-active);
}

:deep(.theme-item-active) .theme-item-name {
  color: var(--td-brand-color);
  font-weight: 600;
}

/* Dropdown menu styling */
:deep(.theme-switcher-dropdown) {
  min-width: 220px;
}

/* Button styling */
:deep(.t-button) {
  gap: 4px;
}
</style>
