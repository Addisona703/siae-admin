<template>
  <div class="content-list-view">
    <!-- 顶部标题区 -->
    <div class="header-section">
      <div>
        <h1 class="page-title">内容管理</h1>
        <p class="page-description">管理文章、笔记、视频等资源内容</p>
      </div>
      <t-button theme="primary" @click="handleAdd">
        <template #icon><t-icon name="add" /></template>
        新建内容
      </t-button>
    </div>

    <!-- 搜索筛选区 -->
    <t-card :bordered="false" class="search-card">
      <t-form layout="inline" :data="searchForm" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="关键词" name="title">
          <t-input v-model="searchForm.keyword" placeholder="搜索标题" style="width: 240px" clearable>
            <template #suffix-icon><t-icon name="search" /></template>
          </t-input>
        </t-form-item>

        <t-form-item label="内容类型" name="type">
          <t-select v-model="searchForm.type" placeholder="全部类型" clearable style="width: 160px">
            <t-option v-for="(label, val) in TYPE_MAP" :key="val" :value="Number(val)" :label="label.text">
              <t-space align="center" :size="4">
                <t-icon :name="label.icon" />
                <span>{{ label.text }}</span>
              </t-space>
            </t-option>
          </t-select>
        </t-form-item>

        <!-- <t-form-item label="分类" name="categoryId">
          <t-select v-model="searchForm.categoryId" placeholder="全部分类" clearable style="width: 160px">
            <t-option v-for="cate in categories" :key="cate.id" :value="cate.id" :label="cate.name"></t-option>
          </t-select>
        </t-form-item> -->

        <t-form-item label="状态" name="status">
          <t-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 140px">
            <t-option v-for="(conf, val) in STATUS_MAP" :key="val" :value="Number(val)" :label="conf.text"></t-option>
          </t-select>
        </t-form-item>

        <!-- <t-form-item label="作者" name="uploadedBy">
          <t-input-number v-model="searchForm.uploadedBy" placeholder="作者ID" clearable style="width: 120px"
            theme="normal" />
        </t-form-item> -->

        <t-form-item>
          <t-space size="small">
            <t-button theme="primary" type="submit">
              <template #icon><t-icon name="search" /></template>
              查询
            </t-button>
            <t-button theme="default" type="reset" variant="base">
              <template #icon><t-icon name="refresh" /></template>
              重置
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-card>

    <!-- 数据表格区 -->
    <t-card :bordered="false" class="table-card">
      <!-- 批量操作栏 -->
      <div class="batch-actions" v-if="selectedRowKeys.length > 0">
        <div class="selected-info">
          已选择 <span class="count">{{ selectedRowKeys.length }}</span> 项
        </div>
        <t-space>
          <t-button theme="danger" variant="outline" size="small" @click="handleBatchDelete">批量删除</t-button>
          <t-button variant="outline" size="small">批量审核</t-button>
        </t-space>
      </div>

      <t-table row-key="id" :data="tableData" :columns="columns" :loading="loading" :selected-row-keys="selectedRowKeys"
        @select-change="onSelectChange" :pagination="pagination" @page-change="onPageChange" stripe hover>
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
            <!-- 封面图 -->
            <div class="cover-wrapper">
              <img v-if="row.cover" :src="row.cover" class="cover-image" />
              <div v-else class="cover-placeholder">
                <t-icon name="image" />
              </div>
              <!-- 视频时长标记 -->
              <span v-if="row.type === 4" class="duration-badge">05:20</span>
            </div>
            <div class="content-text">
              <div class="content-title" :title="row.title" @click="handleDetail(row)">{{ row.title }}</div>
              <div class="content-desc">{{ row.description || '暂无摘要' }}</div>
            </div>
          </div>
        </template>

        <!-- 自定义：数据统计列 -->
        <template #stats="{ row }">
          <div class="stats-wrapper">
            <span class="stat-item" title="浏览量">
              <t-icon name="browse" /> {{ formatNumber(row.viewCount) }}
            </span>
            <span class="stat-item" title="点赞数">
              <t-icon name="thumb-up" /> {{ formatNumber(row.likeCount) }}
            </span>
            <span class="stat-item" title="评论数">
              <t-icon name="chat" /> {{ row.commentCount }}
            </span>
          </div>
        </template>

        <!-- 自定义：状态列 -->
        <template #status="{ row }">
          <t-badge :dot="row.status === 1" :count="row.status === 1 ? '待审' : 0" :offset="[-5, 5]">
            <t-tag shape="round" :theme="STATUS_MAP[row.status]?.theme" variant="light-outline">
              {{ STATUS_MAP[row.status]?.text }}
            </t-tag>
          </t-badge>
        </template>

        <!-- 自定义：操作列 -->
        <template #op="{ row }">
          <div class="op-btns">
            <span class="op-btn default" @click="handleDetail(row)">
              <t-icon name="file" /> 详情
            </span>
            <span class="op-btn primary" @click="handleEdit(row)">
              <t-icon name="edit" /> 编辑
            </span>
            <t-popconfirm content="确认删除该内容吗？" @confirm="handleDelete(row)">
              <span class="op-btn danger">
                <t-icon name="delete" /> 删除
              </span>
            </t-popconfirm>
          </div>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { getAllContentList } from '@/api/content/content'
