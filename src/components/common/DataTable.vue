<template>
  <div class="data-table">
    <t-table :data="data" :columns="columns" :loading="loading" :pagination="paginationConfig" :row-key="rowKey"
      :stripe="stripe" :hover="hover" :bordered="bordered" :max-height="maxHeight" v-bind="$attrs"
      @page-change="handlePageChange" @change="handleChange">
      <!-- Forward all slots to t-table -->
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </t-table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: [Object, Boolean],
    default: () => ({
      current: 1,
      pageSize: 10,
      total: 0
    })
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  stripe: {
    type: Boolean,
    default: true
  },
  hover: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: false
  },
  maxHeight: {
    type: [String, Number],
    default: undefined
  }
})

const emit = defineEmits(['page-change', 'change'])

// Computed pagination config
const paginationConfig = computed(() => {
  if (props.pagination === false) return false

  return {
    current: props.pagination.current || 1,
    pageSize: props.pagination.pageSize || 10,
    total: props.pagination.total || 0,
    showJumper: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50, 100],
    ...props.pagination
  }
})

// Handlers
const handlePageChange = (pageInfo) => {
  emit('page-change', pageInfo)
}

const handleChange = (data, context) => {
  emit('change', data, context)
}
</script>

<style scoped>
.data-table {
  width: 100%;
  overflow-x: auto;
}

/* Responsive table styles */
@media (max-width: 768px) {
  .data-table {
    :deep(.t-table) {
      min-width: 800px;
    }

    :deep(.t-pagination) {
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }

    :deep(.t-pagination__select) {
      margin-bottom: 8px;
    }
  }
}

@media (max-width: 480px) {
  .data-table {
    :deep(.t-pagination) {
      font-size: 12px;
    }

    :deep(.t-pagination__btn) {
      padding: 4px 8px;
    }
  }
}
</style>
