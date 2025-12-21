<template>
  <div class="award-team-members">
    <div class="section-header">
      <h3 class="section-title">
        <t-icon name="usergroup" />
        获奖团队
        <t-tag size="small" variant="light">
          {{ members.length }}人
        </t-tag>
      </h3>
    </div>

    <div class="member-grid">
      <div v-for="member in members" :key="member.id" class="member-card">
        <t-avatar :image="getAvatarUrl(member)" size="36px" />
        <div class="member-info">
          <t-tooltip :content="member.nickname" placement="top">
            <p class="member-name">{{ member.nickname }}</p>
          </t-tooltip>
          <t-tooltip :content="member.studentId" placement="bottom">
            <p class="member-id">{{ member.studentId }}</p>
          </t-tooltip>
        </div>
        <t-icon name="link" class="member-link-icon" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  members: {
    type: Array,
    required: true,
    default: () => []
  }
})

// 获取头像URL
const getAvatarUrl = (member) => {
  if (member.avatarUrl) return member.avatarUrl
  if (member.avatarFileId) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatarFileId}`
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`
}
</script>

<style scoped lang="less">
.award-team-members {
  .section-header {
    margin-bottom: 12px;
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--td-text-color-primary);

    .t-icon {
      color: #3b82f6;
    }
  }
}

.member-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--td-component-border);
    border-radius: 4px;
  }
}

.member-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: 1px solid var(--td-component-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--td-bg-color-container);

  &:hover {
    background: var(--td-bg-color-container-hover);
    border-color: rgba(59, 130, 246, 0.5);

    .member-link-icon {
      opacity: 1;
    }
  }

  .member-info {
    flex: 1;
    min-width: 0;

    .member-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--td-text-color-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }

    .member-id {
      font-size: 12px;
      color: var(--td-text-color-placeholder);
      font-family: monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0;
    }
  }

  .member-link-icon {
    color: #3b82f6;
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
  }
}
</style>
