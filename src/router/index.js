import { createRouter, createWebHistory } from 'vue-router'
import { scrollBehavior } from './guards'

// Define routes with lazy loading
const routes = [
  // Public routes
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      requiresAuth: false,
      hideInMenu: true,
    },
  },

  // Full-screen content creation (no layout)
  {
    path: '/content/create',
    name: 'ContentCreate',
    component: () => import('@/views/content/ContentCreateView.vue'),
    meta: {
      requiresAuth: true,
      hideInMenu: true,
    },
  },

  // Full-screen notification center (no layout)
  {
    path: '/notifications',
    name: 'NotificationCenter',
    component: () => import('@/views/notifications/NotificationCenterView.vue'),
    meta: {
      requiresAuth: true,
      hideInMenu: true,
    },
  },

  // Message publish page (no layout)
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

  // Protected routes with layout
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
          // No permission required for dashboard - accessible to all authenticated users
        },
      },

      // Authentication Management
      {
        path: 'auth',
        name: 'AuthManagement',
        meta: {
          icon: 'lock-on',
          permission: 'auth:view',
        },
        children: [
          {
            path: 'permissions',
            name: 'PermissionManagement',
            component: () => import('@/views/auth/PermissionView.vue'),
            meta: {
              icon: 'control-platform',
              permission: 'auth:permission:view',
            },
          },
          {
            path: 'roles',
            name: 'RoleManagement',
            component: () => import('@/views/auth/RoleView.vue'),
            meta: {
              icon: 'usergroup',
              permission: 'auth:role:view',
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

      // User Management
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
            path: 'audit',
            name: 'UserAudit',
            component: () => import('@/views/users/UserAudit.vue'),
            meta: {
              icon: 'user-audit',
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

      // Award Management
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

      // Content Management
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
            path: 'edit/:id',
            name: 'ContentEdit',
            component: () => import('@/views/content/ContentEditView.vue'),
            meta: {
              icon: 'edit',
              permission: 'content:edit',
              hideInMenu: true,
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
        ],
      },

      // Logging and Monitoring
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
          {
            path: 'audit',
            name: 'AuditLogs',
            component: () => import('@/views/logs/AuditLogView.vue'),
            meta: {
              icon: 'file-search',
              permission: 'log:audit:view',
            },
          },
        ],
      },
    ],
  },

  // Catch-all route for 404
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

// setupRouterGuards(router)

export default router
