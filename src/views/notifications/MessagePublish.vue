<template>
  <div class="message-publish-page">
    <!-- 头部 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <SendIcon />
          消息发布台
        </h1>
        <p class="page-subtitle">向用户发送系统通知、邮件或短信</p>
      </div>
      <t-button variant="outline" theme="default" @click="viewHistory">
        <template #icon><HistoryIcon /></template>
        查看发送记录
      </t-button>
    </div>

    <div class="content-wrapper">
      <!-- 左侧：配置表单 -->
      <div class="form-section">
        <t-form ref="formRef" :data="formData" :rules="rules" label-align="top" @submit="onSubmit">
          
          <!-- 渠道选择 -->
          <div class="channel-selector">
            <label class="form-label">发送渠道</label>
            <t-radio-group v-model="channel" variant="default-filled">
              <t-radio-button value="system">
                <span class="radio-content"><NotificationIcon /> 站内信</span>
              </t-radio-button>
              <t-radio-button value="email">
                <span class="radio-content"><MailIcon /> 邮件 (Email)</span>
              </t-radio-button>
              <t-radio-button value="sms">
                <span class="radio-content"><ChatIcon /> 短信 (SMS)</span>
              </t-radio-button>
            </t-radio-group>
          </div>

          <!-- 站内信配置 -->
          <template v-if="channel === 'system'">
            <div class="form-grid">
              <t-form-item label="通知类型" name="system.type">
                <t-select v-model="formData.system.type">
                  <t-option :value="1" label="系统通知 (System)" />
                  <t-option :value="2" label="公告 (Announcement)" />
                  <t-option :value="3" label="提醒 (Remind)" />
                </t-select>
              </t-form-item>
              
              <t-form-item label="发送对象" name="system.targetType">
                <t-select v-model="formData.system.targetType">
                  <t-option value="all" label="全员广播" />
                  <t-option value="specific" label="指定用户ID" />
                </t-select>
              </t-form-item>
            </div>
            
            <t-form-item 
              v-if="formData.system.targetType === 'specific'" 
              label="用户ID列表" 
              name="system.userIds"
              help="多个ID用逗号分隔"
            >
              <t-input v-model="formData.system.userIds" placeholder="例如: 1001, 1002" />
            </t-form-item>

            <t-form-item label="通知标题" name="system.title">
              <t-input v-model="formData.system.title" placeholder="请输入标题" />
            </t-form-item>

            <t-form-item label="通知内容" name="system.content">
              <t-textarea 
                v-model="formData.system.content" 
                placeholder="请输入详细内容..." 
                :autosize="{ minRows: 4, maxRows: 6 }" 
              />
            </t-form-item>

            <t-form-item label="跳转链接 (可选)" name="system.link">
              <t-input v-model="formData.system.link" placeholder="例如: /profile/settings">
                <template #prefix-icon><LinkIcon /></template>
              </t-input>
            </t-form-item>
          </template>

          <!-- 邮件配置 -->
          <template v-if="channel === 'email'">
            <t-form-item label="收件人邮箱" name="email.recipients" help="多个邮箱用分号分隔">
              <t-textarea 
                v-model="formData.email.recipients" 
                placeholder="user@example.com; admin@example.com" 
                :autosize="{ minRows: 2 }" 
              />
            </t-form-item>

            <t-form-item label="邮件主题" name="email.subject">
              <t-input v-model="formData.email.subject" placeholder="请输入邮件主题" />
            </t-form-item>

            <t-form-item label="邮件正文" name="email.content">
              <t-textarea 
                v-model="formData.email.content" 
                placeholder="支持简单的 HTML 标签..." 
                :autosize="{ minRows: 8 }" 
              />
              <template #tips>
                <span class="text-gray-400">支持 HTML</span>
              </template>
            </t-form-item>
          </template>

          <!-- 短信配置 -->
          <template v-if="channel === 'sms'">
            <t-form-item label="手机号码列表" name="sms.phones" help="多个号码用逗号分隔">
              <t-textarea 
                v-model="formData.sms.phones" 
                placeholder="13800138000, 13900139000" 
                :autosize="{ minRows: 3 }" 
              />
            </t-form-item>

            <t-alert theme="warning" message="注意：短信发送需遵循运营商规范，建议使用预设模板代码。" class="mb-4" />

            <t-form-item label="模板代码 (Template Code)" name="sms.templateCode">
              <t-input v-model="formData.sms.templateCode" placeholder="例如: SMS_123456789" />
            </t-form-item>

            <t-form-item label="短信内容 / 模板参数" name="sms.content">
              <t-textarea 
                v-model="formData.sms.content" 
                placeholder="如果使用模板，请在此输入JSON格式参数；否则输入直接内容。" 
                :autosize="{ minRows: 4 }" 
              />
            </t-form-item>
          </template>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <t-button theme="primary" type="submit" size="large" :loading="sending">
              <template #icon><SendIcon /></template>
              立即发送
            </t-button>
            <t-button theme="default" variant="outline" size="large" @click="resetForm">
              保存草稿
            </t-button>
          </div>
          
        </t-form>
      </div>

      <!-- 右侧：实时预览 -->
      <div class="preview-section">
        <div class="preview-label">终端实时预览</div>
        <div class="device-mockup">
          <div class="device-notch"></div>
          
          <!-- 状态栏 -->
          <div class="status-bar">
            <span>09:41</span>
            <div class="status-icons">
              <WifiIcon />
              <BatteryIcon />
            </div>
          </div>

          <!-- 预览内容区 -->
          <div class="preview-area">
            <!-- 站内信预览 -->
            <transition name="fade">
              <div v-if="channel === 'system'" class="preview-system">
                <div class="preview-time">刚刚</div>
                <div class="notification-card">
                  <div class="notification-icon" :class="getNotificationIconClass()">
                    <component :is="getNotificationIcon()" />
                  </div>
                  <div class="notification-content">
                    <div class="notification-title">{{ formData.system.title || '通知标题' }}</div>
                    <div class="notification-text">{{ formData.system.content || '这里将显示通知的具体内容...' }}</div>
                    <div v-if="formData.system.link" class="notification-link">
                      查看详情 <ChevronRightIcon />
                    </div>
                  </div>
                </div>
              </div>
            </transition>

            <!-- 邮件预览 -->
            <transition name="fade">
              <div v-if="channel === 'email'" class="preview-email">
                <div class="email-header">
                  <div class="email-to">To: {{ formData.email.recipients ? formData.email.recipients.split(';')[0] + '...' : '收件人' }}</div>
                  <div class="email-subject">{{ formData.email.subject || '无主题' }}</div>
                </div>
                <div class="email-body">
                  {{ formData.email.content || '邮件内容预览...' }}
                </div>
              </div>
            </transition>

            <!-- 短信预览 -->
            <transition name="fade">
              <div v-if="channel === 'sms'" class="preview-sms">
                <div class="sms-time">
                  <span class="time-badge">星期一 14:20</span>
                </div>
                <div class="sms-bubble-wrapper">
                  <div class="sms-avatar">S</div>
                  <div class="sms-bubble">
                    <p>{{ formData.sms.content || '短信内容预览...' }}</p>
                    <div v-if="formData.sms.templateCode" class="sms-template">
                      Template: {{ formData.sms.templateCode }}
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          
          <!-- 底部Home条 -->
          <div class="home-indicator"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useRouter } from 'vue-router'
