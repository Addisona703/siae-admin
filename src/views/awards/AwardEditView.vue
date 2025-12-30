<template>
  <div class="award-edit-view">
    <t-loading :loading="loading" size="large" :text="loading ? '加载中...' : ''">
      <!-- 头部导航 -->
      <div class="page-header">
        <div class="header-left">
          <t-button variant="text" @click="handleBack">
            <template #icon><t-icon name="chevron-left" /></template>
          </t-button>
          <div>
            <h1 class="page-title">{{ isEdit ? '编辑获奖记录' : '新增获奖记录' }}</h1>
            <p v-if="isEdit" class="page-subtitle">ID: #{{ formData.id }}</p>
          </div>
        </div>
        <div class="header-actions">
          <t-button variant="outline" @click="handleCancel">取消</t-button>
          <t-button theme="primary" @click="handleSave" :loading="saving">
            <template #icon><t-icon name="check" /></template>
            保存更改
          </t-button>
        </div>
      </div>

      <div class="content-grid">
        <!-- 左侧：主要表单 -->
        <div class="main-form">
          <!-- 基础信息 -->
          <t-card title="基础信息" :bordered="false" class="form-card">
            <template #header>
              <div class="card-header">
                <span class="header-indicator"></span>
                <span class="header-title">基础信息</span>
              </div>
            </template>

            <t-form :data="formData" :rules="rules" ref="formRef" label-width="100px">
              <t-form-item label="奖项名称" name="awardTitle">
                <t-input v-model="formData.awardTitle" placeholder="请输入奖项的全称" clearable />
              </t-form-item>

              <t-row :gutter="16">
                <t-col :span="6">
                  <t-form-item label="奖项等级" name="awardLevelId">
                    <t-select v-model="formData.awardLevelId" placeholder="请选择" clearable>
                      <t-option v-for="level in awardLevels" :key="level.id" :value="level.id" :label="level.name" />
                    </t-select>
                  </t-form-item>
                </t-col>
                <t-col :span="6">
                  <t-form-item label="奖项类型" name="awardTypeId">
                    <t-select v-model="formData.awardTypeId" placeholder="请选择" clearable>
                      <t-option v-for="type in awardTypes" :key="type.id" :value="type.id" :label="type.name" />
                    </t-select>
                  </t-form-item>
                </t-col>
              </t-row>

              <t-row :gutter="16">
                <t-col :span="6">
                  <t-form-item label="颁发单位" name="awardedBy">
                    <t-input v-model="formData.awardedBy" placeholder="例如：教育部" clearable>
                      <template #prefix-icon>
                        <t-icon name="building" />
                      </template>
                    </t-input>
                  </t-form-item>
                </t-col>
                <t-col :span="6">
                  <t-form-item label="获奖日期" name="awardedAt">
                    <t-date-picker v-model="formData.awardedAt" placeholder="选择日期" clearable style="width: 100%" />
                  </t-form-item>
                </t-col>
              </t-row>

              <t-form-item label="详细描述" name="description">
                <t-textarea v-model="formData.description" placeholder="简要描述获奖项目的背景、难点或成果..." :maxlength="500"
                  :autosize="{ minRows: 4, maxRows: 8 }" />
                <template #tips>
                  <span class="char-count">{{ formData.description?.length || 0 }}/500</span>
                </template>
              </t-form-item>
            </t-form>
          </t-card>

          <!-- 获奖团队 -->
          <t-card :bordered="false" class="form-card">
            <template #header>
              <div class="card-header">
                <span class="header-indicator" style="background: #6366f1"></span>
                <span class="header-title">获奖团队</span>
                <div class="header-actions">
                  <MemberSelector @select="addMember" />
                </div>
              </div>
            </template>

            <div class="team-members">
              <transition-group name="list" tag="div" class="member-list">
                <div v-for="(member, index) in formData.teamMemberList" :key="member.id" class="member-item">
                  <t-avatar :image="getAvatarUrl(member)" size="40px" />
                  <div class="member-info">
                    <div class="member-name">
                      {{ member.nickname }}
                      <t-tag v-if="index === 0" theme="warning" size="small" variant="light">
                        队长
                      </t-tag>
                    </div>
                    <div class="member-id">{{ member.studentId }}</div>
                  </div>
                  <t-button theme="danger" variant="text" size="small" @click="removeMember(index)">
                    <template #icon><t-icon name="delete" /></template>
                  </t-button>
                </div>
              </transition-group>

              <div v-if="formData.teamMemberList.length === 0" class="empty-members">
                <t-icon name="user-add" class="empty-icon" />
                <p>暂无成员，请点击右上角添加</p>
              </div>
            </div>
          </t-card>
        </div>

        <!-- 右侧：证书上传 -->
        <div class="sidebar">
          <t-card :bordered="false" class="form-card sticky-card">
            <template #header>
              <div class="card-header">
                <span class="header-indicator" style="background: #f97316"></span>
                <span class="header-title">荣誉凭证</span>
              </div>
            </template>

            <div class="certificate-upload">
              <t-upload v-model="fileList" theme="image" :auto-upload="false" accept="image/*,.pdf" :max="1"
                :size-limit="{ size: 5, unit: 'MB' }" @change="handleFileChange">
                <template #file-list-display>
                  <div v-if="previewUrl" class="preview-container">
                    <img :src="previewUrl" class="preview-image" />
                    <div class="preview-overlay">
                      <t-button theme="danger" size="small" @click.stop="clearFile">
                        更换文件
                      </t-button>
                    </div>
                  </div>
                </template>
              </t-upload>

              <t-alert theme="warning" class="upload-tip">
                <template #icon><t-icon name="info-circle" /></template>
                请确保上传的证书清晰完整，包含颁发单位公章和获奖日期。
              </t-alert>
            </div>
          </t-card>
        </div>
      </div>
    </t-loading>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { userApi } from '@/api/user'
