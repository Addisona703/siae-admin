<template>
  <!-- 当前行 -->
  <tr class="tree-row" :class="{ 'has-children': hasChildren }">
    <td>
      <div class="name-cell" :style="{ paddingLeft: level * 24 + 'px' }">
        <span 
          v-if="hasChildren" 
          class="expand-icon" 
          @click="$emit('toggle', item.id)"
        >
          <t-icon :name="isExpanded ? 'chevron-down' : 'chevron-right'" />
        </span>
        <span v-else class="expand-placeholder"></span>
        <t-icon name="folder" class="folder-icon" />
        <span class="name-text">{{ item.name }}</span>
      </div>
    </td>
    <td>
      <span class="code-text">{{ item.code }}</span>
    </td>
    <td>
      <span v-if="item.description" class="desc-text">{{ item.description }}</span>
      <span v-else class="desc-empty">暂无描述</span>
    </td>
    <td style="text-align: center">
      <t-switch 
        :model-value="item.enable === 1" 
        @change="handleStatusChange"
        size="large"
      />
    </td>
    <td style="text-align: center">
      <div class="action-btns">
        <span class="action-btn" @click="$emit('add-sub', item)">
          <t-icon name="add" /> 子分类
        </span>
        <span class="action-btn" @click="$emit('edit', item)">编辑</span>
        <t-popconfirm 
          content="确定删除该分类及其子分类吗？" 
          theme="danger" 
          @confirm="$emit('delete', item)"
        >
          <span class="action-btn danger">删除</span>
        </t-popconfirm>
      </div>
    </td>
  </tr>
  
  <!-- 子节点 -->
  <template v-if="hasChildren && isExpanded">
    <CategoryTreeRow
      v-for="child in item.children"
      :key="child.id"
      :item="child"
      :level="level + 1"
      :expanded-keys="expandedKeys"
      @toggle="$emit('toggle', $event)"
      @status-change="$emit('status-change', $event)"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @add-sub="$emit('add-sub', $event)"
    />
  </template>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  },
  expandedKeys: {
    type: Set,
    default: () => new Set()
  }
})

const emit = defineEmits(['toggle', 'status-change', 'edit', 'delete', 'add-sub'])

const hasChildren = computed(() => props.item.children && props.item.children.length > 0)
const isExpanded = computed(() => props.expandedKeys.has(props.item.id))

const handleStatusChange = (val) => {
  emit('status-change', { ...props.item, enable: val ? 1 : 0 })
}
</script>

<style scoped lang="less">
.tree-row {
  transition: background-color 0.2s;
  
  &:hover {
    background: var(--td-bg-color-container-hover);
  }
  
  td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--td-component-border);
    font-size: 14px;
    color: var(--td-text-color-primary);
  }
}

.name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  color: var(--td-text-color-secondary);
  transition: all 0.2s;
  
  &:hover {
    background: var(--td-bg-color-container-active);
    color: var(--td-brand-color);
  }
}

.expand-placeholder {
  width: 20px;
}

.folder-icon {
  color: var(--td-warning-color);
  font-size: 18px;
}

.name-text {
  font-weight: 500;
}

.code-text {
  font-family: monospace;
  color: var(--td-text-color-secondary);
  background: var(--td-bg-color-container-hover);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.desc-text {
  color: var(--td-text-color-secondary);
}

.desc-empty {
  color: var(--td-text-color-placeholder);
  font-style: italic;
}

.action-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.action-btn {
  color: var(--td-brand-color);
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 2px;
  
  &:hover {
    text-decoration: underline;
  }
  
  &.danger {
    color: var(--td-error-color);
  }
}
</style>
