<template>
  <div class="draggable-dashboard" :data-theme="currentTheme">
    <!-- Theme Selector & Controls -->
    <div class="dashboard-controls">
      <t-space>
        <t-select v-model="currentThemeId" :options="themeOptions" placeholder="选择主题" style="width: 200px"
          :disabled="isEditMode">
          <template #panelTopContent>
            <div class="theme-selector-header">
              <span>选择仪表盘主题</span>
            </div>
          </template>
        </t-select>
        <t-tag theme="primary" variant="light">
          {{ currentTheme.layout.cols }}列布局
        </t-tag>
        <t-button v-if="editable" theme="primary" variant="outline" @click="toggleEditMode">
          {{ isEditMode ? '保存布局' : '编辑布局' }}
        </t-button>
        <t-button v-if="isEditMode" theme="default" variant="outline" @click="resetLayout">
          重置
        </t-button>
      </t-space>
    </div>

    <!-- Grid Layout -->
    <grid-layout v-model:layout="layoutData" :col-num="gridCols" :row-height="gridRowHeight" :is-draggable="isEditMode"
      :is-resizable="isEditMode" :vertical-compact="compactType === 'vertical'" :use-css-transforms="true"
      :margin="gridMargin" @layout-updated="onLayoutUpdated">
      <grid-item v-for="widget in layoutData" :key="widget.i" :x="widget.x" :y="widget.y" :w="widget.w" :h="widget.h"
        :i="widget.i" :min-w="widget.minW" :min-h="widget.minH" :max-w="widget.maxW" :max-h="widget.maxH"
        :static="widget.static" :is-draggable="widget.isDraggable !== false && isEditMode"
        :is-resizable="widget.isResizable !== false && isEditMode" class="dashboard-widget">
        <div class="widget-container">
          <!-- Widget Header -->
          <div v-if="widget.title" class="widget-header"
            :class="{ 'themed-header': currentTheme.style.headerBackground }">
            <span class="widget-title">{{ widget.title }}</span>
            <t-button v-if="isEditMode && !widget.static" theme="default" variant="text" size="small"
              @click="removeWidget(widget.i)">
              <template #icon><close-icon /></template>
            </t-button>
          </div>

          <!-- Widget Content -->
          <div class="widget-content">
            <component :is="getComponent(widget.component)" v-bind="widget.props" />
          </div>
        </div>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { GridLayout, GridItem } from 'vue-grid-layout'
import { CloseIcon } from 'tdesign-icons-vue-next'
import { useTheme } from '@/composables/useTheme'

