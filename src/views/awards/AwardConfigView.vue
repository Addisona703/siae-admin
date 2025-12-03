<template>
  <div class="award-config-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">奖项基础设置</h2>
      <p class="page-description">配置系统中可用的奖项等级与类别，这些配置将作为下拉选项供业务使用。</p>
    </div>

    <!-- 主要内容卡片 -->
    <t-card :bordered="false" class="content-card">
      <!-- Tabs 切换 -->
      <t-tabs v-model="currentTab" @change="handleTabChange">
        <t-tab-panel value="level" label="奖项等级">
          <template #label>
            <div class="tab-label">
              <t-icon name="medal" />
              <span>奖项等级</span>
            </div>
          </template>
        </t-tab-panel>
        <t-tab-panel value="type" label="奖项类型">
          <template #label>
            <div class="tab-label">
              <t-icon name="tag" />
              <span>奖项类型</span>
            </div>
          </template>
        </t-tab-panel>
      </t-tabs>

      <!-- 工具栏 -->
      <div class="toolbar">
        <t-input v-model="searchQuery" placeholder="搜索名称..." clearable class="search-input">
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>
        <t-button theme="primary" @click="openModal()">
          <template #icon>
            <t-icon name="add" />
          </template>
          新增{{ tabNameCN }}
        </t-button>
      </div>

      <!-- 表格 -->
      <t-table :data="filteredList" :columns="columns" :loading="loading" row-key="id" :hover="true" stripe
        class="data-table">
        <template #order="{ row }">
          <t-tag theme="default" variant="light">{{ getOrderId(row) }}</t-tag>
        </template>

        <template #refCount="{ row }">
          <t-button v-if="getRefCount(row) > 0" theme="primary" variant="text" size="small"
            @click="handleViewRecords(row)">
            {{ getRefCount(row) }} 条记录
            <template #suffix>
              <t-icon name="arrow-up" />
            </template>
          </t-button>
          <span v-else style="color: var(--td-text-color-placeholder)">-</span>
        </template>

        <template #action="{ row }">
          <t-space :size="8">
            <t-button theme="primary" variant="text" size="small" @click="openModal(row)">
              编辑
            </t-button>
            <t-button theme="danger" variant="text" size="small" :disabled="getRefCount(row) > 0"
              @click="handleDelete(row)">
              删除
            </t-button>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 编辑/新增 弹窗 -->
    <t-dialog v-model:visible="showModal" :header="(isEdit ? '编辑' : '新增') + tabNameCN"
      :confirm-btn="{ content: '保存', theme: 'primary' }" :cancel-btn="{ content: '取消', theme: 'default' }"
      @confirm="saveData" @close="closeModal" width="500px">
      <t-form :data="formData" label-width="80px" class="dialog-form">
        <t-form-item label="名称" required>
          <t-input v-model="formData.name" :placeholder="currentTab === 'level' ? '例如：一等奖' : '例如：科技创新类'" />
        </t-form-item>

        <t-form-item label="排序ID">
          <t-input-number v-model="formData.orderId" :min="0" :step="1" style="width: 100%" />
          <template #tips>
            <span style="color: var(--td-text-color-placeholder); font-size: 12px;">
              数值越小越靠前
            </span>
          </template>
        </t-form-item>

        <t-form-item v-if="errorMsg">
          <t-alert theme="error" :message="errorMsg" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { useRouter } from 'vue-router'
import { userApi } from '@/api/user'

const router = useRouter()

// 状态
const currentTab = ref('level')
const searchQuery = ref('')
const showModal = ref(false)
const isEdit = ref(false)
const errorMsg = ref('')
const loading = ref(false)

// 数据列表
const levelData = ref([])
const typeData = ref([])

// 表单数据
const formData = ref({
  id: null,
  name: '',
  orderId: 0
})

// 表格列配置
const columns = [
  {
    colKey: 'order',
    title: '排序',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'name',
    title: '名称',
    ellipsis: true
  },
  {
    colKey: 'refCount',
    title: '关联数据量',
    width: 150,
    align: 'center'
  },
  {
    colKey: 'action',
    title: '操作',
    width: 150,
    align: 'right'
  }
]

// 计算属性
const tabNameCN = computed(() => currentTab.value === 'level' ? '奖项等级' : '奖项类型')

