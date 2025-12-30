import { createRouter, createWebHistory } from 'vue-router'
import {
  scrollBehavior,
  authGuard,
  permissionGuard,
  titleGuard,
  errorGuard
} from './guards'

// 路由配置（懒加载）
const routes = [
  // 公开路由
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      requiresAuth: false,
      hideInMenu: true,
    },
  },
  {
    path: '/oauth/bind',
    name: 'OAuthBind',
    component: () => import('@/views/auth/OAuthBindView.vue'),
    meta: {
      requiresAuth: false,
      hideInMenu: true,
    },
  },

  // 全屏内容创建页（无布局）
  {
    path: '/content/create',
    name: 'ContentCreate',
    component: () => import('@/views/content/ContentCreateView.vue'),
    meta: {
      requiresAuth: true,
      hideInMenu: true,
    },
  },

  // 全屏内容编辑页（无布局）
  {
    path: '/content/edit/:id',
    name: 'ContentEdit',
    component: () => import('@/views/content/ContentEditView.vue'),
    meta: {
      requiresAuth: true,
      hideInMenu: true,
      permission: 'content:edit',
    },
  },

  // 全屏内容详情页（无布局）
  {
    path: '/content/detail/:id',
    name: 'ContentDetail',
    component: () => import('@/views/content/ContentDetailView.vue'),
    meta: {
      requiresAuth: true,
      hideInMenu: true,
      permission: 'content:view',
    },
  },

  // 全屏通知中心（无布局）
  {
    path: '/notifications',
    name: 'NotificationCenter',
    component: () => import('@/views/notifications/NotificationCenterView.vue'),
    meta: {
      requiresAuth: true,
      hideInMenu: true,
    },
  },

  // 消息发布页（无布局）
  {
    path: '/message/publish',
    name: 'MessagePublish',
    component: () => import('@/views/notifications/MessagePublish.vue'),
    meta: {
      requiresAuth: true,
      hideInMenu: true,
      permission: 'notification:publish',
    },
  },

  // AI 聊天页（全屏无布局）
  {
    path: '/ai/chat',
    name: 'AIChat',
    component: () => import('@/views/ai/ChatView.vue'),
    meta: {
      requiresAuth: true,
      hideInMenu: true,
    },
  },

  // 需要认证的路由（带布局）
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: {
          icon: 'dashboard',
          // 仪表盘无需权限，所有已认证用户可访问
        },
      },

      // 权限管理
      {
        path: 'auth',
        name: 'AuthManagement',
        meta: {
          icon: 'lock-on',
          permission: 'auth:view',
        },
        children: [
          {
            path: 'role-permission',
            name: 'RolePermissionManagement',
            component: () => import('@/views/auth/PermissionView.vue'),
            meta: {
              icon: 'control-platform',
              permission: 'auth:permission:view',
            },
          },
          {
            path: 'user-roles',
            name: 'UserRoleManagement',
            component: () => import('@/views/auth/UserRoleView.vue'),
            meta: {
              icon: 'user-setting',
              permission: 'auth:user-role:view',
            },
          },
        ],
      },

      // 用户管理
      {
        path: 'users',
        name: 'UserManagement',
        meta: {
          icon: 'user',
          permission: 'user:view',
        },
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('@/views/users/UserListView.vue'),
            meta: {
              icon: 'user-list',
              permission: 'user:view',
            },
          },
          {
            path: 'blacklist',
            name: 'UserBlacklist',
            component: () => import('@/views/users/Blacklist.vue'),
            meta: {
              icon: 'user-list',
              permission: 'user:view',
            },
          },
          {
            path: 'member-audit',
            name: 'MemberAudit',
            component: () => import('@/views/users/UserAudit.vue'),
            meta: {
              icon: 'check-circle',
              permission: 'user:view',
            },
          },
          {
            path: 'members',
            name: 'MemberList',
            component: () => import('@/views/users/MemberListView.vue'),
            meta: {
              icon: 'member',
              permission: 'user:member:view',
            },
          },
          {
            path: 'classes',
            name: 'ClassManagement',
            component: () => import('@/views/users/ClassView.vue'),
            meta: {
              icon: 'books',
              permission: 'user:class:view',
            },
          },
          {
            path: 'awards',
            name: 'UserAwards',
            component: () => import('@/views/users/AwardView.vue'),
            meta: {
              icon: 'medal',
              permission: 'user:award:view',
            },
          },
          {
            path: 'statistics',
            name: 'MemberStatistics',
            component: () => import('@/views/users/MemberStatisticsView.vue'),
            meta: {
              icon: 'chart-pie',
              permission: 'user:statistics:view',
            },
          },
        ],
      },

      // 奖项管理
      {
        path: 'awards',
        name: 'AwardManagement',
        meta: {
          icon: 'star',
          permission: 'award:view',
        },
        children: [
          {
            path: 'list',
            name: 'AwardList',
            component: () => import('@/views/awards/AwardListView.vue'),
            meta: {
              icon: 'format-horizontal-align-top',
              permission: 'award:view',
            },
          },
          {
            path: 'create',
            name: 'AwardCreate',
            component: () => import('@/views/awards/AwardEditView.vue'),
            meta: {
              icon: 'add',
              permission: 'award:create',
              hideInMenu: true,
            },
          },
          {
            path: 'edit/:id',
            name: 'AwardEdit',
            component: () => import('@/views/awards/AwardEditView.vue'),
            meta: {
              icon: 'edit',
              permission: 'award:edit',
              hideInMenu: true,
            },
          },
          {
            path: 'config',
            name: 'AwardConfig',
            component: () => import('@/views/awards/AwardConfigView.vue'),
            meta: {
              icon: 'setting',
              permission: 'award:config',
            },
          },
          {
            path: 'statistics',
            name: 'AwardStatistics',
            component: () => import('@/views/awards/AwardStatisticsView.vue'),
            meta: {
              icon: 'chart',
              permission: 'award:statistics:view',
            },
          },
        ],
      },

      // 内容管理
      {
        path: 'content',
        name: 'ContentManagement',
        meta: {
          icon: 'file',
          permission: 'content:view',
        },
        children: [
          {
            path: 'list',
            name: 'ContentList',
            component: () => import('@/views/content/ContentListView.vue'),
            meta: {
              icon: 'view-list',
              permission: 'content:view',
            },
          },

          {
            path: 'categories',
            name: 'CategoryManagement',
            component: () => import('@/views/content/CategoryView.vue'),
            meta: {
              icon: 'folder',
              permission: 'content:category:view',
            },
          },
          {
            path: 'tags',
            name: 'TagManagement',
            component: () => import('@/views/content/TagView.vue'),
            meta: {
              icon: 'tag',
              permission: 'content:tag:view',
            },
          },
          {
            path: 'category-tag',
            name: 'CategoryTagManagement',
            component: () => import('@/views/content/CategoryTagManagementView.vue'),
            meta: {
              icon: 'layers',
              permission: 'content:category-tag:view',
            },
          },
          {
            path: 'audit',
            name: 'ContentAudit',
            component: () => import('@/views/content/ContentAuditView.vue'),
            meta: {
              icon: 'check-circle',
              permission: 'content:audit:view',
            },
          },
          {
            path: 'statistics',
            name: 'ContentStatistics',
            component: () => import('@/views/content/StatisticsView.vue'),
            meta: {
              icon: 'chart-bar',
              permission: 'content:statistics:view',
            },
          },
          {
            path: 'trash',
            name: 'ContentTrash',
            component: () => import('@/views/content/ContentTrashView.vue'),
            meta: {
              icon: 'delete',
              permission: 'content:view',
            },
          },
        ],
      },

      // 日志管理
      {
        path: 'logs',
        name: 'LogManagement',
        meta: {
          icon: 'file-paste',
          permission: 'log:view',
        },
        children: [
          {
            path: 'login',
            name: 'LoginLogs',
            component: () => import('@/views/logs/LoginLogView.vue'),
            meta: {
              icon: 'login',
              permission: 'log:login:view',
            },
          },
        ],
      },

      // 考勤管理
      {
        path: 'attendance',
        name: 'AttendanceManagement',
        meta: {
          icon: 'calendar',
          permission: 'attendance:view',
        },
        children: [
          // {
          //   path: 'rules',
          //   name: 'AttendanceRules',
          //   component: () => import('@/views/attendance/RuleManageView.vue'),
          //   meta: {
          //     icon: 'setting',
          //     permission: 'attendance:rule:view',
          //   },
          // },
          {
            path: 'records',
            name: 'AttendanceRecords',
            component: () => import('@/views/attendance/RecordQueryView.vue'),
            meta: {
              icon: 'view-list',
              permission: 'attendance:record:view',
            },
          },
          // {
          //   path: 'statistics',
          //   name: 'AttendanceStatistics',
          //   component: () => import('@/views/attendance/StatisticsView.vue'),
          //   meta: {
          //     icon: 'chart-bar',
          //     permission: 'attendance:statistics:view',
          //   },
          // },
          // {
          //   path: 'anomalies',
          //   name: 'AttendanceAnomalies',
          //   component: () => import('@/views/attendance/AnomalyHandleView.vue'),
          //   meta: {
          //     icon: 'error-circle',
          //     permission: 'attendance:anomaly:view',
          //   },
          // },
          {
            path: 'leave-approval',
            name: 'LeaveApproval',
            component: () => import('@/views/attendance/LeaveApprovalView.vue'),
            meta: {
              icon: 'check-circle',
              permission: 'attendance:leave:approve',
            },
          },
        ],
      },
    ],
  },

  // 404 兜底路由
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: {
      hideInMenu: true,
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior,
})

// 注册路由守卫
router.beforeEach(authGuard)
router.beforeEach(permissionGuard)
router.afterEach(titleGuard)
router.onError(errorGuard)

export default router
