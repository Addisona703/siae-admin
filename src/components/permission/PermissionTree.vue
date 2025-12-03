<template>
  <div class="permission-tree">
    <div v-if="permissionTree.length === 0" class="empty-state">
      <t-icon name="lock" size="48px" />
      <p>暂无权限数据</p>
    </div>

    <div v-else class="tree-content">
      <PermissionTreeNode v-for="node in permissionTree" :key="node.id" :node="node" :level="0"
        :role-permissions="rolePermissions" :is-edit-mode="isEditMode" :expanded-nodes="expandedNodes"
        @toggle-select="$emit('toggle-select', $event)" @toggle-expand="$emit('toggle-expand', $event)"
        @drop-node="(s, t) => $emit('drop-node', s, t)" @delete-node="$emit('delete-node', $event)" />

      <!-- 底部添加按钮 -->
      <div v-if="isEditMode" class="add-root-btn">
        <t-button variant="dashed" block @click="handleAddRoot">
          <template #icon><t-icon name="add" /></template>
          添加根权限模块
        </t-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import PermissionTreeNode from './PermissionTreeNode.vue'

const props = defineProps({
  permissionTree: {
    type: Array,
    required: true,
    default: () => []
  },
  rolePermissions: {
    type: Array,
    required: true,
    default: () => []
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  expandedNodes: {
    type: Set,
    required: true
  }
})

const emit = defineEmits(['toggle-select', 'toggle-expand', 'drop-node', 'delete-node'])

const handleAddRoot = () => {
  alert('添加根权限功能开发中...')
}
</script>

<style scoped lang="less">
.permission-tree {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  background: transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--td-scrollbar-color);
    border-radius: 3px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--td-text-color-placeholder);

  p {
    margin-top: 16px;
    font-size: 14px;
  }
}

.tree-content {
  max-width: 900px;
  margin: 0 auto;
}

.add-root-btn {
  margin-top: 16px;
}
</style>
