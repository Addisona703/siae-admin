<template>
  <div class="tag-view">
    <t-card :bordered="false">
      <template #header>
        <div class="header-wrapper">
          <h3>标签管理</h3>
          <t-button theme="primary" @click="handleCreate">
            <template #icon><t-icon name="add" /></template>
            添加标签
          </t-button>
        </div>
      </template>

      <!-- Search Form -->
      <t-form :data="searchForm" layout="inline" class="search-form">
        <t-form-item label="标签名称" name="name">
          <t-input v-model="searchForm.name" placeholder="按标签名称搜索" clearable style="width: 200px" @clear="handleSearch"
            @enter="handleSearch" />
        </t-form-item>
        <t-form-item label="状态" name="status">
          <t-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px"
            @change="handleSearch">
            <t-option value="active" label="活跃" />
            <t-option value="inactive" label="未激活" />
          </t-select>
        </t-form-item>
        <t-form-item label="排序方式" name="sortBy">
          <t-select v-model="searchForm.sortBy" placeholder="默认排序" style="width: 150px" @change="handleSearch">
            <t-option value="name" label="按名称" />
            <t-option value="usageCount" label="按使用次数" />
            <t-option value="createdAt" label="按创建时间" />
          </t-select>
        </t-form-item>
        <t-form-item>
          <t-button theme="primary" @click="handleSearch">
            <template #icon><t-icon name="search" /></template>
            搜索
          </t-button>
          <t-button theme="default" @click="handleReset">重置</t-button>
        </t-form-item>
      </t-form>

      <!-- Statistics -->
      <div class="stats-row">
        <t-space size="large">
          <span>总标签数: <strong>{{ pagination.total }}</strong></span>
          <span>活跃标签: <strong>{{ activeCount }}</strong></span>
          <span>总使用次数: <strong>{{ totalUsage }}</strong></span>
        </t-space>
      </div>

      <!-- Table -->
      <t-table :data="tableData" :columns="columns" :loading="loading" :pagination="pagination" row-key="id" stripe
        hover @page-change="handlePageChange">
        <template #name="{ row }">
          <t-tag :style="{
            borderColor: row.color || '#1890ff',
            color: row.color || '#1890ff'
          }" variant="outline">
            {{ row.name }}
          </t-tag>
        </template>

        <template #slug="{ row }">
          <t-tag variant="light" size="small">{{ row.slug }}</t-tag>
        </template>

        <template #status="{ row }">
          <t-tag :theme="row.status === 'active' ? 'success' : 'default'">
            {{ row.status === 'active' ? '活跃' : '未激活' }}
          </t-tag>
        </template>

        <template #usageCount="{ row }">
          <span style="color: var(--td-brand-color); font-weight: 500;">
            {{ row.usageCount }}
          </span>
        </template>

        <template #createdAt="{ row }">
          {{ formatDate(row.createdAt, 'YYYY-MM-DD') }}
        </template>

        <template #operation="{ row }">
          <t-space>
            <t-button theme="primary" variant="text" size="small" @click="handleEdit(row)">
              编辑
            </t-button>
            <t-button theme="danger" variant="text" size="small" @click="handleDelete(row)"
              :disabled="row.usageCount > 0">
              删除
            </t-button>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- Create/Edit Dialog -->
    <t-dialog v-model:visible="dialogVisible" :header="dialogMode === 'create' ? '添加标签' : '编辑标签'"
      :confirm-btn="{ content: '保存', theme: 'primary', loading: saving }" :cancel-btn="{ content: '取消' }" width="500px"
      @confirm="handleSave">
      <t-form ref="formRef" :data="formData" :rules="formRules" label-width="100px" @submit="handleSave">
        <t-form-item label="标签名称" name="name">
          <t-input v-model="formData.name" placeholder="请输入标签名称" />
        </t-form-item>

        <t-form-item label="标签标识" name="slug">
          <t-input v-model="formData.slug" placeholder="请输入标签标识（英文）" @blur="handleSlugBlur" />
          <template #tips>URL友好的标识符，只能包含字母、数字、下划线和连字符</template>
        </t-form-item>

        <t-form-item label="描述" name="description">
          <t-textarea v-model="formData.description" placeholder="请输入标签描述（可选）" :autosize="{ minRows: 2, maxRows: 4 }" />
        </t-form-item>

        <t-form-item label="颜色" name="color">
          <t-input v-model="formData.color" type="color" />
        </t-form-item>

        <t-form-item v-if="dialogMode === 'edit'" label="状态" name="status">
          <t-radio-group v-model="formData.status">
            <t-radio value="active">活跃</t-radio>
            <t-radio value="inactive">未激活</t-radio>
          </t-radio-group>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { contentApi } from '@/api'
import { formatDate } from '@/utils/date'

