/**
 * Convert route config with middleware to standard Vue Router route
 * @param {Object} config - Route configuration
 * @returns {Object} Vue Router route record
 */
export function createRoute(config) {
  const { middleware, ...routeConfig } = config
  
  if (middleware) {
    const middlewares = Array.isArray(middleware) ? middleware : [middleware]
    
    routeConfig.beforeEnter = async (to, from, next) => {
      let index = 0
      
      const runNext = async (result) => {
        if (result !== undefined) {
          next(result)
          return
        }
        
        if (index >= middlewares.length) {
          next()
          return
        }
        
        const currentMiddleware = middlewares[index++]
        if (currentMiddleware) {
          await currentMiddleware(to, from, runNext)
        }
      }
      
      await runNext()
    }
    
    return routeConfig
  }
  
  return routeConfig
}

/**
 * Create multiple routes with shared middleware
 * @param {Array} configs - Array of route configurations
 * @returns {Array} Array of Vue Router route records
 */
export function createRoutes(configs) {
  return configs.map(createRoute)
}

/**
 * Route group helper for applying middleware to multiple routes
 * @param {Function|Array} middleware - Middleware function(s)
 * @param {Array} routes - Array of route configurations
 * @returns {Array} Array of route configurations with middleware
 */
export function routeGroup(middleware, routes) {
  const groupMiddleware = Array.isArray(middleware) ? middleware : [middleware]
  return routes.map(route => ({
    ...route,
    middleware: Array.isArray(route.middleware) 
      ? [...groupMiddleware, ...route.middleware]
      : groupMiddleware
  }))
}

/**
 * Helper to create nested routes with layout
 * @param {Function} layoutComponent - Layout component loader
 * @param {Array} routes - Child routes
 * @param {Function|Array} [layoutMiddleware] - Optional middleware
 * @returns {Object} Route configuration with layout
 */
export function layoutRoutes(layoutComponent, routes, layoutMiddleware) {
  return {
    path: '/',
    component: layoutComponent,
    middleware: layoutMiddleware,
    children: routes
  }
}

/**
 * Helper to create redirect route
 * @param {string} from - Source path
 * @param {string|Object} to - Target path or location
 * @returns {Object} Redirect route configuration
 */
export function redirectRoute(from, to) {
  return {
    path: from,
    redirect: to
  }
}

/**
 * Helper to create catch-all 404 route
 * @param {Function} component - 404 component loader
 * @returns {Object} Catch-all route configuration
 */
export function notFoundRoute(component) {
  return {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: component,
    meta: {
      title: '页面未找到',
      hideInMenu: true
    }
  }
}
