<template>
  <t-dialog v-model:visible="visible" :header="null" width="800px" :footer="false" @close="handleClose"
    class="user-detail-dialog" placement="center" attach="body">
    <template v-if="userDetail">
      <!-- 顶部背景与头像区域 -->
      <div class="detail-banner">
        <img
          :src="backgroundImageUrl"
          class="banner-image" 
          alt="Background"
          @error="handleBackgroundError" />
        <div class="banner-overlay"></div>
        <div class="banner-id">ID: {{ userDetail.id }}</div>
      </div>

      <div class="detail-body">
        <!-- 头像与基本信息 -->
        <div class="profile-header">
          <div class="avatar-wrapper">
            <t-avatar v-if="userDetail.avatarUrl" :image="userDetail.avatarUrl" size="120px" class="profile-avatar" />
            <t-avatar v-else size="120px" class="profile-avatar">
              {{ userDetail.nickname?.charAt(0) || userDetail.username?.charAt(0) || 'U' }}
            </t-avatar>
            <div class="gender-badge" :class="getGenderClass(userDetail.gender)">
              <t-icon v-if="userDetail.gender === 1" name="gender-male" />
              <t-icon v-else-if="userDetail.gender === 2" name="gender-female" />
              <span v-else>?</span>
            </div>
          </div>

          <div class="profile-info">
            <div class="name-section">
              <h2 class="real-name">
                {{ userDetail.realName || userDetail.nickname || userDetail.username }}
                <span v-if="userDetail.nickname" class="nickname">(@{{ userDetail.nickname }})</span>
              </h2>
              <div class="meta-info">
                <span class="username-badge">@{{ userDetail.username }}</span>
                <span v-if="userDetail.studentId" class="student-id">
                  <t-icon name="user" />
                  学号: {{ userDetail.studentId }}
                </span>
              </div>
            </div>

            <div class="status-section">
              <t-tag :theme="userDetail.status === 1 ? 'success' : 'danger'" variant="light" size="large">
                <span class="status-dot"></span>
                {{ userDetail.status === 1 ? '状态正常' : '已禁用' }}
              </t-tag>
            </div>
          </div>
        </div>

        <!-- 内容网格布局 -->
        <div class="content-grid">
          <!-- 左侧：简介与班级信息 -->
          <div class="left-column">
            <!-- 个人简介 -->
            <div v-if="userDetail.bio" class="bio-card">
              <h3 class="card-title">
                <t-icon name="info-circle" />
                个人简介
              </h3>
              <p class="bio-text">{{ userDetail.bio }}</p>
            </div>

            <!-- 班级归属 -->
            <div class="academic-card">
              <h3 class="card-title">
                <t-icon name="building" />
                班级归属
              </h3>
              <div class="academic-content">
                <div class="academic-label">专业与班级</div>
                <div class="academic-major">{{ userDetail.entryYear }}级 {{ userDetail.majorName || '未设置' }}</div>
                <div class="academic-class">{{ userDetail.className || (userDetail.classNo ? userDetail.classNo + '班' :
                  '未分配班级') }}</div>
                <div class="academic-footer">
                  <div class="footer-item">
                    <div class="footer-label">成员类型</div>
                    <div class="footer-value" :class="isMember(userDetail.memberType) ? 'text-success' : ''">
                      {{ userDetail.memberType || '-' }}
                    </div>
                  </div>
                  <div class="footer-item">
                    <div class="footer-label">加入时间</div>
                    <div class="footer-value">{{ userDetail.joinDate || '-' }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：详细信息 -->
          <div class="right-column">
            <!-- 基本资料 -->
            <div class="info-section">
              <h3 class="section-title">基本资料</h3>
              <div class="info-grid">
                <div class="info-item">
                  <t-icon name="user" class="item-icon" />
                  <div class="item-content">
                    <div class="item-label">真实姓名</div>
                    <div class="item-value">{{ userDetail.realName || '-' }}</div>
                  </div>
                </div>
                <div class="info-item">
                  <t-icon name="calendar" class="item-icon" />
                  <div class="item-content">
                    <div class="item-label">出生日期</div>
                    <div class="item-value">{{ userDetail.birthday || '-' }}</div>
                  </div>
                </div>
                <div class="info-item">
                  <t-icon name="idcard" class="item-icon" />
                  <div class="item-content">
                    <div class="item-label">身份证号</div>
                    <div class="item-value">{{ maskIdCard(userDetail.idCard) }}</div>
                  </div>
                </div>
                <div class="info-item">
                  <t-icon name="gender-male" class="item-icon" />
                  <div class="item-content">
                    <div class="item-label">性别</div>
                    <div class="item-value">{{ formatGender(userDetail.gender) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 联系方式 -->
            <div class="info-section">
              <h3 class="section-title">联系方式</h3>
              <div class="info-grid">
                <div class="info-item">
                  <t-icon name="mail" class="item-icon" />
                  <div class="item-content">
                    <div class="item-label">电子邮箱</div>
                    <div class="item-value primary">{{ userDetail.email || '-' }}</div>
                  </div>
                </div>
                <div class="info-item">
                  <t-icon name="mobile" class="item-icon" />
                  <div class="item-content">
                    <div class="item-label">手机号码</div>
                    <div class="item-value">{{ userDetail.phone || '-' }}</div>
                  </div>
                </div>
                <div class="info-item">
                  <t-icon name="chat" class="item-icon" />
                  <div class="item-content">
                    <div class="item-label">QQ</div>
                    <div class="item-value">{{ userDetail.qq || '-' }}</div>
                  </div>
                </div>
                <div class="info-item">
                  <t-icon name="logo-wechat" class="item-icon" />
                  <div class="item-content">
                    <div class="item-label">微信</div>
                    <div class="item-value">{{ userDetail.wechat || '-' }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 元数据 -->
            <div class="info-section">
              <h3 class="section-title">元数据</h3>
              <div class="info-grid metadata-grid">
                <div class="metadata-item">
                  <t-icon name="time" class="item-icon" />
                  <div class="item-content">
                    <div class="item-label">注册时间</div>
                    <div class="item-value mono">{{ formatDateTime(userDetail.createdAt) }}</div>
                  </div>
                </div>
                <div class="metadata-item">
                  <t-icon name="time" class="item-icon" />
                  <div class="item-content">
                    <div class="item-label">最后更新</div>
                    <div class="item-value mono">{{ formatDateTime(userDetail.updatedAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="loading-container">
        <t-loading size="large" text="加载中..." />
      </div>
    </template>
  </t-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { searchUserDetail } from '../../api/user/user'

// 默认背景图
const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&q=80'

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

const emit = defineEmits(['update:visible'])

const visible = ref(props.visible)
const userDetail = ref(null)
const backgroundFailed = ref(false)

// 计算背景图URL
const backgroundImageUrl = computed(() => {
  if (backgroundFailed.value) {
    return DEFAULT_BACKGROUND
  }
  const url = userDetail.value?.backgroundUrl
  return url && url.trim() ? url : DEFAULT_BACKGROUND
})

// 背景图加载失败处理
const handleBackgroundError = () => {
  backgroundFailed.value = true
}

// 监听 visible 变化
watch(() => props.visible, (newVal) => {

  visible.value = newVal
  if (newVal && props.userId) {
    loadUserDetail()
  }
})

// 监听内部 visible 变化
watch(visible, (newVal) => {
  emit('update:visible', newVal)
})

// 加载用户详情
const loadUserDetail = async () => {
  if (!props.userId) return

  userDetail.value = null
  backgroundFailed.value = false  // 重置背景图加载状态

  try {
    const response = await searchUserDetail({ id: props.userId })
    console.log('用户详情响应:', response);

    if (response.code === 200 && response.data) {
      userDetail.value = response.data
      console.log('背景图URL:', response.data.backgroundUrl)
    } else {
      MessagePlugin.error(response.message || '获取用户详情失败')
      visible.value = false
    }
  } catch (error) {
    MessagePlugin.error('获取用户详情失败')
    console.error(error)
    visible.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  userDetail.value = null
  backgroundFailed.value = false
}

// 格式化完整日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 格式化性别
const formatGender = (gender) => {
  if (gender === undefined) return '-'
  const genderMap = {
    0: '保密',
    1: '男',
    2: '女'
  }
  return genderMap[gender] || '-'
}

// 获取性别样式类
const getGenderClass = (gender) => {
  const classMap = {
    0: 'gender-unknown',
    1: 'gender-male',
    2: 'gender-female'
  }
  return classMap[gender || 0] || 'gender-unknown'
}

// 获取性别图标
const getGenderIcon = (gender) => {
  const iconMap = {
    0: '?',
    1: '<svg class="gender-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M9 9c1.29 0 2.5.41 3.47 1.11L17.58 5H13V3h8v8h-2V6.41l-5.11 5.09c.71.97 1.12 2.18 1.12 3.47c0 3.31-2.69 6-6 6s-6-2.69-6-6s2.69-6 6-6m0 2c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4s-1.79-4-4-4z"/></svg>',
    2: '<svg class="gender-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4a6 6 0 0 1 6 6c0 2.97-2.16 5.43-5 5.91V19H8v2h5v2h-2v-2h-2v-2h-1v-3.09c-2.84-.48-5-2.94-5-5.91a6 6 0 0 1 6-6m0 2a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4a4 4 0 0 0-4-4z"/></svg>'
  }
  return iconMap[gender || 0] || '?'
}

// 身份证脱敏
const maskIdCard = (idCard) => {
  if (!idCard) return '-'
  return idCard.replace(/^(.{6})(?:\d+)(.{4})$/, '$1********$2')
}

// 判断是否为协会成员
const isMember = (memberType) => {
  return memberType === '协会成员'
}
</script>

<style lang="less">
.user-detail-dialog {

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

<style scoped lang="less">
.detail-banner {
  position: relative;
  height: 250px;
  overflow: hidden;
  margin: -24px -24px 0 -24px;

  .banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .banner-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  }

  .banner-id {
    position: absolute;
    top: 40px;
    right: 40px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 12px;
    font-family: monospace;
  }
}

.detail-body {
  padding: 0 24px 24px;
}

.profile-header {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-top: -64px;
  margin-bottom: 20px;

  .avatar-wrapper {
    position: relative;

    .profile-avatar {
      border: 4px solid var(--td-bg-color-container);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .gender-badge {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 2px solid var(--td-bg-color-container);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 1;

      .gender-icon {
        width: 16px;
        height: 16px;
      }

      &.gender-male {
        background: #e3f2fd;
        color: #1976d2;
      }

      &.gender-female {
        background: #fce4ec;
        color: #c2185b;
      }

      &.gender-unknown {
        background: #f5f5f5;
        color: #9e9e9e;
      }
    }
  }

  .profile-info {
    flex: 1;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    .name-section {
      .real-name {
        font-size: 24px;
        font-weight: 600;
        color: var(--td-text-color-primary);
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 12px;

        .nickname {
          font-size: 16px;
          font-weight: 400;
          color: var(--td-text-color-placeholder);
        }
      }

      .meta-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .username-badge {
          background: var(--td-bg-color-component);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-family: monospace;
          color: var(--td-text-color-placeholder);
        }

        .student-id {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          color: var(--td-text-color-secondary);
        }
      }
    }

    .status-section {
      .status-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        margin-right: 6px;
      }
    }
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  margin-top: 20px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.bio-card,
.academic-card {
  background: var(--td-bg-color-component);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--td-component-border);

  .card-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bio-text {
    font-size: 14px;
    line-height: 1.6;
    color: var(--td-text-color-secondary);
    margin: 0;
  }
}

.academic-card {
  background: linear-gradient(135deg, var(--td-brand-color-1) 0%, var(--td-bg-color-container) 100%);
  border: 1px solid var(--td-brand-color-2);

  .card-title {
    color: var(--td-brand-color);
  }

  .academic-content {
    .academic-label {
      font-size: 12px;
      color: var(--td-brand-color-7);
      margin-bottom: 4px;
    }

    .academic-major {
      font-size: 16px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin-bottom: 2px;
    }

    .academic-class {
      font-size: 14px;
      color: var(--td-text-color-secondary);
      margin-bottom: 12px;
    }

    .academic-footer {
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid var(--td-brand-color-2);

      .footer-item {
        .footer-label {
          font-size: 12px;
          color: var(--td-brand-color-7);
          margin-bottom: 2px;
        }

        .footer-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--td-text-color-primary);

          &.text-success {
            color: var(--td-success-color);
          }
        }
      }
    }
  }
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin: 0 0 16px 0;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--td-component-border);
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 24px;

    .info-item,
    .metadata-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .item-icon {
        color: var(--td-text-color-placeholder);
        font-size: 20px;
        margin-top: 2px;
        flex-shrink: 0;
      }

      .item-content {
        flex: 1;
        min-width: 0;

        .item-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--td-text-color-placeholder);
          margin-bottom: 4px;
        }

        .item-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--td-text-color-primary);
          word-break: break-all;

          &.primary {
            color: var(--td-brand-color);
          }

          &.mono {
            font-family: monospace;
            color: var(--td-text-color-secondary);
          }
        }
      }
    }
  }

  .metadata-grid {
    gap: 16px 24px;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>
