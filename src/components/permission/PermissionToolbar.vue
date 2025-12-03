<template>
  <div class="permission-toolbar">
    <!-- 头部信息 -->
    <div class="toolbar-header">
      <div class="header-info">
        <div class="info-icon">
          <t-icon name="secured" />
        </div>
        <div class="info-text">
          <h3>权限配置</h3>
          <p class="current-role">
            当前正在配置: <span class="role-name">{{ activeRoleName }}</span>
          </p>
        </div>
      </div>

      <div class="header-actions">
        <!-- 模式切换 -->
        <div class="mode-switch">
          <t-button :variant="!isEditMode ? 'base' : 'text'" size="small" @click="$emit('update:is-edit-mode', false)">
            分配
          </t-button>
          <t-button :variant="isEditMode ? 'base' : 'text'" size="small" @click="$emit('update:is-edit-mode', true)">
            <template #icon><t-icon name="view-module" /></template>
            结构
          </t-button>
        </div>

        <!-- 保存按钮 -->
        <t-button theme="primary" @click="$emit('save')">
          <template #icon><t-icon name="save" /></template>
          保存更改
        </t-button>
      </div>
    </div>

    <!-- 搜索与提示栏 -->
    <div class="toolbar-search">
      <t-input v-model="localSearchQuery" placeholder="搜索权限名称或代码..." clearable style="width: 300px">
        <template #prefix-icon>
          <t-icon name="search" />
        </template>
      </t-input>

      <t-alert v-if="isEditMode" theme="warning" message="拖拽节点可调整父子层级关系" close />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeRoleName: {
    type: String,
    required: true
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:is-edit-mode', 'update:search-query', 'save'])

const localSearchQuery = computed({
  get: () => props.searchQuery,
  set: (value) => emit('update:search-query', value),
})
</script>

<style scoped lang="less">
.permission-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px;
  background: transparent;
  border-bottom: 1px solid var(--td-component-border);
}

.toolbar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--td-brand-color-light);
  color: var(--td-brand-color);
}

.info-text {
  h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0 0 4px 0;
  }

  .current-role {
    font-size: 12px;
    color: var(--td-text-color-secondary);
    margin: 0;

    .role-name {
      font-weight: 600;
      color: var(--td-brand-color);
    }
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mode-switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--td-bg-color-component);
  border-radius: 6px;
}

.toolbar-search {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

@media (max-width: 768px) {
  .toolbar-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar-search {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
