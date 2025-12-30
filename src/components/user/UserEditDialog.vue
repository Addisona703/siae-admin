<template>
  <t-dialog v-model:visible="visible" :header="null" width="700px" attach="body" :footer="false" @close="handleClose"
    class="user-edit-dialog" placement="center">
    <div class="user-edit-container">
      <!-- 顶部：头像区域 -->
      <div class="banner-wrapper">
        <div class="banner-section">
          <div class="banner-gradient"></div>
        </div>

        <div class="avatar-section">
          <div class="avatar-wrapper">
            <t-avatar :image="formData.avatarUrl" size="80px" class="profile-avatar">
              {{ formData.nickname?.[0]?.toUpperCase() || formData.username?.[0]?.toUpperCase() || 'U' }}
            </t-avatar>
          </div>

          <div v-if="formData.id" class="user-id-wrapper">
            <div class="user-id">
              ID: {{ formData.id }}
            </div>
          </div>
        </div>
      </div>

      <!-- 表单主体 -->
      <t-form ref="formRef" :data="formData" :rules="rules" label-align="top" class="form-content"
        @submit="handleSubmit">
        <t-tabs v-model="activeTab">

          <!-- Tab 1: 基础信息 -->
          <t-tab-panel value="basic" label="基础信息">
            <div class="form-grid">
              <t-form-item label="用户名" name="username" help="">
                <t-input v-model="formData.username" placeholder="请输入用户名" />
              </t-form-item>

              <t-form-item label="真实姓名" name="realName">
                <t-input v-model="formData.realName" placeholder="请输入真实姓名" />
              </t-form-item>

              <t-form-item label="昵称" name="nickname">
                <t-input v-model="formData.nickname" placeholder="请输入展示昵称" />
              </t-form-item>

              <t-form-item label="账号状态" name="status">
                <div class="status-wrapper">
                  <t-switch v-model="formData.status" :custom-value="[1, 0]" size="large" />
                  <span :class="['status-text', formData.status === 1 ? 'status-active' : 'status-disabled']">
                    {{ formData.status === 1 ? '已启用' : '已禁用' }}
                  </span>
                </div>
              </t-form-item>

              <t-form-item label="新密码" name="password" help="留空则不修改密码">
                <t-input v-model="formData.password" type="password" placeholder="输入新密码" clearable>
                  <template #prefix-icon><t-icon name="lock-on" /></template>
                </t-input>
              </t-form-item>

              <t-form-item label="个人简介" name="bio" class="full-width">
                <t-textarea v-model="formData.bio" placeholder="请输入个人简介" :maxlength="200" :autosize="{ minRows: 2, maxRows: 4 }" />
              </t-form-item>
            </div>
          </t-tab-panel>

          <!-- Tab 2: 联系方式 -->
          <t-tab-panel value="contact" label="联系方式">
            <div class="form-grid">
              <t-form-item label="电子邮箱" name="email">
                <t-input v-model="formData.email" placeholder="example@domain.com">
                  <template #prefix-icon><t-icon name="mail" /></template>
                </t-input>
              </t-form-item>

              <t-form-item label="手机号码" name="phone">
                <t-input v-model="formData.phone" placeholder="11位手机号码">
                  <template #prefix-icon><t-icon name="mobile" /></template>
                </t-input>
              </t-form-item>

              <t-form-item label="QQ号" name="qq">
                <t-input v-model="formData.qq" placeholder="请输入QQ号">
                  <template #prefix-icon><t-icon name="logo-qq" /></template>
                </t-input>
              </t-form-item>

              <t-form-item label="身份证号" name="idCard">
                <t-input v-model="formData.idCard" placeholder="请输入18位身份证号">
                  <template #prefix-icon><t-icon name="user-safety" /></template>
                </t-input>
              </t-form-item>
            </div>
          </t-tab-panel>

          <!-- Tab 3: 学籍信息 -->
          <t-tab-panel value="academic" label="学籍信息">
            <div class="form-grid">
              <t-form-item label="学号" name="studentId">
                <t-input v-model="formData.studentId" placeholder="请输入学号" />
              </t-form-item>

              <t-form-item label="入学年份" name="entryYear">
                <t-date-picker v-model="yearStr" mode="year" placeholder="选择年份" class="w-full"
                  @change="handleYearChange" />
              </t-form-item>

              <t-form-item label="所属专业" name="majorId">
                <t-input-number v-model="formData.majorId" theme="column" placeholder="专业ID" class="w-full"
                  align="left" />
              </t-form-item>

              <t-form-item label="班号" name="classNo">
                <t-input-number v-model="formData.classNo" theme="column" placeholder="班级序号" class="w-full"
                  align="left" />
              </t-form-item>
            </div>
          </t-tab-panel>
        </t-tabs>

        <!-- 底部操作栏 -->
        <div class="form-footer">
          <t-button variant="outline" @click="handleClose">取消修改</t-button>
          <t-button theme="primary" type="submit" :loading="submitting">保存变更</t-button>
        </div>
      </t-form>
    </div>
  </t-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { searchUserDetail, EditUser } from '@/api/user/user'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  userId: {
    type: [Number, String],
    default: undefined
  }
})

const emit = defineEmits(['update:visible', 'success'])

const visible = ref(props.visible)
const activeTab = ref('basic')
const submitting = ref(false)
const formRef = ref()
const confirmPassword = ref('')

// 表单数据初始化
const defaultData = {
  status: 1
}
const formData = ref({ ...defaultData })

// 用于日期选择器的临时变量
const yearStr = ref('')

