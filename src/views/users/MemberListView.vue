<template>
  <div class="member-list-view">
    <!-- 面包屑导航 -->
    <t-breadcrumb class="mb-4">
      <t-breadcrumb-item>成员中心</t-breadcrumb-item>
      <t-breadcrumb-item>成员名册</t-breadcrumb-item>
    </t-breadcrumb>

    <!-- 高级筛选栏 -->
    <t-card :bordered="false" class="search-card">
      <t-form ref="searchFormRef" :data="searchForm" @submit="handleSearch" @reset="handleReset" layout="inline">
        <t-row :gutter="[16, 16]" class="w-full">
          <!-- 第一行 -->
          <!-- 用户名 -->
          <t-col :span="3">
            <t-form-item label="用户名" name="username">
              <t-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
            </t-form-item>

          </t-col>

          <!-- 学号 -->
          <t-col :span="3">

            <t-form-item label="学号" name="studentId">
              <t-input v-model="searchForm.studentId" placeholder="请输入学号" clearable />
            </t-form-item>
          </t-col>

          <!-- 真实姓名 -->
          <t-col :span="3">
            <t-form-item label="真实姓名" name="realName">
              <t-input v-model="searchForm.realName" placeholder="请输入真实姓名" clearable />
            </t-form-item>
          </t-col>

          <!-- 组别 -->
          <t-col :span="3">
            <t-form-item label="部门" name="departmentId">
              <t-select v-model="searchForm.departmentId" placeholder="请选择部门" clearable>
                <t-option v-for="item in department" :key="item.id" :label="item.name" :value="item.id" />
              </t-select>
            </t-form-item>
          </t-col>

          <!-- 第二行 -->
          <!-- 状态 -->
          <t-col :span="3">
            <t-form-item label="状态" name="lifecycleStatus">
              <t-select v-model="searchForm.lifecycleStatus" placeholder="请选择状态" clearable>
                <t-option label="候选成员" :value="0" />
                <t-option label="正式成员" :value="1" />
              </t-select> </t-form-item>
          </t-col>

          <!-- 操作按钮 -->
          <t-col :span="9" class="flex gap-2">
            <t-button theme="primary" type="submit">
              <template #icon>
                <t-icon name="search" />
              </template>
              查询
            </t-button>
            <t-button theme="default" type="reset">
              <template #icon>
                <t-icon name="refresh" />
              </template>
              重置
            </t-button>
          </t-col>
        </t-row>
      </t-form>
    </t-card>

    <!-- 数据表格 -->
    <t-card :bordered="false" class="table-card" title="成员列表">
      <!-- <template #actions>
        <div class="flex gap-2">
          <t-button theme="default" variant="outline" @click="handleExport">
            <template #icon>
              <t-icon name="download" />
            </template>
            导出Excel
          </t-button>
          <t-button theme="primary" @click="handleAdd">
            <template #icon>
              <t-icon name="add" />
            </template>
            手动录入
          </t-button>
        </div>
      </template> -->

      <t-table row-key="id" :data="tableData" :columns="columns" :loading="loading" :pagination="pagination" stripe
        hover class="mt-2" @page-change="handlePageChange">
        <!-- 成员信息列 -->
        <template #memberInfo="{ row }">
          <div class="member-info">
            <t-avatar :image="row.headshotUrl" size="40px" shape="circle">
              {{ row.realName?.[0] || '?' }}
            </t-avatar>
            <div class="member-details">
              <div class="member-name">{{ row.realName || '-' }}</div>
              <div class="member-id">用户ID: {{ row.userId }}</div>
            </div>
          </div>
        </template>

        <!-- 学籍信息列 -->
        <template #education="{ row }">
          <div v-if="row.majorName || row.entryYear">
            {{ row.majorName || '-' }} / {{ row.entryYear ? row.entryYear + '级' : '-' }}
          </div>
          <div v-else class="empty-text">-</div>
        </template>

        <!-- 状态列 -->
        <template #status="{ row }">
          <t-tag v-if="isOfficial(row)" theme="success" variant="light">
            <template #icon>
              <span class="status-dot active" />
            </template>
            {{ row.statusName || '正式成员' }}
          </t-tag>
          <t-tag v-else-if="isCandidate(row)" theme="warning" variant="light">
            <template #icon>
              <span class="status-dot pending" />
            </template>
            {{ row.statusName || '候选成员' }}
          </t-tag>
          <t-tag v-else theme="danger" variant="light">
            <template #icon>
              <span class="status-dot" />
            </template>
            {{ row.statusName || '未知状态' }}
          </t-tag>
        </template>

        <!-- 部门职位列 -->
        <template #positions="{ row }">
          <div class="positions-wrapper">
            <t-tag v-if="row.departmentName && row.positionName" theme="primary" variant="light" size="small">
              {{ row.departmentName }} · {{ row.positionName }}
            </t-tag>
            <span v-else class="empty-text">-</span>
          </div>
        </template>

        <!-- 关键日期列 -->
        <template #date="{ row }">
          <div v-if="isOfficial(row) && row.joinDate">
            {{ formatDate(row.joinDate) }}
          </div>
          <div v-else-if="row.createdAt">
            {{ formatDate(row.createdAt) }}
          </div>
          <div v-else>-</div>
        </template>

        <!-- 操作列 -->
        <template #op="{ row }">
          <div class="op-btns">
            <span v-if="isCandidate(row)" class="op-btn success" @click="openPromoteDialog(row)">
              <t-icon name="check" /> 转正
            </span>
            <span class="op-btn primary" @click="viewDetail(row)">
              <t-icon name="view" /> 详情
            </span>
            <t-popconfirm content="确认将该成员移除出协会吗？" theme="danger" @confirm="handleRemove(row)">
              <span class="op-btn danger">
                <t-icon name="delete" /> 移除
              </span>
            </t-popconfirm>
          </div>
        </template>
      </t-table>
    </t-card>

    <!-- 转正办理弹窗 -->
    <MemberPromoteDialog v-model:visible="promoteDialog.visible" :member="promoteDialog.row"
      :loading="promoteDialog.loading" :departments="departments" :positions="positions"
      @confirm="handlePromoteSubmit" />

    <!-- 成员详情弹窗 -->
    <MemberDetailDialog v-model:visible="detailDialog.visible" :member-id="detailDialog.memberId" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getAllMemberShips } from '@/api/user/user'
