<template>
  <div class="award-list-view">
    <!-- 奖项详情卡片弹窗 -->
    <AwardDetailCard v-model="showDetailCard" :award-data="selectedAward" @edit="handleEdit" @refresh="loadData" />

    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h2 class="page-title">获奖记录管理</h2>
        <p class="page-description">查询与管理所有学生的学科竞赛及荣誉证书记录</p>
        <!-- 筛选提示 -->
        <div v-if="filterHint" class="filter-hint">
          <t-tag theme="primary" variant="light" closable @close="clearFilter">
            <template #icon>
              <t-icon name="filter" />
            </template>
            {{ filterHint }}
          </t-tag>
        </div>
      </div>
      <t-space>
        <t-button theme="primary" @click="router.push({ name: 'AwardCreate' })">
          <template #icon>
            <t-icon name="add" />
          </template>
          新增奖项
        </t-button>
        <t-button theme="default" variant="outline">
          <template #icon>
            <t-icon name="download" />
          </template>
          导出报表
        </t-button>
      </t-space>
    </div>

    <!-- 筛选查询区 -->
    <t-card :bordered="false" class="filter-card">
      <t-form :data="queryForm" layout="inline" class="filter-form">
        <t-form-item label="奖项名称">
          <t-input v-model="queryForm.awardTitle" placeholder="输入奖项名称..." clearable style="width: 200px">
            <template #prefix-icon>
              <t-icon name="search" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item label="获奖学生">
          <t-input v-model="queryForm.username" placeholder="姓名 / 学号" clearable style="width: 200px">
            <template #prefix-icon>
              <t-icon name="user" />
            </template>
          </t-input>
        </t-form-item>

        <t-form-item label="奖项等级">
          <t-select v-model="queryForm.awardLevelId" placeholder="全部等级" clearable style="width: 150px">
            <t-option v-for="level in awardLevels" :key="level.id" :value="level.id" :label="level.name" />
          </t-select>
        </t-form-item>

        <t-form-item label="奖项类型">
          <t-select v-model="queryForm.awardTypeId" placeholder="全部类型" clearable style="width: 150px">
            <t-option v-for="type in awardTypes" :key="type.id" :value="type.id" :label="type.name" />
          </t-select>
        </t-form-item>

        <t-form-item label="颁发单位">
          <t-input v-model="queryForm.awardedBy" placeholder="例如：校团委" clearable style="width: 150px" />
        </t-form-item>

        <t-form-item label="获奖日期">
          <t-date-range-picker v-model="dateRange" clearable style="width: 280px" />
        </t-form-item>

        <t-form-item>
          <t-space>
            <t-button theme="primary" @click="handleSearch">
              <template #icon>
                <t-icon name="search" />
              </template>
              查询
            </t-button>
            <t-button variant="outline" @click="resetQuery">
              <template #icon>
                <t-icon name="refresh" />
              </template>
              重置
            </t-button>
          </t-space>
        </t-form-item>
      </t-form>
    </t-card>

    <!-- 数据列表 -->
    <t-card :bordered="false" class="table-card">
      <t-table :data="tableData" :columns="columns" :loading="loading" :pagination="pagination" row-key="id"
        :hover="true" stripe @page-change="onPageChange" @row-click="(event) => showDetail(event.row)"
        class="clickable-table">
        <!-- 奖项详情 -->
        <template #awardInfo="{ row }">
          <div class="award-info">
            <div class="award-title">{{ row.awardTitle }}</div>
            <t-space :size="4" class="award-badges">
              <t-tag :theme="getLevelTheme(row.awardLevelName)" variant="light-outline" size="small">
                {{ row.awardLevelName }}
              </t-tag>
              <t-tag theme="default" variant="light" size="small">
                {{ row.awardTypeName }}
              </t-tag>
            </t-space>
          </div>
        </template>

        <!-- 获奖成员 -->
        <template #teamMembers="{ row }">
          <div class="team-members">
            <t-avatar-group :max="4" size="small" cascading="left-up">
              <t-avatar v-for="member in row.teamMemberList" :key="member.id" :image="getAvatarUrl(member)">
                {{ member.nickname }}
              </t-avatar>
            </t-avatar-group>
            <div v-if="row.teamMemberList && row.teamMemberList.length <= 2" class="member-names">
              {{row.teamMemberList.map((m) => m.nickname).join(', ')}}
            </div>
          </div>
        </template>

        <!-- 颁发信息 -->
        <template #awardInfo2="{ row }">
          <div class="award-by-info">
            <div class="award-by">{{ row.awardedBy }}</div>
            <div class="award-date">
              <t-icon name="calendar" />
              {{ row.awardedAt }}
            </div>
          </div>
        </template>

        <!-- 证书 -->
        <template #certificate="{ row }">
          <t-button theme="default" variant="text" size="small" @click="previewCertificate(row)">
            <template #icon>
              <t-icon name="file" />
            </template>
            预览
          </t-button>
        </template>

        <!-- 操作 -->
        <template #action="{ row }">
          <div class="op-btns">
            <span class="op-btn primary" @click.stop="showDetail(row)">
              <t-icon name="view" /> 查看
            </span>
            <span class="op-btn primary" @click.stop="handleEdit(row)">
              <t-icon name="edit" /> 编辑
            </span>
            <span class="op-btn danger" @click.stop="handleDelete(row)">
              <t-icon name="delete" /> 删除
            </span>
          </div>
        </template>
      </t-table>
    </t-card>

    <!-- 证书预览弹窗 -->
    <t-dialog v-model:visible="showPreview" header="证书预览" width="800px" :footer="false">
      <div class="certificate-preview">
        <t-image :src="currentCertUrl" fit="contain" style="width: 100%; max-height: 600px" />
        <div class="cert-info">
          <h3>{{ currentCertTitle }}</h3>
          <p>文件ID: {{ currentCertId }}</p>
          <t-button theme="primary" @click="downloadCertificate">
            <template #icon>
              <t-icon name="download" />
            </template>
            下载原件
          </t-button>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { useRoute, useRouter } from 'vue-router'
