<template>
  <div class="category-tree">
    <table class="tree-table">
      <thead>
        <tr>
          <th style="width: 250px">分类名称</th>
          <th style="width: 150px">编码</th>
          <th>描述</th>
          <th style="width: 100px; text-align: center">状态</th>
          <th style="width: 150px; text-align: center">操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="item in treeData" :key="item.id">
          <CategoryTreeRow 
            :item="item" 
            :level="0"
            :expanded-keys="expandedKeys"
            @toggle="toggleExpand"
            @status-change="handleStatusChange"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @add-sub="$emit('add-sub', $event)"
          />
        </template>
      </tbody>
    </table>
    <div v-if="!treeData.length" class="empty-state">
      <t-icon name="folder-open" size="48px" />
      <p>暂无分类数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CategoryTreeRow from './CategoryTreeRow.vue'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['status-change', 'edit', 'delete', 'add-sub'])

const expandedKeys = ref(new Set())

// 构建树形数据
const buildTree = (items, parentId = null) => {
  return items
    .filter(item => item.parentId === parentId)
    .map(item => {
      const children = buildTree(items, item.id)
      return { ...item, children }
    })
}

const treeData = computed(() => buildTree(props.data, null))

// 默认展开所有
const expandAll = () => {
  props.data.forEach(item => expandedKeys.value.add(item.id))
}

const collapseAll = () => {
  expandedKeys.value.clear()
}

const toggleExpand = (id) => {
  if (expandedKeys.value.has(id)) {
    expandedKeys.value.delete(id)
  } else {
    expandedKeys.value.add(id)
  }
}

const handleStatusChange = (item) => {
  emit('status-change', item)
}

// 初始化时展开所有
expandAll()

defineExpose({ expandAll, collapseAll })
</script>

<style scoped lang="less">
.category-tree {
  border: 1px solid var(--td-component-border);
  border-radius: 6px;
  overflow: hidden;
}

.tree-table {
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid var(--td-component-border);
  }
  
  th {
    background: var(--td-bg-color-container-hover);
    font-weight: 600;
    color: var(--td-text-color-primary);
    font-size: 14px;
  }
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: var(--td-text-color-placeholder);
  
  p {
    margin-top: 12px;
    font-size: 14px;
  }
}
</style>
