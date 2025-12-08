<template>
  <t-dialog v-model:visible="dialogVisible" header="成员详情" width="900px" :footer="false" placement="center"
    @close="handleClose">
    <div v-if="member" class="member-detail-content">
      <!-- 头部背景区 -->
      <div class="header-bg">
        <div class="bg-pattern">
          <t-icon name="logo-codepen" size="200px" />
        </div>
      </div>

      <!-- 主要内容区 -->
      <div class="content-wrapper">
        <div class="header-info">
          <!-- 头像与基本信息 -->
          <div class="avatar-section">
            <div class="avatar-wrapper">
              <t-avatar :image="member.headshotUrl" size="100px" shape="square">
                {{ member.realName?.[0] || '?' }}
              </t-avatar>
              <!-- 状态角标 -->
              <div class="status-badge">
                <t-tag v-if="member.lifecycleStatus === 1" theme="primary" shape="mark" size="small">
                  {{ member.lifecycleStatusName }}
                </t-tag>
                <t-tag v-else theme="warning" shape="mark" size="small">
                  {{ member.lifecycleStatusName }}
                </t-tag>
              </div>
            </div>
            <div class="basic-info">
              <h1 class="member-name">
                {{ member.realName }}
                <span class="student-id">{{ member.userId }}</span>
              </h1>
              <div class="meta-info">
                <span class="meta-item">
                  <t-icon name="user-circle" />
                  用户ID: {{ member.userId }}
                </span>
                <span class="divider" />
                <span class="meta-item">
                  <t-icon name="time" />
                  {{ formatDate(member.joinDate || member.createdAt) }} 入会
                </span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <t-button theme="primary" variant="outline" size="small">
              <template #icon>
                <t-icon name="edit" />
              </template>
              更新资料
            </t-button>
            <t-dropdown :options="[
              { content: '转为校友', value: 1 },
              { content: '强制退会', value: 2, theme: 'error' }
            ]">
              <t-button theme="default" variant="outline" size="small">
                <t-icon name="more" />
              </t-button>
            </t-dropdown>
          </div>
        </div>

        <!-- 详细信息区域 -->
        <div class="detail-sections">
          <!-- 组织归属 -->
          <t-descriptions title="组织归属" :column="3" layout="vertical" bordered>
            <!-- 只有正式成员才显示部门和职务 -->
            <t-descriptions-item v-if="member.lifecycleStatus === 2" label="当前部门">
              <t-tag v-if="currentDepartment !== '-'" theme="primary" variant="light-outline">
                {{ currentDepartment }}
              </t-tag>
              <span v-else class="empty-text">-</span>
            </t-descriptions-item>
            <t-descriptions-item v-if="member.lifecycleStatus === 2" label="现任职务">
              <span v-if="currentPosition !== '-'" class="position-text">
                {{ currentPosition }}
              </span>
              <span v-else class="empty-text">-</span>
            </t-descriptions-item>
            <t-descriptions-item label="入会时长">
              {{ calculateDuration(member.joinDate || member.createdAt) }}
            </t-descriptions-item>
            <t-descriptions-item label="在校状态">
              <span class="status-text">
                <t-icon name="check-circle-filled" />
                {{ member.enrollmentStatus === 1 ? '在读' : '离校' }}
              </span>
            </t-descriptions-item>
            <t-descriptions-item label="最近更新">
              {{ formatDate(member.updatedAt) }}
            </t-descriptions-item>
          </t-descriptions>

          <!-- 学籍档案 -->
          <t-descriptions title="学籍档案" :column="3" layout="vertical" bordered>
            <t-descriptions-item label="专业">
              {{ member.majorName || '-' }}
            </t-descriptions-item>
            <t-descriptions-item label="年级班级">
              <span v-if="member.entryYear">
                {{ member.entryYear }}级
              </span>
              <span v-else class="empty-text">-</span>
            </t-descriptions-item>
            <t-descriptions-item label="个人简介">
              {{ member.bio || '-' }}
            </t-descriptions-item>
          </t-descriptions>

          <!-- 个人简介（如果内容较长） -->
          <div v-if="member.bio && member.bio.length > 50" class="bio-section">
            <div class="section-title">
              <span>个人简介</span>
            </div>
            <div class="bio-content">
              {{ member.bio }}
            </div>
          </div>

          <!-- 获奖记录 -->
          <div class="awards-section">
            <div class="section-header">
              <span class="section-title-inline">近期奖项</span>
              <t-link theme="primary" size="small" @click="viewAllAwards">
                查看全部
              </t-link>
            </div>
            <div v-if="recentAwards.length > 0" class="awards-grid">
              <div v-for="award in recentAwards" :key="award.id" class="award-card">
                <div class="award-icon">
                  <t-icon name="medal" size="large" />
                </div>
                <div class="award-info">
                  <div class="award-title">{{ award.awardTitle }}</div>
                  <div class="award-meta">
                    {{ award.awardLevelName }} · {{ formatDate(award.awardedAt) }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="empty-awards">
              <t-icon name="inbox" size="48px" />
              <p>暂无获奖记录</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部信息栏 -->
      <div class="footer-bar">
        <span class="update-time">
          档案最后更新：{{ formatDateTime(member.updatedAt) }}
        </span>
        <t-button variant="text" theme="default">
          <template #icon>
            <t-icon name="file-pdf" />
          </template>
          导出档案
        </t-button>
      </div>
    </div>
  </t-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { getAwards, getMemberDetail } from '../../../api/user/user'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  memberId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:visible'])

// 成员详情数据
const member = ref(null)
const loading = ref(false)

// 获奖记录
const recentAwards = ref([])

// 加载成员详情
const loadMemberDetail = async () => {
  if (!props.memberId) {
    // console.log('没有memberId，无法加载成员详情')
    return
  }

  loading.value = true
  try {
    // console.log('加载成员详情，memberId:', props.memberId)
    const response = await getMemberDetail(props.memberId)
    console.log(123789);
    console.log(response);

    // console.log('成员详情响应:', response)
    if (response.code === 200 && response.data) {
      member.value = response.data
      // console.log('成员详情加载成功:', member.value)
      // 加载获奖记录
      if (member.value.userId) {
        loadAwards(member.value.userId)
      }
    }
  } catch (error) {
    console.error('获取成员详情失败:', error)
    MessagePlugin.error('加载成员详情失败')
  } finally {
    loading.value = false
  }
}

// 加载获奖记录
const loadAwards = async (userId) => {
  try {
    // console.log('加载获奖记录，userId:', userId)
    const response = await getAwards(userId)
    // console.log('获奖记录响应:', response)
    if (response.code === 200 && response.data) {
      recentAwards.value = response.data.records || []
      // console.log('获奖记录数量:', recentAwards.value.length)
    }
  } catch (error) {
    console.error('获取获奖记录失败:', error)
    // 失败时设置为空数组，显示空状态
    recentAwards.value = []
  }
}

const dialogVisible = ref(props.visible)

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val && props.memberId) {
      loadMemberDetail()
    }
  }
)

