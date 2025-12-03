<template>
  <div class="stat-card" :class="colorClass">
    <div class="stat-card__icon">
      <t-icon :name="icon" size="32px" />
    </div>
    <div class="stat-card__content">
      <div class="stat-card__title">{{ title }}</div>
      <div class="stat-card__value">{{ formattedValue }}</div>
      <div v-if="trend !== undefined" class="stat-card__trend" :class="trendClass">
        <t-icon :name="trendIcon" size="14px" />
        <span>{{ Math.abs(trend) }}%</span>
      </div>
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
  value: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'orange', 'red', 'purple'].includes(value)
  },
  trend: {
    type: Number,
    default: undefined
  }
})

const formattedValue = computed(() => {
  return props.value.toLocaleString()
})

const colorClass = computed(() => `stat-card--${props.color}`)

const trendClass = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend >= 0 ? 'stat-card__trend--up' : 'stat-card__trend--down'
})

const trendIcon = computed(() => {
  if (props.trend === undefined) return ''
  return props.trend >= 0 ? 'arrow-up' : 'arrow-down'
})
</script>

<style scoped lang="less">
.stat-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: var(--td-bg-color-container);
  border-radius: 16px;
  border: 1px solid var(--td-component-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  will-change: transform, box-shadow;
  min-height: 130px;
  height: 100%;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    border-color: transparent;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 20px;
    margin-right: 20px;
    flex-shrink: 0;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    transition: transform 0.4s ease;
  }

  &:hover &__icon {
    transform: scale(1.05) rotate(5deg);
  }

  &__content {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 14px;
    color: var(--td-text-color-secondary);
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  &__value {
    font-size: 32px;
    font-weight: 700;
    color: var(--td-text-color-primary);
    line-height: 1.2;
    margin-bottom: 8px;
    letter-spacing: -1px;
  }

  &__trend {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 8px;

    &--up {
      background-color: rgba(52, 211, 153, 0.15);
      color: #059669;
    }

    &--down {
      background-color: rgba(248, 113, 113, 0.15);
      color: #dc2626;
    }
  }

  // Color variations
  &--blue &__icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
  }

  &--green &__icon {
    background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    color: #ffffff;
  }

  &--orange &__icon {
    background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
    color: #ffffff;
  }

  &--red &__icon {
    background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    color: #ffffff;
  }

  &--purple &__icon {
    background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
    color: #ffffff;
  }
}
</style>
