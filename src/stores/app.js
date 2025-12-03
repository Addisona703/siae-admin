import { ref, computed, watch, readonly } from 'vue'
import { defineStore } from 'pinia'

import { useAuthStore } from './auth'
import { performViewTransition, debounce } from '@/utils/theme-transition'

// Storage keys
const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed'
const THEME_KEY = 'theme'

export const useAppStore = defineStore('app', () => {
  // State
  const sidebarCollapsed = ref(getSavedSidebarState())
  const theme = ref(getSavedTheme())
  const isMobile = ref(false)

  // Getters
  const isDarkTheme = computed(() => theme.value === 'dark')
  const isLightTheme = computed(() => theme.value === 'light')

  // Actions
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed
  }

  const toggleTheme = async (event) => {
    const nextTheme = theme.value === 'light' ? 'dark' : 'light'

    if (!event) {
      theme.value = nextTheme
      return
    }

    await performViewTransition(
      () => {
        theme.value = nextTheme
      },
      {
        x: event.clientX,
        y: event.clientY,
        duration: 300,
      },
    )
  }

  const debouncedToggleTheme = debounce(toggleTheme, 200)

  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  const setMobile = (mobile) => {
    isMobile.value = mobile
  }

  const initializeApp = async () => {
    // Initialize authentication
    const authStore = useAuthStore()
    await authStore.initializeAuth()

    // Apply theme to document
    applyThemeToDocument(theme.value)

    // Set up responsive behavior
    updateMobileState()
    window.addEventListener('resize', updateMobileState)
  }

  const cleanup = () => {
    window.removeEventListener('resize', updateMobileState)
  }

  // Watch for changes and persist to localStorage
  watch(sidebarCollapsed, (newValue) => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(newValue))
  })

  watch(theme, (newValue) => {
    localStorage.setItem(THEME_KEY, newValue)
    applyThemeToDocument(newValue)
  })

  // Auto-collapse sidebar on mobile
  watch(isMobile, (newValue) => {
    if (newValue) {
      setSidebarCollapsed(true)
    }
  })

  return {
    // State
    sidebarCollapsed: false,
    theme: 'light',
    isMobile: false,
    // Getters
    isDarkTheme,
    isLightTheme,

    // Actions
    toggleSidebar,
    setSidebarCollapsed,
    toggleTheme,
    debouncedToggleTheme,
    setTheme,
    setMobile,
    initializeApp,
    cleanup,
  }
})

// Helper functions
function getSavedSidebarState() {
  const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
  return saved ? JSON.parse(saved) : false
}

function getSavedTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  return saved && ['light', 'dark'].includes(saved) ? saved : 'light'
}

function applyThemeToDocument(theme) {
  const htmlElement = document.documentElement
  const bodyElement = document.body

  // Use requestAnimationFrame to batch DOM updates
  requestAnimationFrame(() => {
    if (theme === 'dark') {
      htmlElement.setAttribute('theme-mode', 'dark')
      htmlElement.classList.add('t-dark-theme')
      htmlElement.classList.remove('t-light-theme')
      bodyElement.classList.add('dark-mode')
      bodyElement.classList.remove('light-mode')
    } else {
      htmlElement.setAttribute('theme-mode', 'light')
      htmlElement.classList.add('t-light-theme')
      htmlElement.classList.remove('t-dark-theme')
      bodyElement.classList.remove('dark-mode')
      bodyElement.classList.add('light-mode')
    }

    // Delay event dispatch to avoid triggering re-renders during animation
    requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme } }))
    })
  })
}

function updateMobileState() {
  const appStore = useAppStore()
  const isMobileSize = window.innerWidth < 768
  appStore.setMobile(isMobileSize)
}
