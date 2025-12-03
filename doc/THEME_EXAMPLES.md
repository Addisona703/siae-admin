# 主题系统使用示例

## 快速开始

### 1. 基础主题切换

```vue
<template>
  <div>
    <t-select v-model="selectedTheme" :options="themeOptions" />
    <DraggableDashboard :widgets="widgets" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { currentThemeId, themeOptions, setTheme } = useTheme()
const selectedTheme = ref(currentThemeId.value)

watch(selectedTheme, (newTheme) => {
  setTheme(newTheme)
})
</script>
```

### 2. 获取当前主题信息

```typescript
import { useTheme } from '@/composables/useTheme'

const { currentTheme } = useTheme()

console.log('当前主题:', currentTheme.value.name)
console.log('列数:', currentTheme.value.layout.cols)
console.log('行高:', currentTheme.value.layout.rowHeight)
```

### 3. 程序化切换主题

```typescript
import { useTheme } from '@/composables/useTheme'

const { setTheme } = useTheme()

// 切换到海洋主题
setTheme('ocean')

// 切换到暗黑主题
setTheme('dark')
```

## 高级用法

### 1. 创建自定义主题

```typescript
// src/config/dashboard-theme.ts
export const DASHBOARD_THEMES: DashboardThemePreset = {
  // ... 现有主题
  
  corporate: {
    id: 'corporate',
    name: '企业主题',
    description: '专业的企业级仪表盘主题',
    style: {
      widgetBackground: '#ffffff',
      widgetBorder: '1px solid #d1d5db',
      widgetShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      widgetHoverShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      dragHandleColor: '#3b82f6',
      resizeHandleColor: '#60a5fa',
      headerBackground: 'linear-gradient(to right, #1e40af, #3b82f6)',
      headerTextColor: '#ffffff'
    },
    layout: {
      cols: 12,
      rowHeight: 100,
      margin: [16, 16],
      compactType: 'vertical'
    },
    componentOverrides: {
      // 可以为特定组件添加配置
      UserStatsCard: {
        chartColor: '#3b82f6'
      }
    }
  }
}
```

### 2. 主题特定样式

```css
/* src/assets/theme-overrides.css */

/* 企业主题特定样式 */
[data-dashboard-theme="corporate"] {
  --font-family: 'Inter', sans-serif;
}

[data-dashboard-theme="corporate"] .widget-container {
  border-radius: 8px;
}

[data-dashboard-theme="corporate"] .widget-title {
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* 暗黑主题特定样式 */
[data-dashboard-theme="dark"] {
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
}

[data-dashboard-theme="dark"] .widget-content {
  color: var(--text-primary);
}
```

### 3. 响应式主题切换

根据屏幕尺寸自动切换主题：

```typescript
import { useTheme } from '@/composables/useTheme'
import { onMounted, onUnmounted } from 'vue'

const { setTheme } = useTheme()

const handleResize = () => {
  const width = window.innerWidth
  
  if (width < 768) {
    // 移动端使用极简主题（4列）
    setTheme('minimal')
  } else if (width < 1200) {
    // 平板使用海洋主题（8列）
    setTheme('ocean')
  } else if (width >= 1920) {
    // 大屏使用日落主题（16列）
    setTheme('sunset')
  } else {
    // 桌面使用品牌主题（12列）
    setTheme('brand')
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
```

### 4. 主题预设管理

创建用户主题预设：

```typescript
interface UserThemePreset {
  name: string
  themeId: string
  layout: DashboardWidget[]
}

const savePreset = (name: string) => {
  const { currentThemeId } = useTheme()
  const layout = getCurrentLayout()
  
  const preset: UserThemePreset = {
    name,
    themeId: currentThemeId.value,
    layout
  }
  
  const presets = JSON.parse(localStorage.getItem('theme-presets') || '[]')
  presets.push(preset)
  localStorage.setItem('theme-presets', JSON.stringify(presets))
}

const loadPreset = (presetName: string) => {
  const presets = JSON.parse(localStorage.getItem('theme-presets') || '[]')
  const preset = presets.find(p => p.name === presetName)
  
  if (preset) {
    setTheme(preset.themeId)
    applyLayout(preset.layout)
  }
}
```

### 5. 主题动画过渡

添加平滑的主题切换动画：

```vue
<template>
  <transition name="theme-fade" mode="out-in">
    <div :key="currentThemeId" class="dashboard-container">
      <DraggableDashboard :widgets="widgets" />
    </div>
  </transition>
</template>

<style scoped>
.theme-fade-enter-active,
.theme-fade-leave-active {
  transition: opacity 0.3s ease;
}

.theme-fade-enter-from,
.theme-fade-leave-to {
  opacity: 0;
}

.dashboard-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
```

### 6. 主题导出导入

```typescript
// 导出当前主题配置
const exportTheme = () => {
  const { currentTheme } = useTheme()
  const themeJson = JSON.stringify(currentTheme.value, null, 2)
  
  const blob = new Blob([themeJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `theme-${currentTheme.value.id}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 导入主题配置
