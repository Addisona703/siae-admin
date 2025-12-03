import { ref, computed } from 'vue'
import { DASHBOARD_THEMES, DEFAULT_THEME, adaptLayoutToTheme } from '@/config/dashboard-theme'

const STORAGE_KEY = 'dashboard-theme'

// 全局主题状态
const currentThemeId = ref(DEFAULT_THEME)

export function useTheme() {
  // 当前主题配置
  const currentTheme = computed(() => {
    return (DASHBOARD_THEMES[currentThemeId.value] ?? DASHBOARD_THEMES[DEFAULT_THEME])
  })

  // 所有可用主题
  const availableThemes = computed(() => 
    Object.values(DASHBOARD_THEMES)
  )

  // 主题选项（用于下拉选择）
  const themeOptions = computed(() =>
    availableThemes.value.map(theme => ({
      label: theme.name,
      value: theme.id,
      description: theme.description
    }))
  )

  // 应用主题样式到 DOM
  const applyThemeStyles = (theme) => {
    const root = document.documentElement
    const { style } = theme

    // 应用 CSS 变量
    root.style.setProperty('--dashboard-widget-bg', style.widgetBackground)
    root.style.setProperty('--dashboard-widget-border', style.widgetBorder)
    root.style.setProperty('--dashboard-widget-shadow', style.widgetShadow)
    root.style.setProperty('--dashboard-widget-hover-shadow', style.widgetHoverShadow)
    root.style.setProperty('--dashboard-drag-handle', style.dragHandleColor)
    root.style.setProperty('--dashboard-resize-handle', style.resizeHandleColor)
    
    if (style.headerBackground) {
      root.style.setProperty('--dashboard-header-bg', style.headerBackground)
    }
    if (style.headerTextColor) {
      root.style.setProperty('--dashboard-header-text', style.headerTextColor)
    }
    if (style.contentBackground) {
      root.style.setProperty('--dashboard-content-bg', style.contentBackground)
    }

    // 设置主题 ID 到 body，方便全局样式覆盖
    document.body.setAttribute('data-dashboard-theme', theme.id)
  }

  // 切换主题
  const setTheme = (themeId) => {
    const theme = DASHBOARD_THEMES[themeId]
    if (!theme) {
      console.warn(`Theme "${themeId}" not found`)
      return
    }

    currentThemeId.value = themeId
    applyThemeStyles(theme)
    
    // 保存到 localStorage
    localStorage.setItem(STORAGE_KEY, themeId)
  }

  // 从 localStorage 加载主题
  const loadSavedTheme = () => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && DASHBOARD_THEMES[saved]) {
      setTheme(saved)
    } else {
      applyThemeStyles(currentTheme.value)
    }
  }

  // 获取主题布局配置
  const getThemeLayout = (themeId) => {
    const theme = themeId ? DASHBOARD_THEMES[themeId] : currentTheme.value
    return theme?.layout
  }

  // 适配布局到新主题
  const adaptLayout = (widgets, toThemeId) => {
    return adaptLayoutToTheme(widgets, currentThemeId.value, toThemeId)
  }

  return {
    currentThemeId,
    currentTheme,
    availableThemes,
    themeOptions,
    setTheme,
    loadSavedTheme,
    getThemeLayout,
    adaptLayout
  }
}
