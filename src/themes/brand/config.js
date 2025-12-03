export const brandThemeConfig = {
  id: 'brand',
  name: 'Brand Theme',
  description: '品牌主题 - 突出企业品牌形象',
  author: 'SIAE Team',
  version: '1.0.0',
  customSettings: {
    primaryColor: '#1890ff',
    secondaryColor: '#52c41a',
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
    preloadAssets: ['brand-logo.svg']
  },
  accessibility: {
    reducedMotion: false,
    focusVisible: true
  }
}

export default brandThemeConfig
