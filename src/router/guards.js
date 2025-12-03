import { useAuthStore, usePermissionStore } from '@/stores'
import { MessagePlugin } from 'tdesign-vue-next'

/**
 * Authentication guard - checks if user is authenticated
 */
export async function authGuard(to, from, next) {
  const authStore = useAuthStore()

  // If going to login page and already authenticated, redirect to dashboard
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ path: '/' })
    return
  }

  // Check if route requires authentication
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth !== false)

  if (requiresAuth && !authStore.isAuthenticated) {
    // Only show message if not coming from login page
    if (from.name !== 'Login') {
      MessagePlugin.warning('请先登录')
    }

    // Redirect to login with return URL
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
    return
  }

  next()
}

/**
 * Permission guard - checks if user has required permissions
 */
export async function permissionGuard(to, from, next) {
  const authStore = useAuthStore()
  const permissionStore = usePermissionStore()

  // Skip permission check for non-authenticated routes
  const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth !== false)
  if (!requiresAuth || !authStore.isAuthenticated) {
    next()
    return
  }

  // Check permissions for the route
  const permission = to.meta?.permission

  if (permission && !permissionStore.hasPermission(permission)) {
    // Show permission denied message
    MessagePlugin.error('您没有访问此页面的权限')

    // Redirect to dashboard or previous page
    const fallbackRoute = from.name ? from : { path: '/' }
    next(fallbackRoute)
    return
  }

  next()
}

/**
 * Route loading guard - handles loading states
 */
export async function loadingGuard(to, from, next) {
  // You can add loading logic here if needed
  // For example, show a global loading indicator

  next()
}

/**
 * Title guard - updates document title
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
 * Error handling guard - handles navigation errors
 */
export function errorGuard(error, to, from) {
  console.error('Navigation error:', error)

  // Show error message
  MessagePlugin.error('页面导航失败，请重试')

  // You can add more sophisticated error handling here
  // For example, redirect to error page or retry navigation
}

/**
 * Scroll behavior configuration
 */
export function scrollBehavior(to, from, savedPosition) {
  // If there's a saved position (browser back/forward), use it
  if (savedPosition) {
    return savedPosition
  }

  // If navigating to an anchor, scroll to it
  if (to.hash) {
    return {
      el: to.hash,
      behavior: 'smooth',
    }
  }

  // Otherwise, scroll to top
  return { top: 0 }
}

/**
 * Analytics guard - tracks page views
 */
export function analyticsGuard(to, from) {
  // You can add analytics tracking here
  // For example, track page views, user navigation patterns, etc.

  if (import.meta.env.PROD) {
    // Example: gtag('event', 'page_view', {
    //   page_path: to.path,
    //   page_title: to.meta?.title,
    //   from_path: from.path,
    // })
  }
}