watch(dialogVisible, (val) => {
  emit('update:visible', val)
  if (!val) {
    // 关闭时清空数据
    member.value = null
    recentAwards.value = []
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

// 计算当前部门（取第一个）
const currentDepartment = computed(() => {
  return member.value?.departments?.[0]?.departmentName || '-'
})

// 计算当前职位（取第一个未结束的）
const currentPosition = computed(() => {
  const activePosition = member.value?.positions?.find(p => !p.endDate)
  return activePosition?.positionName || '-'
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.split('T')[0]
}

// 格式化日期时间
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

// 计算入会时长
const calculateDuration = (startDateStr) => {
  if (!startDateStr) return '-'
  const start = new Date(startDateStr)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays > 365) {
    return `${(diffDays / 365).toFixed(1)} 年`
  }
  return `${diffDays} 天`
}

// 查看全部奖项
const viewAllAwards = () => {
  MessagePlugin.info('跳转到获奖记录页面')
}
</script>

<style scoped lang="less">
.member-detail-content {

  // 头部背景
  .header-bg {
    position: relative;
    height: 128px;
    background: linear-gradient(to right, #2563eb, #4f46e5);
    overflow: hidden;
    margin: -24px -24px 0;

    .bg-pattern {
      position: absolute;
      right: 0;
      top: 0;
      opacity: 0.1;
      color: white;
      transform: translate(40px, -40px);
    }
  }

  // 内容区
  .content-wrapper {
    padding: 0 32px 32px;

    .header-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: -48px;
      margin-bottom: 24px;

      .avatar-section {
        display: flex;
        align-items: flex-end;
        gap: 20px;

        .avatar-wrapper {
          position: relative;

          :deep(.t-avatar) {
            border: 4px solid white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
          }

          .status-badge {
            position: absolute;
            bottom: -8px;
            right: -8px;
          }
        }

        .basic-info {
          margin-bottom: 4px;

          .member-name {
            font-size: 24px;
            font-weight: 700;
            color: var(--td-text-color-primary);
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 0 0 8px 0;

            .student-id {
              font-size: 14px;
              font-weight: 400;
              color: var(--td-text-color-placeholder);
              background: var(--td-bg-color-container);
              padding: 2px 8px;
              border-radius: 4px;
            }
          }

          .meta-info {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            color: var(--td-text-color-secondary);

            .meta-item {
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .divider {
              height: 12px;
              width: 1px;
              background: var(--td-component-border);
            }
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }
    }

    // 详细信息区域
    .detail-sections {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .position-text {
        font-weight: 600;
        color: var(--td-brand-color);
      }

      .status-text {
        color: var(--td-success-color);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .empty-text {
        color: var(--td-text-color-placeholder);
      }

      // 个人简介区域
      .bio-section {
        .section-title {
          margin-bottom: 12px;
          font-size: 15px;
          font-weight: 700;
          color: var(--td-text-color-primary);
          border-left: 4px solid var(--td-brand-color);
          padding-left: 10px;
        }

        .bio-content {
          background: var(--td-bg-color-container);
          padding: 16px;
          border-radius: 8px;
          line-height: 1.6;
          color: var(--td-text-color-secondary);
        }
      }

      // 获奖记录区域
      .awards-section {
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          .section-title-inline {
            font-size: 15px;
            font-weight: 700;
            color: var(--td-text-color-primary);
            border-left: 4px solid var(--td-brand-color);
            padding-left: 10px;
          }
        }

        .awards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;

          .award-card {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            background: var(--td-bg-color-container);
            border-radius: 8px;
            padding: 16px;
            border: 1px solid transparent;
            transition: all 0.2s;

            &:hover {
              border-color: var(--td-component-border);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            }

            .award-icon {
              background: white;
              padding: 8px;
              border-radius: 6px;
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
              color: #f59e0b;
              flex-shrink: 0;
            }

            .award-info {
              flex: 1;
              min-width: 0;

              .award-title {
                font-weight: 500;
                color: var(--td-text-color-primary);
                margin-bottom: 4px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }

              .award-meta {
                font-size: 12px;
                color: var(--td-text-color-placeholder);
              }
            }
          }
        }

        .empty-awards {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 0;
          color: var(--td-text-color-placeholder);

          p {
            margin-top: 12px;
            font-size: 14px;
          }
        }
      }
    }
  }

  // 底部信息栏
  .footer-bar {
    background: var(--td-bg-color-container);
    padding: 12px 24px;
    border-top: 1px solid var(--td-component-border);
    margin: 32px -24px -24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .update-time {
      font-size: 14px;
      color: var(--td-text-color-placeholder);
    }
  }
}

// TDesign 描述组件样式调整
:deep(.t-descriptions__header) {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 700;
  color: var(--td-text-color-primary);
  border-left: 4px solid var(--td-brand-color);
  padding-left: 10px;
}
</style>