import { getAllAwardsList } from '@/api/awards/awards'
import AwardDetailCard from '@/components/AwardDetailCard.vue'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(false)
const showPreview = ref(false)
const currentCertUrl = ref('')
const currentCertTitle = ref('')
const currentCertId = ref('')
const showDetailCard = ref(false)
const selectedAward = ref(null)

// 查询表单
const queryForm = ref({
  awardTitle: '',
  username: '',
  awardLevelId: undefined,
  awardTypeId: undefined,
  awardedBy: ''
})

const dateRange = ref([])

// 字典数据
const awardLevels = ref([])
const awardTypes = ref([])

// 表格数据
const tableData = ref([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

// 表格列配置
const columns = [
  {
    colKey: 'awardInfo',
    title: '奖项详情',
    width: 280
  },
  {
    colKey: 'teamMembers',
    title: '获奖成员',
    width: 200
  },
  {
    colKey: 'awardInfo2',
    title: '颁发信息',
    width: 180
  },
  {
    colKey: 'certificate',
    title: '证书',
    width: 100,
    align: 'center'
  },
  {
    colKey: 'action',
    title: '操作',
    width: 180,
    align: 'right'
  }
]

// 获取头像URL
const getAvatarUrl = (member) => {
  // 优先使用后端返回的 avatarUrl
  if (member.avatarUrl) {
    return member.avatarUrl
  }
  // 降级使用 avatarFileId 生成默认头像
  if (member.avatarFileId) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatarFileId}`
  }
  // 使用用户ID生成默认头像
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`
}

// 获取等级主题
const getLevelTheme = (levelName) => {
  if (levelName.includes('国家')) return 'danger'
  if (levelName.includes('省')) return 'warning'
  if (levelName.includes('校')) return 'primary'
  return 'default'
}

// 加载字典数据
const loadDictData = async () => {
  try {
    const [levelsRes, typesRes] = await Promise.all([
      userApi.getAwardLevels(),
      userApi.getAwardTypes()
    ])

    if (levelsRes.code === 200 && levelsRes.data) {
      awardLevels.value = levelsRes.data
    }
    if (typesRes.code === 200 && typesRes.data) {
      awardTypes.value = typesRes.data
    }
  } catch (error) {
    console.error('加载字典数据失败:', error)
  }
}

// 加载列表数据
const loadData = async () => {
  loading.value = true
  try {
    // 处理日期范围
    let awardDateStart, awardDateEnd
    if (dateRange.value && dateRange.value.length === 2) {
      awardDateStart = dateRange.value[0]
      awardDateEnd = dateRange.value[1]
    }

    const result = await getAllAwardsList({
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
      awardTitle: queryForm.value.awardTitle || undefined,
      username: queryForm.value.username || undefined,
      awardLevelId: queryForm.value.awardLevelId || undefined,
      awardTypeId: queryForm.value.awardTypeId || undefined,
      awardedBy: queryForm.value.awardedBy || undefined,
      awardDateStart,
      awardDateEnd
    })

    if (result.code === 200 && result.data) {
      tableData.value = result.data.records || []
      pagination.value.total = result.data.total || 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    MessagePlugin.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pagination.value.current = 1
  loadData()
}

// 重置
const resetQuery = () => {
  queryForm.value = {
    awardTitle: '',
    username: '',
    awardLevelId: undefined,
    awardTypeId: undefined,
    awardedBy: ''
  }
  dateRange.value = []
  handleSearch()
}

// 分页变化
const onPageChange = (pageInfo) => {
  pagination.value.current = pageInfo.current
  pagination.value.pageSize = pageInfo.pageSize
  loadData()
}

// 预览证书
const previewCertificate = (record) => {
  currentCertUrl.value = `https://placehold.co/800x600/EEE/31343C?text=${encodeURIComponent(record.awardTitle)}`
  currentCertTitle.value = record.awardTitle
  currentCertId.value = record.certificateFileId
  showPreview.value = true
}

// 下载证书
const downloadCertificate = () => {
  window.open(currentCertUrl.value, '_blank')
}

// 显示详情
const showDetail = (record) => {
  selectedAward.value = record
  showDetailCard.value = true
}

// 编辑
const handleEdit = (recordOrId) => {
  if (typeof recordOrId === 'number') {
    // 只有ID，需要调用接口
    router.push({ name: 'AwardEdit', params: { id: recordOrId } })
  } else {
    // 有完整数据，直接传递
    router.push({
      name: 'AwardEdit',
      params: {
        id: recordOrId.id,
        data: JSON.stringify(recordOrId)
      }
    })
  }
}

// 删除
const handleDelete = async (record) => {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除"${record.awardTitle}"吗？此操作不可恢复。`,
    confirmBtn: '删除',
    cancelBtn: '取消',
    theme: 'warning',
    onConfirm: async () => {
      try {
        const result = await userApi.deleteAward(record.id)
        if (result.code === 200) {
          MessagePlugin.success('删除成功')
          await loadData()
        }
        confirmDialog.destroy()
      } catch (error) {
        console.error('删除失败:', error)
        MessagePlugin.error('删除失败')
      }
    }
  })
}

// 筛选提示
const filterHint = computed(() => {
  const hints = []

  if (route.query.awardLevelName) {
    hints.push(`等级：${route.query.awardLevelName}`)
  }
  if (route.query.awardTypeName) {
    hints.push(`类型：${route.query.awardTypeName}`)
  }

  return hints.length > 0 ? `当前筛选 - ${hints.join('，')}` : ''
})

// 清除筛选
const clearFilter = () => {
  queryForm.value.awardLevelId = undefined
  queryForm.value.awardTypeId = undefined
  router.push({ name: 'AwardList' })
}

// 从路由参数初始化筛选条件
const initFromRoute = () => {
  if (route.query.awardLevelId) {
    queryForm.value.awardLevelId = Number(route.query.awardLevelId)
  }
  if (route.query.awardTypeId) {
    queryForm.value.awardTypeId = Number(route.query.awardTypeId)
  }
}

// 初始化
onMounted(async () => {
  initFromRoute()
  await loadData()
})

// 监听路由变化
watch(
  () => route.query,
  () => {
    initFromRoute()
    loadData()
  }
)
</script>

<style scoped lang="less">
.award-list-view {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 4px;
}

.page-description {
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.filter-hint {
  margin-top: 8px;
}

.filter-card {
  margin-bottom: 16px;

  :deep(.t-card__body) {
    padding: 20px;
  }
}

.filter-form {
  :deep(.t-form__item) {
    margin-bottom: 16px;
  }
}

.table-card {
  :deep(.t-card__body) {
    padding: 0;
  }
}

.award-info {
  .award-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin-bottom: 8px;
  }

  .award-badges {
    display: flex;
    flex-wrap: wrap;
  }
}

.team-members {
  .member-names {
    margin-top: 8px;
    font-size: 12px;
    color: var(--td-text-color-placeholder);
  }
}

.award-by-info {
  .award-by {
    font-size: 14px;
    color: var(--td-text-color-primary);
    margin-bottom: 4px;
  }

  .award-date {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--td-text-color-placeholder);
  }
}

.certificate-preview {
  .cert-info {
    text-align: center;
    padding: 16px 0;

    h3 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    p {
      font-size: 12px;
      color: var(--td-text-color-placeholder);
      margin-bottom: 16px;
    }
  }
}

.clickable-table {
  :deep(.t-table__body tr) {
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--td-bg-color-container-hover) !important;
    }
  }
}
</style>
