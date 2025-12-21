<template>
  <div class="category-tag-view">
    <!-- 头部 -->
    <div class="mb-6 flex justify-between items-end" style="margin-bottom: 30px;">
      <div>
        <h1 class="page-title">
          <LayersIcon size="28" /> 资源归档管理
        </h1>
        <p class="page-description">管理内容分类层级结构与内容标签</p>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="card-box p-4">
      <t-tabs v-model="currentTab" theme="normal">

        <!-- Tab 1: 分类管理 -->
        <t-tab-panel value="category" label="分类管理">
          <div class="pt-4">
            <!-- 操作栏 -->
            <div class="mb-4 flex justify-between">
              <div class="flex gap-2 items-center">
                <t-button theme="primary" @click="openCategoryModal('add')">
                  <template #icon>
                    <AddIcon />
                  </template>
                  新建根分类
                </t-button>
                <t-button variant="outline" @click="toggleExpandAll">
                  {{ allExpanded ? '折叠全部' : '展开全部' }}
                </t-button>
              </div>
              <t-input v-model="cateSearch" placeholder="搜索分类名称" style="width: 240px" clearable>
                <template #suffix-icon>
                  <SearchIcon />
                </template>
              </t-input>
            </div>

            <!-- 自定义树形表格 -->
            <t-loading :loading="categoryLoading">
              <CategoryTree
                ref="categoryTreeRef"
                :data="filteredCategoryList"
                @status-change="handleStatusChange"
                @edit="(row) => openCategoryModal('edit', row)"
                @delete="handleDeleteCategory"
                @add-sub="(row) => openCategoryModal('sub', row)"
              />
            </t-loading>
          </div>
        </t-tab-panel>

        <!-- Tab 2: 标签管理 -->
        <t-tab-panel value="tag" label="标签管理">
          <div class="pt-4">
            <!-- 操作栏 -->
            <div class="mb-4 flex justify-between">
              <t-button theme="primary" @click="openTagModal('add')">
                <template #icon>
                  <AddIcon />
                </template>
                新建标签
              </t-button>
              <t-input v-model="tagSearch" placeholder="搜索标签" style="width: 240px" clearable>
                <template #suffix-icon>
                  <SearchIcon />
                </template>
              </t-input>
            </div>

            <!-- 标签表格 -->
            <t-table row-key="id" :data="filteredTags" :columns="tagColumns" :loading="tagLoading" hover stripe
              bordered :empty="tagSearch ? '未找到匹配的标签' : '暂无标签数据'">
              <template #description="{ row }">
                <span v-if="row.description" class="text-secondary">{{ row.description }}</span>
                <span v-else class="text-placeholder">暂无描述</span>
              </template>
              <template #createdAt="{ row }">
                <span class="text-secondary">{{ formatDate(row.createdAt) }}</span>
              </template>
              <template #op="{ row }">
                <t-space size="small">
                  <t-link theme="primary" hover="color" @click="openTagModal('edit', row)">编辑</t-link>
                  <t-popconfirm content="确定删除该标签吗？" theme="danger" @confirm="handleDeleteTag(row)">
                    <t-link theme="danger" hover="color">删除</t-link>
                  </t-popconfirm>
                </t-space>
              </template>
            </t-table>
          </div>
        </t-tab-panel>

      </t-tabs>
    </div>

    <!-- 弹窗：分类编辑 -->
    <t-dialog v-model:visible="cateDialog.visible" :header="cateDialog.title"
      :confirm-btn="{ content: '保存', theme: 'primary', loading: cateDialog.loading }" :on-confirm="submitCategory"
      width="600px">
      <t-form ref="cateFormRef" :data="cateForm" :rules="cateRules" label-align="top" @submit="submitCategory">
        <t-form-item label="分类名称" name="name">
          <t-input v-model="cateForm.name" placeholder="例如：后端技术" />
        </t-form-item>

        <t-form-item label="分类编码 (Code)" name="code">
          <t-input v-model="cateForm.code" placeholder="例如：backend" />
          <template #help>用于URL路径或系统标识，需唯一</template>
        </t-form-item>

        <t-form-item label="上级分类" name="parentId">
          <t-tree-select v-model="cateForm.parentId" :data="categoryTreeSelectData" placeholder="留空表示作为根分类" clearable
            filterable />
        </t-form-item>



        <t-form-item label="状态" name="enable">
          <t-radio-group v-model="cateForm.enable">
            <t-radio :value="1">启用</t-radio>
            <t-radio :value="0">禁用</t-radio>
          </t-radio-group>
        </t-form-item>

        <t-form-item label="描述" name="description">
          <t-textarea v-model="cateForm.description" placeholder="分类描述..." :autosize="{ minRows: 3, maxRows: 6 }" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 弹窗：标签编辑 -->
    <t-dialog v-model:visible="tagDialog.visible" :header="tagDialog.title"
      :confirm-btn="{ content: '保存', theme: 'primary', loading: tagDialog.loading }" :on-confirm="submitTag"
      width="500px">
      <t-form ref="tagFormRef" :data="tagForm" :rules="tagRules" label-align="top" @submit="submitTag">
        <t-form-item label="标签名称" name="name">
          <t-input v-model="tagForm.name" placeholder="例如：SpringBoot" />
        </t-form-item>
        <t-form-item label="描述" name="description">
          <t-textarea v-model="tagForm.description" placeholder="标签用途描述..." :autosize="{ minRows: 3, maxRows: 6 }" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import {
  LayersIcon,
  AddIcon,
  SearchIcon
} from 'tdesign-icons-vue-next'
import { contentApi } from '@/api/content'
import { getAllCategories } from '../../api/content/content'
import CategoryTree from '@/components/CategoryTree.vue'

