<template>
  <div class="chart-card" :style="cardStyle">
    <div class="chart-card__header">
      <div class="chart-card__title">
        <t-icon v-if="icon" :name="icon" size="20px" />
        <span>{{ title }}</span>
      </div>
      <div v-if="$slots.extra" class="chart-card__extra">
        <slot name="extra"></slot>
      </div>
    </div>
    <div class="chart-card__content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: 'auto'
  }
})

const cardStyle = computed(() => {
  if (props.height && props.height !== 'auto') {
    return { height: props.height }
  }
  return {}
})
</script>

<style scoped lang="less">
.chart-card {
  background: var(--td-bg-color-container);
  border-radius: 16px;
  border: 1px solid var(--td-component-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  will-change: transform, box-shadow;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    border-color: transparent;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--td-component-border);
    flex-shrink: 0;
    background: var(--td-bg-color-container);
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 18px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    letter-spacing: -0.5px;
  }

  &__extra {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__content {
    padding: 24px;
    flex: 1;
    overflow: hidden;
    background: var(--td-bg-color-container);
  }
}
</style>
