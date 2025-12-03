<template>
  <div class="award-level-view">
    <h2 class="page-title">奖项等级管理</h2>
    <p class="page-description">管理系统中的奖项等级，如国家级、省级、校级等</p>
    
    <div class="content-placeholder">
      <t-icon name="star" size="64px" style="color: var(--td-text-color-placeholder);" />
      <p style="margin-top: 16px; color: var(--td-text-color-secondary);">奖项等级管理功能开发中...</p>
      <p style="margin-top: 8px; color: var(--td-text-color-placeholder); font-size: 14px;">
        将支持：等级列表、添加等级、编辑等级、删除等级等功能
      </p>
    </div>
  </div>
</template>

<script setup>
// 奖项等级管理页面
</script>

<style scoped lang="less">
.award-level-view {
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
