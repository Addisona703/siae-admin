<template>
  <div class="page-header">
    <div class="page-header-content">
      <!-- Left side: Title and description -->
      <div class="page-header-left">
        <div class="page-header-title-wrapper">
          <t-icon v-if="icon" :name="icon" class="page-header-icon" />
          <h1 class="page-header-title">{{ title }}</h1>
        </div>
        <p v-if="description" class="page-header-description">{{ description }}</p>
        <slot name="extra" />
      </div>

      <!-- Right side: Actions -->
      <div v-if="$slots.actions || showBack" class="page-header-actions">
        <t-button v-if="showBack" theme="default" @click="handleBack">
          <template #icon><t-icon name="chevron-left" /></template>
          {{ backText }}
        </t-button>
        <slot name="actions" />
      </div>
    </div>

    <!-- Breadcrumb -->
    <div v-if="showBreadcrumb && breadcrumbs.length > 0" class="page-header-breadcrumb">
      <t-breadcrumb>
        <t-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path">
          {{ item.title }}
        </t-breadcrumb-item>
      </t-breadcrumb>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from '@/composables'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  },
  backText: {
    type: String,
    default: '返回'
  },
  showBreadcrumb: {
    type: Boolean,
    default: false
  },
  breadcrumbs: {
    type: Array,
    default: () => []
  }
})

const { goBack } = useRouter()

const handleBack = () => {
  goBack()
}
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.page-header-left {
  flex: 1;
}

.page-header-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.page-header-icon {
  font-size: 24px;
  color: var(--td-brand-color);
}

.page-header-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  line-height: 1.4;
}

.page-header-description {
  margin: 0;
  font-size: 14px;
  color: var(--td-text-color-secondary);
  line-height: 1.6;
}

.page-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.page-header-breadcrumb {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--td-border-level-1-color);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header-content {
    flex-direction: column;
  }

  .page-header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .page-header-title {
    font-size: 20px;
  }
}
</style>
