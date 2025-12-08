<template>
  <div class="tree-node">
    <!-- 连接线 -->
    <div v-if="level > 0" class="connection-line"></div>

    <div :class="[
      'node-content',
      { 'is-selected': isSelected, 'is-edit-mode': isEditMode }
    ]" :style="{ marginLeft: level * 24 + 'px' }" :draggable="isEditMode" @dragstart="handleDragStart"
      @dragover="handleDragOver" @drop="handleDrop">
      <!-- 展开/收起按钮 -->
      <t-button v-if="hasChildren" variant="text" size="small" class="expand-btn" @click="handleToggleExpand">
        <template #icon>
          <t-icon :name="isExpanded ? 'chevron-down' : 'chevron-right'" />
        </template>
      </t-button>
      <div v-else class="expand-placeholder"></div>

      <!-- 内容区域 -->
      <div class="node-main">
        <div class="node-info">
          <!-- 复选框（分配模式） -->
          <t-checkbox v-if="!isEditMode" :checked="isSelected" @change="handleToggleSelect" />

          <!-- 拖拽手柄（结构模式） -->
          <t-icon v-if="isEditMode" name="move" class="drag-handle" />

          <div class="node-text">
            <span class="node-name">{{ node.name }}</span>
            <span class="node-code">{{ node.code }}</span>
          </div>
        </div>

        <div class="node-actions">
          <t-tag v-if="node.parentId === null" size="small" variant="outline">
            模块
          </t-tag>
          <div v-if="isEditMode" class="action-buttons">
            <t-button variant="text" size="small" theme="danger" @click="handleDelete">
              <template #icon><t-icon name="delete" /></template>
            </t-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 子节点 -->
    <transition name="slide">
      <div v-if="isExpanded && hasChildren" class="node-children">
        <PermissionTreeNode v-for="child in node.children" :key="child.id" :node="child" :level="level + 1"
          :role-permissions="rolePermissions" :is-edit-mode="isEditMode" :expanded-nodes="expandedNodes"
          @toggle-select="$emit('toggle-select', $event)" @toggle-expand="$emit('toggle-expand', $event)"
          @drop-node="(s, t) => $emit('drop-node', s, t)" @delete-node="$emit('delete-node', $event)" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    required: true
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

const isExpanded = computed(() => props.expandedNodes.has(props.node.id))
// 统一转为字符串比较，避免类型不一致问题
const isSelected = computed(() => props.rolePermissions.includes(String(props.node.id)))
const hasChildren = computed(() => props.node.children && props.node.children.length > 0)

const handleToggleExpand = () => {
  emit('toggle-expand', props.node.id)
}

const handleToggleSelect = () => {
  emit('toggle-select', props.node.id)
}

const handleDragStart = (e) => {
  if (!props.isEditMode) return
  e.dataTransfer.setData('text/plain', props.node.id)
  e.dataTransfer.effectAllowed = 'move'
}

const handleDragOver = (e) => {
  if (!props.isEditMode) return
  e.preventDefault()
}

const handleDrop = (e) => {
  if (!props.isEditMode) return
  e.preventDefault()
  e.stopPropagation()
  const sourceId = e.dataTransfer.getData('text/plain')
  if (sourceId && sourceId !== props.node.id) {
    emit('drop-node', sourceId, props.node.id)
  }
}

const handleDelete = () => {
  emit('delete-node', props.node.id)
}
</script>

<style scoped lang="less">
.tree-node {
  position: relative;
  user-select: none;
}

.connection-line {
  position: absolute;
  left: -18px;
  top: 50%;
  width: 18px;
  height: 1px;
  background: var(--td-component-border);
}

.node-content {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: var(--td-bg-color-container);
  transition: all 0.2s;

  &:hover {
    background: var(--td-bg-color-container-hover);
  }

  &.is-edit-mode {
    cursor: move;

    &:hover {
      border-color: var(--td-brand-color);
    }
  }

  &.is-selected {
    background: var(--td-brand-color-light);
  }
}

.expand-btn {
  margin-right: 8px;
  padding: 0;
  min-width: 24px;
}

.expand-placeholder {
  width: 24px;
  margin-right: 8px;
}

.node-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.node-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.drag-handle {
  color: var(--td-text-color-placeholder);
  cursor: move;
}

.node-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.node-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--td-text-color-primary);
}

.node-code {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  font-family: 'Consolas', 'Monaco', monospace;
}

.node-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-buttons {
  opacity: 0;
  transition: opacity 0.2s;

  .node-content:hover & {
    opacity: 1;
  }
}

.node-children {
  overflow: hidden;
}

// 展开/收起动画
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-in-out;
  max-height: 1000px;
  opacity: 1;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
