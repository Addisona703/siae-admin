<template>
  <t-head-menu :theme="menuTheme" height="64px" @change="handleMenuChange" class="header-menu">
    <template #logo>
      <div class="logo-section">
        <img src="/public/favicon.ico" alt="" class="logo-icon">
        <span class="logo-text">SIAE 管理系统</span>
      </div>
    </template>

    <div class="header-breadcrumb">
      <t-breadcrumb :max-item-width="'150px'">
        <t-breadcrumbItem v-for="item in breadcrumbs" :key="item.path" :to="item.path">
          {{ item.title }}
        </t-breadcrumbItem>
      </t-breadcrumb>
    </div>

    <div class="header-time">
      <!-- <t-icon name="time" /> -->
      <span>{{ currentTime }}</span>
    </div>

    <template #operations>
      <t-button style="margin-right: 15px;" variant="text" shape="circle" @click="handleToggleTheme($event)">
        <template #icon>
          <t-icon :name="isDarkTheme ? 'sunny' : 'moon'" />
        </template>
      </t-button>

      <t-badge :count="notificationCount" :max-count="99">
        <t-button style="margin-right: 15px;" variant="text" shape="square" @click="handleNotifications">
          <t-icon name="notification" />
        </t-button>
      </t-badge>

      <t-dropdown :min-column-width="160">
        <t-button style="margin-right: 30px;" variant="text" shape="square">
          <t-avatar size="small">
            {{ userInfo?.username?.charAt(0).toUpperCase() || 'A' }}
          </t-avatar>
        </t-button>



        <template #dropdown>
          <t-dropdown-menu>
            <t-dropdown-item @click="handleProfile">
              <t-icon name="user" />
              个人信息
            </t-dropdown-item>
            <t-dropdown-item @click="handleSettings">
              <t-icon name="setting" />
              设置
            </t-dropdown-item>
            <t-dropdown-item divider />
            <t-dropdown-item @click="handleLogout">
              <t-icon name="logout" />
              退出登录
            </t-dropdown-item>
          </t-dropdown-menu>
        </template>
      </t-dropdown>
    </template>
  </t-head-menu>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { notificationApi } from '@/api/notification'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

const userInfo = computed(() => authStore.currentUser)
const isDarkTheme = computed(() => appStore.isDarkTheme)
const menuTheme = computed(() => appStore.isDarkTheme ? 'dark' : 'light')
const notificationCount = ref(0)
const currentTime = ref('')

// 更新时间
const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekDay = weekDays[now.getDay()]

  currentTime.value = `${year}-${month}-${day} ${weekDay} ${hours}:${minutes}:${seconds}`
}

// 加载未读通知数量
const loadUnreadCount = async () => {
  try {
    const response = await notificationApi.getUnreadCount()
    if (response.code === 200 && response.data !== undefined) {
      notificationCount.value = response.data
    }
  } catch (error) {
    console.error('Failed to load unread count:', error)
  }
}

// 定时刷新未读数量
let refreshTimer = null
let timeTimer = null

onMounted(() => {
  // loadUnreadCount()
  // 每30秒刷新一次未读数量
  // refreshTimer = window.setInterval(loadUnreadCount, 30000)

  // 初始化时间并每秒更新
  updateTime()
  timeTimer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  if (timeTimer) {
    clearInterval(timeTimer)
  }
})

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  const breadcrumbList = matched.map(item => ({
    title: item.meta.title,
    path: item.path
  }))

  // 如果第一个不是仪表盘，添加仪表盘作为首页
  if (breadcrumbList.length > 0 && breadcrumbList[0]?.title !== '数据总览') {
    breadcrumbList.unshift({
      title: '数据总览',
      path: '/dashboard'
    })
  }

  return breadcrumbList
})

const handleMenuChange = () => {
  // Header menu logic removed as it is replaced by breadcrumbs
}

const handleToggleTheme = (event) => {
  appStore.toggleTheme(event)
}

const handleNotifications = () => {
  router.push('/notifications')
}

const handleProfile = () => {
  MessagePlugin.info('个人信息功能开发中')
}

const handleSettings = () => {
  MessagePlugin.info('设置功能开发中')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    MessagePlugin.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    MessagePlugin.error('退出登录失败')
    console.error('Logout error:', error)
  }
}
</script>

<style scoped lang="less">
.header-menu {
  width: 100%;
  height: 100%;

  // 暗黑模式样式
  &.t-head-menu--dark {
    background: rgba(26, 31, 58, 0.95) !important;
    border-bottom: 1px solid rgba(96, 165, 250, 0.2) !important;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  }

  // 明亮模式样式
  &.t-head-menu--light {
    background: #ffffff !important;
    border-bottom: 1px solid #e5e7eb !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  }
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
  // padding: 0 10px;
  height: 100%;
  width: fit-content;
  // background-color: pink;
  // background: transparent !important;

  .logo-icon {
    width: 35px;
    font-size: 26px;
  }

  .logo-text {
    font-size: 23px;
    font-weight: 600;
    letter-spacing: 0;
    white-space: nowrap;
  }
}

// 暗黑模式下的 logo 样式
.header-menu.t-head-menu--dark {
  .logo-section {
    color: #60a5fa;

    .logo-icon {
      color: #60a5fa;
      filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.5));
    }

    .logo-text {
      color: #e0e6ed !important;
      text-shadow: 0 0 10px rgba(96, 165, 250, 0.3);
    }
  }
}

