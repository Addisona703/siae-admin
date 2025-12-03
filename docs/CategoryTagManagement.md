# 分类标签管理页面

## 概述

这是一个整合了分类管理和标签管理的页面，提供了完整的内容归档管理功能。

## 功能特性

### 分类管理

- **树形结构展示**：支持多级分类的树形展示
- **CRUD操作**：
  - 新建根分类
  - 添加子分类
  - 编辑分类（支持调整父级分类）
  - 删除分类（级联删除子分类）
- **状态管理**：一键启用/禁用分类
- **搜索功能**：快速搜索分类名称
- **展开/折叠**：支持一键展开或折叠所有分类

### 标签管理

- **列表展示**：清晰展示所有标签
- **CRUD操作**：
  - 新建标签
  - 编辑标签
  - 删除标签
- **使用统计**：显示标签使用次数
- **搜索功能**：快速搜索标签名称

## 路由配置

页面路由：`/content/category-tag`

在 `router/index.ts` 中已配置：

```typescript
{
  path: 'category-tag',
  name: 'CategoryTagManagement',
  component: () => import('@/views/content/CategoryTagManagementView.vue'),
  meta: {
    title: '分类标签管理',
    icon: 'layers',
    permission: 'category:view'
  }
}
```

## API 接口

页面使用以下 API：

### 分类相关
- `contentApi.getCategoryPage()` - 获取分类列表
- `contentApi.createCategory()` - 创建分类
- `contentApi.updateCategory()` - 更新分类
- `contentApi.deleteCategory()` - 删除分类
- `contentApi.toggleCategoryEnable()` - 切换分类状态

### 标签相关
- `contentApi.getTagPage()` - 获取标签列表
- `contentApi.createTag()` - 创建标签
- `contentApi.updateTag()` - 更新标签
- `contentApi.deleteTag()` - 删除标签

## 数据结构

### CategoryVO
```typescript
interface CategoryVO {
  id: number
  name: string
  code: string
  description?: string
  parentId?: number
  enable: number  // 0=禁用, 1=启用
  contentCount?: number
  createdAt: string
  updatedAt: string
}
```

### TagVO
```typescript
interface TagVO {
  id: number
  name: string
  description?: string
  usageCount: number
  createdAt: string
  updatedAt: string
}
```

## 使用说明

1. **访问页面**：在侧边栏导航中点击"内容管理" -> "分类标签管理"

2. **分类管理**：
   - 点击"新建根分类"创建顶级分类
   - 点击某个分类的"添加子类"创建子分类
   - 点击"编辑"可以修改分类信息，包括调整父级分类
   - 使用开关可以快速启用/禁用分类
   - 点击"展开/折叠全部"可以控制树形结构的展开状态

3. **标签管理**：
   - 切换到"标签管理"标签页
   - 点击"新建标签"创建新标签
   - 点击"编辑"修改标签信息
   - 使用搜索框快速查找标签

## 权限要求

- 查看权限：`category:view`
- 创建权限：`category:create`
- 编辑权限：`category:edit`
- 删除权限：`category:delete`

## 技术栈

- Vue 3 Composition API
- TypeScript
- TDesign Vue Next
- Tailwind CSS

## 注意事项

1. 删除分类时会级联删除所有子分类，请谨慎操作
2. 分类编码（code）需要唯一，用于URL路径或系统标识
3. 禁用的分类不会在前台显示，但不影响已关联的内容
4. 标签的使用次数会自动统计
