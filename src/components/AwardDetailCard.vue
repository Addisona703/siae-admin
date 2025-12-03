<template>
  <t-dialog v-model:visible="visible" :header="null" :footer="false" width="900px" :close-btn="true"
    :close-on-overlay-click="true" class="award-detail-dialog">
    <div v-if="awardData" class="award-detail-card">
      <!-- 左侧：证书预览区 -->
      <div class="certificate-section">
        <div class="top-decoration"></div>

        <div class="certificate-container">
          <div class="certificate-wrapper">
            <div class="certificate-inner">
              <t-icon name="award" class="cert-icon" />
              <h3 class="cert-title">荣誉证书</h3>
              <p class="cert-subtitle">CERTIFICATE OF HONOR</p>
              <p class="cert-award-title">{{ awardData.awardTitle }}</p>
              <div class="cert-qr">
                <img :src="getQRCode()" alt="QR Code" />
              </div>
            </div>
          </div>

          <!-- 悬浮操作层 -->
          <div class="hover-actions">
            <t-button theme="default" size="small" @click="previewLarge">
              <template #icon><t-icon name="browse" /></template>
              预览大图
            </t-button>
            <t-button theme="primary" size="small" @click="downloadCert">
              <template #icon><t-icon name="download" /></template>
              下载
            </t-button>
          </div>
        </div>

        <!-- 底部文件信息 -->
        <div class="file-info">
          <span class="file-id">
            <t-icon name="file-check" />
            文件ID: {{ awardData.certificateFileId || 'N/A' }}
          </span>
          <t-tag theme="success" size="small" variant="light">已归档</t-tag>
        </div>
      </div>

      <!-- 右侧：详细信息区 -->
      <div class="info-section">
        <!-- 头部：标题与标签 -->
        <div class="info-header">
          <div class="badges-row">
            <t-tag :theme="getLevelTheme(awardData.awardLevelName)" size="small" variant="light-outline">
              {{ awardData.awardLevelName }}
            </t-tag>
            <t-tag theme="default" size="small" variant="light">
              {{ awardData.awardTypeName }}
            </t-tag>
            <span class="award-id">#{{ awardData.id }}</span>
          </div>

          <h1 class="award-title">{{ awardData.awardTitle }}</h1>

          <div class="meta-info">
            <t-tooltip :content="awardData.awardedBy" placement="top">
              <span class="meta-item">
                <t-icon name="building" />
                <span class="meta-text">{{ awardData.awardedBy }}</span>
              </span>
            </t-tooltip>
            <span class="divider"></span>
            <span class="meta-item">
              <t-icon name="calendar" />
              {{ awardData.awardedAt }}
            </span>
          </div>
        </div>

        <!-- 中部：获奖描述 -->
        <div class="info-body">
          <h3 class="section-title">
            <t-icon name="file-text" />
            获奖详情
          </h3>
          <p class="description">
            {{ awardData.description || '暂无详细描述...' }}
          </p>

          <!-- 团队成员 -->
          <div class="team-section">
            <AwardTeamMembers :members="awardData.teamMemberList || []" />
          </div>
        </div>

        <!-- 底部：元数据与操作 -->
        <div class="info-footer">
          <div class="timestamps">
            <p>创建时间: {{ formatTime(awardData.createdAt) }}</p>
            <p>最后更新: {{ formatTime(awardData.updatedAt) }}</p>
          </div>
          <div class="actions">
            <t-button size="small" variant="outline" @click="handleEdit">
              编辑记录
            </t-button>
            <t-button size="small" theme="primary" @click="generatePoster">
              生成海报
            </t-button>
          </div>
        </div>
      </div>
    </div>
  </t-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import AwardTeamMembers from './AwardTeamMembers.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  awardId: {
    type: Number,
    default: undefined
  },
  awardData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'edit', 'refresh'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 获取二维码
const getQRCode = () => {
  const data = props.awardData?.id || 'Award'
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data}`
}

// 获取等级主题
const getLevelTheme = (levelName) => {
  if (levelName?.includes('国家')) return 'danger'
  if (levelName?.includes('省')) return 'warning'
  if (levelName?.includes('校')) return 'primary'
  return 'default'
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return 'N/A'
  return timeStr.replace('T', ' ')
}

// 预览大图
const previewLarge = () => {
  if (!props.awardData?.certificateFileId) {
    MessagePlugin.warning('该奖项暂无证书文件')
    return
  }

  // TODO: 调用文件预览API
  MessagePlugin.info('预览大图功能开发中...')
}

// 下载证书
const downloadCert = () => {
  if (!props.awardData?.certificateFileId) {
    MessagePlugin.warning('该奖项暂无证书文件')
    return
  }

  // TODO: 调用文件下载API
  MessagePlugin.success('证书下载中...')
}

// 编辑记录
const handleEdit = () => {
  if (props.awardData) {
    emit('edit', props.awardData)
    visible.value = false
  }
}

// 生成海报
const generatePoster = () => {
  MessagePlugin.info('海报生成功能开发中...')
}
</script>

<style scoped lang="less">
.award-detail-dialog {
  :deep(.t-dialog__body) {
    padding: 0;
  }
}

.award-detail-card {
  display: flex;
  min-height: 500px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

// 左侧证书区
.certificate-section {
  width: 40%;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: relative;

  &:hover .hover-actions {
    opacity: 1;
  }
}

.top-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(to right, #3b82f6, #6366f1);
}

.certificate-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
}

.certificate-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1.414;
  max-width: 280px;
  background: white;
  border: 8px double rgba(202, 138, 4, 0.3);
  border-radius: 2px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transition: transform 0.5s;

  &:hover {
    transform: scale(1.05);
  }
}

.certificate-inner {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  border: 1px solid #e2e8f0;
  margin: 8px;

  .cert-icon {
    font-size: 48px;
    color: #eab308;
    margin-bottom: 8px;
  }

  .cert-title {
    font-family: serif;
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 4px;
  }

  .cert-subtitle {
    font-size: 10px;
    color: #64748b;
    margin-bottom: 16px;
  }

  .cert-award-title {
    font-size: 12px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8px;
    padding: 0 8px;
  }

  .cert-qr {
    margin-top: auto;
    margin-bottom: 16px;

    img {
      width: 40px;
      height: 40px;
      opacity: 0.8;
      mix-blend-mode: multiply;
    }
  }
}

.hover-actions {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.file-info {
  padding: 16px;
  background: white;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #64748b;

  .file-id {
    display: flex;
    align-items: center;
    gap: 4px;
  }
}

// 右侧信息区
.info-section {
  width: 60%;
  display: flex;
  flex-direction: column;
  max-height: 600px;
}

.info-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;

  .badges-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;

    .award-id {
      margin-left: auto;
      font-size: 12px;
      color: #94a3b8;
      font-family: monospace;
    }
  }

  .award-title {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.4;
    margin-bottom: 12px;
  }

  .meta-info {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
    color: #64748b;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: 200px;

      .meta-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .divider {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #cbd5e1;
      flex-shrink: 0;
    }
  }
}

.info-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 12px;

    .t-icon {
      color: #3b82f6;
    }
  }

  .description {
    font-size: 14px;
    color: #475569;
    line-height: 1.6;
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .team-section {
    margin-top: 24px;
  }
}

.info-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .timestamps {
    font-size: 12px;
    color: #94a3b8;

    p {
      margin: 0;
      line-height: 1.6;
    }
  }

  .actions {
    display: flex;
    gap: 8px;
  }
}
</style>
