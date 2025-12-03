// Layout theme types (JSDoc definitions for JavaScript)

/**
 * 主题配置接口
 * @typedef {Object} ThemeConfig
 * @property {string} id - Theme ID
 * @property {string} name - Theme name
 * @property {string} description - Theme description
 * @property {Object} customSettings - Custom settings
 */

/**
 * 主题状态接口
 * @typedef {Object} ThemeState
 * @property {string} currentTheme - Current theme ID
 * @property {boolean} isDark - Dark mode flag
 */

/**
 * 过渡动画配置接口
 * @typedef {Object} TransitionConfig
 * @property {number} duration - Transition duration in ms
 * @property {string} easing - Easing function
 */

/**
 * 主题自定义设置接口
 * @typedef {Object} ThemeCustomSettings
 * @property {string} primaryColor - Primary color
 * @property {string} secondaryColor - Secondary color
 * @property {string} borderRadius - Border radius
 */

/**
 * 响应式配置接口
 * @typedef {Object} ResponsiveConfig
 * @property {string} [mobileLayout] - 移动端专用布局组件
 * @property {string} [tabletLayout] - 平板端专用布局组件
 * @property {string} [desktopLayout] - 桌面端专用布局组件
 */

/**
 * 性能配置接口
 * @typedef {Object} PerformanceConfig
 * @property {boolean} reduceAnimations - Reduce animations flag
 * @property {Array<string>} preloadAssets - Assets to preload
 */

/**
 * 无障碍访问配置接口
 * @typedef {Object} AccessibilityConfig
 * @property {boolean} reducedMotion - Reduced motion preference
 * @property {boolean} focusVisible - Focus visible preference
 */

/**
 * 加载状态接口
 * @typedef {Object} LoadingState
 * @property {boolean} isLoading - Loading flag
 * @property {string} [message] - Loading message
 */

/**
 * 设备性能信息接口
 * @typedef {Object} DevicePerformance
 * @property {string} tier - Performance tier (low, medium, high)
 * @property {number} score - Performance score
 */

/**
 * 主题切换选项接口
 * @typedef {Object} ThemeSwitchOptions
 * @property {boolean} [animate] - Enable animation
 * @property {boolean} [persist] - Persist to storage
 */

export default {}
