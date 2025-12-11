<template>
  <div class="award-ranking">
    <t-loading :loading="loading">
      <div v-if="data.length === 0" class="award-ranking__empty">
        <t-empty description="暂无数据" />
      </div>
      <div v-else class="award-ranking__list">
        <div v-for="(item, index) in data" :key="item.userId" class="award-ranking__item" @click="handleClick(item)">
          <div class="award-ranking__rank">
            <span v-if="index < 3" class="award-ranking__medal" :class="`medal-${index + 1}`">
              {{ ['🥇', '🥈', '🥉'][index] }}
            </span>
            <span v-else class="award-ranking__number">{{ index + 1 }}</span>
          </div>

          <div class="award-ranking__avatar">
            <t-avatar :image="getAvatarUrl(item.avatarUrl)" size="large">
              {{ item.realName?.charAt(0) || item.username.charAt(0) }}
            </t-avatar>
          </div>

          <div class="award-ranking__info">
            <div class="award-ranking__name">{{ item.realName || item.username }}</div>
            <div class="award-ranking__username">@{{ item.username }}</div>
          </div>

          <div class="award-ranking__chart">
            <div class="award-ranking__bar">
              <div v-if="item.nationalCount > 0" class="award-ranking__bar-segment award-ranking__bar-segment--national"
                :style="{ width: getBarWidth(item.nationalCount) }" :title="`国家级: ${item.nationalCount}`"></div>
              <div v-if="item.provincialCount > 0"
                class="award-ranking__bar-segment award-ranking__bar-segment--provincial"
                :style="{ width: getBarWidth(item.provincialCount) }" :title="`省级: ${item.provincialCount}`"></div>
              <div v-if="item.schoolCount > 0" class="award-ranking__bar-segment award-ranking__bar-segment--school"
                :style="{ width: getBarWidth(item.schoolCount) }" :title="`校级: ${item.schoolCount}`"></div>
            </div>
            <div class="award-ranking__counts">
              <span class="count count--national">国家{{ item.nationalCount }}</span>
              <span class="count count--provincial">省{{ item.provincialCount }}</span>
              <span class="count count--school">校{{ item.schoolCount }}</span>
            </div>
          </div>

          <div class="award-ranking__total">
            <div class="total-label">总获奖</div>
            <div class="total-value">{{ item.awardCount }}</div>
          </div>
        </div>
      </div>
    </t-loading>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['userClick'])

const maxAwardCount = computed(() => {
  return Math.max(...props.data.map(item => item.awardCount), 1)
})

const getBarWidth = (count) => {
  const percentage = (count / maxAwardCount.value) * 100
  return `${percentage}%`
}

const getAvatarUrl = (url) => {
  console.log(url)
  if (!url) return undefined
  // 只有当 URL 以 http 或 / 开头时才认为是有效的图片 URL
  // 否则可能是一个文件 ID，此时应该显示文字头像
  if (url.startsWith('http') || url.startsWith('/')) {
    return url
  }
  return undefined
}

const handleClick = (item) => {
  emit('userClick', item.userId)
}
</script>

<style scoped lang="less">
.award-ranking {
  &__empty {
    padding: 40px 0;
    text-align: center;
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__item {
    display: flex;
    align-items: center;
    padding: 20px;
    background: var(--td-bg-color-container);
    border: 1px solid var(--td-component-border);
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: var(--td-brand-color);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px) scale(1.005);
      z-index: 1;
    }
  }

  &__rank {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    flex-shrink: 0;
  }

  &__medal {
    font-size: 32px;
    line-height: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  &__number {
    font-size: 20px;
    font-weight: 700;
    color: var(--td-text-color-placeholder);
    font-family: 'Outfit', sans-serif;
  }

  &__avatar {
    flex-shrink: 0;
    margin: 0 20px;
    transition: transform 0.3s ease;
  }

  &__item:hover &__avatar {
    transform: scale(1.1);
  }

  &__info {
    flex: 1;
    min-width: 0;
    margin-right: 24px;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: var(--td-text-color-primary);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__username {
    font-size: 13px;
    color: var(--td-text-color-placeholder);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__chart {
    flex-shrink: 0;
    width: 220px;
    margin-right: 24px;
  }

  &__bar {
    display: flex;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
    background: var(--td-bg-color-component);
    margin-bottom: 12px;
  }

  &__bar-segment {
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    height: 100%;

    &--national {
      background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
    }

    &--provincial {
      background: linear-gradient(90deg, #faad14 0%, #ffc53d 100%);
    }

    &--school {
      background: linear-gradient(90deg, #1890ff 0%, #69c0ff 100%);
    }
  }

  &__counts {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;

    .count {
      flex: 1;
      text-align: center;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      white-space: nowrap;
      font-size: 11px;

      &--national {
        color: #f5222d;
        background: rgba(245, 34, 45, 0.06);
        border: none;
      }

      &--provincial {
        color: #faad14;
        background: rgba(250, 173, 20, 0.06);
        border: none;
      }

      &--school {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.06);
        border: none;
      }
    }
  }

  &__total {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    min-width: 90px;
    padding-left: 24px;
    border-left: 1px solid var(--td-component-border);

    .total-label {
      font-size: 12px;
      color: var(--td-text-color-placeholder);
      margin-bottom: 4px;
      font-weight: 500;
    }

    .total-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--td-brand-color);
      line-height: 1;
      letter-spacing: -1px;
    }
  }

  // 暗黑模式优化
  html[theme-mode='dark'] & {
    &__item {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);

      &:hover {
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      }
    }
  }
}
</style>
