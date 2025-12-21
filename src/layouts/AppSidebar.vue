<template>
  <t-menu :value="activeMenu" :theme="menuTheme" :collapsed="collapsed" @change="handleMenuChange" class="sidebar-menu">

    <t-menu-item value="dashboard">
      <template #icon>
        <t-icon name="dashboard" />
      </template>
      数据总览
    </t-menu-item>

    <t-submenu value="users" title="用户管理">
      <template #icon>
        <t-icon name="user" />
      </template>
      <t-menu-item value="user-list">
        <template #icon>
          <t-icon name="user-list" />
        </template>
        用户列表
      </t-menu-item>
      <t-menu-item value="member-list">
        <template #icon>
          <t-icon name="usergroup" />
        </template>
        成员列表
      </t-menu-item>
      <t-menu-item value="member-statistics">
        <template #icon>
          <t-icon name="chart-bar" />
        </template>
        成员统计
      </t-menu-item>

      <t-menu-item value="member-audit">
        <template #icon>
          <t-icon name="check-circle" />
        </template>
        成员审核
      </t-menu-item>

      <t-menu-item value="user-blacklist">
        <template #icon>
          <t-icon name="chart-bar" />
        </template>
        黑名单
      </t-menu-item>
    </t-submenu>

    <t-submenu value="content" title="内容管理">
      <template #icon>
        <t-icon name="edit" />
      </template>
      <t-menu-item value="content-list">
        <template #icon>
          <t-icon name="view-list" />
        </template>
        内容列表
      </t-menu-item>
      <t-menu-item value="content-audit">
        <template #icon>
          <t-icon name="check-circle" />
        </template>
        内容审核
      </t-menu-item>
      <t-menu-item value="category-tag">
        <template #icon>
          <t-icon name="layers" />
        </template>
        分类标签管理
      </t-menu-item>
      <t-menu-item value="content-statistics">
        <template #icon>
          <t-icon name="chart-bar" />
        </template>
        数据统计
      </t-menu-item>
    </t-submenu>

    <t-submenu value="awards" title="奖项管理">
      <template #icon>
        <t-icon name="star" />
      </template>
      <t-menu-item value="award-list">
        <template #icon>
          <t-icon name="view-list" />
        </template>
        奖项列表
      </t-menu-item>
      <t-menu-item value="award-config">
        <template #icon>
          <t-icon name="setting" />
        </template>
        奖项配置
      </t-menu-item>
      <t-menu-item value="award-statistics">
        <template #icon>
          <t-icon name="chart-bar" />
        </template>
        奖项统计
      </t-menu-item>
    </t-submenu>

    <t-submenu value="auth" title="权限管理">
      <template #icon>
        <t-icon name="user-setting" />
      </template>
      <t-menu-item value="role-permission">
        <template #icon>
          <t-icon name="lock" />
        </template>
        角色权限
      </t-menu-item>
      <t-menu-item value="user-roles">
        <template #icon>
          <t-icon name="user-circle" />
        </template>
        用户角色
      </t-menu-item>
    </t-submenu>

    <t-submenu value="logs" title="日志管理">
      <template #icon>
        <t-icon name="file" />
      </template>
      <t-menu-item value="login-logs">
        <template #icon>
          <t-icon name="login" />
        </template>
        登录日志
      </t-menu-item>
    </t-submenu>

    <t-submenu value="attendance" title="考勤管理">
      <template #icon>
        <t-icon name="calendar" />
      </template>
      <t-menu-item value="attendance-rules">
        <template #icon>
          <t-icon name="setting" />
        </template>
        考勤规则
      </t-menu-item>
      <t-menu-item value="attendance-records">
        <template #icon>
          <t-icon name="view-list" />
        </template>
        考勤记录
      </t-menu-item>
      <t-menu-item value="attendance-statistics">
        <template #icon>
          <t-icon name="chart-bar" />
        </template>
        考勤统计
      </t-menu-item>
      <t-menu-item value="attendance-anomalies">
        <template #icon>
          <t-icon name="error-circle" />
        </template>
        异常处理
      </t-menu-item>
      <t-menu-item value="leave-approval">
        <template #icon>
          <t-icon name="check-circle" />
        </template>
        请假审批
      </t-menu-item>
    </t-submenu>

    <t-menu-item value="resource">
      <template #icon>
        <t-icon name="layers" />
      </template>
      SIAE 物资管理
    </t-menu-item>
  </t-menu>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from '@/stores'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const collapsed = ref(false)

const menuTheme = computed(() => appStore.isDarkTheme ? 'dark' : 'light')

