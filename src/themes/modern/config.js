export const modernThemeConfig = {
  id: 'modern',
  name: 'Modern Theme',
  description: '现代主题 - 简洁现代的设计风格',
  author: 'SIAE Team',
  version: '1.0.0',
  customSettings: {
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    borderRadius: '12px',
    spacing: '16px',
    fontSize: '14px',
    animations: true
  },
  responsive: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  },
  performance: {
    reduceAnimations: false,
    preloadAssets: []
  },
  accessibility: {
    reducedMotion: false,
    focusVisible: true
  }
}

export default modernThemeConfig