// Search form
const searchForm = reactive({
  name: '',
  status: undefined,
  sortBy: 'createdAt'
})

// Table data
const loading = ref(false)
const tableData = ref([])

// Pagination
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// Dialog
const dialogVisible = ref(false)
const dialogMode = ref < 'create' | 'edit' > ('create')
const currentTag = ref < Tag | null > (null)

// Form
const formRef = ref()
const formData = reactive({
  name: '',
  slug: '',
  description: '',
  color: '#1890ff',
  status: 'active'
})

const saving = ref(false)

// Statistics
const activeCount = computed(() => {
  return tableData.value.filter(tag => tag.status === 'active').length
})

const totalUsage = computed(() => {
  return tableData.value.reduce((sum, tag) => sum + tag.usageCount, 0)
})

// Table columns
const columns = [
  {
    colKey: 'name',
    title: '标签名称',
    width: 200
  },
  {
    colKey: 'slug',
    title: '标识',
    width: 150
  },
  {
    colKey: 'description',
    title: '描述',
    width: 250,
    ellipsis: true
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100
  },
  {
    colKey: 'usageCount',
    title: '使用次数',
    width: 120,
    align: 'center'
  },
  {
    colKey: 'createdAt',
    title: '创建时间',
    width: 150
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 150,
    fixed: 'right'
  }
]

// Form validation rules
const formRules = {
  name: [
    { required: true, message: '请输入标签名称', type: 'error' }
  ],
  slug: [
    { required: true, message: '请输入标签标识', type: 'error' },
    {
      pattern: /^[a-z0-9_-]+$/,
      message: '只能包含小写字母、数字、下划线和连字符',
      type: 'error'
    }
  ]
}

// Fetch tags
const fetchTags = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current,
      size: pagination.pageSize,
      sortBy: searchForm.sortBy
    }

    if (searchForm.name) params.name = searchForm.name
    if (searchForm.status) params.status = searchForm.status

    const response = await contentApi.getTags(params)
    if (response.code === 200) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    } else {
      MessagePlugin.error(response.message || '获取标签失败')
    }
  } catch (error) {
    MessagePlugin.error(error.message || '获取标签失败')
  } finally {
    loading.value = false
  }
}

// Auto-generate slug from name
const handleSlugBlur = () => {
  if (!formData.slug && formData.name) {
    formData.slug = formData.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '')
  }
}

// Handlers
const handleSearch = () => {
  pagination.current = 1
  fetchTags()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = undefined
  searchForm.sortBy = 'createdAt'
  handleSearch()
}

const handlePageChange = (pageInfo) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  fetchTags()
}

const handleCreate = () => {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (tag) => {
  dialogMode.value = 'edit'
  currentTag.value = tag
  formData.name = tag.name
  formData.slug = tag.slug
  formData.description = tag.description || ''
  formData.color = tag.color || '#1890ff'
  formData.status = tag.status
  dialogVisible.value = true
}

const handleSave = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  saving.value = true
  try {
    const data = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || undefined,
      color: formData.color || undefined
    }

    if (dialogMode.value === 'edit') {
      ; (data).status = formData.status
    }

    let response
    if (dialogMode.value === 'create') {
      response = await contentApi.createTag(data)
    } else if (currentTag.value) {
      response = await contentApi.updateTag(currentTag.value.id, data)
    }

    if (response && response.code === 200) {
      MessagePlugin.success(dialogMode.value === 'create' ? '创建成功' : '更新成功')
      dialogVisible.value = false
      fetchTags()
    } else {
      MessagePlugin.error(response?.message || '保存失败')
    }
  } catch (error) {
    MessagePlugin.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = async (tag) => {
  if (tag.usageCount > 0) {
    MessagePlugin.warning('该标签已被使用，无法删除')
    return
  }

  const result = await DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除标签"${tag.name}"吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消'
  })

  if (!result) return

  try {
    const response = await contentApi.deleteTag(tag.id)
    if (response.code === 200) {
      MessagePlugin.success('删除成功')
      fetchTags()
    } else {
      MessagePlugin.error(response.message || '删除失败')
    }
  } catch (error) {
    MessagePlugin.error(error.message || '删除失败')
  }
}

const resetForm = () => {
  formData.name = ''
  formData.slug = ''
  formData.description = ''
  formData.color = '#1890ff'
  formData.status = 'active'
  formRef.value?.clearValidate()
}

// Initialize
onMounted(() => {
  fetchTags()
})
</script>

<style scoped lang="less">
.tag-view {
  padding: 20px;
}

.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }
}

.search-form {
  margin-bottom: 16px;
  padding: 16px;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
}

.stats-row {
  margin-bottom: 16px;
  padding: 12px 16px;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);

  strong {
    color: var(--td-brand-color);
    font-size: 16px;
  }
}
</style>
