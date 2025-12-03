<template>
  <div class="content-editor-view">
    <h2 class="page-title">内容编辑器</h2>
    <p class="page-description">创建和编辑内容</p>
    
    <div class="content-placeholder">
      <t-icon name="edit" size="64px" style="color: var(--td-text-color-placeholder);" />
      <p style="margin-top: 16px; color: var(--td-text-color-secondary);">内容编辑器功能开发中...</p>
      <p style="margin-top: 8px; color: var(--td-text-color-placeholder); font-size: 14px;">
        将支持：富文本编辑、Markdown编辑、图片上传、内容预览等功能
      </p>
    </div>
  </div>
</template>

<script setup>
// 内容编辑器页面
</script>

<style scoped lang="less">
.content-editor-view {
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
