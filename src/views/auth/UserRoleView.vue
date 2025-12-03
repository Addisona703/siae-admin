<template>
  <div class="user-role-view">
    <h2 class="page-title">用户角色分配</h2>
    <p class="page-description">为用户分配角色和权限</p>
    
    <div class="content-placeholder">
      <t-icon name="user-setting" size="64px" style="color: var(--td-text-color-placeholder);" />
      <p style="margin-top: 16px; color: var(--td-text-color-secondary);">用户角色分配功能开发中...</p>
      <p style="margin-top: 8px; color: var(--td-text-color-placeholder); font-size: 14px;">
        将支持：查看用户角色、分配角色、移除角色等功能
      </p>
    </div>
  </div>
</template>

<script setup>
// 用户角色分配页面
</script>

<style scoped lang="less">
.user-role-view {
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