import MemberPromoteDialog from './components/MemberPromoteDialog.vue'
import MemberDetailDialog from './components/MemberDetailDialog.vue'
import { deleteMember, getDepartments } from '../../api/user/user'

// 响应式数据
const loading = ref(false)
const searchFormRef = ref()

const searchForm = reactive({
  keyword: '',           // 关键字（统一搜索用户名、真实姓名、学号）
  username: '',          // 用户名（模糊查询）
  realName: '',          // 真实姓名（模糊查询）
  studentId: '',         // 学号
  lifecycleStatus: null, // 生命周期状态：0候选，1正式，null查询所有
  departmentId: null,    // 部门ID（查询该部门的成员）
  positionId: null,      // 职位ID（查询担任该职位的成员）
  joinDateStart: '',     // 加入日期开始
  joinDateEnd: '',       // 加入日期结束
  isCurrentMember: null, // 是否为现届成员：true查询现届（在读），false查询往届（离校）
  entryYear: null        // 年级（入学年份）
})

// 部门和职位数据
const departments = ref([])
const positions = ref([])

// 年级选项（动态生成最近10年）
const entryYears = ref([])
const generateEntryYears = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = 0; i < 10; i++) {
    years.push(currentYear - i)
  }
  entryYears.value = years
}

// 加入日期范围
const joinDateRange = ref([])

// 表格配置
const columns = [
  // { colKey: 'id', title: 'ID', width: 80, align: 'center' },
  { colKey: 'memberInfo', title: '成员信息', width: 220 },
  { colKey: 'education', title: '学籍信息', width: 200 },
  { colKey: 'status', title: '状态', width: 120 },
  { colKey: 'positions', title: '部门职务', width: 220 },
  { colKey: 'date', title: '关键日期', width: 150 },
  { colKey: 'op', title: '操作', fixed: 'right', width: 180 }
]

const tableData = ref([])
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showJumper: true
})

// 转正弹窗
const promoteDialog = reactive({
  visible: false,
  loading: false,
  row: null
})

// 详情弹窗
const detailDialog = reactive({
  visible: false,
  memberId: null
})



// 工具函数
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.split('T')[0]
}

// 判断是否为候选成员
// lifecycleStatus: 1=候选成员, 2=正式成员, 3=已拒绝
// 或者使用 statusName 字段判断
const isCandidate = (row) => {
  // 优先使用 statusName 字段
  if (row.statusName) {
    return row.statusName === '候选成员'
  }
  // 备用：使用 lifecycleStatus 数字判断
  return row.lifecycleStatus === 1
}

// 判断是否为正式成员
const isOfficial = (row) => {
  // 优先使用 statusName 字段
  if (row.statusName) {
    return row.statusName === '正式成员'
  }
  // 备用：使用 lifecycleStatus 数字判断
  return row.lifecycleStatus === 2
}