import { contentApi } from '@/api/content'

const router = useRouter()

// 类型映射
const TYPE_MAP = {
  0: { text: '文章', icon: 'article', theme: 'primary' },
  1: { text: '笔记', icon: 'note', theme: 'success' },
  2: { text: '提问', icon: 'question', theme: 'warning' },
  3: { text: '文件', icon: 'file', theme: 'default' },
  4: { text: '视频', icon: 'video', theme: 'danger' }
}

// 状态映射
const STATUS_MAP = {
  0: { text: '草稿', theme: 'default' },
  1: { text: '待审核', theme: 'warning' },
  2: { text: '已发布', theme: 'success' },
}

// 下拉菜单选项
const dropdownOptions = [
  { content: '查看详情', value: 1 },
  { content: '审核记录', value: 2 }
]

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedRowKeys = ref([])
const categories = ref([])

// 搜索表单
const searchForm = reactive({
  keyword: '',        // 关键词搜索（标题）
  type: undefined,    // 内容类型：0=article, 1=note, 2=question, 3=file, 4=video
  categoryId: undefined,  // 分类ID
  status: undefined,  // 状态：0=草稿, 1=待审核, 2=已发布, 3=已删除
  uploadedBy: undefined  // 上传者ID
})

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true
})

// 表格列定义
const columns = [
  // { colKey: 'row-select', type: 'multiple', width: 50 },
  // { colKey: 'id', title: 'ID', width: 60, align: 'center' },
  { colKey: 'title', title: '内容信息', minWidth: 280 },
  { colKey: 'type', title: '类型', width: 100 },
  { colKey: 'categoryName', title: '分类', width: 100 },
  { colKey: 'uploadedByName', title: '作者', width: 100 },
  { colKey: 'stats', title: '数据统计', width: 160 },
  { colKey: 'status', title: '状态', width: 90 },
  { colKey: 'createdAt', title: '创建时间', width: 160 },
  { colKey: 'op', title: '操作', fixed: 'right', width: 140 }
]

// 类型字符串到数字的映射
const TYPE_STRING_TO_NUMBER = {
  'article': 0,
  'note': 1,
  'question': 2,
  'file': 3,
  'video': 4
}

// 状态字符串到数字的映射
const STATUS_STRING_TO_NUMBER = {
  '草稿': 0,
  '待审核': 1,
  '已发布': 2,
  '已删除': 3
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const param = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      params: {}
    }

    // 只添加非空的查询参数
    if (searchForm.keyword) param.params.keyword = searchForm.keyword
    if (searchForm.type !== undefined) param.params.type = searchForm.type
    if (searchForm.categoryId) param.params.categoryId = searchForm.categoryId
    if (searchForm.status !== undefined) param.params.status = searchForm.status
    if (searchForm.uploadedBy) param.params.uploadedBy = searchForm.uploadedBy

    // console.log('查询参数:', param)
    const res = await getAllContentList(param)

    if (res.code === 200 && res.data) {
      // 处理后端返回的数据，转换字符串类型为数字
      tableData.value = res.data.records?.map((item) => {
        // 转换 type（可能是字符串或数字）
        let typeNum = typeof item.type === 'string'
          ? TYPE_STRING_TO_NUMBER[item.type] ?? 0
          : item.type

        // 转换 status（可能是字符串或数字）
        let statusNum = typeof item.status === 'string'
          ? STATUS_STRING_TO_NUMBER[item.status] ?? 0
          : item.status

        // 根据 categoryId 从分类列表中查找分类名称（前端补充）
        const category = categories.value.find(c => c.id === item.categoryId)
        const categoryName = item.categoryName || category?.name || '-'

        return {
          id: item.id,
          title: item.title,
          description: item.description,
          type: typeNum,
          categoryId: item.categoryId,
          categoryName: categoryName,
          uploadedByName: item.authorNickname || '-',
          status: statusNum,
          cover: item.coverUrl || null,
          viewCount: item.statistics?.viewCount || 0,
          likeCount: item.statistics?.likeCount || 0,
          favoriteCount: item.statistics?.favoriteCount || 0,
          commentCount: item.statistics?.commentCount || 0,
          createdAt: item.createTime,
          updatedAt: item.updateTime
        }
      }) || []

      pagination.total = res.data.total || 0
    } else {
      MessagePlugin.error(res.message || '获取内容列表失败')
    }
  } catch (error) {
    console.error('获取内容列表失败:', error)
    MessagePlugin.error(error.message || '获取内容列表失败')
  } finally {
    loading.value = false
  }
}