// 明亮模式下的 logo 样式
.header-menu.t-head-menu--light {
  .logo-section {
    color: #2563eb;

    .logo-icon {
      color: #2563eb;
      filter: none;
    }

    .logo-text {
      color: #1f2937 !important;
      text-shadow: none;
    }
  }
}

:deep(.t-head-menu__inner) {
  height: 100%;
  display: flex;
  align-items: center;
  background: transparent !important;
}

.header-breadcrumb {
  margin-left: 24px;
  display: flex;
  align-items: center;
}

// 暗黑模式下的面包屑
.header-menu.t-head-menu--dark {
  .header-breadcrumb {
    :deep(.t-breadcrumb__item) {
      color: #8b92a7 !important;

      &:hover {
        color: #60a5fa !important;
      }
    }

    :deep(.t-breadcrumb__separator) {
      color: #6b7280 !important;
    }
  }
}

// 明亮模式下的面包屑
.header-menu.t-head-menu--light {
  .header-breadcrumb {
    :deep(.t-breadcrumb__item) {
      color: #6b7280 !important;

      &:hover {
        color: #2563eb !important;
      }
    }

    :deep(.t-breadcrumb__separator) {
      color: #9ca3af !important;
    }
  }
}

:deep(.t-head-menu__logo) {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 !important;
  margin-left: 0 !important;
  background: transparent !important;
}

:deep(.t-menu__item) {
  border-radius: 6px;
  margin: 0 4px;
  height: 40px;
  line-height: 40px;
  transition: background-color 0.2s ease-out, color 0.2s ease-out;
  font-weight: 500;
  will-change: background-color, color;
}

// 暗黑模式下的菜单项
.header-menu.t-head-menu--dark {
  :deep(.t-menu__item) {
    color: #8b92a7 !important;

    &:hover {
      background: rgba(96, 165, 250, 0.1) !important;
      color: #60a5fa !important;
    }

    &.t-is-active {
      background: rgba(96, 165, 250, 0.2) !important;
      color: #60a5fa !important;
      font-weight: 600;

      .t-icon {
        color: #60a5fa;
      }
    }
  }
}

// 明亮模式下的菜单项
.header-menu.t-head-menu--light {
  :deep(.t-menu__item) {
    color: #6b7280 !important;

    &:hover {
      background: rgba(37, 99, 235, 0.1) !important;
      color: #2563eb !important;
    }

    &.t-is-active {
      background: rgba(37, 99, 235, 0.15) !important;
      color: #2563eb !important;
      font-weight: 600;

      .t-icon {
        color: #2563eb;
      }
    }
  }
}

:deep(.t-head-menu) {
  background: transparent !important;
}

// 暗黑模式下的 head-menu
.header-menu.t-head-menu--dark {
  :deep(.t-head-menu) {
    border-bottom: 1px solid rgba(96, 165, 250, 0.2) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  }
}

// 明亮模式下的 head-menu
.header-menu.t-head-menu--light {
  :deep(.t-head-menu) {
    border-bottom: 1px solid #e5e7eb !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  }
}

:deep(.t-head-menu__operations) {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 12px;
}

// 暗黑模式下的操作按钮
.header-menu.t-head-menu--dark {
  :deep(.t-head-menu__operations) {
    .t-button {
      color: #e0e6ed !important;

      &:hover {
        background: rgba(96, 165, 250, 0.1) !important;
        color: #60a5fa !important;
      }
    }

    .t-icon {
      color: #e0e6ed !important;
    }

    .t-avatar {
      background: rgba(96, 165, 250, 0.3) !important;
      color: #e0e6ed !important;
    }
  }
}

// 明亮模式下的操作按钮
.header-menu.t-head-menu--light {
  :deep(.t-head-menu__operations) {
    .t-button {
      color: #4b5563 !important;

      &:hover {
        background: rgba(37, 99, 235, 0.1) !important;
        color: #2563eb !important;
      }
    }

    .t-icon {
      color: #4b5563 !important;
    }

    .t-avatar {
      background: rgba(37, 99, 235, 0.2) !important;
      color: #1f2937 !important;
    }
  }
}

.header-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  margin: auto;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;

  .t-icon {
    font-size: 16px;
  }

  span {
    letter-spacing: 0.5px;
  }
}

// 暗黑模式下的时间样式
.header-menu.t-head-menu--dark {
  .header-time {
    color: #e0e6ed;
    background: rgba(26, 31, 58, 0.6);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(96, 165, 250, 0.1);
    border: 1px solid rgba(96, 165, 250, 0.2);

    .t-icon {
      color: #60a5fa;
      filter: drop-shadow(0 0 4px rgba(96, 165, 250, 0.5));
    }

    span {
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    &:hover {
      background: rgba(26, 31, 58, 0.8);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(96, 165, 250, 0.2);
      border-color: rgba(96, 165, 250, 0.3);
    }
  }
}

// 明亮模式下的时间样式
.header-menu.t-head-menu--light {
  .header-time {
    color: #4b5563;
    background: rgba(249, 250, 251, 0.8);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(229, 231, 235, 0.8);

    .t-icon {
      color: #2563eb;
    }

    span {
      text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
    }

    &:hover {
      background: rgba(243, 244, 246, 1);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.7);
      border-color: rgba(209, 213, 219, 1);
    }
  }
}

@media (max-width: 768px) {
  .logo-text {
    display: none;
  }

  .header-time {
    font-size: 12px;
    padding: 0 8px;

    span {
      display: none;
    }
  }
}
</style>
