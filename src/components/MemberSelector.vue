<template>
  <div class="member-selector">
    <div class="selector-trigger">
      <t-button theme="primary" variant="outline" size="small" @click="visible = true">
        <template #icon><t-icon name="user-add" /></template>
        添加成员
      </t-button>
    </div>

    <t-dialog v-model:visible="visible" header="选择团队成员" width="600px" :footer="false">
      <div class="member-search-dialog">
        <!-- 搜索框 -->
        <t-input v-model="searchKeyword" placeholder="搜索学号或姓名..." clearable @change="handleSearch">
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>

        <!-- 搜索结果列表 -->
        <div class="search-results">
          <t-loading :loading="loading" size="small">
            <div v-if="searchResults.length > 0" class="result-list">
              <div v-for="user in searchResults" :key="user.id" class="result-item" @click="selectMember(user)">
                <t-avatar :image="getAvatarUrl(user)" size="40px" />
                <div class="user-info">
                  <p class="user-name">{{ user.nickname }}</p>
                  <p class="user-id">{{ user.studentId }}</p>
                </div>
                <t-icon name="check-circle" class="check-icon" />
              </div>
            </div>
            <div v-else class="empty-state">
              <t-icon name="inbox" class="empty-icon" />
              <p>{{ searchKeyword ? '未找到匹配的成员' : '请输入关键词搜索' }}</p>
            </div>
          </t-loading>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { userApi } from '@/api/user'

const emit = defineEmits(['select'])

const visible = ref(false)
const loading = ref(false)
const searchKeyword = ref('')
const searchResults = ref([])

// 获取头像URL
const getAvatarUrl = (user) => {
  if (user.avatarUrl) return user.avatarUrl
  if (user.avatarFileId) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarFileId}`
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
}

// 搜索成员
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    searchResults.value = []
    return
  }

  loading.value = true
  try {
    const result = await userApi.getUsers({
      pageNum: 1,
      pageSize: 20,
      username: searchKeyword.value,
      studentId: searchKeyword.value
    })

    if (result.code === 200 && result.data) {
      searchResults.value = result.data.records || []
    }
  } catch (error) {
    console.error('搜索失败:', error)
    MessagePlugin.error('搜索失败')
  } finally {
    loading.value = false
  }
}

// 选择成员
const selectMember = (user) => {
  emit('select', user)
  visible.value = false
  searchKeyword.value = ''
  searchResults.value = []
}
</script>

<style scoped lang="less">
.member-search-dialog {
  .search-results {
    margin-top: 16px;
    max-height: 400px;
    overflow-y: auto;
  }

  .result-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f8fafc;
      border-color: #bfdbfe;

      .check-icon {
        opacity: 1;
      }
    }

    .user-info {
      flex: 1;
      min-width: 0;

      .user-name {
        font-size: 14px;
        font-weight: 500;
        color: #1e293b;
        margin: 0;
      }

      .user-id {
        font-size: 12px;
        color: #94a3b8;
        font-family: monospace;
        margin: 0;
      }
    }

    .check-icon {
      color: #3b82f6;
      opacity: 0;
      transition: opacity 0.2s;
    }
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #94a3b8;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    p {
      font-size: 14px;
    }
  }
}
</style>
