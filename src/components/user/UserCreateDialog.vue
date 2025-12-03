<template>
  <t-dialog v-model:visible="dialogVisible" header="新建用户" width="720px" :footer="false" @close="handleClose"
    placement="center" attach="body">
    <t-form ref="formRef" :data="formData" label-align="top" @submit="handleSubmit">
      <t-tabs v-model="activeTab">
        <!-- 基础信息 -->
        <t-tab-panel value="basic" label="基础信息">
          <div class="form-grid">
            <t-form-item label="用户名" name="username">
              <t-input v-model="formData.username" placeholder="请输入用户名" clearable>
                <template #prefix-icon><t-icon name="user" /></template>
              </t-input>
            </t-form-item>

            <t-form-item label="密码" name="password">
              <t-input v-model="formData.password" type="password" placeholder="请输入密码" clearable>
                <template #prefix-icon><t-icon name="lock-on" /></template>
              </t-input>
            </t-form-item>

            <t-form-item label="真实姓名" name="realName">
              <t-input v-model="formData.realName" placeholder="请输入真实姓名" clearable />
            </t-form-item>

            <t-form-item label="昵称" name="nickname">
              <t-input v-model="formData.nickname" placeholder="请输入昵称" clearable />
            </t-form-item>

            <t-form-item label="性别" name="gender">
              <t-radio-group v-model="formData.gender">
                <t-radio :value="1">男</t-radio>
                <t-radio :value="2">女</t-radio>
                <t-radio :value="0">保密</t-radio>
              </t-radio-group>
            </t-form-item>

            <t-form-item label="出生日期" name="birthday">
              <t-date-picker v-model="formData.birthday" placeholder="选择出生日期" style="width: 100%" />
            </t-form-item>

            <t-form-item label="身份证号" name="idCard">
              <t-input v-model="formData.idCard" placeholder="请输入身份证号" clearable />
            </t-form-item>

            <t-form-item label="账号状态" name="status">
              <t-select v-model="formData.status" placeholder="请选择状态">
                <t-option :value="1" label="启用" />
                <t-option :value="0" label="禁用" />
              </t-select>
            </t-form-item>
          </div>
        </t-tab-panel>

        <!-- 联系方式 -->
        <t-tab-panel value="contact" label="联系方式">
          <div class="form-grid">
            <t-form-item label="邮箱" name="email">
              <t-input v-model="formData.email" placeholder="请输入邮箱" clearable>
                <template #prefix-icon><t-icon name="mail" /></template>
              </t-input>
            </t-form-item>

            <t-form-item label="手机号" name="phone">
              <t-input v-model="formData.phone" placeholder="请输入手机号" clearable>
                <template #prefix-icon><t-icon name="mobile" /></template>
              </t-input>
            </t-form-item>

            <t-form-item label="QQ" name="qq">
              <t-input v-model="formData.qq" placeholder="请输入QQ号" clearable>
                <template #prefix-icon><t-icon name="chat" /></template>
              </t-input>
            </t-form-item>

            <t-form-item label="微信" name="wechat">
              <t-input v-model="formData.wechat" placeholder="请输入微信号" clearable>
                <template #prefix-icon><t-icon name="logo-wechat" /></template>
              </t-input>
            </t-form-item>
          </div>
        </t-tab-panel>

        <!-- 学籍信息 -->
        <t-tab-panel value="academic" label="学籍信息">
          <div class="form-grid">
            <t-form-item label="学号" name="studentId">
              <t-input v-model="formData.studentId" placeholder="请输入学号" clearable />
            </t-form-item>

            <t-form-item label="入学年份" name="entryYear">
              <t-date-picker v-model="entryYearStr" mode="year" placeholder="选择入学年份" style="width: 100%"
                @change="handleYearChange" />
            </t-form-item>

            <t-form-item label="专业" name="majorId">
              <t-select v-model="formData.majorId" placeholder="请选择专业" filterable>
                <t-option v-for="m in majorOptions" :key="m.value" :value="m.value" :label="m.label" />
              </t-select>
            </t-form-item>

            <t-form-item label="班号" name="classNo">
              <t-input-number v-model="formData.classNo" placeholder="班级序号" style="width: 100%" :min="1" />
            </t-form-item>

            <t-form-item label="成员类型" name="memberType">
              <t-select v-model="formData.memberType" placeholder="请选择成员类型">
                <t-option value="MEMBER" label="协会成员" />
                <t-option value="NON_MEMBER" label="非协会成员" />
              </t-select>
            </t-form-item>

            <t-form-item label="加入日期" name="joinDate">
              <t-date-picker v-model="formData.joinDate" placeholder="选择加入日期" style="width: 100%" />
            </t-form-item>
          </div>
        </t-tab-panel>

        <!-- 个人简介 -->
        <t-tab-panel value="bio" label="个人简介">
          <t-form-item label="个人简介" name="bio">
            <t-textarea v-model="formData.bio" placeholder="简单介绍一下自己..." :maxlength="200"
              :autosize="{ minRows: 4, maxRows: 8 }" />
          </t-form-item>
        </t-tab-panel>
      </t-tabs>

      <div class="form-footer">
        <t-button variant="outline" @click="handleClose">取消</t-button>
        <t-button theme="primary" type="submit" :loading="submitting">创建用户</t-button>
      </div>
    </t-form>
  </t-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(false)
