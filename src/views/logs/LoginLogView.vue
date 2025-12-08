<template>
  <div class="login-log-view">
    <t-card :bordered="false">
      <template #header>
        <h3>登录日志</h3>
      </template>

      <t-table
        :data="tableData"
        :columns="columns"
        :pagination="pagination"
        :loading="loading"
        row-key="id"
        @page-change="handlePageChange"
      >
        <template #status="{ row }">
          <t-tag :theme="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '成功' : '失败' }}
          </t-tag>
        </template>
      </t-table>
    </t-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { logApi } from '@/api/log'

const loading = ref(false)
const tableData = ref([])

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const columns = [
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'username', title: '用户名', width: 150 },
  { colKey: 'ip', title: 'IP地址', width: 150 },
  { colKey: 'location', title: '登录地点', width: 150 },
  { colKey: 'browser', title: '浏览器', width: 120 },
  { colKey: 'os', title: '操作系统', width: 120 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'message', title: '消息', ellipsis: true },
  { colKey: 'loginTime', title: '登录时间', width: 180 }
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await logApi.getLoginLogs({
      current: pagination.current,
      size: pagination.pageSize,
      params: {}
    })
    
    if (res.code === 200) {
      tableData.value = res.data.records
      pagination.total = res.data.total
    }
  } catch (error) {
    MessagePlugin.error('加载登录日志失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (pageInfo) => {
  pagination.current = pageInfo.current
  pagination.pageSize = pageInfo.pageSize
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.login-log-view {
  padding: 24px;
}
</style>