import { notificationApi } from '@/api/notification'
import type { MessageChannel, MessagePublishForm } from '@/types/notification'
import { 
  SendIcon, 
  HistoryIcon, 
  NotificationIcon, 
  MailIcon, 
  ChatIcon,
  WifiIcon,
  BatteryIcon,
  LinkIcon,
  ChevronRightIcon,
  SettingIcon,
  TimeIcon
} from 'tdesign-icons-vue-next'

const router = useRouter()
const formRef = ref()
const sending = ref(false)
const channel = ref<MessageChannel>('system')

// 表单数据
const formData = reactive<MessagePublishForm>({
  system: {
    type: 1,
    targetType: 'all',
    userIds: '',
    title: '',
    content: '',
    link: ''
  },
  email: {
    recipients: '',
    subject: '',
    content: ''
  },
  sms: {
    phones: '',
    templateCode: '',
    content: ''
  }
})

// 表单验证规则
const rules = {
  'system.title': [{ required: true, message: '请输入标题' }],
  'system.content': [{ required: true, message: '请输入内容' }],
  'email.recipients': [{ required: true, message: '请输入收件人' }],
  'email.subject': [{ required: true, message: '请输入主题' }],
  'email.content': [{ required: true, message: '请输入邮件内容' }],
  'sms.phones': [{ required: true, message: '请输入手机号' }],
  'sms.content': [{ required: true, message: '请输入内容' }]
}

