export const splitThemeConfig = {
  id: 'split',
  name: 'Split Theme',
  description: '分屏主题 - 左右分屏布局设计',
  author: 'SIAE Team',
  version: '1.0.0',
  customSettings: {
    primaryColor: '#3b82f6',
    secondaryColor: '#10b981',
    borderRadius: '8px',
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

export default splitThemeConfig
