<template>
  <div class="notification-center-page">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="navbar-content">
        <t-button variant="text" @click="goBack">
          <template #icon><t-icon name="chevron-left" /></template>
          返回
        </t-button>
        <div class="navbar-title">
          <t-icon name="notification" /> 消息通知中心
        </div>
        <div class="navbar-right">
          <t-dropdown :min-column-width="160">
            <t-button variant="text" shape="square">
              <t-avatar size="small">
                {{ userInfo?.username?.charAt(0).toUpperCase() || 'U' }}
              </t-avatar>
            </t-button>
            
            <template #dropdown>
              <t-dropdown-menu>
                <t-dropdown-item @click="goToDashboard">
                  <t-icon name="dashboard" />
                  返回仪表盘
                </t-dropdown-item>
                <t-dropdown-item divider />
                <t-dropdown-item @click="handleLogout">
                  <t-icon name="logout" />
                  退出登录
                </t-dropdown-item>
              </t-dropdown-menu>
            </template>
          </t-dropdown>
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="notification-center">
      <!-- 头部 -->
      <div class="header-section">
        <div>
          <h1 class="page-title">
            <t-icon name="notification" /> 消息通知中心
          </h1>
          <p class="page-subtitle">查看系统通知及消息发送记录</p>
        </div>
        <t-button theme="primary" @click="goToPublish">
          <template #icon><t-icon name="send" /></template>
          发布消息
        </t-button>
      </div>

    <!-- 主内容区 -->
    <div class="content-card">
      <t-tabs v-model="currentTab" theme="normal">
        
        <!-- Tab 1: 站内通知 -->
        <t-tab-panel value="system" label="站内通知">
          <div class="tab-content">
            <!-- 工具栏 -->
            <div class="toolbar">
              <div class="toolbar-left">
                <t-radio-group v-model="notifyFilter" variant="default-filled">
                  <t-radio-button value="all">全部</t-radio-button>
                  <t-radio-button value="unread">未读</t-radio-button>
                  <t-radio-button value="read">已读</t-radio-button>
                </t-radio-group>
                
                <t-select 
                  v-model="notifyTypeFilter" 
                  placeholder="通知类型" 
                  clearable 
                  style="width: 140px"
                >
                  <t-option :value="1" label="系统通知"></t-option>
                  <t-option :value="2" label="公告"></t-option>
                  <t-option :value="3" label="提醒"></t-option>
                </t-select>
              </div>
              
              <t-button variant="text" theme="primary" @click="markAllRead">
                <template #icon><t-icon name="check-double" /></template>
                全部标为已读
              </t-button>
            </div>

            <!-- 通知列表 -->
            <div class="notification-list">
              <div v-if="filteredNotifications.length === 0" class="empty-state">
                <t-icon name="notification-off" size="48px" />
                <p>暂无相关通知</p>
              </div>

              <div 
                v-for="item in filteredNotifications" 
                :key="item.id" 
                class="notification-item"
                :class="{ 'unread': !item.is_read }"
                @click="readNotification(item)"
              >
                <!-- 图标 -->
                <div class="notification-icon">
                  <t-avatar 
                    :style="{ 
                      backgroundColor: getTypeConfig(item.type).color, 
                      color: '#fff' 
                    }"
                  >
                    <template #icon>
                      <t-icon :name="getTypeConfig(item.type).iconName" />
                    </template>
                  </t-avatar>
                </div>
                
                <!-- 内容 -->
                <div class="notification-content">
                  <div class="notification-header">
                    <h3 class="notification-title">
                      {{ item.title }}
                      <span v-if="!item.is_read" class="unread-dot"></span>
                    </h3>
                    <span class="notification-time">{{ item.created_at }}</span>
                  </div>
                  <p class="notification-text">{{ item.content }}</p>
                  <div v-if="item.link_url" class="notification-link">
                    <a :href="item.link_url" @click.stop>
                      查看详情 <t-icon name="chevron-right" />
                    </a>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="notification-actions">
                  <t-tooltip content="删除通知">
                    <t-button 
                      shape="circle" 
                      variant="text" 
                      theme="danger" 
                      @click.stop="deleteNotification(item)"
                    >
                      <t-icon name="delete" />
                    </t-button>
                  </t-tooltip>
                </div>
              </div>
            </div>
            
            <!-- 分页 -->
            <div class="pagination-wrapper">
              <t-pagination 
                v-model="pagination.current" 
                v-model:pageSize="pagination.pageSize" 
                :total="pagination.total" 
                show-jumper
              />
            </div>
          </div>
        </t-tab-panel>

      </t-tabs>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { MessagePlugin } from 'tdesign-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { notificationApi } from '@/api/notification'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const userInfo = computed(() => authStore.currentUser)

