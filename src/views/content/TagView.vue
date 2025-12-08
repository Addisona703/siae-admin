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
        </t-space>
      </div>

      <!-- Table -->
      <t-table :data="tableData" :columns="columns" :loading="loading" :pagination="pagination" row-key="id" stripe
        hover @page-change="handlePageChange">
        <template #name="{ row }">
          <t-tag theme="primary" variant="outline">
            {{ row.name }}
          </t-tag>
        </template>

        <template #createTime="{ row }">
          {{ formatDate(row.createTime, 'YYYY-MM-DD HH:mm') }}
        </template>

        <template #updateTime="{ row }">
          {{ formatDate(row.updateTime, 'YYYY-MM-DD HH:mm') }}
        </template>

        <template #operation="{ row }">
          <t-space>
            <t-button theme="primary" variant="text" size="small" @click="handleEdit(row)">
              编辑
            </t-button>
            <t-button theme="danger" variant="text" size="small" @click="handleDelete(row)">
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

        <t-form-item label="描述" name="description">
          <t-textarea v-model="formData.description" placeholder="请输入标签描述（可选）" :autosize="{ minRows: 2, maxRows: 4 }" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { contentApi } from '@/api'
import { formatDate } from '@/utils/date'

// Search form
const searchForm = reactive({
  name: ''
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

// 对话框
const dialogVisible = ref(false)
const dialogMode = ref('create') // 'create' | 'edit'
const currentTag = ref(null)

// 表单
const formRef = ref()
const formData = reactive({
  name: '',
  description: ''
})

const saving = ref(false)



// 表格列
const columns = [
  {
    colKey: 'id',
    title: 'ID',
    width: 80,
    align: 'center'
  },
  {
    colKey: 'name',
    title: '标签名称',
    width: 200
  },
  {
    colKey: 'description',
    title: '描述',
    width: 300,
    ellipsis: true
  },
  {
    colKey: 'createTime',
    title: '创建时间',
    width: 180
  },
  {
    colKey: 'updateTime',
    title: '更新时间',
    width: 180
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
  ]
}

// Fetch tags
const fetchTags = async () => {
  loading.value = true
  try {
    const param = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      params: {}
    }

    if (searchForm.name) {
      param.params.name = searchForm.name
    }

    console.log('请求参数:', param)
    const response = await contentApi.getTagPage(param)
    console.log('响应数据:', response)
    
    if (response.code === 200 && response.data) {
      tableData.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      MessagePlugin.error(response.message || '获取标签失败')
    }
  } catch (error) {
    console.error('获取标签失败:', error)
    MessagePlugin.error(error.message || '获取标签失败')
  } finally {
    loading.value = false
  }
}

// Handlers
const handleSearch = () => {
  pagination.current = 1
  fetchTags()
}

const handleReset = () => {
  searchForm.name = ''
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
  formData.description = tag.description || ''
  dialogVisible.value = true
}

const handleSave = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  saving.value = true
  try {
    const data = {
      name: formData.name,
      description: formData.description || undefined
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
  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除标签"${tag.name}"吗？`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    onConfirm: async () => {
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
      confirmDialog.destroy()
    }
  })
}

const resetForm = () => {
  formData.name = ''
  formData.description = ''
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
