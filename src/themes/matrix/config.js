export const matrixThemeConfig = {
  id: 'matrix',
  name: 'Matrix Theme',
  description: '黑客帝国主题 - 科技感十足的数字雨效果',
  author: 'SIAE Team',
  version: '1.0.0',
  customSettings: {
    primaryColor: '#00ff00',
    secondaryColor: '#003300',
    borderRadius: '4px',
    spacing: '12px',
    fontSize: '14px',
    animations: true
  },
  responsive: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  },
  performance: {
    reduceAnimations: true, // Matrix 效果可能消耗性能
    preloadAssets: []
  },
  accessibility: {
    reducedMotion: true, // 数字雨效果可能引起不适
    focusVisible: true
  }
}

export default matrixThemeConfig