const activeMenu = computed(() => {
  const name = route.name

  // 映射路由名称到菜单值
  const menuMap = {
    'Dashboard': 'dashboard',
    'UserList': 'user-list',
    'MemberList': 'member-list',
    'MemberStatistics': 'member-statistics',
    'ContentList': 'content-list',
    'ContentAudit': 'content-audit',
    'CategoryTagManagement': 'category-tag',
    'ContentStatistics': 'content-statistics',
    'AwardList': 'award-list',
    'AwardConfig': 'award-config',
    'AwardStatistics': 'award-statistics',
    'RolePermissionManagement': 'role-permission',
    'UserRoleManagement': 'user-roles',
    'LoginLogs': 'login-logs',
    'MemberAudit': 'member-audit',
    'UserBlacklist': 'user-blacklist',
    'AttendanceRules': 'attendance-rules',
    'AttendanceRecords': 'attendance-records',
    'AttendanceStatistics': 'attendance-statistics',
    'AttendanceAnomalies': 'attendance-anomalies',
    'LeaveApproval': 'leave-approval'
  }

  return menuMap[name] || 'dashboard'
})

const handleMenuChange = (value) => {
  // 特殊处理：物资管理跳转到外部链接
  if (value === 'resource') {
    const token = localStorage.getItem('access_token')
    const url = token 
      ? `http://localhost:5174/home?token=${encodeURIComponent(token)}`
      : 'http://localhost:5174/home'
    window.open(url, '_blank')
    return
  }

  const routeMap = {
    'dashboard': '/dashboard',
    'user-list': '/users/list',
    'member-list': '/users/members',
    'member-statistics': '/users/statistics',
    'content-list': '/content/list',
    'content-audit': '/content/audit',
    'category-tag': '/content/category-tag',
    'content-statistics': '/content/statistics',
    'award-list': '/awards/list',
    'award-config': '/awards/config',
    'award-statistics': '/awards/statistics',
    'role-permission': '/auth/role-permission',
    'user-roles': '/auth/user-roles',
    'login-logs': '/logs/login',
    'member-audit': '/users/member-audit',
    'user-blacklist': '/users/blacklist',
    'attendance-rules': '/attendance/rules',
    'attendance-records': '/attendance/records',
    'attendance-statistics': '/attendance/statistics',
    'attendance-anomalies': '/attendance/anomalies',
    'leave-approval': '/attendance/leave-approval'
  }

  const path = routeMap[value]
  if (path) {
    router.push(path)
  }
}
</script>

<style scoped lang="less">
.sidebar-menu {

  // 暗黑模式样式
  &.t-menu--dark {
    background: linear-gradient(180deg, #1a1f3a 0%, #0f1729 100%) !important;

    :deep(.t-menu) {
      border-top: 1px solid rgba(96, 165, 250, 0.2);
    }
  }

  // 明亮模式样式
  &.t-menu--light {
    background: #ffffff !important;

    :deep(.t-menu) {
      border-top: 1px solid #e5e7eb;
    }

    // 明亮模式下的菜单项颜色
    :deep(.t-menu__item),
    :deep(.t-submenu__title) {
      color: #4b5563 !important;

      &:hover {
        color: #2563eb !important;
        background-color: rgba(37, 99, 235, 0.1) !important;
      }
    }

    :deep(.t-menu__item.t-is-active) {
      background: rgba(37, 99, 235, 0.1) !important;
      color: #2563eb !important;

      &::before {
        background-color: #2563eb;
      }

      .t-icon {
        color: #2563eb;
      }
    }

    :deep(.t-submenu.t-is-opened) {
      >.t-submenu__title {
        background: rgba(37, 99, 235, 0.1) !important;
        color: #2563eb !important;
        border-left: 3px solid #2563eb !important;

        .t-icon {
          color: #2563eb !important;
          filter: none;
        }
      }

      .t-menu__sub {
        background: rgba(249, 250, 251, 0.8) !important;
        border-left: 2px solid rgba(37, 99, 235, 0.3) !important;
      }
    }

    :deep(.t-submenu) {
      .t-menu__item {
        color: #6b7280 !important;

        &::before {
          background: rgba(37, 99, 235, 0.4);
        }

        &:hover {
          color: #2563eb !important;

          &::before {
            background: #2563eb;
          }
        }

        &.t-is-active {
          background: rgba(37, 99, 235, 0.15) !important;
          color: #2563eb !important;
          border-left: 3px solid #2563eb !important;

          &::before {
            background: #2563eb;
          }

          .t-icon {
            color: #2563eb !important;
          }
        }
      }
    }
  }
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #60a5fa;
  filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.5));
}

