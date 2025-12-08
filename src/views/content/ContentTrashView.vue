<template>
  <div class="content-trash-view">
    <!-- 顶部标题区 -->
    <div class="header-section">
      <div>
        <h1 class="page-title">回收站</h1>
        <p class="page-description">已删除的内容将在30天后自动清理</p>
      </div>
      <t-space>
        <t-button theme="default" variant="outline" @click="handleEmptyTrash" :disabled="tableData.length === 0">
          <template #icon><t-icon name="delete" /></template>
          清空回收站
        </t-button>
      </t-space>
    </div>

    <!-- 数据表格区 -->
    <t-card :bordered="false" class="table-card">
      <!-- 批量操作栏 -->
      <div class="batch-actions" v-if="selectedRowKeys.length > 0">
        <div class="selected-info">
          已选择 <span class="count">{{ selectedRowKeys.length }}</span> 项
        </div>
        <t-space>
          <t-button theme="primary" variant="outline" size="small" @click="handleBatchRestore">批量恢复</t-button>
          <t-button theme="danger" variant="outline" size="small" @click="handleBatchDelete">彻底删除</t-button>
        </t-space>
      </div>

      <t-table 
        row-key="id" 
        :data="tableData" 
        :columns="columns" 
        :loading="loading" 
        :selected-row-keys="selectedRowKeys"
        @select-change="onSelectChange" 
        :pagination="pagination" 
        @page-change="onPageChange" 
        stripe 
        hover
      >
        <!-- 自定义：类型列 -->
        <template #type="{ row }">
          <t-tag variant="light" :theme="TYPE_MAP[row.type]?.theme || 'default'">
            <template #icon>
              <t-icon :name="TYPE_MAP[row.type]?.icon" />
            </template>
            {{ TYPE_MAP[row.type]?.text }}
          </t-tag>
        </template>

        <!-- 自定义：标题/信息列 -->
        <template #title="{ row }">
          <div class="content-info">
            <div class="cover-wrapper">
              <img v-if="row.cover" :src="row.cover" class="cover-image" />
              <div v-else class="cover-placeholder">
                <t-icon name="image" />
              </div>
            </div>
            <div class="content-text">
              <div class="content-title" :title="row.title">{{ row.title }}</div>
              <div class="content-desc">{{ row.description || '暂无摘要' }}</div>
            </div>
          </div>
        </template>

        <!-- 自定义：操作列 -->
        <template #op="{ row }">
          <div class="op-btns">
            <span class="op-btn primary" @click="handleRestore(row)">
              <t-icon name="rollback" /> 恢复
            </span>
            <t-popconfirm content="彻底删除后无法恢复，确认删除吗？" @confirm="handleDelete(row)">
              <span class="op-btn danger">
                <t-icon name="delete" /> 彻底删除
              </span>
            </t-popconfirm>
          </div>
        </template>
      </t-table>

      <!-- 空状态 -->
      <div v-if="!loading && tableData.length === 0" class="empty-state">
        <t-icon name="delete" size="48px" />
        <p>回收站是空的</p>
      </div>
    </t-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { contentApi } from '@/api/content'

// 类型映射
const TYPE_MAP = {
  0: { text: '文章', icon: 'article', theme: 'primary' },
  1: { text: '笔记', icon: 'note', theme: 'success' },
  2: { text: '提问', icon: 'question', theme: 'warning' },
  3: { text: '文件', icon: 'file', theme: 'default' },
  4: { text: '视频', icon: 'video', theme: 'danger' }
}

// 类型字符串到数字的映射
const TYPE_STRING_TO_NUMBER = {
  'article': 0, 'note': 1, 'question': 2, 'file': 3, 'video': 4
}

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedRowKeys = ref([])

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true
})

// 表格列定义
const columns = [
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'title', title: '内容信息', minWidth: 280 },
  { colKey: 'type', title: '类型', width: 100 },
  { colKey: 'categoryName', title: '分类', width: 100 },
  { colKey: 'uploadedByName', title: '作者', width: 100 },
  { colKey: 'deletedAt', title: '删除时间', width: 160 },
  { colKey: 'op', title: '操作', fixed: 'right', width: 160 }
]

// 获取回收站数据
const fetchData = async () => {
  loading.value = true
  try {
    const param = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      params: { status: 3 } // 3 = TRASH 状态
    }
    const res = await contentApi.getContentPage(param)
    if (res.code === 200 && res.data) {
      tableData.value = res.data.records?.map((item) => {
        let typeNum = typeof item.type === 'string'
          ? TYPE_STRING_TO_NUMBER[item.type] ?? 0
          : item.type
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          type: typeNum,
          categoryName: item.categoryName || '-',
          uploadedByName: item.authorNickname || '-',
          cover: item.coverUrl || null,
          deletedAt: item.updateTime
        }
      }) || []
      pagination.total = res.data.total || 0
    } else {
      MessagePlugin.error(res.message || '获取回收站列表失败')
    }
  } catch (error) {
    console.error('获取回收站列表失败:', error)
    MessagePlugin.error('获取回收站列表失败')
  } finally {
    loading.value = false
  }
}