const goBack = () => {
  router.back()
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    MessagePlugin.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    MessagePlugin.error('退出登录失败')
    console.error('Logout error:', error)
  }
}

const goToPublish = () => {
  router.push('/message/publish')
}



// 通知类型配置
const NOTIFY_TYPES = {
  1: { label: '系统通知', iconName: 'setting', color: '#0052d9' },
  2: { label: '公告', iconName: 'notification', color: '#ed7b2f' },
  3: { label: '提醒', iconName: 'time', color: '#2ba471' }
}

// 当前 Tab
const currentTab = ref('system')

// ================== 站内通知逻辑 ==================
const notifyFilter = ref('all')
const notifyTypeFilter = ref(null)
const pagination = reactive({ 
  current: 1, 
  pageSize: 10, 
  total: 0 
})

// 通知数据
const notifications = ref([])
const notificationLoading = ref(false)

// 加载通知列表
const loadNotifications = async () => {
  try {
    notificationLoading.value = true
    const response = await notificationApi.getMyNotifications({
      page: pagination.current,
      size: pagination.pageSize,
      isRead: notifyFilter.value === 'all' ? undefined : notifyFilter.value === 'read'
    })
    
    if (response.code === 200 && response.data) {
      // 转换数据格式
      notifications.value = response.data.records.map(item => ({
        id: item.id,
        type: getTypeFromString(item.type),
        title: item.title,
        content: item.content,
        is_read: item.isRead,
        created_at: item.createdAt,
        link_url: item.linkUrl
      }))
      pagination.total = response.data.total
    }
  } catch (error) {
    console.error('Failed to load notifications:', error)
    MessagePlugin.error('加载通知失败')
  } finally {
    notificationLoading.value = false
  }
}

// 将字符串类型转换为数字类型
const getTypeFromString = (typeStr) => {
  const typeMap = {
    'SYSTEM': 1,
    'ANNOUNCEMENT': 2,
    'REMINDER': 3
  }
  return typeMap[typeStr] || 1
}

