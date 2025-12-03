<template>
  <div class="role-list">
    <div class="role-header">
      <div class="header-title">
        <t-icon name="user" />
        <h3>角色列表</h3>
      </div>
      <t-button variant="text" size="small" @click="handleAdd">
        <template #icon><t-icon name="add" /></template>
      </t-button>
    </div>

    <div class="role-items">
      <div v-for="role in roles" :key="role.id" :class="['role-item', { active: activeRoleId === role.id }]"
        @click="handleSelect(role.id)">
        <div class="role-info">
          <h4 class="role-name">{{ role.name }}</h4>
          <p class="role-desc">{{ role.description }}</p>
          <div class="role-meta">
            <t-tag size="small" variant="outline">
              {{ role.count }} 个成员
            </t-tag>
          </div>
        </div>
        <div v-if="activeRoleId === role.id" class="active-indicator"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  roles: {
    type: Array,
    required: true,
    default: () => []
  },
  activeRoleId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:activeRoleId', 'add'])

const handleSelect = (id) => {
  emit('update:activeRoleId', id)
}

const handleAdd = () => {
  emit('add')
}
</script>

<style scoped lang="less">
.role-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--td-bg-color-container);
  border-radius: 12px;
  border: 1px solid var(--td-component-border);
  padding: 20px;
}

.role-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin: 0;
    }
  }
}

.role-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;

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

.role-item {
  position: relative;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--td-component-border);
  background: var(--td-bg-color-container);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--td-brand-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &.active {
    background: var(--td-brand-color);
    border-color: var(--td-brand-color);
    color: white;

    .role-name,
    .role-desc {
      color: white;
    }

    .role-meta {
      :deep(.t-tag) {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: white;
      }
    }
  }
}

.role-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 0;
}

.role-desc {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin: 0;
}

.role-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.active-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  animation: pulse 2s infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>
