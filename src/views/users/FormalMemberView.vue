<template>
  <div class="formal-member-view">
    <h2 class="page-title">正式成员管理</h2>
    <p class="page-description">管理已转正的正式成员</p>
    
    <div class="content-placeholder">
      <t-icon name="user-checked" size="64px" style="color: var(--td-text-color-placeholder);" />
      <p style="margin-top: 16px; color: var(--td-text-color-secondary);">正式成员管理功能开发中...</p>
      <p style="margin-top: 8px; color: var(--td-text-color-placeholder); font-size: 14px;">
        将支持：成员列表、搜索成员、添加成员、编辑成员、成员详情等功能
      </p>
    </div>
  </div>
</template>

<script setup>
// 正式成员管理页面
</script>

<style scoped lang="less">
.formal-member-view {
  width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 8px;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin-bottom: 32px;
}

.content-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: var(--td-bg-color-container);
  border-radius: 16px;
  border: 1px solid var(--td-component-border);
}
</style>
