<template>
  <div class="role-view">
    <h2 class="page-title">角色管理</h2>
    <p class="page-description">管理系统中的角色配置</p>
    
    <div class="content-placeholder">
      <t-icon name="user-circle" size="64px" style="color: var(--td-text-color-placeholder);" />
      <p style="margin-top: 16px; color: var(--td-text-color-secondary);">角色管理功能开发中...</p>
      <p style="margin-top: 8px; color: var(--td-text-color-placeholder); font-size: 14px;">
        将支持：角色列表、添加角色、编辑角色、分配权限等功能
      </p>
    </div>
  </div>
</template>

<script setup>
// 角色管理页面
</script>

<style scoped lang="less">
.role-view {
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
