export const DASHBOARD_THEMES = {
  // 默认品牌主题 - 标准网格布局
  brand: {
    id: 'brand',
    name: '品牌主题',
    description: '标准网格布局，适合大多数场景',
    style: {
      widgetBackground: 'var(--td-bg-color-container)',
      widgetBorder: '1px solid var(--td-component-border)',
      widgetShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      widgetHoverShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      dragHandleColor: 'var(--td-brand-color)',
      resizeHandleColor: 'var(--td-brand-color)',
      headerBackground: 'linear-gradient(135deg, var(--td-brand-color) 0%, var(--td-brand-color-light) 100%)',
      headerTextColor: '#ffffff'
    },
    layout: {
      cols: 12,
      rowHeight: 80,
      margin: [16, 16],
      compactType: 'vertical'
    }
  },

  // 海洋主题 - 宽松布局
  ocean: {
    id: 'ocean',
    name: '海洋主题',
    description: '宽松布局，更多留白空间',
    style: {
      widgetBackground: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
      widgetBorder: '1px solid rgba(100, 130, 180, 0.2)',
      widgetShadow: '0 4px 12px rgba(100, 130, 180, 0.15)',
      widgetHoverShadow: '0 8px 24px rgba(100, 130, 180, 0.25)',
      dragHandleColor: '#667eea',
      resizeHandleColor: '#764ba2',
      headerBackground: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      headerTextColor: '#ffffff'
    },
    layout: {
      cols: 12,
      rowHeight: 90,
      margin: [24, 24],
      compactType: 'vertical'
    }
  },

  // 日落主题 - 紧凑布局
  sunset: {
    id: 'sunset',
    name: '日落主题',
    description: '紧凑布局，信息密度更高',
    style: {
      widgetBackground: 'linear-gradient(135deg, #fff5f5 0%, #ffe4e4 100%)',
      widgetBorder: '1px solid rgba(255, 99, 71, 0.2)',
      widgetShadow: '0 2px 8px rgba(255, 99, 71, 0.15)',
      widgetHoverShadow: '0 4px 16px rgba(255, 99, 71, 0.25)',
      dragHandleColor: '#f093fb',
      resizeHandleColor: '#f5576c',
      headerBackground: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      headerTextColor: '#ffffff'
    },
    layout: {
      cols: 12,
      rowHeight: 70,
      margin: [12, 12],
      compactType: 'vertical'
    }
  },

  // 极简主题 - 卡片式布局
  minimal: {
    id: 'minimal',
    name: '极简主题',
    description: '简洁卡片式布局',
    style: {
      widgetBackground: '#ffffff',
      widgetBorder: 'none',
      widgetShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      widgetHoverShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
      dragHandleColor: '#666666',
      resizeHandleColor: '#999999',
      headerBackground: '#f8f9fa',
      headerTextColor: '#333333'
    },
    layout: {
      cols: 12,
      rowHeight: 85,
      margin: [20, 20],
      compactType: 'vertical'
    }
  },

  // 暗黑主题 - 标准布局
  dark: {
    id: 'dark',
    name: '暗黑主题',
    description: '深色背景，护眼模式',
    style: {
      widgetBackground: '#1e1e1e',
      widgetBorder: '1px solid #333333',
      widgetShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      widgetHoverShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
      dragHandleColor: '#4fc3f7',
      resizeHandleColor: '#81c784',
      headerBackground: '#2d2d2d',
      headerTextColor: '#e0e0e0'
    },
    layout: {
      cols: 12,
      rowHeight: 80,
      margin: [16, 16],
      compactType: 'vertical'
    }
  }
}

export const DEFAULT_THEME = 'brand'

// 主题布局适配器 - 根据主题调整组件布局
export function adaptLayoutToTheme(widgets, fromTheme, toTheme) {
  const from = DASHBOARD_THEMES[fromTheme]
  const to = DASHBOARD_THEMES[toTheme]
  
  if (!from || !to) return widgets

  const colRatio = to.layout.cols / from.layout.cols
  
  return widgets.map(widget => {
    const newW = Math.round(widget.w * colRatio)
    const newX = Math.round(widget.x * colRatio)
    
    return {
      ...widget,
      // 确保不超出边界
      w: Math.min(newW, to.layout.cols),
      x: Math.min(newX, to.layout.cols - 1)
    }
  })
}