const currentList = computed(() =>
  currentTab.value === 'level' ? levelData.value : typeData.value
)

const filteredList = computed(() => {
  let list = currentList.value
  if (searchQuery.value) {
    list = list.filter(item => item.name.includes(searchQuery.value))
  }
  // 排序：orderId 升序
  return [...list].sort((a, b) => getOrderId(a) - getOrderId(b))
})

// 辅助函数
const getOrderId = (item) => {
  if ('rank' in item && item.rank !== undefined) {
    return item.rank
  }
  return item.orderId || 0
}

const getRefCount = (item) => {
  return item.refCount || 0
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    if (currentTab.value === 'level') {
      const result = await userApi.getAwardLevels()
      if (result.code === 200 && result.data) {
        levelData.value = result.data
      }
    } else {
      const result = await userApi.getAwardTypes()
      if (result.code === 200 && result.data) {
        typeData.value = result.data
      }
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    MessagePlugin.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 打开弹窗
const openModal = (item) => {
  errorMsg.value = ''
  if (item) {
    isEdit.value = true
    formData.value = {
      id: item.id,
      name: item.name,
      orderId: getOrderId(item)
    }
  } else {
    isEdit.value = false
    const maxOrder = Math.max(...currentList.value.map(i => getOrderId(i)), 0)
    formData.value = {
      id: null,
      name: '',
      orderId: maxOrder + 10
    }
  }
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
}

// 保存数据
const saveData = async () => {
  if (!formData.value.name.trim()) {
    errorMsg.value = '名称不能为空'
    return false
  }

  try {
    if (currentTab.value === 'level') {
      if (isEdit.value && formData.value.id) {
        await userApi.updateAwardLevel(
          Number(formData.value.id),
          formData.value.name,
          formData.value.orderId
        )
        MessagePlugin.success('更新成功')
      } else {
        await userApi.createAwardLevel({
          name: formData.value.name,
          rank: formData.value.orderId
        })
        MessagePlugin.success('创建成功')
      }
    } else {
      if (isEdit.value && formData.value.id) {
        await userApi.updateAwardType(
          Number(formData.value.id),
          formData.value.name,
          formData.value.orderId
        )
        MessagePlugin.success('更新成功')
      } else {
        await userApi.createAwardType({
          name: formData.value.name,
          category: 'default'
        })
        MessagePlugin.success('创建成功')
      }
    }

    closeModal()
    await loadData()
    return true
  } catch (error) {
    console.error('保存失败:', error)
    errorMsg.value = '保存失败，请重试'
    MessagePlugin.error('保存失败')
    return false
  }
}

// 删除数据
const handleDelete = async (item) => {
  if (getRefCount(item) > 0) {
    MessagePlugin.warning(`无法删除"${item.name}"，因为它已被使用`)
    return
  }

  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除"${item.name}"吗？此操作不可恢复。`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: async () => {
      try {
        if (currentTab.value === 'level') {
          await userApi.deleteAwardLevel(Number(item.id))
        } else {
          await userApi.deleteAwardType(Number(item.id))
        }
        MessagePlugin.success('删除成功')
        await loadData()
        confirmDialog.destroy()
      } catch (error) {
        console.error('删除失败:', error)
        MessagePlugin.error('删除失败')
      }
    }
  })
}

// 查看关联记录
const handleViewRecords = (item) => {
  // 跳转到获奖列表页面，并传递筛选参数
  const query = {}

  if (currentTab.value === 'level') {
    query.awardLevelId = item.id
    query.awardLevelName = item.name
  } else {
    query.awardTypeId = item.id
    query.awardTypeName = item.name
  }

  router.push({
    name: 'AwardList',
    query
  })
}

// 监听 tab 切换
const handleTabChange = () => {
  loadData()
}

// 初始化
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="less">
.award-config-view {
  width: 100%;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 8px;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.content-card {
  :deep(.t-card__body) {
    padding: 0;
  }

  :deep(.t-tabs) {
    padding: 0 24px;
    border-bottom: 1px solid var(--td-component-border);
  }

  .tab-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--td-component-border);

  .search-input {
    width: 300px;
  }
}

.data-table {
  :deep(.t-table) {
    border: none;
  }
}

.dialog-form {
  padding: 16px 0;
}
</style>
