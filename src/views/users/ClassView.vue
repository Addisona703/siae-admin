<template>
  <div class="class-view">
    <t-card :bordered="false">
      <template #header>
        <div class="header-wrapper">
          <h3>班级管理</h3>
          <t-space>
            <t-button theme="default" @click="handleToggleView">
              <template #icon><t-icon :name="viewMode === 'list' ? 'view-module' : 'view-list'" /></template>
              {{ viewMode === 'list' ? '层级视图' : '列表视图' }}
            </t-button>
            <t-button theme="primary" @click="handleCreate">
              <template #icon><t-icon name="add" /></template>
              添加班级
            </t-button>
          </t-space>
        </div>
      </template>

      <!-- List View -->
      <div v-if="viewMode === 'list'">
        <!-- Search Form -->
        <t-form :data="searchForm" layout="inline" class="search-form">
          <t-form-item label="班级名称" name="name">
            <t-input
              v-model="searchForm.name"
              placeholder="按班级名称搜索"
              clearable
              @clear="handleSearch"
              @enter="handleSearch"
            />
          </t-form-item>
          <t-form-item label="学院" name="college">
            <t-input
              v-model="searchForm.college"
              placeholder="按学院搜索"
              clearable
              @clear="handleSearch"
              @enter="handleSearch"
            />
          </t-form-item>
          <t-form-item label="专业" name="major">
            <t-input
              v-model="searchForm.major"
              placeholder="按专业搜索"
              clearable
              @clear="handleSearch"
              @enter="handleSearch"
            />
          </t-form-item>
          <t-form-item label="入学年份" name="enrollmentYear">
            <t-input-number
              v-model="searchForm.enrollmentYear"
              placeholder="入学年份"
              clearable
              :min="2000"
              :max="2100"
              style="width: 150px;"
              @change="handleSearch"
            />
          </t-form-item>
          <t-form-item label="状态" name="status">
            <t-select
              v-model="searchForm.status"
              placeholder="全部"
              clearable
              @change="handleSearch"
            >
              <t-option value="active" label="活跃" />
              <t-option value="inactive" label="未激活" />
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

        <!-- Table -->
        <t-table
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          stripe
          hover
          @page-change="handlePageChange"
        >
          <template #status="{ row }">
            <t-tag :theme="row.status === 'active' ? 'success' : 'default'">
              {{ row.status === 'active' ? '活跃' : '未激活' }}
            </t-tag>
          </template>

          <template #createdAt="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>

          <template #operation="{ row }">
            <t-space>
              <t-button
                theme="primary"
                variant="text"
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </t-button>
              <t-button
                theme="danger"
                variant="text"
                size="small"
                @click="handleDelete(row)"
              >
                删除
              </t-button>
            </t-space>
          </template>
        </t-table>
      </div>

      <!-- Hierarchy View -->
      <div v-else class="hierarchy-view">
        <t-loading :loading="loading" size="large">
          <div v-if="Object.keys(hierarchyData).length > 0" class="hierarchy-content">
            <t-collapse :default-value="Object.keys(hierarchyData)">
              <t-collapse-panel
                v-for="(majors, college) in hierarchyData"
                :key="college"
                :value="college"
                :header="college"
              >
                <div class="college-content">
                  <t-collapse :default-value="Object.keys(majors)">
                    <t-collapse-panel
                      v-for="(classes, major) in majors"
                      :key="`${college}-${major}`"
                      :value="`${college}-${major}`"
                      :header="major"
                    >
                      <div class="major-content">
                        <t-space direction="vertical" style="width: 100%;">
                          <t-card
                            v-for="classItem in classes"
                            :key="classItem.id"
                            :bordered="true"
                            size="small"
                            class="class-card"
                          >
                            <div class="class-info">
                              <div class="class-header">
                                <h4>{{ classItem.name }}</h4>
                                <t-tag :theme="classItem.status === 'active' ? 'success' : 'default'">
                                  {{ classItem.status === 'active' ? '活跃' : '未激活' }}
                                </t-tag>
                              </div>
                              <div class="class-details">
                                <p><strong>入学年份:</strong> {{ classItem.enrollmentYear }}</p>
                                <p><strong>班级编号:</strong> {{ classItem.classNumber }}</p>
                                <p v-if="classItem.description"><strong>描述:</strong> {{ classItem.description }}</p>
                              </div>
                              <div class="class-actions">
                                <t-button
                                  theme="primary"
                                  variant="outline"
                                  size="small"
                                  @click="handleEdit(classItem)"
                                >
                                  编辑
                                </t-button>
                                <t-button
                                  theme="danger"
                                  variant="outline"
                                  size="small"
                                  @click="handleDelete(classItem)"
                                >
                                  删除
                                </t-button>
                              </div>
                            </div>
                          </t-card>
                        </t-space>
                      </div>
                    </t-collapse-panel>
                  </t-collapse>
                </div>
              </t-collapse-panel>
            </t-collapse>
          </div>
          <t-empty v-else description="暂无班级数据" />
        </t-loading>
      </div>
    </t-card>

    <!-- Create/Edit Dialog -->
    <t-dialog
      v-model:visible="dialogVisible"
      :header="dialogMode === 'create' ? '添加班级' : '编辑班级'"
      :confirm-btn="{ content: '保存', theme: 'primary', loading: saving }"
      :cancel-btn="{ content: '取消' }"
      width="600px"
      @confirm="handleSave"
    >
      <t-form
        ref="formRef"
        :data="formData"
        :rules="formRules"
        label-width="100px"
        @submit="handleSave"
      >
        <t-form-item label="班级名称" name="name">
          <t-input v-model="formData.name" placeholder="请输入班级名称" />
        </t-form-item>

        <t-form-item label="学院" name="college">
          <t-input v-model="formData.college" placeholder="请输入学院" />
        </t-form-item>

        <t-form-item label="专业" name="major">
          <t-input v-model="formData.major" placeholder="请输入专业" />
        </t-form-item>

        <t-form-item label="入学年份" name="enrollmentYear">
          <t-input-number
            v-model="formData.enrollmentYear"
            placeholder="请输入入学年份"
            :min="2000"
            :max="2100"
            style="width: 100%;"
          />
        </t-form-item>

        <t-form-item label="班级编号" name="classNumber">
          <t-input-number
            v-model="formData.classNumber"
            placeholder="请输入班级编号"
            :min="1"
            style="width: 100%;"
          />
        </t-form-item>

        <t-form-item label="描述" name="description">
          <t-textarea
            v-model="formData.description"
            placeholder="请输入描述（可选）"
            :autosize="{ minRows: 3, maxRows: 6 }"
          />
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
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { userApi } from '@/api'