const importTheme = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const theme = JSON.parse(e.target?.result as string)
      // 验证主题格式
      if (theme.id && theme.name && theme.style && theme.layout) {
        DASHBOARD_THEMES[theme.id] = theme
        setTheme(theme.id)
      }
    } catch (error) {
      console.error('Invalid theme file:', error)
    }
  }
  reader.readAsText(file)
}
```

## 实际场景示例

### 场景 1: 多租户系统

不同租户使用不同主题：

```typescript
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores'

const { setTheme } = useTheme()
const authStore = useAuthStore()

// 根据租户 ID 设置主题
const tenantThemes = {
  'tenant-1': 'brand',
  'tenant-2': 'ocean',
  'tenant-3': 'dark'
}

const tenantId = authStore.user?.tenantId
if (tenantId && tenantThemes[tenantId]) {
  setTheme(tenantThemes[tenantId])
}
```

### 场景 2: 时间驱动主题

根据时间自动切换主题：

```typescript
const autoSwitchTheme = () => {
  const hour = new Date().getHours()
  
  if (hour >= 6 && hour < 12) {
    setTheme('ocean') // 早晨 - 清新
  } else if (hour >= 12 && hour < 18) {
    setTheme('brand') // 下午 - 标准
  } else if (hour >= 18 && hour < 22) {
    setTheme('sunset') // 傍晚 - 温暖
  } else {
    setTheme('dark') // 夜晚 - 暗黑
  }
}

// 每小时检查一次
setInterval(autoSwitchTheme, 3600000)
autoSwitchTheme()
```

### 场景 3: 用户偏好设置

```vue
<template>
  <div class="theme-settings">
    <h3>主题设置</h3>
    
    <t-radio-group v-model="themeMode">
      <t-radio value="auto">自动（跟随系统）</t-radio>
      <t-radio value="light">浅色主题</t-radio>
      <t-radio value="dark">深色主题</t-radio>
    </t-radio-group>
    
    <t-select
      v-if="themeMode !== 'auto'"
      v-model="selectedTheme"
      :options="filteredThemes"
      placeholder="选择主题"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { themeOptions, setTheme } = useTheme()
const themeMode = ref('auto')
const selectedTheme = ref('brand')

const filteredThemes = computed(() => {
  if (themeMode.value === 'dark') {
    return themeOptions.value.filter(t => t.value === 'dark')
  }
  return themeOptions.value.filter(t => t.value !== 'dark')
})

watch(themeMode, (mode) => {
  if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setTheme(prefersDark ? 'dark' : 'brand')
  } else if (mode === 'dark') {
    setTheme('dark')
  } else {
    setTheme(selectedTheme.value)
  }
})

watch(selectedTheme, (theme) => {
  if (themeMode.value !== 'auto') {
    setTheme(theme)
  }
})
</script>
```

### 场景 4: A/B 测试

测试不同主题的用户体验：

```typescript
const runThemeABTest = () => {
  const userId = authStore.user?.id
  const testGroup = userId % 2 === 0 ? 'A' : 'B'
  
  const themes = {
    A: 'brand',
    B: 'ocean'
  }
  
  setTheme(themes[testGroup])
  
  // 记录用户行为
  analytics.track('theme_ab_test', {
    userId,
    testGroup,
    theme: themes[testGroup]
  })
}
```

## 调试技巧

### 1. 主题调试面板

```vue
<template>
  <div v-if="isDev" class="theme-debug">
    <h4>主题调试</h4>
    <pre>{{ JSON.stringify(currentTheme, null, 2) }}</pre>
    <button @click="logThemeVars">Log CSS Variables</button>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

const { currentTheme } = useTheme()
const isDev = import.meta.env.DEV

const logThemeVars = () => {
  const root = document.documentElement
  const styles = getComputedStyle(root)
  
  console.log('Dashboard Theme Variables:')
  console.log('--dashboard-widget-bg:', styles.getPropertyValue('--dashboard-widget-bg'))
  console.log('--dashboard-widget-border:', styles.getPropertyValue('--dashboard-widget-border'))
  // ... 其他变量
}
</script>
```

### 2. 性能监控

```typescript
const measureThemeSwitch = (toTheme: string) => {
  const start = performance.now()
  
  setTheme(toTheme)
  
  requestAnimationFrame(() => {
    const end = performance.now()
    console.log(`Theme switch took ${end - start}ms`)
  })
}
```

## 常见问题

### Q: 如何禁用主题切换？

```vue
<DraggableDashboard
  :widgets="widgets"
  :editable="false"
/>
```

### Q: 如何锁定特定主题？

```typescript
// 在应用初始化时
const { setTheme } = useTheme()
setTheme('brand')

// 移除主题选择器
```

### Q: 如何为不同角色设置默认主题？

```typescript
const roleThemes = {
  admin: 'dark',
  user: 'brand',
  guest: 'minimal'
}

const userRole = authStore.user?.role
if (userRole && roleThemes[userRole]) {
  setTheme(roleThemes[userRole])
}
```