const onPageChange = (pageInfo) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  fetchData()
}

const onSelectChange = (value) => {
  selectedRowKeys.value = value
}

// 恢复单个内容
const handleRestore = async (row) => {
  try {
    const res = await contentApi.restoreContent(row.id)
    if (res.code === 200) {
      MessagePlugin.success('恢复成功')
      fetchData()
    } else {
      MessagePlugin.error(res.message || '恢复失败')
    }
  } catch (error) {
    console.error('恢复失败:', error)
    MessagePlugin.error('恢复失败')
  }
}

// 彻底删除单个内容
const handleDelete = async (row) => {
  try {
    const res = await contentApi.deleteContent(row.id, 0)
    if (res.code === 200) {
      MessagePlugin.success('已彻底删除')
      fetchData()
    } else {
      MessagePlugin.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除失败:', error)
    MessagePlugin.error('删除失败')
  }
}

// 批量恢复
const handleBatchRestore = async () => {
  try {
    const promises = selectedRowKeys.value.map(id => contentApi.restoreContent(id))
    await Promise.all(promises)
    MessagePlugin.success(`已恢复 ${selectedRowKeys.value.length} 项内容`)
    selectedRowKeys.value = []
    fetchData()
  } catch (error) {
    console.error('批量恢复失败:', error)
    MessagePlugin.error('批量恢复失败')
  }
}

// 批量彻底删除
const handleBatchDelete = () => {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认彻底删除',
    body: `确定要彻底删除选中的 ${selectedRowKeys.value.length} 项内容吗？此操作不可恢复！`,
    confirmBtn: { content: '彻底删除', theme: 'danger' },
    onConfirm: async () => {
      confirmDialog.update({ confirmBtn: { content: '删除中...', loading: true } })
      try {
        const promises = selectedRowKeys.value.map(id => contentApi.deleteContent(id, 0))
        await Promise.all(promises)
        MessagePlugin.success(`已彻底删除 ${selectedRowKeys.value.length} 项内容`)
        selectedRowKeys.value = []
        confirmDialog.destroy()
        fetchData()
      } catch (error) {
        console.error('批量删除失败:', error)
        MessagePlugin.error('批量删除失败')
        confirmDialog.update({ confirmBtn: { content: '彻底删除', theme: 'danger', loading: false } })
      }
    }
  })
}

// 清空回收站
const handleEmptyTrash = () => {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认清空回收站',
    body: '确定要清空回收站吗？所有内容将被彻底删除，此操作不可恢复！',
    confirmBtn: { content: '清空', theme: 'danger' },
    onConfirm: async () => {
      confirmDialog.update({ confirmBtn: { content: '清空中...', loading: true } })
      try {
        const promises = tableData.value.map(item => contentApi.deleteContent(item.id, 0))
        await Promise.all(promises)
        MessagePlugin.success('回收站已清空')
        confirmDialog.destroy()
        fetchData()
      } catch (error) {
        console.error('清空回收站失败:', error)
        MessagePlugin.error('清空回收站失败')
        confirmDialog.update({ confirmBtn: { content: '清空', theme: 'danger', loading: false } })
      }
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>


<style scoped lang="less">
.content-trash-view {
  padding: 24px;
  background: var(--td-bg-color-page);
  min-height: 100vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--td-text-color-primary);
  margin-bottom: 4px;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.table-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--td-bg-color-container-hover);
  border-radius: 6px;

  .selected-info {
    font-size: 14px;
    color: var(--td-text-color-secondary);
    .count {
      font-weight: 700;
      color: var(--td-brand-color);
    }
  }
}

.content-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;

  .cover-wrapper {
    width: 64px;
    height: 48px;
    background: var(--td-bg-color-container);
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid var(--td-component-border);

    .cover-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--td-text-color-placeholder);
    }
  }

  .content-text {
    flex: 1;
    min-width: 0;

    .content-title {
      font-weight: 500;
      color: var(--td-text-color-primary);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .content-desc {
      font-size: 12px;
      color: var(--td-text-color-placeholder);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.op-btns {
  display: flex;
  gap: 12px;
  
  .op-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 14px;
    transition: color 0.2s;
    
    &.primary {
      color: var(--td-brand-color);
      &:hover { color: var(--td-brand-color-hover); }
    }
    
    &.danger {
      color: var(--td-error-color);
      &:hover { color: var(--td-error-color-hover); }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--td-text-color-placeholder);
  
  p {
    margin-top: 16px;
    font-size: 14px;
  }
}
</style>
