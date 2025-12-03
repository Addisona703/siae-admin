<template>
  <t-button variant="text" shape="square" @click="handleToggle" :title="isDarkTheme ? '切换到浅色模式' : '切换到深色模式'">
    <template #icon>
      <t-icon v-if="isDarkTheme" name="mode-light" />
      <t-icon v-else name="mode-dark" />
    </template>
  </t-button>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores'

const appStore = useAppStore()
const { isDarkTheme } = storeToRefs(appStore)

const handleToggle = (event) => {
  appStore.toggleTheme(event)
}
</script>
