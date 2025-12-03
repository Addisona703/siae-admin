<template>
  <t-layout class="app-layout">
    <t-header class="app-header">
      <app-header />
    </t-header>
    
    <t-layout class="main-layout">
      <t-aside class="app-aside" width="240px">
        <app-sidebar />
      </t-aside>
      
      <t-layout class="content-layout">
        <t-content class="app-content">
          <router-view v-slot="{ Component, route }">
            <transition name="fade" mode="out-in">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="route.path" />
              </keep-alive>
            </transition>
          </router-view>
        </t-content>
      </t-layout>
    </t-layout>
  </t-layout>
</template>

<script setup>
import { computed } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const cachedViews = computed(() => {
  return []
})
</script>

<style scoped lang="less">
.app-layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-layout {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.content-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  border-bottom: 1px solid var(--td-component-border);
  background: var(--td-bg-color-container);
  padding: 0;
  height: 64px;
  box-shadow: none;
  z-index: 100;
  position: relative;
  transform: translateZ(0);
  will-change: background-color;
}

.app-aside {
  width: 240px;
  min-width: 240px;
  flex-shrink: 0;
  background: var(--td-bg-color-container);
  border-right: 1px solid var(--td-component-border);
  overflow-y: auto;
  overflow-x: hidden;
  
  // 隐藏滚动条
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.app-content {
  flex: 1;
  padding: 24px;
  background: var(--td-bg-color-page);
  overflow-y: auto;
  overflow-x: hidden;
  
  // 隐藏滚动条
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.app-footer {
  text-align: center;
  color: var(--text-color-secondary);
  font-size: 14px;
  padding: 16px;
  border-top: 1px solid var(--component-border);
  background: var(--bg-color-container);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .app-aside {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.is-open {
      transform: translateX(0);
    }
  }
  
  .app-content {
    padding: 16px;
  }
}
</style>