// 加载分类
const loadCategories = async () => {
  try {
    // 使用分页接口获取分类列表
    const pageDTO = {
      pageNum: 1,
      pageSize: 100, // 获取所有分类
      params: {
        enable: 1 // 只获取启用的分类
      }
    }

    // console.log('加载分类列表，请求参数:', pageDTO)
    const res = await contentApi.getCategoryPage(pageDTO)
    // console.log('分类列表响应:', res)

    if (res.code === 200 && res.data) {
      categories.value = res.data.records || []
      // console.log('分类列表加载成功，数量:', categories.value.length, categories.value)
    } else {
      console.error('分类列表加载失败:', res.message)
    }
  } catch (error) {
    console.error('获取分类列表失败:', error)
  }
}

// 事件处理
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = undefined
  searchForm.categoryId = undefined
  searchForm.status = undefined
  searchForm.uploadedBy = undefined
  pagination.current = 1
  fetchData()
}

const onPageChange = (pageInfo) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  fetchData()
}

const onSelectChange = (value) => {
  selectedRowKeys.value = value
}

const handleEdit = (row) => {
  router.push({
    name: 'ContentEdit',
    params: { id: row.id },
    query: { type: row.type }
  })
}

const handleDetail = (row) => {
  router.push({
    name: 'ContentDetail',
    params: { id: row.id }
  })
}

const handleDelete = async (row) => {
  try {
    // 移至垃圾箱 (isTrash=1)
    const res = await contentApi.deleteContent(row.id, 1)
    if (res.code === 200) {
      MessagePlugin.success('删除成功')
      fetchData()
    } else {
      MessagePlugin.error(res.message || '删除失败')
    }
  } catch (error) {
    console.error('删除内容失败:', error)
    MessagePlugin.error(error.message || '删除失败')
  }
}

const handleBatchDelete = async () => {
  try {
    // 批量删除
    const promises = selectedRowKeys.value.map(id =>
      contentApi.deleteContent(id, 1)
    )
    await Promise.all(promises)
    MessagePlugin.success(`已删除 ${selectedRowKeys.value.length} 项数据`)
    selectedRowKeys.value = []
    fetchData()
  } catch (error) {
    console.error('批量删除失败:', error)
    MessagePlugin.error(error.message || '批量删除失败')
  }
}

const handleAdd = () => {
  router.push({ name: 'ContentCreate' })
}

// 工具函数
const formatNumber = (num) => {
  return num > 1000 ? (num / 1000).toFixed(1) + 'k' : num
}

onMounted(async () => {
  // 先加载分类列表，再加载内容列表（以便前端补充分类名称）
  await loadCategories()
  fetchData()
})
</script>

<style scoped lang="less">
.content-list-view {
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

.search-card,
.table-card {
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
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

// 内容信息样式
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
    position: relative;

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

    .duration-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      font-size: 10px;
      padding: 2px 4px;
      transform: scale(0.75);
      transform-origin: bottom right;
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
      cursor: pointer;

      &:hover {
        color: var(--td-brand-color);
      }
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

// 统计数据样式
.stats-wrapper {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--td-text-color-secondary);

  .stat-item {
    display: flex;
    align-items: center;
    gap: 2px;
  }
}

// 表格样式优化
:deep(.t-table) {
  .t-table__header th {
    white-space: nowrap;
  }
}

.op-btns {
  display: flex;
  gap: 8px;
  
  .op-btn {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 14px;
    transition: color 0.2s;
    
    &.default {
      color: var(--td-text-color-secondary);
      &:hover {
        color: var(--td-brand-color);
      }
    }
    
    &.primary {
      color: var(--td-brand-color);
      &:hover {
        color: var(--td-brand-color-hover);
      }
    }
    
    &.danger {
      color: var(--td-error-color);
      &:hover {
        color: var(--td-error-color-hover);
      }
    }
  }
}
</style>