const props = defineProps({
  widgets: {
    type: Array,
    required: true,
    default: () => []
  },
  editable: {
    type: Boolean,
    default: true
  },
  components: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:widgets', 'layout-change', 'theme-change'])

// 使用主题管理
const {
  currentThemeId,
  currentTheme,
  themeOptions,
  setTheme,
  loadSavedTheme,
  adaptLayout
} = useTheme()

// State
const layoutData = ref([])
const isEditMode = ref(false)
const previousThemeId = ref(currentThemeId.value)

// 动态布局配置（基于当前主题）
const gridCols = computed(() => currentTheme.value.layout.cols)
const gridRowHeight = computed(() => currentTheme.value.layout.rowHeight)
const gridMargin = computed(() => currentTheme.value.layout.margin)
const compactType = computed(() => currentTheme.value.layout.compactType)

// Methods
const getComponent = (componentName) => {
  // Dynamic component resolution from provided components map
  return props.components[componentName] || componentName
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    saveLayout()
  }
}

const saveLayout = () => {
  emit('update:widgets', layoutData.value)
  emit('layout-change', layoutData.value)
  // Save to localStorage
  localStorage.setItem('dashboard-layout', JSON.stringify(layoutData.value))
}

const resetLayout = () => {
  layoutData.value = JSON.parse(JSON.stringify(props.widgets))
  localStorage.removeItem('dashboard-layout')
}

const removeWidget = (widgetId) => {
  layoutData.value = layoutData.value.filter(w => w.i !== widgetId)
}

const onLayoutUpdated = (newLayout) => {
  // Sync layout changes
  layoutData.value = layoutData.value.map(widget => {
    const updated = newLayout.find(item => item.i === widget.i)
    return updated ? { ...widget, ...updated } : widget
  })
}

// 主题切换处理
const handleThemeChange = (newThemeId) => {
  // 适配布局到新主题
  const adaptedLayout = adaptLayout(layoutData.value, newThemeId)
  layoutData.value = adaptedLayout

  // 切换主题
  setTheme(newThemeId)
  previousThemeId.value = newThemeId

  // 通知父组件
  emit('theme-change', newThemeId)

  // 保存布局
  saveLayout()
}

// 生命周期
onMounted(() => {
  // 加载保存的主题
  loadSavedTheme()
  previousThemeId.value = currentThemeId.value

  // Load saved layout from localStorage
  const savedLayout = localStorage.getItem('dashboard-layout')
  if (savedLayout) {
    try {
      layoutData.value = JSON.parse(savedLayout)
    } catch {
      layoutData.value = JSON.parse(JSON.stringify(props.widgets))
    }
  } else {
    layoutData.value = JSON.parse(JSON.stringify(props.widgets))
  }
})

// Watch props changes
watch(() => props.widgets, (newWidgets) => {
  if (!isEditMode.value) {
    layoutData.value = JSON.parse(JSON.stringify(newWidgets))
  }
}, { deep: true })

// Watch theme changes
watch(currentThemeId, (newThemeId, oldThemeId) => {
  if (newThemeId !== oldThemeId && !isEditMode.value) {
    handleThemeChange(newThemeId)
  }
})
</script>

<style scoped>
/* Vue Grid Layout Base Styles */
:deep(.vue-grid-layout) {
  position: relative;
  transition: height 0.2s ease;
}

:deep(.vue-grid-item) {
  transition: all 0.2s ease;
  transition-property: left, top, right, bottom;
  box-sizing: border-box;
}

:deep(.vue-grid-item.no-touch) {
  touch-action: none;
}

:deep(.vue-grid-item.cssTransforms) {
  transition-property: transform, width, height;
  left: 0;
  right: auto;
}

:deep(.vue-grid-item.resizing) {
  transition: none;
  z-index: 3;
}

:deep(.vue-grid-item.vue-draggable-dragging) {
  transition: none;
  z-index: 3;
}

:deep(.vue-grid-item.dropping) {
  visibility: hidden;
}

:deep(.vue-grid-item > .vue-resizable-handle) {
  position: absolute;
  width: 20px;
  height: 20px;
  bottom: 0;
  right: 0;
  cursor: se-resize;
}

:deep(.vue-grid-item > .vue-rtl-resizable-handle) {
  bottom: 0;
  left: 0;
  cursor: sw-resize;
  right: auto;
}

.draggable-dashboard {
  width: 100%;
  min-height: 100%;
}

.dashboard-controls {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.theme-selector-header {
  padding: 8px 12px;
  font-size: 12px;
  color: var(--td-text-color-secondary);
  border-bottom: 1px solid var(--td-component-border);
}

.dashboard-widget {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.widget-container {
  width: 100%;
  height: 100%;
  background: var(--dashboard-widget-bg, var(--td-bg-color-container));
  border: var(--dashboard-widget-border, var(--td-component-border));
  border-radius: var(--td-radius-default);
  box-shadow: var(--dashboard-widget-shadow, var(--td-shadow-1));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.widget-container:hover {
  box-shadow: var(--dashboard-widget-hover-shadow, var(--td-shadow-2));
}

.widget-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--td-component-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--td-bg-color-container);
  transition: all 0.3s ease;
}

.widget-header.themed-header {
  background: var(--dashboard-header-bg);
}

.widget-header.themed-header .widget-title {
  color: var(--dashboard-header-text);
}

.widget-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.widget-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
}

/* Grid Layout Customization */
:deep(.vue-grid-item) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.vue-grid-item.vue-grid-placeholder) {
  background: var(--dashboard-drag-handle, var(--td-brand-color));
  opacity: 0.2;
  border-radius: var(--td-radius-default);
}

:deep(.vue-grid-item > .vue-resizable-handle) {
  background-color: var(--dashboard-resize-handle, var(--td-brand-color-light));
  opacity: 0;
  transition: opacity 0.3s;
}

:deep(.vue-grid-item:hover > .vue-resizable-handle) {
  opacity: 0.6;
}

:deep(.vue-grid-item.resizing) {
  opacity: 0.9;
}

:deep(.vue-grid-item.static) {
  cursor: default;
}

:deep(.vue-grid-item.vue-draggable-dragging) {
  transition: none;
  z-index: 100;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .dashboard-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .dashboard-controls :deep(.t-space) {
    width: 100%;
    flex-direction: column;
  }

  .dashboard-controls :deep(.t-select),
  .dashboard-controls :deep(.t-button) {
    width: 100%;
  }
}
</style>
