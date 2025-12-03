/**
 * Theme transition utilities for smooth and performant theme switching
 */

/**
 * Optimize theme transition by temporarily disabling animations
 * This prevents layout thrashing and improves performance
 */
export function optimizeThemeTransition(callback) {
  const root = document.documentElement
  
  // Add class to disable transitions
  root.classList.add('theme-transitioning')
  
  // Execute the theme change
  callback()
  
  // Re-enable transitions after a frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('theme-transitioning')
    })
  })
}

/**
 * Check if View Transition API is supported
 */
export function supportsViewTransition() {
  return 'startViewTransition' in document
}

/**
 * Perform theme transition with View Transition API
 */
export async function performViewTransition(callback, options) {
  if (!supportsViewTransition()) {
    callback()
    return
  }

  const { x = 0, y = 0, duration = 400 } = options || {}

  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  )

  // Add class to disable other transitions
  const root = document.documentElement
  root.classList.add('theme-switching')

  const transition = document.startViewTransition(() => {
    callback()
  })

  try {
    await transition.ready

    // Use Web Animations API for better performance
    const animation = root.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]
      },
      {
        duration,
        easing: 'cubic-bezier(0, 0, 0.2, 1)',
        pseudoElement: '::view-transition-new(root)'
      }
    )

    await transition.finished
  } finally {
    root.classList.remove('theme-switching')
  }
}

/**
 * Debounce function for theme toggle to prevent rapid switching
 */
export function debounce(func, wait) {
  let timeout = null

  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}