:deep(.t-menu) {
  height: 100%;
  background: transparent !important;
  border-right: none;
  padding: 12px 12px;
}

:deep(.t-default-menu__inner) {
  padding: 0;
}

:deep(.t-menu__item),
:deep(.t-submenu__title) {
  color: #8b92a7 !important;
  transition: background-color 0.2s ease-out, color 0.2s ease-out;
  margin: 2px 0 !important;
  padding: 0 12px !important;
  border-radius: 8px;
  font-size: 15px;
  height: 44px !important;
  min-height: 44px !important;
  max-height: 44px !important;
  line-height: 44px !important;
  will-change: background-color, color;
  display: flex !important;
  align-items: center !important;
  gap: 12px;
  box-sizing: border-box !important;
  justify-content: flex-start !important;

  &:hover {
    color: #60a5fa !important;
    background-color: rgba(96, 165, 250, 0.1) !important;
  }

  >.t-icon {
    color: inherit;
    font-size: 18px;
    width: 18px;
    height: 18px;
    margin: 0 !important;
    padding: 0 !important;
    flex-shrink: 0;
    line-height: 1 !important;
  }

  >.t-menu__content {
    display: flex;
    align-items: center;
    line-height: 1 !important;
    margin: 0 !important;
    padding: 0 !important;
    flex: 0 0 auto;
  }
}

// 选中状态
:deep(.t-menu__item.t-is-active) {
  background: rgba(96, 165, 250, 0.2) !important;
  color: #60a5fa !important;
  font-weight: 600;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.3);
  position: relative;

  // 左侧指示条 - 不占用布局空间
  &::before {
    content: '';
    position: absolute;
    left: -12px;
    top: 50%;
    transform: translateY(-50%);
    height: 24px;
    width: 3px;
    background-color: #14b8a6;
    border-radius: 0 4px 4px 0;
  }

  .t-icon {
    color: #14b8a6;
  }

  &.t-menu__item--plain {
    background: rgba(20, 184, 166, 0.15) !important;
    color: #14b8a6 !important;
  }
}

// 父级菜单（submenu）样式
:deep(.t-submenu__title) {
  background: rgba(26, 31, 58, 0.5) !important;
  border-left: 3px solid transparent !important;
  font-weight: 600 !important;
  font-size: 15px !important;

  &:hover {
    background: rgba(96, 165, 250, 0.15) !important;
    border-left-color: rgba(96, 165, 250, 0.5) !important;
  }

  .t-icon {
    font-size: 20px !important;
  }
}

// 展开的父级菜单
:deep(.t-submenu.t-is-opened) {
  >.t-submenu__title {
    background: rgba(96, 165, 250, 0.2) !important;
    color: #60a5fa !important;
    font-weight: 700 !important;
    border-left: 3px solid #60a5fa !important;
    box-shadow: 0 2px 8px rgba(96, 165, 250, 0.2);

    .t-icon {
      color: #60a5fa !important;
      filter: drop-shadow(0 0 4px rgba(96, 165, 250, 0.5));
    }
  }

  // 展开后的子菜单容器
  .t-menu__sub {
    background: rgba(15, 23, 41, 0.6) !important;
    margin: 4px 0 !important;
    padding: 4px 0 !important;
    border-left: 2px solid rgba(96, 165, 250, 0.3) !important;
    margin-left: 12px !important;
  }
}

// 子菜单项样式
:deep(.t-submenu) {
  .t-menu__item {
    background-color: transparent !important;
    padding-left: 48px !important;
    min-height: 40px !important;
    height: 40px !important;
    font-size: 14px !important;
    color: #a0aec0 !important;
    position: relative;

    // 子菜单项前的小圆点
    &::before {
      content: '';
      position: absolute;
      left: 32px;
      top: 50%;
      transform: translateY(-50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(96, 165, 250, 0.4);
      transition: all 0.3s;
    }

    &:hover {
      background: rgba(96, 165, 250, 0.1) !important;
      color: #60a5fa !important;
      padding-left: 52px !important;

      &::before {
        background: #60a5fa;
        width: 8px;
        height: 8px;
        box-shadow: 0 0 8px rgba(96, 165, 250, 0.6);
      }
    }

    &.t-is-active {
      background: rgba(96, 165, 250, 0.25) !important;
      color: #60a5fa !important;
      font-weight: 600 !important;
      padding-left: 52px !important;
      border-left: 3px solid #60a5fa !important;

      &::before {
        background: #60a5fa;
        width: 10px;
        height: 10px;
        box-shadow: 0 0 12px rgba(96, 165, 250, 0.8);
      }

      .t-icon {
        color: #60a5fa !important;
      }
    }
  }
}
</style>
