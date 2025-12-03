<template>
  <div class="skeleton-screen">
    <!-- Table Skeleton -->
    <div v-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-header">
        <t-skeleton :loading="true" :row-col="[{ width: '100%', height: '40px' }]" />
      </div>
      <div class="skeleton-rows">
        <t-skeleton v-for="i in rows" :key="i" :loading="true" :row-col="[{ width: '100%', height: '48px' }]"
          class="skeleton-row" />
      </div>
    </div>

    <!-- Card Skeleton -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <t-skeleton :loading="true" :row-col="[
        { width: '100%', height: '200px' },
        { width: '60%', height: '20px', marginTop: '16px' },
        { width: '80%', height: '16px', marginTop: '8px' },
        { width: '70%', height: '16px', marginTop: '8px' }
      ]" />
    </div>

    <!-- Form Skeleton -->
    <div v-else-if="type === 'form'" class="skeleton-form">
      <t-skeleton v-for="i in rows" :key="i" :loading="true" :row-col="[
        { width: '30%', height: '20px' },
        { width: '100%', height: '40px', marginTop: '8px' }
      ]" class="skeleton-form-item" />
    </div>

    <!-- Chart Skeleton -->
    <div v-else-if="type === 'chart'" class="skeleton-chart">
      <t-skeleton :loading="true" :row-col="[{ width: '100%', height: chartHeight }]" />
    </div>

    <!-- List Skeleton -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <t-skeleton v-for="i in rows" :key="i" :loading="true" :row-col="[
        { width: '48px', height: '48px' },
        { width: 'calc(100% - 64px)', height: '20px', marginLeft: '16px' },
        { width: 'calc(100% - 64px)', height: '16px', marginTop: '8px', marginLeft: '16px' }
      ]" class="skeleton-list-item" />
    </div>

    <!-- Custom Skeleton -->
    <div v-else class="skeleton-custom">
      <t-skeleton :loading="true" :row-col="rowCol" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'table',
    validator: (value) => ['table', 'card', 'form', 'chart', 'list', 'custom'].includes(value)
  },
  rows: {
    type: Number,
    default: 5
  },
  chartHeight: {
    type: String,
    default: '300px'
  },
  rowCol: {
    type: Array,
    default: () => [{ width: '100%', height: '200px' }]
  }
})
</script>

<style scoped>
.skeleton-screen {
  width: 100%;
  padding: 16px;
}

.skeleton-table {
  width: 100%;
}

.skeleton-header {
  margin-bottom: 16px;
}

.skeleton-row {
  margin-bottom: 8px;
}

.skeleton-card {
  width: 100%;
  padding: 16px;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
}

.skeleton-form {
  width: 100%;
}

.skeleton-form-item {
  margin-bottom: 24px;
}

.skeleton-chart {
  width: 100%;
  padding: 16px;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
}

.skeleton-list {
  width: 100%;
}

.skeleton-list-item {
  margin-bottom: 16px;
  padding: 12px;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
}

.skeleton-custom {
  width: 100%;
}
</style>
