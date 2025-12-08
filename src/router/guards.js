import { useAuthStore, usePermissionStore } from '@/stores'
import { MessagePlugin } from 'tdesign-vue-next'
import { waitForInit } from '@/main'

/**
 * 认证守卫 - 检查用户是否已登录
 */
export async function authGuard(to, from, next) {
  // 等待应用初始化完成
  await waitForInit()
  
  const authStore = useAuthStore()

  // 已登录用户访问登录页时，重定向到首页
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ path: '/' })
    return
  }

  // 检查路由是否需要认证
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth !== false)

  if (requiresAuth && !authStore.isAuthenticated) {
    // 非登录页跳转时显示提示
    if (from.name !== 'Login') {
      MessagePlugin.warning('请先登录')
    }

    // 重定向到登录页，并携带返回地址
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
    return
  }

  next()
}

/**
 * 权限守卫 - 检查用户是否有访问权限（支持权限和角色）
 */
export async function permissionGuard(to, from, next) {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  // 非认证路由跳过权限检查
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth !== false)
  if (!requiresAuth || !authStore.isAuthenticated) {
    next()
    return
  }

  // 如果权限数据还没加载，先等待初始化
  if (!permissionStore.hasAnyPermission && authStore.currentUser?.permissions?.length > 0) {
    permissionStore.initializePermissions()
  }

  // ROLE_ROOT 超级管理员直接放行
  if (permissionStore.hasRole('ROLE_ROOT')) {
    next()
    return
  }

  // 检查路由所需权限
  const permission = to.meta?.permission
  const roles = to.meta?.roles // 支持角色数组

  // 如果路由没有配置权限要求，直接放行
  if (!permission && (!roles || roles.length === 0)) {
    next()
    return
  }

  // 权限检查
  if (permission && !permissionStore.hasPermission(permission)) {
    // 如果有角色配置，检查角色（角色和权限满足其一即可）
    if (roles && roles.length > 0 && permissionStore.hasAnyOfRoles(roles)) {
      next()
      return
    }

    MessagePlugin.error('您没有访问此页面的权限')
    const fallbackRoute = from.name ? from : { path: '/' }
    next(fallbackRoute)
    return
  }

  // 仅角色检查（没有配置权限时）
  if (!permission && roles && roles.length > 0 && !permissionStore.hasAnyOfRoles(roles)) {
    MessagePlugin.error('您没有访问此页面的权限')
    const fallbackRoute = from.name ? from : { path: '/' }
    next(fallbackRoute)
    return
  }

  next()
}

/**
 * 加载守卫 - 处理加载状态
 */
export async function loadingGuard(to, from, next) {
  // 可在此添加全局加载指示器逻辑
  next()
}

/**
 * 标题守卫 - 更新页面标题
 */
export function titleGuard(to) {
  const title = to.meta?.title
  if (title) {
    document.title = `${title} - SIAE 管理后台`
  } else {
    document.title = 'SIAE 管理后台'
  }
}

/**
 * 错误守卫 - 处理导航错误
 */
export function errorGuard(error, to, from) {
  console.error('导航错误:', error)
  MessagePlugin.error('页面导航失败，请重试')
}

/**
 * 滚动行为配置
 */
export function scrollBehavior(to, from, savedPosition) {
  // 浏览器前进/后退时，恢复保存的位置
  if (savedPosition) {
    return savedPosition
  }

  // 导航到锚点时，平滑滚动到目标
  if (to.hash) {
    return {
      el: to.hash,
      behavior: 'smooth',
    }
  }

  // 默认滚动到顶部
  return { top: 0 }
}

/**
 * 分析守卫 - 追踪页面访问（生产环境）
 */
export function analyticsGuard(to, from) {
  if (import.meta.env.PROD) {
    // 可在此添加页面访问统计逻辑
  }
}
