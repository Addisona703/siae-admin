<template>
  <t-loading :loading="loading" :fullscreen="fullscreen" :size="size" :text="text" :attach="attach"
    :preventScrollThrough="preventScrollThrough">
    <slot />
  </t-loading>
</template>

<script setup>
const props = defineProps({
  loading: {
    type: Boolean,
    required: true
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  text: {
    type: String,
    default: 'Loading...'
  },
  attach: {
    type: [String, Function],
    default: undefined
  },
  preventScrollThrough: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
/* Additional loading overlay styles if needed */
</style>