// ================== 全局状态 ==================
const currentTab = ref('category')

// ================== 分类管理逻辑 ==================
const cateSearch = ref('')
const allExpanded = ref(true)
const categoryLoading = ref(false)
const categoryTreeRef = ref(null)

// 分类数据
const categoryList = ref([])

// 过滤后的分类列表
const filteredCategoryList = computed(() => {
  if (!cateSearch.value) return categoryList.value
  return categoryList.value.filter(item => 
    item.name.toLowerCase().includes(cateSearch.value.toLowerCase())
  )
})

// 展开/折叠全部
const toggleExpandAll = () => {
  if (allExpanded.value) {
    categoryTreeRef.value?.collapseAll()
    allExpanded.value = false
  } else {
    categoryTreeRef.value?.expandAll()
    allExpanded.value = true
  }
}

// 以下保留用于 TreeSelect
// 构建树形数据的函数
const buildTree = (items, parentId = null) => {
  return items
    .filter(item => item.parentId === parentId)
    .map(item => {
      const children = buildTree(items, item.id)
      if (children.length) {
        return { ...item, children }
      }
      return { ...item }
    })
}

// 计算属性：生成树形表格数据
const categoryData = computed(() => {
  let list = categoryList.value
  if (cateSearch.value) {
    list = list.filter(i => i.name.includes(cateSearch.value))
  }
  return buildTree(list, null)
})

// 计算属性：生成用于 TreeSelect 的数据
const categoryTreeSelectData = computed(() => {
  const transform = (nodes) => {
    return nodes.map(node => ({
      label: node.name,
      value: node.id,
      children: node.children ? transform(node.children) : []
    }))
  }
  return transform(categoryData.value)
})

const categoryColumns = [
  { colKey: 'name', title: '分类名称', width: 250, ellipsis: true },
  { colKey: 'code', title: '编码', width: 180 },
  { colKey: 'description', title: '描述', ellipsis: true, width: 300 },
  { colKey: 'status', title: '状态', width: 100, align: 'center' },
  { colKey: 'op', title: '操作', width: 150, fixed: 'right', align: 'center' }
]

const cateDialog = reactive({
  visible: false,
  title: '',
  loading: false,
  mode: 'add'
})

const cateForm = reactive({
  id: undefined,
  name: '',
  code: '',
  parentId: undefined,
  enable: 1,
  description: ''
})

const cateRules = {
  name: [{ required: true, message: '分类名称必填', type: 'error' }],
  code: [{ required: true, message: '分类编码必填', type: 'error' }]
}

const cateFormRef = ref()

