<template>
  <div class="content-audit-view">
    <h2 class="page-title">内容审核</h2>
    <p class="page-description">审核待发布的内容</p>
    
    <div class="content-placeholder">
      <t-icon name="check-circle" size="64px" style="color: var(--td-text-color-placeholder);" />
      <p style="margin-top: 16px; color: var(--td-text-color-secondary);">内容审核功能开发中...</p>
      <p style="margin-top: 8px; color: var(--td-text-color-placeholder); font-size: 14px;">
        将支持：待审核列表、审核通过、审核拒绝、审核历史等功能
      </p>
    </div>
  </div>
</template>

<script setup>
// 内容审核页面
</script>

<style scoped lang="less">
.content-audit-view {
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