// 提交表单
const onSubmit = async ({ validateResult, firstError }: any) => {
  if (validateResult !== true) {
    MessagePlugin.warning(firstError)
    return
  }

  sending.value = true
  
  try {
    if (channel.value === 'system') {
      const userIds = formData.system.targetType === 'specific' 
        ? formData.system.userIds.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id))
        : undefined

      await notificationApi.broadcastSystemNotification({
        type: formData.system.type,
        targetType: formData.system.targetType,
        userIds,
        title: formData.system.title,
        content: formData.system.content,
        linkUrl: formData.system.link || undefined
      })
    } else if (channel.value === 'email') {
      const recipients = formData.email.recipients.split(';').map(r => r.trim()).filter(r => r)
      
      await notificationApi.sendBatchEmails({
        recipients,
        subject: formData.email.subject,
        content: formData.email.content
      })
    } else if (channel.value === 'sms') {
      const phones = formData.sms.phones.split(',').map(p => p.trim()).filter(p => p)
      
      await notificationApi.sendBatchSms({
        phones,
        templateCode: formData.sms.templateCode,
        content: formData.sms.content
      })
    }

    MessagePlugin.success('发送任务已提交')
    resetForm()
  } catch (error: any) {
    MessagePlugin.error(error.message || '发送失败')
  } finally {
    sending.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.system = {
    type: 1,
    targetType: 'all',
    userIds: '',
    title: '',
    content: '',
    link: ''
  }
  formData.email = {
    recipients: '',
    subject: '',
    content: ''
  }
  formData.sms = {
    phones: '',
    templateCode: '',
    content: ''
  }
}

// 查看历史记录
const viewHistory = () => {
  router.push('/notifications/history')
}

// 获取通知图标类名
const getNotificationIconClass = () => {
  const type = formData.system.type
  if (type === 1) return 'icon-blue'
  if (type === 2) return 'icon-orange'
  return 'icon-green'
}

// 获取通知图标组件
const getNotificationIcon = () => {
  const type = formData.system.type
  if (type === 1) return SettingIcon
  if (type === 2) return NotificationIcon
  return TimeIcon
}
</script>

<style scoped lang="less">
.message-publish-page {
  padding: 24px;
  background-color: #f3f4f7;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.page-subtitle {
  color: #6b7280;
  font-size: 14px;
  margin: 4px 0 0 0;
}

.content-wrapper {
  display: flex;
  gap: 24px;
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
}

.form-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.channel-selector {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: #374151;
  margin-bottom: 8px;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 16px;
}

.preview-section {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 1024px) {
    width: 100%;
  }
}

.preview-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: bold;
  margin-bottom: 12px;
}

.device-mockup {
  border: 8px solid #1f2937;
  border-radius: 30px;
  overflow: hidden;
  background: #fff;
  position: relative;
  height: 600px;
  width: 320px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.device-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 20px;
  background: #1f2937;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  z-index: 20;
}

.status-bar {
  height: 48px;
  background: #f3f4f6;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 16px 8px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 12px;
  color: #4b5563;
  font-weight: 500;
}

.status-icons {
  display: flex;
  gap: 4px;
}

.preview-area {
  height: calc(100% - 48px);
  overflow-y: auto;
  background-color: #f9fafb;
  padding: 16px;
  position: relative;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.home-indicator {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 128px;
  height: 4px;
  background: #d1d5db;
  border-radius: 9999px;
}

// 站内信预览
.preview-system {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-time {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin: 8px 0;
}

.notification-card {
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  
  &.icon-blue {
    background: #3b82f6;
  }
  
  &.icon-orange {
    background: #f97316;
  }
  
  &.icon-green {
    background: #10b981;
  }
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: bold;
  font-size: 14px;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notification-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.notification-link {
  margin-top: 8px;
  color: #3b82f6;
  font-size: 12px;
  display: flex;
  align-items: center;
}

// 邮件预览
.preview-email {
  background: white;
  height: 100%;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.email-header {
  background: #f9fafb;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.email-to {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.email-subject {
  font-weight: bold;
  font-size: 14px;
  color: #1f2937;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.email-body {
  padding: 16px;
  font-size: 14px;
  color: #4b5563;
  flex: 1;
  overflow-y: auto;
  word-break: break-word;
  white-space: pre-wrap;
  font-family: serif;
}

// 短信预览
.preview-sms {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.sms-time {
  display: flex;
  justify-content: center;
}

.time-badge {
  font-size: 12px;
  background: #e5e7eb;
  padding: 4px 8px;
  border-radius: 4px;
  color: #6b7280;
}

.sms-bubble-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.sms-avatar {
  width: 32px;
  height: 32px;
  background: #d1d5db;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.sms-bubble {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 12px;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 80%;
  font-size: 14px;
  color: #1f2937;
  word-break: break-word;
  position: relative;
  
  p {
    margin: 0;
  }
}

.sms-template {
  font-size: 10px;
  color: #9ca3af;
  margin-top: 4px;
}

// 动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