const formRef = ref()
const submitting = ref(false)
const activeTab = ref('basic')
const entryYearStr = ref('')

// 专业选项
const majorOptions = [
  { label: '软件技术', value: 1 },
  { label: '移动应用开发', value: 2 },
  { label: '计算机网络技术', value: 3 },
  { label: '大数据技术', value: 4 },
  { label: '人工智能技术应用', value: 5 }
]

// 表单数据
const defaultFormData = {
  username: '',
  password: '',
  realName: '',
  nickname: '',
  gender: 0,
  birthday: '',
  idCard: '',
  status: 1,
  email: '',
  phone: '',
  qq: '',
  wechat: '',
  studentId: '',
  entryYear: undefined,
  majorId: undefined,
  classNo: undefined,
  memberType: 'MEMBER',
  joinDate: '',
  bio: '',
  avatarFileId: '',
  backgroundFileId: ''
}

const formData = ref({ ...defaultFormData })

// 表单校验规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', type: 'error' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', type: 'error' }
  ],
  password: [
    { required: true, message: '请输入密码', type: 'error' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', type: 'error' }
  ],
  realName: [{ required: true, message: '请输入真实姓名', type: 'error' }],
  email: [{ email: true, message: '请输入正确的邮箱格式', type: 'warning' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', type: 'warning' }],
  idCard: [
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '身份证格式不正确', type: 'warning' }
  ]
}

// 监听 visible
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val) {
      formData.value = { ...defaultFormData }
      entryYearStr.value = ''
      activeTab.value = 'basic'
    }
  }
)

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

// 处理年份变化
const handleYearChange = (val) => {
  formData.value.entryYear = val ? parseInt(val) : undefined
}

// 提交表单
import { postUser } from '../../api/user/user'
const handleSubmit = async () => {
  console.log(formData.value);

  let res = await postUser(formData.value)
  console.log(res);

  // if (res.code == 200) {
  //   MessagePlugin.success('用户创建成功')
  //   console.log(res);
  // }

  // if (validateResult === true) {
  //     submitting.value = true
  //     try {
  //         // TODO: 调用创建用户API
  //         // const response = await createUser(formData.value)

  //         // 模拟API调用
  //         await new Promise((resolve) => setTimeout(resolve, 1000))

  //         MessagePlugin.success('用户创建成功')
  //         emit('success')
  //         handleClose()
  //     } catch (error) {
  //         MessagePlugin.error(error.message || '创建失败，请重试')
  //         console.error(error)
  //     } finally {
  //         submitting.value = false
  //     }
  // } else {
  //     MessagePlugin.warning(firstError || '请检查表单填写是否正确')
  // }
}

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.reset()
}
</script>

<style scoped lang="less">
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
  padding: 16px 0;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--td-component-border);
}

// 统一弹窗内的 Tabs 样式
:deep(.t-tabs) {
  .t-tabs__nav {
    background: transparent;
  }

  .t-tabs__nav-item {
    color: var(--td-text-color-secondary);

    &.t-is-active {
      color: var(--td-brand-color);
    }

    &:hover {
      color: var(--td-brand-color);
    }
  }

  .t-tabs__nav-item-wrapper {
    background: transparent;
  }
}

// 统一表单标签颜色
:deep(.t-form__label) {
  color: var(--td-text-color-secondary);
}
</style>
