# 主题系统架构

## 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        应用层                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           DashboardView.vue                          │   │
│  │  - 数据获取                                           │   │
│  │  - 组件配置                                           │   │
│  │  - 事件处理                                           │   │
│  └──────────────────┬───────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      组件层                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        DraggableDashboard.vue                        │   │
│  │  - 网格布局管理                                       │   │
│  │  - 主题切换 UI                                        │   │
│  │  - 拖拽/调整大小                                      │   │
│  │  - 布局持久化                                         │   │
│  └──────────────────┬───────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Composable 层                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              useTheme()                              │   │
│  │  - 主题状态管理                                       │   │
│  │  - 主题切换逻辑                                       │   │
│  │  - CSS 变量应用                                       │   │
│  │  - 布局适配算法                                       │   │
│  │  - 持久化管理                                         │   │
│  └──────────────────┬───────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      配置层                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         dashboard-theme.ts                           │   │
│  │  - 主题定义                                           │   │
│  │  - 布局配置                                           │   │
│  │  - 样式配置                                           │   │
│  │  - 适配函数                                           │   │
│  └──────────────────┬───────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      类型层                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              theme.ts                                │   │
│  │  - ThemeConfig                                       │   │
│  │  - ThemeStyle                                        │   │
│  │  - ThemeLayout                                       │   │
│  │  - DashboardThemePreset                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

### 1. 主题切换流程

```
用户选择主题
    │
    ▼
DraggableDashboard 接收事件
    │
    ▼
调用 useTheme().setTheme()
    │
    ├─► 更新 currentThemeId
    │
    ├─► 应用 CSS 变量到 DOM
    │
    ├─► 保存到 localStorage
    │
    └─► 触发 theme-change 事件
         │
         ▼
    父组件接收通知
```

### 2. 布局适配流程

```
主题切换
    │
    ▼
检测列数变化
    │
    ▼
调用 adaptLayout()
    │
    ├─► 计算列数比例
    │
    ├─► 调整组件宽度
    │
    ├─► 调整组件位置
    │
    └─► 边界检查
         │
         ▼
    应用新布局
         │
         ▼
    保存到 localStorage
```

### 3. 初始化流程

```
应用启动
    │
    ▼
DraggableDashboard mounted
    │
    ├─► loadSavedTheme()
    │   └─► 从 localStorage 读取
    │       └─► 应用主题样式
    │
    └─► 加载布局数据
        └─► 从 localStorage 读取
            └─► 应用到网格
```

## 核心模块

### 1. useTheme Composable

**职责:**
- 管理全局主题状态
- 提供主题切换接口
- 处理 CSS 变量应用
- 管理主题持久化

**API:**
```typescript
{
  currentThemeId: Ref<string>
  currentTheme: ComputedRef<ThemeConfig>
  availableThemes: ComputedRef<ThemeConfig[]>
  themeOptions: ComputedRef<SelectOption[]>
  setTheme: (themeId: string) => void
  loadSavedTheme: () => void
  getThemeLayout: (themeId?: string) => ThemeLayout
  adaptLayout: (widgets: any[], toThemeId: string) => any[]
}
```

### 2. DraggableDashboard 组件

**职责:**
- 渲染网格布局
- 处理拖拽交互
- 管理编辑模式
- 同步布局变化

**Props:**
```typescript
{
  widgets: DashboardWidget[]
  editable?: boolean
  components?: Record<string, Component>
}
```

**Events:**
```typescript
{
  'update:widgets': (widgets: DashboardWidget[]) => void
  'layout-change': (layout: DashboardWidget[]) => void
  'theme-change': (themeId: string) => void
}
```

### 3. 主题配置

**结构:**
```typescript
ThemeConfig {
  id: string              // 唯一标识
  name: string            // 显示名称
  description?: string    // 描述
  style: {                // 样式配置
    widgetBackground
    widgetBorder
    widgetShadow
    ...
  }
  layout: {               // 布局配置
    cols: number          // 列数
    rowHeight: number     // 行高
    margin: [number, number]
    compactType?: 'vertical' | 'horizontal' | null
  }
}
```

## 扩展点

### 1. 添加新主题

在 `dashboard-theme.ts` 中添加配置：

```typescript
export const DASHBOARD_THEMES: DashboardThemePreset = {
  // ... 现有主题
  newTheme: {
    id: 'newTheme',
    name: '新主题',
    style: { /* ... */ },
    layout: { /* ... */ }
  }
}
```

### 2. 自定义布局适配

修改 `adaptLayoutToTheme` 函数：

```typescript
export function adaptLayoutToTheme(
  widgets: any[],
  fromTheme: string,
  toTheme: string
): any[] {
  // 自定义适配逻辑
}
```

### 3. 添加主题特定行为

使用 `componentOverrides` 配置：

```typescript
{
  componentOverrides: {
    UserStatsCard: {
      chartType: 'bar',
      colors: ['#ff0000', '#00ff00']
    }
  }
}
```

## 性能优化

### 1. CSS 变量

使用 CSS 变量避免重新渲染：
```css
.widget-container {
  background: var(--dashboard-widget-bg);
}
```

### 2. 计算缓存

使用 `computed` 缓存主题配置：
```typescript
const currentTheme = computed(() => /* ... */)
```

### 3. 布局批量更新

主题切换时一次性更新所有布局：
```typescript
layoutData.value = adaptedLayout
```

## 最佳实践

1. **主题命名**: 使用语义化的主题 ID
2. **布局兼容**: 确保组件在不同列数下正常显示
3. **边界检查**: 适配布局时检查边界
4. **持久化**: 保存用户的主题和布局选择
5. **响应式**: 考虑不同屏幕尺寸的主题适配
6. **性能**: 避免频繁的主题切换
7. **可访问性**: 确保主题对比度符合标准

## 故障排查

### 问题: 主题切换后样式不生效

**原因**: CSS 变量未正确应用

**解决**:
1. 检查 `applyThemeStyles` 函数
2. 确认 CSS 变量名称正确
3. 查看浏览器开发工具中的 CSS 变量值

### 问题: 布局适配后组件重叠

**原因**: 列数比例计算错误或边界检查失败

**解决**:
1. 检查 `adaptLayoutToTheme` 函数
2. 确认边界检查逻辑
3. 调整组件的 minW/maxW 限制

### 问题: 主题持久化失败

**原因**: localStorage 访问受限或数据格式错误

**解决**:
1. 检查浏览器 localStorage 权限
2. 验证保存的数据格式
3. 添加错误处理和降级方案