// State
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('create')
const viewMode = ref('list')
const tableData = ref([])
const hierarchyData = ref({})
const formRef = ref()

// Search form
const searchForm = reactive({
  name: '',
  college: '',
  major: '',
  enrollmentYear: undefined,
  status: undefined
})

// Pagination
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

// Form data
const formData = ref({
  id: '',
  name: '',
  college: '',
  major: '',
  enrollmentYear: new Date().getFullYear(),
  classNumber: 1,
  description: '',
  status: 'active'
})

// Form validation rules
const formRules = {
  name: [
    { required: true, message: '班级名称不能为空', trigger: 'blur' }
  ],
  college: [
    { required: true, message: '学院不能为空', trigger: 'blur' }
  ],
  major: [
    { required: true, message: '专业不能为空', trigger: 'blur' }
  ],
  enrollmentYear: [
    { required: true, message: '入学年份不能为空', trigger: 'change' }
  ],
  classNumber: [
    { required: true, message: '班级编号不能为空', trigger: 'change' }
  ]
}

// Table columns
const columns = [
  { colKey: 'name', title: '班级名称', width: 200 },
  { colKey: 'college', title: '学院', width: 150 },
  { colKey: 'major', title: '专业', width: 150 },
  { colKey: 'enrollmentYear', title: '入学年份', width: 120 },
  { colKey: 'classNumber', title: '班级编号', width: 100 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'description', title: '描述', ellipsis: true },
  { colKey: 'createdAt', title: '创建时间', width: 180 },
  { colKey: 'operation', title: '操作', width: 150, fixed: 'right' }
]

// Methods
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const loadClasses = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current || 1,
      size: pagination.pageSize || 10
    }

    if (searchForm.name) params.name = searchForm.name
    if (searchForm.college) params.college = searchForm.college
    if (searchForm.major) params.major = searchForm.major
    if (searchForm.enrollmentYear) params.enrollmentYear = searchForm.enrollmentYear
    if (searchForm.status) params.status = searchForm.status

    const response = await userApi.getClasses(params)
    if (response.code === 200) {
      tableData.value = response.data.items
      pagination.total = response.data.total
    } else {
      MessagePlugin.error(response.message || '加载班级列表失败')
    }
  } catch (error) {
    MessagePlugin.error(error.message || '加载班级列表失败')
  } finally {
    loading.value = false
  }
}

