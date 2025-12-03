
import {
  authGuard,
  permissionGuard,
  loadingGuard,
  titleGuard,
  errorGuard,
  analyticsGuard
} from './guards'

/**
 * Attach global navigation guards to the provided router instance.
 */
export function setupRouterGuards(router) {
  router.beforeEach(authGuard)
  router.beforeEach(permissionGuard)
  router.beforeEach(loadingGuard)

  router.afterEach((to, from) => {
    titleGuard(to)
    analyticsGuard(to, from)
  })

  router.onError((error, to, from) => {
    errorGuard(error, to, from)
  })
}