import MemberSelector from '@/components/MemberSelector.vue'
import { mediaUploader } from '@/utils/upload-utils'

const route = useRoute()
const router = useRouter()

const formRef = ref(null)
const saving = ref(false)
const loading = ref(false)
const awardLevels = ref([])
const awardTypes = ref([])
const fileList = ref([])
const previewUrl = ref('')

// 判断是编辑还是新增
const isEdit = computed(() => !!route.params.id)

// 判断是否通过路由传递了数据
const hasRouteData = computed(() => !!route.params.data)

// 表单数据
const formData = ref({
  id: undefined,
  awardTitle: '',
  awardLevelId: undefined,
  awardTypeId: undefined,
  awardedBy: '',
  awardedAt: '',
  description: '',
  certificateFileId: '',
  teamMemberList: []
})

// 表单验证规则
const rules = {
  awardTitle: [
    { required: true, message: '请输入奖项名称', type: 'error' }
  ],
  awardLevelId: [
    { required: true, message: '请选择奖项等级', type: 'error' }
  ],
  awardTypeId: [
    { required: true, message: '请选择奖项类型', type: 'error' }
  ],
  awardedBy: [
    { required: true, message: '请输入颁发单位', type: 'error' }
  ],
  awardedAt: [
    { required: true, message: '请选择获奖日期', type: 'error' }
  ]
}

// 获取头像URL
const getAvatarUrl = (member) => {
  if (member.avatarUrl) return member.avatarUrl
  if (member.avatarFileId) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.avatarFileId}`
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`
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

// 填充表单数据
const fillFormData = (data) => {
  formData.value = {
    id: data.id,
    awardTitle: data.awardTitle,
    awardLevelId: data.awardLevelId,
    awardTypeId: data.awardTypeId,
    awardedBy: data.awardedBy,
    awardedAt: data.awardedAt,
    description: data.description || '',
    certificateFileId: data.certificateFileId || '',
    // 处理团队成员列表 - 后端返回的是 UserVO 列表
    teamMemberList: (data.teamMemberList || []).map(member => ({
      id: member.id,
      studentId: member.studentId,
      nickname: member.nickname || member.realName,
      avatarUrl: member.avatarUrl,
      avatarFileId: member.avatarFileId
    }))
  }

  // 加载证书预览
  if (data.certificateUrl) {
    previewUrl.value = data.certificateUrl
  } else if (data.certificateFileId) {
    // 如果有文件ID但没有URL，可以尝试构建预览URL
    previewUrl.value = ''
  }
}

// 加载奖项详情
const loadAwardDetail = async (id) => {
  loading.value = true
  try {
    const result = await userApi.getAwardById(id)
    if (result.code === 200 && result.data) {
      fillFormData(result.data)
    }
  } catch (error) {
    console.error('加载奖项详情失败:', error)
    MessagePlugin.error('加载奖项详情失败')
  } finally {
    loading.value = false
  }
}

// 添加成员
const addMember = (user) => {
  // 检查是否已存在
  if (formData.value.teamMemberList.find(m => m.id === user.id)) {
    MessagePlugin.warning('该成员已在列表中')
    return
  }

  formData.value.teamMemberList.push({
    id: user.id,
    studentId: user.studentId,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    avatarFileId: user.avatarFileId
  })
}

// 移除成员
const removeMember = (index) => {
  formData.value.teamMemberList.splice(index, 1)
}

