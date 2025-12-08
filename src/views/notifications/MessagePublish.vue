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

      <!-- 已移除实时预览部分 -->
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { useRouter } from 'vue-router'
import { notificationApi } from '@/api/notification'
import { 
  SendIcon, 
  HistoryIcon, 
  NotificationIcon, 
  MailIcon, 
  ChatIcon,
  LinkIcon,
} from 'tdesign-icons-vue-next'

const router = useRouter()
const formRef = ref()
const sending = ref(false)
const channel = ref('system')

// 表单数据
const formData = reactive({
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

// 通知类型映射 (前端数字 -> 后端期望的中文名称)
// 后端 NotificationType 枚举使用 @JsonValue 标注在 name 字段上
const NOTIFICATION_TYPE_MAP = {
  1: '系统通知',
  2: '公告', 
  3: '提醒'
}

// 提交表单
const onSubmit = async ({ validateResult, firstError }) => {
  if (validateResult !== true) {
    MessagePlugin.warning(firstError)
    return
  }

  sending.value = true
  
  try {
    if (channel.value === 'system') {
      // 站内信发送
      if (formData.system.targetType === 'specific') {
        // 指定用户发送：循环调用 /send 接口
        const userIds = formData.system.userIds
          .split(',')
          .map(id => Number(id.trim()))
          .filter(id => !isNaN(id) && id > 0)

        if (userIds.length === 0) {
          MessagePlugin.warning('请输入有效的用户ID')
          sending.value = false
          return
        }

        // 批量发送给指定用户
        const sendPromises = userIds.map(userId => 
          notificationApi.sendNotification({
            userId,
            type: NOTIFICATION_TYPE_MAP[formData.system.type],
            title: formData.system.title,
            content: formData.system.content,
            linkUrl: formData.system.link || undefined
          })
        )
        
        const results = await Promise.allSettled(sendPromises)
        const successCount = results.filter(r => r.status === 'fulfilled').length
        const failCount = results.filter(r => r.status === 'rejected').length
        
        if (failCount > 0) {
          MessagePlugin.warning(`发送完成：成功 ${successCount} 个，失败 ${failCount} 个`)
        } else {
          MessagePlugin.success(`成功发送给 ${successCount} 个用户`)
        }
      } else {
        // 全员广播 - 使用 broadcastSystemNotification 接口
        await notificationApi.broadcastSystemNotification({
          type: NOTIFICATION_TYPE_MAP[formData.system.type],
          title: formData.system.title,
          content: formData.system.content,
          linkUrl: formData.system.link || undefined
        })
        MessagePlugin.success('广播消息已发送')
      }
      
      resetForm()
    } else if (channel.value === 'email') {
      const recipients = formData.email.recipients.split(';').map(r => r.trim()).filter(r => r)
      
      if (recipients.length === 0) {
        MessagePlugin.warning('请输入有效的收件人邮箱')
        sending.value = false
        return
      }
      
      await notificationApi.sendBatchEmails({
        recipients,
        subject: formData.email.subject,
        content: formData.email.content
      })
      
      MessagePlugin.success('邮件发送任务已提交')
      resetForm()
    } else if (channel.value === 'sms') {
      const phones = formData.sms.phones.split(',').map(p => p.trim()).filter(p => p)
      
      if (phones.length === 0) {
        MessagePlugin.warning('请输入有效的手机号码')
        sending.value = false
        return
      }
      
      await notificationApi.sendBatchSms({
        phones,
        templateCode: formData.sms.templateCode,
        content: formData.sms.content
      })
      
      MessagePlugin.success('短信发送任务已提交')
      resetForm()
    }
  } catch (error) {
    console.error('发送失败:', error)
    MessagePlugin.error(error.response?.data?.message || error.message || '发送失败，请稍后重试')
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
  router.push('/notifications')
}
</script>

<style scoped lang="less">
.message-publish-page {
  padding: 24px;
  background-color: var(--td-bg-color-page);
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
  color: var(--td-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.page-subtitle {
  color: var(--td-text-color-secondary);
  font-size: 14px;
  margin: 4px 0 0 0;
}

.content-wrapper {
  display: flex;
  justify-content: center;
}

.form-section {
  width: 100%;
  max-width: 800px; /* 限制最大宽度，保持美观 */
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-default);
  box-shadow: var(--td-shadow-1);
  padding: 32px;
}

.channel-selector {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--td-component-border);
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 16px;
}

.radio-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-actions {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--td-component-border);
  display: flex;
  justify-content: flex-end; /* 按钮靠右 */
  gap: 16px;
}
</style>