// 数据加载
const fetchData = async () => {
  loading.value = true
  try {
    const param = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      params: {
        username: searchForm.username || undefined,
        realName: searchForm.realName || undefined,
        studentId: searchForm.studentId || undefined,
        lifecycleStatus: searchForm.lifecycleStatus !== null ? searchForm.lifecycleStatus : undefined,
        departmentId: searchForm.departmentId || undefined,
        positionId: searchForm.positionId || undefined,
        joinDateStart: searchForm.joinDateStart || undefined,
        joinDateEnd: searchForm.joinDateEnd || undefined,
        isCurrentMember: searchForm.isCurrentMember !== null ? searchForm.isCurrentMember : undefined,
        entryYear: searchForm.entryYear || undefined
      }
    }

    // console.log('搜索参数:', param)
    const response = await getAllMemberShips(param)
    // console.log('搜索结果:', response)

    if (response.code === 200 && response.data) {
      tableData.value = response.data.records || []
      pagination.total = response.data.total || 0
    } else {
      MessagePlugin.error(response.message || '查询失败')
    }
  } catch (error) {
    console.error('获取成员列表失败:', error)
    MessagePlugin.error(error.message || '获取成员列表失败')
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
  searchForm.keyword = ''
  searchForm.username = ''
  searchForm.realName = ''
  searchForm.studentId = ''
  searchForm.lifecycleStatus = null
  searchForm.departmentId = null
  searchForm.positionId = null
  searchForm.joinDateStart = ''
  searchForm.joinDateEnd = ''
  searchForm.isCurrentMember = null
  searchForm.entryYear = null
  joinDateRange.value = []
  pagination.current = 1
  fetchData()
}

const handlePageChange = (pageInfo) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  fetchData()
}

const openPromoteDialog = (row) => {
  promoteDialog.row = row
  promoteDialog.visible = true
}

const handlePromoteSubmit = async (formData) => {
  if (!promoteDialog.row) return

  // 验证必填项
  if (!formData.joinDate) {
    MessagePlugin.warning('请选择转正日期')
    return
  }
  if (!formData.departmentId) {
    MessagePlugin.warning('请选择任命部门')
    return
  }
  if (!formData.positionId) {
    MessagePlugin.warning('请选择授予职位')
    return
  }
  if (!formData.positionStartDate) {
    MessagePlugin.warning('请选择生效日期')
    return
  }

  promoteDialog.loading = true
  try {
    const response = await userApi.promoteToOfficial(promoteDialog.row.id, formData)

    if (response.code === 200) {
      MessagePlugin.success('转正成功')
      promoteDialog.visible = false
      fetchData() // 刷新列表
    } else {
      MessagePlugin.error(response.message || '转正失败')
    }
  } catch (error) {
    console.error('转正失败:', error)
    MessagePlugin.error(error.message || '转正失败')
  } finally {
    promoteDialog.loading = false
  }
}

const viewDetail = (row) => {
  // console.log(row);

  detailDialog.memberId = row.id
  detailDialog.visible = true
}

const handleRemove = async (row) => {
  let res = await deleteMember(row.id)
  if (res.code == 200) {
    MessagePlugin.success('已移除成员')
  }
  fetchData()
}

const department = ref([])

const getDepartmentsed = async () => {
  let res = await getDepartments()
  department.value = res.data.map(item => ({
    id: item.id,
    name: item.name
  }))
  // console.log(department.value);

}

onMounted(() => {
  generateEntryYears()
  fetchData()
  getDepartmentsed()
  // loadDepartments()
  // loadPositions()
})
</script>

<style scoped lang="less">
.member-list-view {
  width: 100%;

  .mb-4 {
    margin-bottom: 16px;
  }

  .search-card,
  .table-card {
    border-radius: 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    margin-bottom: 16px;
  }

  .w-full {
    width: 100%;
  }

  .flex {
    display: flex;
  }

  .flex-1 {
    flex: 1;
  }

  .justify-end {
    justify-content: flex-end;
  }

  .gap-2 {
    gap: 8px;
  }

  .mt-2 {
    margin-top: 8px;
  }

  // 成员信息样式
  .member-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;

    .member-details {
      .member-name {
        font-weight: 600;
        color: var(--td-text-color-primary);
        margin-bottom: 4px;
      }

      .member-id {
        font-size: 12px;
        color: var(--td-text-color-placeholder);
      }
    }
  }

  // 状态圆点
  .status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;

    &.active {
      background-color: #2ba471;
    }

    &.pending {
      background-color: #e37318;
    }
  }

  // 部门职位样式
  .positions-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    .empty-text {
      color: var(--td-text-color-placeholder);
      font-size: 12px;
    }
  }

  .empty-text {
    color: var(--td-text-color-placeholder);
    font-size: 14px;
  }

}
</style>
