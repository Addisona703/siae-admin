<template>
  <div class="content-audit-view">
    <!-- 顶部标题区 -->
    <div class="header-section">
      <div>
        <h1 class="page-title">内容审核</h1>
        <p class="page-description">审核待发布的内容，确保内容符合社区规范</p>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <t-card :bordered="false" class="search-card">
      <t-form layout="inline" :data="searchForm" @submit="handleSearch" @reset="handleReset">
        <t-form-item label="目标类型" name="targetType">
          <t-select v-model="searchForm.targetType" placeholder="全部类型" clearable style="width: 140px">
            <t-option :value="0" label="内容" />
            <t-option :value="1" label="评论" />
          </t-select>
        </t-form-item>

        <t-form-item label="审核状态" name="auditStatus">
          <t-select v-model="searchForm.auditStatus" placeholder="全部状态" clearable style="width: 140px">
            <t-option :value="0" label="待审核" />
            <t-option :value="1" label="已通过" />
            <t-option :value="2" label="已删除" />
          </t-select>
        </t-form-item>

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
          <t-button theme="primary" variant="outline" size="small" @click="handleBatchApprove">批量通过</t-button>
          <t-button theme="danger" variant="outline" size="small" @click="handleBatchReject">批量拒绝</t-button>
        </t-space>
      </div>

      <t-table row-key="id" :data="tableData" :columns="columns" :loading="loading" :selected-row-keys="selectedRowKeys"
        @select-change="onSelectChange" :pagination="pagination" @page-change="onPageChange" stripe hover>
        <!-- 空状态 -->
        <template #empty>
          <div class="empty-state">
            <t-icon name="check-circle" size="64px" style="color: var(--td-text-color-placeholder);" />
            <p style="margin-top: 16px; color: var(--td-text-color-secondary);">暂无审核记录</p>
            <p style="margin-top: 8px; color: var(--td-text-color-placeholder); font-size: 14px;">
              当有内容提交审核时，将在此处显示
            </p>
          </div>
        </template>
        <!-- 自定义：目标类型列 -->
        <template #targetType="{ row }">
          <t-tag variant="light" :theme="TARGET_TYPE_MAP[row.targetType]?.theme || 'default'">
            <template #icon>
              <t-icon :name="TARGET_TYPE_MAP[row.targetType]?.icon" />
            </template>
            {{ TARGET_TYPE_MAP[row.targetType]?.text || row.targetType }}
          </t-tag>
        </template>

        <!-- 自定义：审核内容列 -->
        <template #targetContent="{ row }">
          <div class="target-content">
            <!-- 内容审核 -->
            <template v-if="row.targetType === '0' || row.targetType === 0">
              <div class="content-info-row">
                <div class="cover-wrapper">
                  <img v-if="row.contentCoverUrl" :src="row.contentCoverUrl" class="cover-image" />
                  <div v-else class="cover-placeholder">
                    <t-icon name="image" />
                  </div>
                </div>
                <div class="content-text">
                  <div class="content-title">{{ row.contentTitle || '未知内容' }}</div>
                  <div class="content-meta">
                    <t-tag size="small" variant="light" :theme="CONTENT_TYPE_MAP[row.contentType]?.theme || 'default'">
                      {{ CONTENT_TYPE_MAP[row.contentType]?.text || '未知' }}
                    </t-tag>
                    <span class="author">作者ID: {{ row.contentAuthorId || '-' }}</span>
                  </div>
                </div>
              </div>
            </template>
            <!-- 评论审核 -->
            <template v-else-if="row.targetType === '1' || row.targetType === 1">
              <div class="comment-text">{{ row.commentContent || '未知评论' }}</div>
              <div class="comment-source">
                来自：<span class="source-title">{{ row.commentContentTitle || '未知内容' }}</span>
              </div>
            </template>
            <!-- 未知类型 -->
            <template v-else>
              <span class="unknown">目标ID: {{ row.targetId }}</span>
            </template>
          </div>
        </template>

        <!-- 自定义：审核状态列 -->
        <template #auditStatus="{ row }">
          <t-tag shape="round" :theme="STATUS_MAP[row.auditStatus]?.theme" variant="light-outline">
            {{ STATUS_MAP[row.auditStatus]?.text || row.auditStatus }}
          </t-tag>
        </template>

        <!-- 自定义：操作列 -->
        <template #op="{ row }">
          <div class="op-btns">
            <span class="op-btn default" @click="handleViewDetail(row)">
              <t-icon name="browse" /> 详情
            </span>
            <!-- 内容类型时显示跳转按钮 -->
            <span v-if="row.auditStatus === 1" class="op-btn default" @click="goToContentDetail(row.targetId)">
              <t-icon name="jump" /> 内容
            </span>
            <template v-if="isPending(row)">
              <span class="op-btn primary" @click="handleApprove(row)">
                <t-icon name="check" /> 通过
              </span>
              <span class="op-btn danger" @click="handleReject(row)">
                <t-icon name="close" /> 拒绝
              </span>
            </template>
          </div>
        </template>
      </t-table>
    </t-card>

    <!-- 审核弹窗 -->
    <t-dialog v-model:visible="auditDialogVisible" :header="auditDialogTitle"
      :confirm-btn="{ content: '确认', theme: auditAction === 'approve' ? 'primary' : 'danger' }"
      @confirm="handleAuditConfirm" :destroy-on-close="true" attach="body" :show-overlay="true"
      :close-on-overlay-click="true">
      <t-form :data="auditForm" :rules="auditRules" ref="auditFormRef" v-if="auditDialogVisible">
        <t-form-item label="审核意见" name="auditReason">
          <t-input v-model="auditForm.auditReason"
            :placeholder="auditAction === 'approve' ? '请输入审核通过意见（可选）' : '请输入拒绝原因'" :maxlength="500" />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 详情对话框 -->
    <t-dialog v-model:visible="detailDrawerVisible" header="审核详情" width="800px" :destroy-on-close="true" attach="body"
      placement="center" :show-overlay="true" :close-on-overlay-click="true">
      <div class="detail-content" v-if="currentDetail">
        <!-- 审核信息 -->
        <div class="detail-section">
          <h3 class="section-title">审核信息</h3>
          <div class="detail-row">
            <span class="detail-label">审核ID：</span>
            <span class="detail-value">{{ currentDetail.id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">目标类型：</span>
            <t-tag variant="light" :theme="TARGET_TYPE_MAP[currentDetail.targetType]?.theme">
              <template #icon><t-icon :name="TARGET_TYPE_MAP[currentDetail.targetType]?.icon" /></template>
              {{ TARGET_TYPE_MAP[currentDetail.targetType]?.text }}
            </t-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">审核状态：</span>
            <t-tag shape="round" :theme="STATUS_MAP[currentDetail.auditStatus]?.theme" variant="light-outline">
              {{ STATUS_MAP[currentDetail.auditStatus]?.text }}
            </t-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">审核时间：</span>
            <span class="detail-value">{{ currentDetail.createTime }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">审核人ID：</span>
            <span class="detail-value">{{ currentDetail.auditBy || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">审核意见：</span>
            <span class="detail-value" :style="{ color: currentDetail.auditStatus === 2 ? '#f56c6c' : '' }">
              {{ currentDetail.auditReason || '-' }}
            </span>
          </div>
        </div>

        <!-- 内容详情 -->
        <div class="detail-section" v-if="currentDetail.targetType === '0' || currentDetail.targetType === 0">
          <h3 class="section-title">内容详情</h3>
          <div class="detail-row">
            <span class="detail-label">内容ID：</span>
            <span class="detail-value">{{ currentDetail.targetId }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">标题：</span>
            <span class="detail-value">{{ currentDetail.contentTitle || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">内容类型：</span>
            <t-tag size="small" variant="light" :theme="CONTENT_TYPE_MAP[currentDetail.contentType]?.theme">
              {{ CONTENT_TYPE_MAP[currentDetail.contentType]?.text || '-' }}
            </t-tag>
          </div>
          <div class="detail-row">
            <span class="detail-label">描述：</span>
            <span class="detail-value">{{ currentDetail.contentDescription || '-' }}</span>
          </div>
          <div class="detail-row" v-if="currentDetail.contentCoverUrl">
            <span class="detail-label">封面：</span>
            <img :src="currentDetail.contentCoverUrl" class="detail-cover" />
          </div>
          <div class="detail-row">
            <span class="detail-label">作者ID：</span>
            <span class="detail-value">{{ currentDetail.contentAuthorId || '-' }}</span>
          </div>
          <t-button theme="primary" variant="outline" style="margin-top: 16px; width: 100%;"
            @click="goToContentDetail(currentDetail.targetId)">
            <template #icon><t-icon name="jump" /></template>
            查看内容详情
          </t-button>
        </div>

        <!-- 评论详情 -->
        <div class="detail-section" v-if="currentDetail.targetType === '1' || currentDetail.targetType === 1">
          <h3 class="section-title">评论详情</h3>
          <div class="detail-row">
            <span class="detail-label">评论ID：</span>
            <span class="detail-value">{{ currentDetail.targetId }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">评论内容：</span>
            <div class="detail-value comment-content">{{ currentDetail.commentContent || '-' }}</div>
          </div>
          <div class="detail-row">
            <span class="detail-label">评论用户ID：</span>
            <span class="detail-value">{{ currentDetail.commentUserId || '-' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">所属内容：</span>
            <span class="detail-value">{{ currentDetail.commentContentTitle || '-' }}</span>
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { contentApi } from '@/api/content'

const router = useRouter()

// 目标类型映射（后端返回字符串"0"/"1"）
const TARGET_TYPE_MAP = {
  '0': { text: '内容', icon: 'file', theme: 'primary' },
  '1': { text: '评论', icon: 'chat', theme: 'warning' }
}

// 审核状态映射（AuditStatusEnum）：0=待审核, 1=已通过, 2=已删除
const STATUS_MAP = {
  1: { text: '待审核', theme: 'warning' },
  2: { text: '已通过', theme: 'success' },
  3: { text: '已删除', theme: 'danger' }
}

// 判断是否为待审核状态（0=待审核）
const isPending = (row) => {
  return row.auditStatus === 1
}

// 内容类型映射
const CONTENT_TYPE_MAP = {
  0: { text: '文章', icon: 'article', theme: 'primary' },
  1: { text: '笔记', icon: 'note', theme: 'success' },
  2: { text: '提问', icon: 'help-circle', theme: 'warning' },
  3: { text: '文件', icon: 'file', theme: 'default' },
  4: { text: '视频', icon: 'video', theme: 'danger' }
}

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const selectedRowKeys = ref([])

// 搜索表单
const searchForm = reactive({
  targetType: undefined,
  auditStatus: undefined
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
  { colKey: 'row-select', type: 'multiple', width: 50 },
  { colKey: 'id', title: 'ID', width: 70, align: 'center' },
  { colKey: 'targetType', title: '类型', width: 90 },
  { colKey: 'targetContent', title: '审核内容', minWidth: 280 },
  { colKey: 'auditStatus', title: '状态', width: 100 },
  { colKey: 'createTime', title: '提交时间', width: 170 },
  { colKey: 'op', title: '操作', fixed: 'right', width: 180 }
]

// 审核弹窗
const auditDialogVisible = ref(false)
const auditDialogTitle = ref('')
const auditAction = ref('approve')
const auditFormRef = ref(null)
const currentAuditRow = ref(null)
const auditForm = reactive({
  auditReason: ''
})
const auditRules = {
  auditReason: [
    {
      validator: (val) => auditAction.value === 'approve' || (val && val.trim()),
      message: '拒绝时必须填写原因'
    }
  ]
}

// 详情抽屉
const detailDrawerVisible = ref(false)
const currentDetail = ref(null)

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const param = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      params: {}
    }

    if (searchForm.targetType !== undefined && searchForm.targetType !== null) {
      param.params.targetType = searchForm.targetType
    }
    if (searchForm.auditStatus !== undefined && searchForm.auditStatus !== null) {
      param.params.auditStatus = searchForm.auditStatus
    }

    const res = await contentApi.getAuditPage(param)

    if (res.code === 200 && res.data) {
      tableData.value = res.data.records?.map(item => ({
        ...item,
        // 保持 auditStatus 为数字类型，不要用 || 因为 0 是有效值
        auditStatus: item.auditStatus !== undefined && item.auditStatus !== null
          ? item.auditStatus
          : 0 // 默认待审核
      })) || []
      pagination.total = res.data.total || 0
    } else {
      MessagePlugin.error(res.message || '获取审核列表失败')
    }
  } catch (error) {
    console.error('获取审核列表失败:', error)
    MessagePlugin.error(error.message || '获取审核列表失败')
  } finally {
    loading.value = false
  }
}

// 事件处理
const handleSearch = () => {
  pagination.current = 1
  fetchData()
}

const handleReset = () => {
  searchForm.targetType = undefined
  searchForm.auditStatus = undefined
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

// 查看详情 - 调用API获取最新审核记录
const handleViewDetail = async (row) => {
  // 先显示列表中的数据并打开抽屉
  currentDetail.value = row
  detailDrawerVisible.value = true

  try {
    // 调用API获取最新的审核记录详情
    const res = await contentApi.getAuditRecord({
      targetId: row.targetId,
      targetType: row.targetType
    })

    if (res.code === 200 && res.data) {
      // 合并API返回的数据（保留列表中的关联信息）
      currentDetail.value = {
        ...row,
        ...res.data,
        // 确保关联信息不被覆盖
        contentTitle: res.data.contentTitle || row.contentTitle,
        contentCoverUrl: res.data.contentCoverUrl || row.contentCoverUrl,
        commentContent: res.data.commentContent || row.commentContent
      }
    }
  } catch (error) {
    console.error('获取审核详情失败:', error)
    // 失败时仍显示列表中的数据
  }
}

// 跳转到内容详情页
const goToContentDetail = (contentId) => {
  detailDrawerVisible.value = false
  router.push({ name: 'ContentDetail', params: { id: contentId } })
}

// 审核通过
const handleApprove = (row) => {
  currentAuditRow.value = row
  auditAction.value = 'approve'
  auditDialogTitle.value = '审核通过'
  auditForm.auditReason = ''
  auditDialogVisible.value = true
}

// 审核拒绝
const handleReject = (row) => {
  currentAuditRow.value = row
  auditAction.value = 'reject'
  auditDialogTitle.value = '审核拒绝'
  auditForm.auditReason = ''
  auditDialogVisible.value = true
}

// 将前端targetType转换为后端枚举值
const convertTargetType = (type) => {
  // 后端 TypeEnum: CONTENT=0, COMMENT=1
  if (type === '0' || type === 0) return 0
  if (type === '1' || type === 1) return 1
  return type
}

// 确认审核
const handleAuditConfirm = async () => {
  // 批量拒绝处理
  if (auditAction.value === 'batchReject') {
    if (!auditForm.auditReason?.trim()) {
      MessagePlugin.warning('拒绝时必须填写原因')
      return
    }
    await doBatchReject()
    return
  }

  if (auditAction.value === 'reject' && !auditForm.auditReason?.trim()) {
    MessagePlugin.warning('拒绝时必须填写原因')
    return
  }

  try {
    // 后端枚举：targetType: 0=CONTENT, 1=COMMENT; auditStatus: 0=草稿, 1=待审核, 2=已通过, 3=已删除
    // auditBy 由后端从当前登录用户自动获取
    const auditData = {
      targetId: currentAuditRow.value.targetId,
      targetType: convertTargetType(currentAuditRow.value.targetType),
      auditStatus: auditAction.value === 'approve' ? 2 : 3,
      auditReason: auditForm.auditReason || (auditAction.value === 'approve' ? '审核通过' : ''),
      version: currentAuditRow.value.version
    }
    console.log(auditData);


    // console.log('审核请求参数:', auditData)
    const res = await contentApi.handleAudit(currentAuditRow.value.id, auditData)

    if (res.code === 200) {
      MessagePlugin.success(auditAction.value === 'approve' ? '审核通过成功' : '审核拒绝成功')
      auditDialogVisible.value = false
      fetchData()
    } else {
      MessagePlugin.error(res.message || '审核操作失败')
    }
  } catch (error) {
    console.error('审核操作失败:', error)
    MessagePlugin.error(error.message || '审核操作失败')
  }
}

// 执行批量拒绝
const doBatchReject = async () => {
  try {
    const pendingRows = tableData.value.filter(
      row => selectedRowKeys.value.includes(row.id) && isPending(row)
    )

    if (pendingRows.length === 0) {
      MessagePlugin.warning('没有待审核的记录')
      return
    }

    const promises = pendingRows.map(row =>
      contentApi.handleAudit(row.id, {
        targetId: row.targetId,
        targetType: convertTargetType(row.targetType),
        auditStatus: 2, // 2=已删除
        auditReason: auditForm.auditReason,
        version: row.version
      })
    )

    await Promise.all(promises)
    MessagePlugin.success(`已拒绝 ${pendingRows.length} 条记录`)
    selectedRowKeys.value = []
    auditDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error('批量拒绝失败:', error)
    MessagePlugin.error(error.message || '批量拒绝失败')
  }
}

// 批量通过
const handleBatchApprove = async () => {
  if (selectedRowKeys.value.length === 0) return

  try {
    const pendingRows = tableData.value.filter(
      row => selectedRowKeys.value.includes(row.id) && isPending(row)
    )

    if (pendingRows.length === 0) {
      MessagePlugin.warning('没有待审核的记录')
      return
    }

    const promises = pendingRows.map(row =>
      contentApi.handleAudit(row.id, {
        targetId: row.targetId,
        targetType: convertTargetType(row.targetType),
        auditStatus: 1, // 1=已通过
        auditReason: '批量审核通过',
        version: row.version
      })
    )

    await Promise.all(promises)
    MessagePlugin.success(`已通过 ${pendingRows.length} 条记录`)
    selectedRowKeys.value = []
    fetchData()
  } catch (error) {
    console.error('批量审核失败:', error)
    MessagePlugin.error(error.message || '批量审核失败')
  }
}

// 批量拒绝
const handleBatchReject = async () => {
  if (selectedRowKeys.value.length === 0) return

  auditAction.value = 'batchReject'
  auditDialogTitle.value = '批量拒绝'
  auditForm.auditReason = ''
  auditDialogVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>



<style scoped lang="less">
.content-audit-view {
  padding: 24px 24px 0 24px;
  min-height: auto;
  width: 100%;
  background: var(--td-bg-color-page);
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.header-section {
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  visibility: visible !important;
  opacity: 1 !important;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--td-text-color-primary) !important;
  margin-bottom: 4px;
  display: block !important;
  visibility: visible !important;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary) !important;
  display: block !important;
  visibility: visible !important;
}

.search-card,
.table-card {
  border-radius: 8px;
  margin-bottom: 24px;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  background: var(--td-bg-color-container) !important;
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

.detail-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--td-component-border);

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin-bottom: 16px;
  }
}

.detail-row {
  display: flex;
  align-items: flex-start;
  padding: 10px 0;

  .detail-label {
    flex-shrink: 0;
    width: 100px;
    color: var(--td-text-color-secondary);
    font-weight: 500;
  }

  .detail-value {
    flex: 1;
    color: var(--td-text-color-primary);
    word-break: break-word;
  }

  .comment-content {
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .detail-cover {
    max-width: 300px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

// 审核内容列样式
.target-content {
  padding: 4px 0;

  .content-info-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

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
  }

  .content-title {
    font-weight: 500;
    color: var(--td-text-color-primary);
    margin-bottom: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .content-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;

    .author {
      color: var(--td-text-color-placeholder);
    }
  }

  .comment-text {
    color: var(--td-text-color-primary);
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .comment-source {
    font-size: 12px;
    color: var(--td-text-color-placeholder);

    .source-title {
      color: var(--td-text-color-secondary);
    }
  }

  .unknown {
    color: var(--td-text-color-placeholder);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

:deep(.t-table) {
  .t-table__header th {
    white-space: nowrap;
  }

  .t-table__pagination {
    padding: 16px 0 0 0;
    margin: 0;
  }
}
</style>