const loadHierarchy = async () => {
  loading.value = true
  try {
    const response = await userApi.getClassHierarchy()
    if (response.code === 200) {
      hierarchyData.value = response.data
    } else {
      MessagePlugin.error(response.message || '加载班级层级失败')
    }
  } catch (error) {
    MessagePlugin.error(error.message || '加载班级层级失败')
  } finally {
    loading.value = false
  }
}

const handleToggleView = () => {
  viewMode.value = viewMode.value === 'list' ? 'hierarchy' : 'list'
  if (viewMode.value === 'hierarchy') {
    loadHierarchy()
  } else {
    loadClasses()
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadClasses()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.college = ''
  searchForm.major = ''
  searchForm.enrollmentYear = undefined
  searchForm.status = undefined
  handleSearch()
}

const handlePageChange = (pageInfo: any) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  loadClasses()
}

const handleCreate = () => {
  dialogMode.value = 'create'
  formData.value = {
    id: '',
    name: '',
    college: '',
    major: '',
    enrollmentYear: new Date().getFullYear(),
    classNumber: 1,
    description: '',
    status: 'active'
  }
  dialogVisible.value = true
}

const handleEdit = (classItem: Class) => {
  dialogMode.value = 'edit'
  formData.value = {
    id: classItem.id,
    name: classItem.name,
    college: classItem.college,
    major: classItem.major,
    enrollmentYear: classItem.enrollmentYear,
    classNumber: classItem.classNumber,
    description: classItem.description || '',
    status: classItem.status
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  saving.value = true
  try {
    let response
    if (dialogMode.value === 'create') {
      const data = {
        name: formData.value.name,
        college: formData.value.college,
        major: formData.value.major,
        enrollmentYear: formData.value.enrollmentYear,
        classNumber: formData.value.classNumber,
        description: formData.value.description || undefined
      }
      response = await userApi.createClass(data)
    } else {
      const data = {
        name: formData.value.name,
        college: formData.value.college,
        major: formData.value.major,
        enrollmentYear: formData.value.enrollmentYear,
        classNumber: formData.value.classNumber,
        description: formData.value.description || undefined,
        status: formData.value.status
      }
      response = await userApi.updateClass(formData.value.id, data)
    }

    if (response.code === 200) {
      MessagePlugin.success(
        dialogMode.value === 'create' ? '班级创建成功' : '班级更新成功'
      )
      dialogVisible.value = false
      if (viewMode.value === 'list') {
        await loadClasses()
      } else {
        await loadHierarchy()
      }
    } else {
      MessagePlugin.error(response.message || '操作失败')
    }
  } catch (error) {
    MessagePlugin.error(error.message || '操作失败')
  } finally {
    saving.value = false
  }
}

const handleDelete = (classItem) => {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除班级 "${classItem.name}" 吗？此操作无法撤销。`,
    confirmBtn: { content: '删除', theme: 'danger' },
    cancelBtn: '取消',
    onConfirm: async () => {
      try {
        const response = await userApi.deleteClass(classItem.id)
        if (response.code === 200) {
          MessagePlugin.success('班级删除成功')
          if (viewMode.value === 'list') {
            await loadClasses()
          } else {
            await loadHierarchy()
          }
        } else {
          MessagePlugin.error(response.message || '删除班级失败')
        }
      } catch (error) {
        MessagePlugin.error(error.message || '删除班级失败')
      }
      confirmDialog.destroy()
    }
  })
}

// Lifecycle
onMounted(() => {
  loadClasses()
})
</script>

<style scoped>
.class-view {
  padding: 24px;
}

.header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-wrapper h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.search-form {
  margin-bottom: 16px;
}

.hierarchy-view {
  margin-top: 16px;
}

.hierarchy-content {
  padding: 16px 0;
}

.college-content,
.major-content {
  padding: 8px 0;
}

.class-card {
  margin-bottom: 12px;
}

.class-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.class-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.class-details p {
  margin: 4px 0;
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.class-actions {
  display: flex;
  gap: 8px;
}
</style>