// 表单校验规则
const rules = {
  realName: [{ required: true, message: '真实姓名不能为空', type: 'error' }],
  email: [{ email: true, message: '请输入正确的邮箱格式', type: 'warning' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', type: 'warning' }],
  password: [
    { min: 6, message: '密码长度至少6位', type: 'warning', trigger: 'blur' }
  ],
  qq: [{ pattern: /^[1-9]\d{4,10}$/, message: '请输入正确的QQ号', type: 'warning' }],
  idCard: [{ pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '请输入正确的身份证号', type: 'warning' }]
}

// 监听 props.visible 和 userId
watch(
  () => props.visible,
  async (val) => {
    visible.value = val
    if (val && props.userId) {
      await loadUserDetail()
    } else if (val && !props.userId) {
      formData.value = { ...defaultData }
      yearStr.value = ''
      confirmPassword.value = ''
    }
  }
)

watch(visible, (val) => emit('update:visible', val))

// 加载用户详情
const loadUserDetail = async () => {
  if (!props.userId) return

  try {
    const response = await searchUserDetail({ id: props.userId })

    // 添加 response 存在性检查
    if (!response) {
      MessagePlugin.error('获取用户详情失败：服务器无响应')
      visible.value = false
      return
    }

    if (response.code === 200 && response.data) {
      formData.value = JSON.parse(JSON.stringify(response.data))

      // 转换 status 字段：如果是字符串，转换为数字
      if (typeof formData.value.status === 'string') {
        formData.value.status = formData.value.status === '启用' ? 1 : 0
      }
      // 确保 status 是数字类型
      if (formData.value.status === undefined || formData.value.status === null) {
        formData.value.status = 1 // 默认启用
      }

      // 初始化特殊字段
      if (formData.value.entryYear) {
        yearStr.value = String(formData.value.entryYear)
      }
    } else {
      MessagePlugin.error(response.message || '获取用户详情失败')
      visible.value = false
    }
  } catch (error) {
    MessagePlugin.error('获取用户详情失败')
    console.error('loadUserDetail error:', error)
    visible.value = false
  }
}

// 处理年份变化
const handleYearChange = (val) => {
  formData.value.entryYear = val ? parseInt(val) : undefined
}

// 提交表单
const handleSubmit = async ({ validateResult, firstError }) => {
  if (validateResult === true) {
    // 验证密码一致性
    if (formData.value.password && formData.value.password !== confirmPassword.value) {
      MessagePlugin.warning('两次输入的密码不一致')
      return
    }

    submitting.value = true
    try {
      if (props.userId) {
        const updateData = { ...formData.value }
        // 如果密码为空，则不提交密码字段
        if (!updateData.password) {
          delete updateData.password
        }
        // 移除不需要的字段
        delete updateData.avatarFileId

        const response = await EditUser(updateData)

        if (!response) {
          MessagePlugin.error('更新失败：服务器无响应')
          return
        }

        if (response.code === 200) {
          MessagePlugin.success('用户信息更新成功')
          emit('success')
          handleClose()
        } else {
          MessagePlugin.error(response.message || '更新失败')
        }
      }
    } catch (error) {
      MessagePlugin.error('更新失败，请重试')
      console.error('更新用户失败:', error)
    } finally {
      submitting.value = false
    }
  } else {
    console.log('Validate Errors: ', firstError, validateResult)
    MessagePlugin.warning(firstError || '请检查表单填写是否正确')
  }
}

const handleClose = () => {
  emit('update:visible', false)
  confirmPassword.value = ''
  formData.value = { ...defaultData }
  yearStr.value = ''
  setTimeout(() => {
    activeTab.value = 'basic'
  }, 200)
}
</script>

<style scoped lang="less">
.user-edit-container {
  .banner-wrapper {
    position: relative;

    .banner-section {
      position: relative;
      height: 120px;
      overflow: hidden;
      margin: -24px -24px 0 -24px;

      .banner-gradient {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--td-brand-color-1) 0%, var(--td-brand-color-3) 100%);
      }
    }

    .avatar-section {
      position: absolute;
      bottom: 0;
      left: 32px;
      transform: translateY(50%);
      z-index: 20;
      display: flex;
      align-items: flex-end;
      gap: 16px;

      .avatar-wrapper {
        position: relative;
        cursor: pointer;

        .profile-avatar {
          border: 4px solid var(--td-bg-color-container);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          background: var(--td-bg-color-container);
        }
      }

      .user-id-wrapper {
        margin-bottom: 18px;

        .user-id {
          font-size: 12px;
          font-weight: 600;
          font-family: monospace;
          color: var(--td-text-color-primary);
          background: var(--td-bg-color-container);
          backdrop-filter: blur(8px);
          padding: 4px 12px;
          border-radius: 100px;
          border: 1px solid var(--td-component-border);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
      }
    }
  }

  .form-content {
    margin-top: 60px;
    padding: 0 24px 20px;

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px 24px;
      margin-top: 16px;

      .full-width {
        grid-column: 1 / -1;
      }

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }



    .status-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;

      .status-text {
        font-size: 14px;
        font-weight: 500;

        &.status-active {
          color: var(--td-success-color);
        }

        &.status-disabled {
          color: var(--td-error-color);
        }
      }
    }

    .form-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid var(--td-component-border);
    }
  }

  .w-full {
    width: 100%;
  }
}

:deep(.t-form__label) {
  color: var(--td-text-color-secondary);
  font-size: 14px;
  font-weight: 500;
}

:deep(.t-input--disabled) {
  background-color: var(--td-bg-color-component);
  color: var(--td-text-color-placeholder);
}
</style>

<style lang="less">
.user-edit-dialog {

  // 弹窗居中
  .t-dialog__position {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .t-dialog {
    border-radius: 12px;
    overflow: hidden;
    margin: 0 auto;
  }

  .t-dialog__header {
    display: none !important;
  }

  .t-dialog__body {
    padding: 0;
  }

  .t-dialog--default {
    padding: 0 !important;
  }
}
</style>
