<template>
  <div class="stat-card" :class="`stat-card-${color}`">
    <div class="stat-content">
      <div class="stat-info">
        <p class="stat-title">{{ title }}</p>
        <h3 class="stat-value">{{ formatValue(value) }}</h3>
      </div>
      <div class="stat-icon">
        <t-icon :name="icon" size="24px" />
      </div>
    </div>
    <div class="stat-footer">
      <span v-if="trend" class="stat-trend">
        <t-icon name="arrow-up" size="12px" />
        {{ trend }}
      </span>
      <span v-if="subText" class="stat-subtext">{{ subText }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'red', 'purple'].includes(value)
  },
  trend: {
    type: String,
    default: ''
  },
  subText: {
    type: String,
    default: ''
  }
})

const formatValue = (value) => {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  return value
}
</script>

<style scoped lang="less">
.stat-card {
  background: var(--td-bg-color-container);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--td-shadow-1);
  transition: all 0.3s ease;
  border: 1px solid var(--td-component-border);

  &:hover {
    box-shadow: var(--td-shadow-2);
    transform: translateY(-2px);
  }
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin: 0 0 8px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--td-text-color-primary);
  margin: 0;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.stat-card-blue .stat-icon {
  background: rgba(59, 130, 246, 0.1);
  color: var(--td-brand-color);
}

.stat-card-green .stat-icon {
  background: rgba(16, 185, 129, 0.1);
  color: var(--td-success-color);
}

.stat-card-red .stat-icon {
  background: rgba(239, 68, 68, 0.1);
  color: var(--td-error-color);
}

.stat-card-purple .stat-icon {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--td-success-color);
  font-weight: 500;
}

.stat-subtext {
  color: var(--td-text-color-placeholder);
}
</style>
