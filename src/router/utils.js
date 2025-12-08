import { usePermissionStore } from '@/stores'

/**
 * 将路由转换为菜单项（支持权限和角色）
 */
export function routesToMenuItems(routes) {
  const permissionStore = usePermissionStore()
  const menuItems = []
  const isRoot = permissionStore.hasRole('ROLE_ROOT')

  for (const route of routes) {
    if (route.meta?.hideInMenu) continue

    // ROLE_ROOT 超级管理员跳过权限检查
    if (!isRoot) {
      const permission = route.meta?.permission
      const roles = route.meta?.roles

      // 权限检查：有权限配置时检查权限
      if (permission && !permissionStore.hasPermission(permission)) {
        // 如果有角色配置，检查角色（角色和权限满足其一即可）
        if (!(roles && roles.length > 0 && permissionStore.hasAnyOfRoles(roles))) {
          continue
        }
      }

      // 仅角色检查（没有配置权限时）
      if (!permission && roles && roles.length > 0 && !permissionStore.hasAnyOfRoles(roles)) {
        continue
      }
    }

    const menuItem = {
      key: route.name || route.path,
      title: route.meta?.title || route.name,
      icon: route.meta?.icon,
      path: route.path,
      permission,
      children: undefined
    }

    if (route.children?.length > 0) {
      const childMenuItems = routesToMenuItems(route.children)
      if (childMenuItems.length > 0) {
        menuItem.children = childMenuItems
      }
    }

    if (!route.children || route.children.length === 0 || menuItem.children?.length > 0) {
      menuItems.push(menuItem)
    }
  }

  return menuItems
}

/**
 * 获取面包屑导航项
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
