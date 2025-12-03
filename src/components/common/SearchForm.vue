<template>
  <div class="search-form">
    <t-form :data="modelValue" :layout="layout" :label-width="labelWidth" class="search-form-inner" v-bind="$attrs">
      <!-- Forward all slots -->
      <slot />

      <!-- Action buttons -->
      <t-form-item v-if="showActions" :label="layout === 'inline' ? '' : ' '">
        <t-space :size="8">
          <t-button theme="primary" @click="handleSearch">
            <template #icon><t-icon name="search" /></template>
            {{ searchText }}
          </t-button>
          <t-button v-if="showReset" theme="default" @click="handleReset">
            {{ resetText }}
          </t-button>
          <slot name="extra-actions" />
        </t-space>
      </t-form-item>
    </t-form>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  layout: {
    type: String,
    default: 'inline',
    validator: (value) => ['vertical', 'inline'].includes(value)
  },
  labelWidth: {
    type: [String, Number],
    default: 'auto'
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showReset: {
    type: Boolean,
    default: true
  },
  searchText: {
    type: String,
    default: '搜索'
  },
  resetText: {
    type: String,
    default: '重置'
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

// Handlers
const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  emit('reset')
}
</script>

<style scoped>
.search-form {
  padding: 16px;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
  margin-bottom: 16px;
}

.search-form-inner {
  margin-bottom: 0;
}
</style>