// 加载分类列表
const loadCategories = async () => {
  categoryLoading.value = true
  try {
    const pageDTO = {
      pageNum: 1,
      pageSize: 1000
    }
    const result = await getAllCategories(pageDTO)
    console.log('分类数据:', result)

    if (result.code === 200) {
      const records = result.data.records || []

      // 转换 status 字段并确保所有字段都存在
      // 后端返回的 id/parentId 是字符串，status 是数字 0/1
      categoryList.value = records.filter(item => item && item.id).map(item => {
        return {
          id: Number(item.id), // 转为数字
          name: item.name || '',
          code: item.code || '',
          parentId: item.parentId ? Number(item.parentId) : null, // 转为数字，无父级则为 null
          enable: item.status === 1 || item.status === '1' ? 1 : 0, // status 就是 0/1
          description: item.description || '',
          createTime: item.createTime,
          updateTime: item.updateTime,
          contentCount: 0
        }
      })

      console.log('处理后的分类数据:', categoryList.value)
    } else {
      MessagePlugin.warning('暂无分类数据')
      categoryList.value = []
    }
  } catch (error) {
    MessagePlugin.error(error.message || '加载分类列表失败')
    console.error('加载分类失败:', error)
    categoryList.value = []
  } finally {
    categoryLoading.value = false
  }
}

// 操作方法
const openCategoryModal = (mode, row) => {
  cateDialog.mode = mode
  cateDialog.visible = true

  if (mode === 'add') {
    cateDialog.title = '新建根分类'
    Object.assign(cateForm, {
      id: undefined,
      name: '',
      code: '',
      parentId: undefined,
      enable: 1,
      description: ''
    })
  } else if (mode === 'sub' && row) {
    cateDialog.title = `新建 [${row.name}] 的子分类`
    Object.assign(cateForm, {
      id: undefined,
      name: '',
      code: '',
      parentId: row.id,
      enable: 1,
      description: ''
    })
  } else if (mode === 'edit' && row) {
    cateDialog.title = '编辑分类'
    Object.assign(cateForm, { ...row })
  }
}

const submitCategory = async () => {
  const valid = await cateFormRef.value?.validate()
  if (!valid) return

  cateDialog.loading = true
  try {
    if (cateDialog.mode === 'edit' && cateForm.id) {
      const updateDTO = {
        id: cateForm.id,
        name: cateForm.name,
        code: cateForm.code,
        parentId: cateForm.parentId,
        description: cateForm.description || ''
      }
      await contentApi.updateCategory(updateDTO)
      MessagePlugin.success('更新成功')
    } else {
      const createDTO = {
        name: cateForm.name,
        code: cateForm.code,
        parentId: cateForm.parentId,
        description: cateForm.description || ''
      }
      await contentApi.createCategory(createDTO)
      MessagePlugin.success('创建成功')
    }
    cateDialog.visible = false
    await loadCategories()
  } catch (error) {
    MessagePlugin.error(error.message || '操作失败')
  } finally {
    cateDialog.loading = false
  }
}

const handleDeleteCategory = async (row) => {
  try {
    await contentApi.deleteCategory(row.id)
    MessagePlugin.success('删除成功')
    await loadCategories()
  } catch (error) {
    MessagePlugin.error(error.message || '删除失败')
  }
}

const handleStatusChange = async (item) => {
  // item 包含新的 enable 值
  const newEnable = item.enable === 1
  try {
    await contentApi.toggleCategoryEnable({
      id: item.id,
      enable: newEnable
    })
    // 更新本地数据
    const target = categoryList.value.find(c => c.id === item.id)
    if (target) {
      target.enable = item.enable
    }
    const statusText = newEnable ? '启用' : '禁用'
    MessagePlugin.success(`${item.name} 已${statusText}`)
  } catch (error) {
    MessagePlugin.error(error.message || '状态切换失败')
    // 重新加载以恢复状态
    await loadCategories()
  }
}

// ================== 标签管理逻辑 ==================
const tagSearch = ref('')
const tagLoading = ref(false)
const tagList = ref([])

const filteredTags = computed(() => {
  if (!tagSearch.value) return tagList.value
  return tagList.value.filter(t =>
    t.name.toLowerCase().includes(tagSearch.value.toLowerCase())
  )
})

const tagColumns = [
  { colKey: 'name', title: '标签名称', width: 250 },
  { colKey: 'description', title: '描述', ellipsis: true },
  { colKey: 'createdAt', title: '创建时间', width: 200 },
  { colKey: 'op', title: '操作', width: 150, fixed: 'right', align: 'center' }
]

const tagDialog = reactive({
  visible: false,
  title: '',
  loading: false,
  mode: 'add'
})

const tagForm = reactive({
  id: undefined,
  name: '',
  description: ''
})

const tagRules = {
  name: [{ required: true, message: '标签名称必填', type: 'error' }]
}