const filteredNotifications = computed(() => {
  return notifications.value.filter(item => {
    // 状态过滤
    if (notifyFilter.value === 'unread' && item.is_read) return false
    if (notifyFilter.value === 'read' && !item.is_read) return false
    // 类型过滤
    if (notifyTypeFilter.value && item.type !== notifyTypeFilter.value) return false
    return true
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const getTypeConfig = (type) => {
  return NOTIFY_TYPES[type] || { 
    iconName: 'info-circle', 
    color: '#999' 
  }
}

const readNotification = async (item) => {
  if (!item.is_read) {
    try {
      await notificationStore.markAsRead(item.id)
      item.is_read = true
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }
}

const markAllRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    notifications.value.forEach(n => n.is_read = true)
    MessagePlugin.success('全部已标记为已读')
  } catch (error) {
    console.error('Failed to mark all as read:', error)
    MessagePlugin.error('操作失败')
  }
}

const deleteNotification = async (item) => {
  try {
    await notificationApi.deleteNotification(item.id)
    notifications.value = notifications.value.filter(n => n.id !== item.id)
    pagination.total--
    MessagePlugin.success('删除成功')
  } catch (error) {
    console.error('Failed to delete notification:', error)
    MessagePlugin.error('删除失败')
  }
}

// ================== 日志逻辑 (Email/SMS) ==================
const logLoading = ref(false)
const emailSearch = ref('')
const smsSearch = ref('')
const logStatusFilter = ref(null)

// 邮件日志数据
const emailLogs = ref([])
const emailPagination = reactive({ current: 1, pageSize: 10, total: 0 })

// 短信日志数据
const smsLogs = ref([])
const smsPagination = reactive({ current: 1, pageSize: 10, total: 0 })

// 加载邮件日志
const loadEmailLogs = async () => {
  try {
    logLoading.value = true
    const response = await notificationApi.getEmailLogs({
      page: emailPagination.current,
      size: emailPagination.pageSize,
      recipient: emailSearch.value || undefined,
      status: logStatusFilter.value ?? undefined
    })
    
    if (response.code === 200 && response.data) {
      emailLogs.value = response.data.records.map(item => ({
        id: item.id,
        recipient: item.recipient,
        subject: item.subject,
        status: item.status,
        send_time: item.sendTime,
        error_msg: item.errorMsg
      }))
      emailPagination.total = response.data.total
    }
  } catch (error) {
    console.error('Failed to load email logs:', error)
    MessagePlugin.error('加载邮件日志失败')
  } finally {
    logLoading.value = false
  }
}

// 加载短信日志
const loadSmsLogs = async () => {
  try {
    logLoading.value = true
    const response = await notificationApi.getSmsLogs({
      page: smsPagination.current,
      size: smsPagination.pageSize,
      phone: smsSearch.value || undefined,
      status: logStatusFilter.value ?? undefined
    })
    
    if (response.code === 200 && response.data) {
      smsLogs.value = response.data.records.map(item => ({
        id: item.id,
        phone: item.phone,
        content: item.content,
        template_code: item.templateCode,
        status: item.status,
        send_time: item.sendTime,
        error_msg: item.errorMsg
      }))
      smsPagination.total = response.data.total
    }
  } catch (error) {
    console.error('Failed to load SMS logs:', error)
    MessagePlugin.error('加载短信日志失败')
  } finally {
    logLoading.value = false
  }
}

// 邮件表格列配置
const emailColumns = [
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'recipient', title: '收件人', width: 200 },
  { colKey: 'subject', title: '主题' },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'send_time', title: '发送时间', width: 180 },
  { colKey: 'op', title: '操作', width: 100, fixed: 'right' }
]

// 短信表格列配置
const smsColumns = [
  { colKey: 'id', title: 'ID', width: 80 },
  { colKey: 'phone', title: '手机号', width: 150 },
  { colKey: 'content', title: '短信内容', width: 300, ellipsis: true },
  { colKey: 'template_code', title: '模板代码', width: 120 },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'send_time', title: '发送时间', width: 180 }
]

const fetchLogs = () => {
  if (currentTab.value === 'email_log') {
    loadEmailLogs()
  } else if (currentTab.value === 'sms_log') {
    loadSmsLogs()
  }
}

// 监听 Tab 切换
watch(currentTab, (newTab) => {
  if (newTab === 'system') {
    loadNotifications()
  } else if (newTab === 'email_log') {
    loadEmailLogs()
  } else if (newTab === 'sms_log') {
    loadSmsLogs()
  }
})

// 监听筛选条件变化
watch([notifyFilter, notifyTypeFilter], () => {
  pagination.current = 1
  loadNotifications()
})

// 监听分页变化
watch(() => pagination.current, () => {
  loadNotifications()
})

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped lang="less">
.notification-center-page {
  min-height: 100vh;
  background-color: var(--td-bg-color-page);
}

.top-navbar {
  background: var(--td-bg-color-container);
  border-bottom: 1px solid var(--td-component-border);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.navbar-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-center {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.page-subtitle {
  color: var(--td-text-color-placeholder);
  font-size: 14px;
  margin: 4px 0 0 0;
}

.content-card {
  background: var(--td-bg-color-container);
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  padding: 16px;
  min-height: 600px;
}

.tab-content {
  padding-top: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;
}

.toolbar-left {
  display: flex;
  gap: 16px;
  align-items: center;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--td-text-color-placeholder);
  
  :deep(.t-icon) {
    margin-bottom: 8px;
  }
  
  p {
    margin: 0;
  }
}

.notification-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--td-component-border);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &:hover {
    background-color: var(--td-bg-color-container-hover);
  }
  
  &.unread {
    background-color: rgba(0, 82, 217, 0.05);
    
    &:hover {
      background-color: rgba(0, 82, 217, 0.08);
    }
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 4px;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--td-text-color-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--td-error-color);
  display: inline-block;
}

.notification-time {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  white-space: nowrap;
}

.notification-text {
  color: var(--td-text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.notification-link {
  margin-top: 8px;
  
  a {
    color: var(--td-brand-color);
    font-size: 12px;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

.notification-actions {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s;
  
  .notification-item:hover & {
    opacity: 1;
  }
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.log-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

:deep(.t-table) {
  .mr-1 {
    margin-right: 4px;
  }
  
  .cursor-help {
    cursor: help;
  }
}
</style>
