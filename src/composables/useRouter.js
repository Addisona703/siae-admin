import { computed } from 'vue'
import { useRoute, useRouter as useVueRouter } from 'vue-router'
import { getBreadcrumbItems, routesToMenuItems } from '@/router/utils'
import { usePermissionStore } from '@/stores'

/**
 * Enhanced router composable with additional utilities
 */
export function useRouter() {
  const router = useVueRouter()
  const route = useRoute()
  const permissionStore = usePermissionStore()

  // Get current route breadcrumbs
  const breadcrumbs = computed(() => {
    return getBreadcrumbItems(route)
  })

  // Get menu items from routes (filtered by permissions)
  const menuItems = computed(() => {
    const protectedRoutes = router.getRoutes().filter(r => 
      r.path.startsWith('/') && 
      !r.meta?.hideInMenu &&
      r.name !== 'Login' &&
      r.name !== 'NotFound'
    )
    return routesToMenuItems(protectedRoutes)
  })

  // Navigation helpers
  const navigateTo = (name, params, query) => {
    return router.push({ name, params, query })
  }

  const navigateToPath = (path, query) => {
    return router.push({ path, query })
  }

  const goBack = () => {
    return router.back()
  }

  const goForward = () => {
    return router.forward()
  }

  const replace = (location) => {
    return router.replace(location)
  }

  // Check if current route matches
  const isCurrentRoute = (name) => {
    return route.name === name
  }

  const isCurrentPath = (path) => {
    return route.path === path
  }

  // Get route title
  const currentTitle = computed(() => {
    return route.meta?.title || ''
  })

  // Check if route requires permission
  const hasRoutePermission = (routeName) => {
    const targetRoute = router.getRoutes().find(r => r.name === routeName)
    if (!targetRoute) return false
    
    const permission = targetRoute.meta?.permission
    if (!permission) return true
    
    return permissionStore.hasPermission(permission)
  }

  return {
    // Vue Router instances
    router,
    route,
    
    // Computed properties
    breadcrumbs,
    menuItems,
    currentTitle,
    
    // Navigation methods
    navigateTo,
    navigateToPath,
    goBack,
    goForward,
    replace,
    
    // Route checking methods
    isCurrentRoute,
    isCurrentPath,
    hasRoutePermission
  }
}