// 文件变化
const handleFileChange = (files) => {
  if (files.length > 0) {
    const file = files[0]
    if (file.raw) {
      const reader = new FileReader()
      reader.onload = (e) => {
        previewUrl.value = e.target?.result
      }
      reader.readAsDataURL(file.raw)
    }
  }
}

// 清除文件
const clearFile = () => {
  fileList.value = []
  previewUrl.value = ''
}

// 返回
const handleBack = () => {
  router.back()
}

// 取消
const handleCancel = () => {
  DialogPlugin.confirm({
    header: '确认取消',
    body: '确定要取消编辑吗？未保存的更改将丢失。',
    confirmBtn: '确定',
    cancelBtn: '继续编辑',
    onConfirm: () => {
      router.back()
    }
  })
}

// 保存
const handleSave = async () => {
  const valid = await formRef.value?.validate()
  if (valid !== true) {
    MessagePlugin.warning('请完善必填信息')
    return
  }

  saving.value = true
  try {
    // 上传证书文件（如果有新文件）
    let certificateFileId = formData.value.certificateFileId
    if (fileList.value.length > 0 && fileList.value[0].raw) {
      const file = fileList.value[0].raw
      try {
        const uploadTask = await mediaUploader.upload(file, {
          tenantId: 'ai',
          accessPolicy: 'PUBLIC',
          bizTags: ['award-certificate'],
          onProgress: (percent) => {
            console.log(`上传进度: ${percent}%`)
          }
        })
        certificateFileId = uploadTask.fileId
      } catch (uploadError) {
        console.error('证书上传失败:', uploadError)
        MessagePlugin.error('证书文件上传失败')
        saving.value = false
        return
      }
    }

    // 构造提交数据 - teamMembers 直接传数组，不要 JSON.stringify
    const payload = {
      awardTitle: formData.value.awardTitle,
      awardLevelId: formData.value.awardLevelId,
      awardTypeId: formData.value.awardTypeId,
      awardedBy: formData.value.awardedBy,
      awardedAt: formData.value.awardedAt,
      description: formData.value.description,
      certificateFileId: certificateFileId,
      teamMembers: formData.value.teamMemberList.map(m => m.id)
    }

    let result
    if (isEdit.value) {
      result = await userApi.updateAward(formData.value.id, payload)
    } else {
      result = await userApi.createAward(payload)
    }

    if (result.code === 200) {
      MessagePlugin.success(isEdit.value ? '更新成功' : '创建成功')
      router.push({ name: 'AwardList' })
    }
  } catch (error) {
    console.error('保存失败:', error)
    MessagePlugin.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 初始化
onMounted(async () => {
  await loadDictData()

  if (isEdit.value) {
    // 始终调用接口获取完整数据，确保包含 teamMemberList 和 certificateUrl
    const id = Number(route.params.id)
    await loadAwardDetail(id)
  }
})
</script>

<style scoped lang="less">
.award-edit-view {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0;
  }

  .page-subtitle {
    font-size: 14px;
    color: var(--td-text-color-placeholder);
    margin: 4px 0 0;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.main-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-card {
  :deep(.t-card__body) {
    padding: 24px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;

  .header-indicator {
    width: 4px;
    height: 20px;
    background: #3b82f6;
    border-radius: 2px;
  }

  .header-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--td-text-color-primary);
  }

  .header-actions {
    margin-left: auto;
  }
}

.char-count {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.team-members {
  .member-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .member-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--td-bg-color-container);
    border: 1px solid var(--td-component-border);
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: var(--td-bg-color-container-hover);
      border-color: var(--td-brand-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .member-info {
      flex: 1;
      min-width: 0;

      .member-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 500;
        color: var(--td-text-color-primary);
        margin-bottom: 4px;
      }

      .member-id {
        font-size: 12px;
        color: var(--td-text-color-placeholder);
        font-family: monospace;
      }
    }
  }

  .empty-members {
    text-align: center;
    padding: 40px 20px;
    border: 2px dashed var(--td-component-border);
    border-radius: 8px;
    color: var(--td-text-color-placeholder);

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    p {
      font-size: 14px;
      margin: 0;
    }
  }
}

// 列表动画
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.sidebar {
  .sticky-card {
    position: sticky;
    top: 24px;
  }
}

.certificate-upload {
  .preview-container {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;

    &:hover .preview-overlay {
      opacity: 1;
    }

    .preview-image {
      width: 100%;
      height: auto;
      display: block;
      border: 1px solid var(--td-component-border);
      border-radius: 8px;
    }

    .preview-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }
  }

  .upload-tip {
    margin-top: 16px;
  }
}
</style>