const tagFormRef = ref()

// 加载标签列表
const loadTags = async () => {
  tagLoading.value = true
  try {
    const pageDTO = {
      pageNum: 1,
      pageSize: 1000
    }
    const result = await contentApi.getTagPage(pageDTO)
    console.log('标签数据:', result)

    if (result && result.code === 200 && result.data) {
      const records = result.data.records || []
      tagList.value = records.filter(item => item && item.id).map(item => ({
        id: item.id,
        name: item.name || '',
        description: item.description || '',
        usageCount: item.usageCount || 0,
        createdAt: item.createdAt || item.createTime,
        updatedAt: item.updatedAt || item.updateTime
      }))
      console.log('处理后的标签数据:', tagList.value)
    } else {
      MessagePlugin.warning('暂无标签数据')
      tagList.value = []
    }
  } catch (error) {
    MessagePlugin.error(error.message || '加载标签列表失败')
    console.error('加载标签失败:', error)
    tagList.value = []
  } finally {
    tagLoading.value = false
  }
}

const openTagModal = (mode, row) => {
  tagDialog.mode = mode
  tagDialog.visible = true
  if (mode === 'add') {
    tagDialog.title = '新建标签'
    Object.assign(tagForm, { id: undefined, name: '', description: '' })
  } else if (row) {
    tagDialog.title = '编辑标签'
    Object.assign(tagForm, { ...row })
  }
}

const submitTag = async () => {
  const valid = await tagFormRef.value?.validate()
  if (!valid) return

  tagDialog.loading = true
  try {
    if (tagDialog.mode === 'edit' && tagForm.id) {
      const updateDTO = {
        name: tagForm.name,
        description: tagForm.description || ''
      }
      await contentApi.updateTag(tagForm.id, updateDTO)
      MessagePlugin.success('标签更新成功')
    } else {
      const createDTO = {
        name: tagForm.name,
        description: tagForm.description || ''
      }
      await contentApi.createTag(createDTO)
      MessagePlugin.success('标签创建成功')
    }
    tagDialog.visible = false
    await loadTags()
  } catch (error) {
    MessagePlugin.error(error.message || '操作失败')
  } finally {
    tagDialog.loading = false
  }
}

const handleDeleteTag = async (row) => {
  try {
    await contentApi.deleteTag(row.id)
    MessagePlugin.success('删除成功')
    await loadTags()
  } catch (error) {
    MessagePlugin.error(error.message || '删除失败')
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// ================== 初始化 ==================
onMounted(() => {
  loadCategories()
  loadTags()
})
</script>

<style scoped>
.category-tag-view {
  min-height: 100vh;
  background: var(--td-bg-color-page);
  padding: 24px;
}

.card-box {
  overflow: hidden;
  background: var(--td-bg-color-container);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--td-component-border);
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--td-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
  margin-top: 4px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mb-6 {
  margin-bottom: 24px;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-end {
  align-items: flex-end;
}

.items-center {
  align-items: center;
}

.gap-2 {
  gap: 8px;
}

.pt-4 {
  padding-top: 16px;
}

.p-4 {
  padding: 24px;
}

.text-secondary {
  color: var(--td-text-color-secondary);
}

.text-placeholder {
  color: var(--td-text-color-placeholder);
  font-style: italic;
}

/* 优化表格样式 */
:deep(.t-table) {
  font-size: 14px;
}

:deep(.t-table__header) {
  background: var(--td-bg-color-container-hover);
}

:deep(.t-table__cell) {
  padding: 12px 16px;
}

/* 优化 Tabs 样式 */
:deep(.t-tabs__nav-item) {
  font-size: 15px;
  font-weight: 500;
  padding: 12px 24px;
}

:deep(.t-tabs__nav-item.t-is-active) {
  color: var(--td-brand-color);
  font-weight: 600;
}

/* 优化开关样式 */
:deep(.t-switch) {
  vertical-align: middle;
}

/* 暗黑模式优化 */
html[theme-mode='dark'] {
  .card-box {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
  }

  :deep(.t-table__header) {
    background: rgba(255, 255, 255, 0.03);
  }

  :deep(.t-table) {
    border-color: rgba(255, 255, 255, 0.08);
  }

  :deep(.t-table__cell) {
    border-color: rgba(255, 255, 255, 0.08);
  }

  :deep(.t-tabs__nav-item) {
    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>