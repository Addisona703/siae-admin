import { usePermissionStore } from '@/stores'

/**
 * Convert routes to menu items for navigation
 * @param {Array} routes - Vue Router routes
 * @returns {Array} Menu items
 */
export function routesToMenuItems(routes) {
  const permissionStore = usePermissionStore()
  const menuItems = []

  for (const route of routes) {
    // Skip routes that should be hidden in menu
    if (route.meta?.hideInMenu) {
      continue
    }

    // Check if user has permission for this route
    const permission = route.meta?.permission
    if (permission && !permissionStore.hasPermission(permission)) {
      continue
    }

    const menuItem = {
      key: route.name || route.path,
      title: route.meta?.title || route.name,
      icon: route.meta?.icon,
      path: route.path,
      permission: permission,
      children: undefined
    }

    // Process children routes
    if (route.children && route.children.length > 0) {
      const childMenuItems = routesToMenuItems(route.children)
      if (childMenuItems.length > 0) {
        menuItem.children = childMenuItems
      }
    }

    // Only add menu item if it has children or is not a parent-only route
    if (!route.children || route.children.length === 0 || (menuItem.children && menuItem.children.length > 0)) {
      menuItems.push(menuItem)
    }
  }

  return menuItems
}

/**
 * Find route by name
 * @param {Array} routes - Routes to search
 * @param {string} name - Route name to find
 * @returns {Object|null} Found route or null
 */
export function findRouteByName(routes, name) {
  for (const route of routes) {
    if (route.name === name) {
      return route
    }
    
    if (route.children) {
      const found = findRouteByName(route.children, name)
      if (found) {
        return found
      }
    }
  }
  
  return null
}

/**
 * Get breadcrumb items from current route
 * @param {Object} route - Current route object
 * @returns {Array} Breadcrumb items
 */
export function getBreadcrumbItems(route) {
  const breadcrumbs = []
  
  route.matched.forEach((match, index) => {
    const title = match.meta?.title
    if (title && !match.meta?.hideInMenu) {
      breadcrumbs.push({
        title,
        path: index === route.matched.length - 1 ? undefined : match.path
      })
    }
  })
  
  return breadcrumbs
}

/**
 * Check if route is accessible by current user
 * @param {Object} route - Route to check
 * @returns {boolean} Whether route is accessible
 */
export function isRouteAccessible(route) {
  const permissionStore = usePermissionStore()
  const permission = route.meta?.permission
  
  if (!permission) {
    return true
  }
  
  return permissionStore.hasPermission(permission)
}

/**
 * Get all accessible routes for current user
 * @param {Array} routes - Routes to filter
 * @returns {Array} Accessible routes
 */
export function getAccessibleRoutes(routes) {
  const accessibleRoutes = []
  
  for (const route of routes) {
    if (isRouteAccessible(route)) {
      const accessibleRoute = { ...route }
      
      if (route.children) {
        accessibleRoute.children = getAccessibleRoutes(route.children)
      }
      
      accessibleRoutes.push(accessibleRoute)
    }
  }
  
  return accessibleRoutes
}
