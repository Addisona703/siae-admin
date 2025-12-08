<template>
  <div class="comment-section">
    <!-- 头部：标题与统计 -->
    <div class="comment-header">
      <h3 class="comment-title">
        全部评论
        <span class="comment-count">{{ totalCount }}</span>
      </h3>
      <div class="comment-sort">
        <span :class="['sort-item', { active: sortBy === 'new' }]" @click="changeSortBy('new')">
          最新
        </span>
        <span :class="['sort-item', { active: sortBy === 'hot' }]" @click="changeSortBy('hot')">
          最热
        </span>
      </div>
    </div>

    <!-- 顶部：主发表评论框 -->
    <div class="comment-input-wrapper">
      <t-avatar :image="currentUser?.avatar" size="large" class="user-avatar">
        {{ currentUser?.nickname?.charAt(0) || '?' }}
      </t-avatar>
      <div class="input-container">
        <t-textarea
          v-model="newRootComment"
          :placeholder="props.disabled ? '内容未发布，暂不支持评论' : '发一条友善的评论'"
          :autosize="{ minRows: 3, maxRows: 6 }"
          class="comment-textarea"
          :disabled="props.disabled"
          @keydown.ctrl.enter="handleSubmitRoot"
        />
        <div class="input-actions">
          <span class="input-hint">{{ props.disabled ? '内容发布后可评论' : '按 Ctrl + Enter 发送' }}</span>
          <t-button theme="primary" :loading="submitting" :disabled="props.disabled" @click="handleSubmitRoot">
            发布评论
          </t-button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <t-loading size="medium" text="加载评论中..." />
    </div>

    <!-- 评论列表 -->
    <div v-else class="comment-list">
      <template v-for="(item, index) in treeData" :key="item.id">
        <!-- 一级评论 -->
        <t-comment :datetime="formatTime(item.createTime)">
          <template #avatar>
            <t-avatar :image="item.userAvatarUrl" size="medium">
              {{ item.userNickname?.charAt(0) || '?' }}
            </t-avatar>
          </template>

          <template #author>
            <span class="comment-author">{{ item.userNickname || '匿名用户' }}</span>
            <t-tag
              v-if="item.userId === contentAuthorId"
              size="small"
              variant="light"
              theme="primary"
              class="author-tag"
            >
              作者
            </t-tag>
          </template>

          <template #content>
            <div class="comment-content">{{ item.content }}</div>
          </template>

          <template #actions>
            <div class="comment-actions">
              <span
                class="action-item"
                :class="{ liked: item.isLiked }"
                @click="handleLike(item)"
              >
                <ThumbUp1FilledIcon v-if="item.isLiked" />
                <ThumbUpIcon v-else />
                {{ item.likeCount || '点赞' }}
              </span>
              <span class="action-item" @click="toggleReplyBox(item.id)">
                <ChatIcon />
                {{ activeReplyId === item.id ? '取消回复' : '回复' }}
                <span v-if="item.childCount > 0" class="child-count">{{ item.childCount }}</span>
              </span>
              <span
                v-if="item.userId === currentUser?.userId"
                class="action-item delete"
                @click="handleDeleteComment(item.id)"
              >
                删除
              </span>
            </div>
          </template>

          <!-- 二级评论区域 -->
          <template #reply>
            <div v-if="item.childCount > 0 || activeReplyId === item.id" class="reply-section">
              <!-- 展开回复按钮（未展开时显示） -->
              <div
                v-if="item.childCount > 0 && !expandedReplies.has(item.id)"
                class="expand-replies"
                @click="handleExpandReplies(item)"
              >
                <t-loading v-if="loadingReplies.has(item.id)" size="small" />
                <template v-else>
                  展开 {{ item.childCount }} 条回复
                </template>
              </div>

              <!-- 子评论列表（展开后显示） -->
              <template v-if="expandedReplies.has(item.id) && item.children && item.children.length > 0">
                <div
                  v-for="reply in item.children"
                  :key="reply.id"
                  class="sub-comment-item"
                >
                  <t-comment :datetime="formatTime(reply.createTime)">
                    <template #avatar>
                      <t-avatar :image="reply.userAvatarUrl" size="small">
                        {{ reply.userNickname?.charAt(0) || '?' }}
                      </t-avatar>
                    </template>

                    <template #author>
                      <div class="sub-comment-author">
                        <span class="author-name">{{ reply.userNickname || '匿名用户' }}</span>
                        <template v-if="reply.replyToUserId">
                          <span class="reply-arrow">回复</span>
                          <span class="reply-target">@{{ reply.replyToUserNickname || '用户' }}</span>
                        </template>
                      </div>
                    </template>

                    <template #content>
                      <div class="sub-comment-content">{{ formatReplyContent(reply.content) }}</div>
                    </template>

                    <template #actions>
                      <div class="sub-comment-actions">
                        <span
                          class="action-item"
                          :class="{ liked: reply.isLiked }"
                          @click="handleLike(reply)"
                        >
                          <ThumbUp1FilledIcon v-if="reply.isLiked" />
                          <ThumbUpIcon v-else />
                          <span class="action-text">{{ reply.likeCount || '点赞' }}</span>
                        </span>
                        <span class="action-item" @click="toggleReplyBox(item.id, reply)">
                          <ChatIcon />
                          <span class="action-text">回复</span>
                        </span>
                        <span
                          v-if="reply.userId === currentUser?.userId"
                          class="action-item delete"
                          @click="handleDeleteComment(reply.id)"
                        >
                          <span class="action-text">删除</span>
                        </span>
                      </div>
                    </template>
                  </t-comment>
                </div>

                <!-- 展开更多 / 收起 按钮 -->
                <div class="replies-actions">
                  <span
                    v-if="(item.children?.length || 0) < item.childCount"
                    class="expand-more"
                    @click="loadMoreReplies(item)"
                  >
                    <t-loading v-if="loadingReplies.has(item.id)" size="small" />
                    <template v-else>
                      展开更多回复
                    </template>
                  </span>
                  <span class="collapse-replies" @click="collapseReplies(item.id)">
                    收起
                  </span>
                </div>
              </template>

              <!-- 回复输入框 -->
              <transition name="fade">
                <div v-if="activeReplyId === item.id" class="reply-input-wrapper">
                  <t-avatar :image="currentUser?.avatar" size="small" class="reply-avatar">
                    {{ currentUser?.nickname?.charAt(0) || '?' }}
                  </t-avatar>
                  <div class="reply-input-container">
                    <t-textarea
                      v-model="replyContent"
                      :placeholder="
                        replyTarget
                          ? `回复 @${replyTarget.userNickname} :`
                          : `回复 @${item.userNickname} :`
                      "
                      :autosize="{ minRows: 2, maxRows: 4 }"
                      class="reply-textarea"
                      @keydown.ctrl.enter="submitReply(item.id)"
                    />
                    <div class="reply-actions">
                      <t-button
                        theme="primary"
                        size="small"
                        :loading="submitting"
                        @click="submitReply(item.id)"
                      >
                        发送
                      </t-button>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </template>
        </t-comment>

        <t-divider v-if="index !== treeData.length - 1" dashed class="comment-divider" />
      </template>

      <!-- 空状态 -->
      <div v-if="treeData.length === 0" class="empty-state">暂无评论，快来抢沙发吧~</div>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="load-more">
        <t-button variant="text" :loading="loadingMore" @click="loadMore">
          加载更多评论
        </t-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'
import { ThumbUpIcon, ThumbUp1FilledIcon, ChatIcon } from 'tdesign-icons-vue-next'
import { useAuthStore } from '@/stores/auth'
import { contentApi } from '@/api/content'

const props = defineProps({
  contentId: {
    type: [String, Number],
    required: true
  },
  contentAuthorId: {
    type: [String, Number],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentUser)

// 状态
const rawComments = ref([])
const newRootComment = ref('')
const replyContent = ref('')
const activeReplyId = ref(null)
const replyTarget = ref(null)
const sortBy = ref('new')
const loading = ref(false)
const loadingMore = ref(false)
const submitting = ref(false)
const likedComments = ref(new Set()) // 记录已点赞的评论ID
const expandedReplies = ref(new Set()) // 记录已展开回复的一级评论ID
const loadingReplies = ref(new Set()) // 记录正在加载回复的一级评论ID

// 分页
const pagination = ref({
  current: 1,
  pageSize: 20,
  total: 0
})

const hasMore = computed(() => {
  return rawComments.value.length < pagination.value.total
})

const totalCount = computed(() => pagination.value.total)

// 评论树数据（后端已返回树结构）
const treeData = computed(() => {
  return rawComments.value.map((item) => ({
    ...item,
    isLiked: likedComments.value.has(item.id),
    children: (item.children || []).map((child) => ({
      ...child,
      isLiked: likedComments.value.has(child.id)
    }))
  }))
})

// 加载评论列表
const fetchComments = async (reset = true) => {
  if (!props.contentId) return

  if (reset) {
    loading.value = true
    pagination.value.current = 1
  } else {
    loadingMore.value = true
  }

  try {
    const res = await contentApi.getCommentsByContent(props.contentId, {
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
      params: {
        sortBy: sortBy.value === 'hot' ? 'likeCount' : 'createTime',
        sortOrder: 'desc'
      }
    })
    console.log(res)
    if (res.code === 200) {
      const list = res.data?.records || res.data?.list || []
      if (reset) {
        rawComments.value = list
      } else {
        rawComments.value = [...rawComments.value, ...list]
      }
      pagination.value.total = res.data?.total || 0

      // 获取当前用户对评论的点赞状态
      if (currentUser.value && list.length > 0) {
        await fetchLikedStatus(list.map((c) => c.id))
      }
    }
  } catch (e) {
    console.error('获取评论失败:', e)
    MessagePlugin.error('获取评论失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 获取用户点赞状态
const fetchLikedStatus = async (commentIds) => {
  try {
    const res = await contentApi.getLikedIds(commentIds, 'COMMENT')
    if (res.code === 200 && res.data) {
      // 更新点赞状态
      res.data.forEach((id) => likedComments.value.add(id))
    }
  } catch (e) {
    console.error('获取点赞状态失败:', e)
  }
}

// 加载更多
const loadMore = () => {
  pagination.value.current++
  fetchComments(false)
}

// 切换排序
const changeSortBy = (type) => {
  if (sortBy.value !== type) {
    sortBy.value = type
    fetchComments(true)
  }
}

// 格式化回复内容（去掉"回复 @xxx:"前缀）
const formatReplyContent = (content) => {
  if (!content) return ''
  // 去掉开头的"回复 @xxx:"或"回复 @xxx："格式
  return content.replace(/^回复\s*@[^:：]+[:：]\s*/, '')
}

// 时间格式化
const formatTime = (time) => {
  if (!time) return ''
  const now = new Date()
  const past = new Date(time)
  const diff = Math.floor((now - past) / 1000)

  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}天前`
  return past.toLocaleDateString()
}

// 点赞
const handleLike = async (item) => {
  if (!currentUser.value) {
    MessagePlugin.warning('请先登录')
    return
  }

  const isLiked = likedComments.value.has(item.id)

  try {
    if (isLiked) {
      // 取消点赞
      await contentApi.cancelAction({
        targetId: item.id,
        targetType: 'COMMENT',
        actionType: 'LIKE'
      })
      likedComments.value.delete(item.id)
      // 更新原始数据中的 likeCount
      updateCommentLikeCount(item.id, -1)
    } else {
      // 点赞
      await contentApi.recordAction({
        targetId: item.id,
        targetType: 'COMMENT',
        actionType: 'LIKE'
      })
      likedComments.value.add(item.id)
      // 更新原始数据中的 likeCount
      updateCommentLikeCount(item.id, 1)
    }
    // 触发响应式更新
    likedComments.value = new Set(likedComments.value)
  } catch (e) {
    console.error('点赞操作失败:', e)
    MessagePlugin.error('操作失败')
  }
}

// 更新评论点赞数
const updateCommentLikeCount = (commentId, delta) => {
  const comment = rawComments.value.find((c) => c.id === commentId)
  if (comment) {
    comment.likeCount = Math.max(0, (comment.likeCount || 0) + delta)
  }
}

// 子评论分页状态
const childPageMap = ref(new Map()) // rootId -> currentPage

// 首次展开回复（加载第一页）
const handleExpandReplies = async (item) => {
  const rootId = item.id

  loadingReplies.value.add(rootId)
  loadingReplies.value = new Set(loadingReplies.value)

  try {
    const res = await contentApi.getChildComments(props.contentId, rootId, {
      pageNum: 1,
      pageSize: 3
    })

    if (res.code === 200) {
      const children = res.data?.records || res.data || []
      const comment = rawComments.value.find((c) => c.id === rootId)
      if (comment) {
        comment.children = children
        comment.childCount = res.data?.total || children.length
      }
      childPageMap.value.set(rootId, 1)
      expandedReplies.value.add(rootId)
      expandedReplies.value = new Set(expandedReplies.value)

      if (currentUser.value && children.length > 0) {
        await fetchLikedStatus(children.map((c) => c.id))
      }
    }
  } catch (e) {
    console.error('加载子评论失败:', e)
    MessagePlugin.error('加载子评论失败')
  } finally {
    loadingReplies.value.delete(rootId)
    loadingReplies.value = new Set(loadingReplies.value)
  }
}

// 加载更多回复（下一页）
const loadMoreReplies = async (item) => {
  const rootId = item.id
  const currentPage = childPageMap.value.get(rootId) || 1

  loadingReplies.value.add(rootId)
  loadingReplies.value = new Set(loadingReplies.value)

  try {
    const res = await contentApi.getChildComments(props.contentId, rootId, {
      pageNum: currentPage + 1,
      pageSize: 3
    })

    if (res.code === 200) {
      const newChildren = res.data?.records || res.data || []
      const comment = rawComments.value.find((c) => c.id === rootId)
      if (comment) {
        comment.children = [...(comment.children || []), ...newChildren]
        comment.childCount = res.data?.total || comment.children.length
      }
      childPageMap.value.set(rootId, currentPage + 1)

      if (currentUser.value && newChildren.length > 0) {
        await fetchLikedStatus(newChildren.map((c) => c.id))
      }
    }
  } catch (e) {
    console.error('加载更多回复失败:', e)
    MessagePlugin.error('加载更多回复失败')
  } finally {
    loadingReplies.value.delete(rootId)
    loadingReplies.value = new Set(loadingReplies.value)
  }
}

// 收起回复
const collapseReplies = (rootId) => {
  expandedReplies.value.delete(rootId)
  expandedReplies.value = new Set(expandedReplies.value)
  // 清空已加载的子评论
  const comment = rawComments.value.find((c) => c.id === rootId)
  if (comment) {
    comment.children = []
  }
  childPageMap.value.delete(rootId)
}

// 切换回复框
const toggleReplyBox = (rootId, targetComment = null) => {
  // 判断是否点击同一个回复目标
  const isSameTarget = activeReplyId.value === rootId && 
    (replyTarget.value?.id === targetComment?.id)
  
  if (isSameTarget) {
    activeReplyId.value = null
    replyTarget.value = null
    return
  }
  activeReplyId.value = rootId
  replyTarget.value = targetComment
  replyContent.value = ''
}

// 发布主评论
const handleSubmitRoot = async () => {
  if (!currentUser.value) {
    MessagePlugin.warning('请先登录')
    return
  }

  if (!newRootComment.value.trim()) {
    MessagePlugin.warning('请输入评论内容')
    return
  }

  submitting.value = true
  try {
    const res = await contentApi.createComment(props.contentId, {
      content: newRootComment.value.trim(),
      parentId: null,
      replyToUserId: null
    })

    if (res.code === 200) {
      newRootComment.value = ''
      MessagePlugin.success('评论发表成功')
      // 重新加载评论列表
      fetchComments(true)
    } else {
      MessagePlugin.error(res.message || '评论发表失败')
    }
  } catch (e) {
    console.error('发表评论失败:', e)
    MessagePlugin.error('评论发表失败')
  } finally {
    submitting.value = false
  }
}

// 提交回复
const submitReply = async (rootId) => {
  if (!currentUser.value) {
    MessagePlugin.warning('请先登录')
    return
  }

  if (!replyContent.value.trim()) {
    MessagePlugin.warning('请输入回复内容')
    return
  }

  // 获取一级评论信息
  const rootComment = treeData.value.find((c) => c.id === rootId)

  submitting.value = true
  try {
    // 如果有 replyTarget 则回复该用户，否则回复一级评论作者
    const replyToUserId = replyTarget.value
      ? replyTarget.value.userId
      : rootComment?.userId || null

    const res = await contentApi.createComment(props.contentId, {
      content: replyContent.value.trim(),
      parentId: rootId,
      replyToUserId: replyToUserId
    })

    if (res.code === 200) {
      replyContent.value = ''
      activeReplyId.value = null
      replyTarget.value = null
      MessagePlugin.success('回复成功')
      // 重新加载评论列表
      fetchComments(true)
    } else {
      MessagePlugin.error(res.message || '回复失败')
    }
  } catch (e) {
    console.error('回复失败:', e)
    MessagePlugin.error('回复失败')
  } finally {
    submitting.value = false
  }
}

// 删除评论
const handleDeleteComment = async (commentId) => {
  try {
    const res = await contentApi.deleteComment(commentId)
    if (res.code === 200) {
      MessagePlugin.success('删除成功')
      fetchComments(true)
    } else {
      MessagePlugin.error(res.message || '删除失败')
    }
  } catch (e) {
    console.error('删除评论失败:', e)
    MessagePlugin.error('删除失败')
  }
}

// 监听 contentId 变化
watch(
  () => props.contentId,
  (newId) => {
    if (newId) {
      fetchComments(true)
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.contentId) {
    fetchComments(true)
  }
})
</script>


<style scoped>
.comment-section {
  background: var(--td-bg-color-container);
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--td-component-border);
}

.comment-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.comment-count {
  padding: 2px 8px;
  background: var(--td-bg-color-secondarycontainer);
  color: var(--td-text-color-secondary);
  font-size: 12px;
  border-radius: 12px;
  font-weight: 500;
}

.comment-sort {
  display: flex;
  gap: 24px;
  font-size: 14px;
}

.sort-item {
  color: var(--td-text-color-secondary);
  cursor: pointer;
  transition: color 0.2s;
}

.sort-item:hover {
  color: var(--td-brand-color);
}

.sort-item.active {
  color: var(--td-brand-color);
  font-weight: 600;
}

.comment-input-wrapper {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}

.user-avatar {
  flex-shrink: 0;
}

.input-container {
  flex: 1;
}

.comment-textarea {
  margin-bottom: 12px;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-hint {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-author {
  color: var(--td-text-color-primary);
  font-weight: 600;
  font-size: 15px;
}

.author-tag {
  margin-left: 8px;
  transform: scale(0.9);
}

.comment-content {
  color: var(--td-text-color-primary);
  font-size: 15px;
  line-height: 1.6;
  margin-top: 4px;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 12px;
  user-select: none;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--td-text-color-placeholder);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  color: var(--td-brand-color);
}

.action-item.liked {
  color: var(--td-brand-color);
}

.action-item.delete:hover {
  color: var(--td-error-color);
}

.child-count {
  background: var(--td-bg-color-secondarycontainer);
  color: var(--td-text-color-secondary);
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 10px;
  margin-left: 2px;
}

.reply-section {
  margin-top: 4px;
  padding-left: 8px;
}

.sub-comment-item {
  padding: 4px 0;
}

.sub-comment-item :deep(.t-comment__inner) {
  padding: 8px 0;
}

.sub-comment-author {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 14px;
}

.author-name {
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.reply-arrow {
  color: var(--td-text-color-placeholder);
  font-size: 12px;
  margin: 0 2px;
}

.reply-target {
  color: var(--td-brand-color);
  font-weight: 500;
}

.sub-comment-content {
  color: var(--td-text-color-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-top: 2px;
}

.sub-comment-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 8px;
  font-size: 13px;
}

.sub-comment-actions .action-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--td-text-color-placeholder);
  cursor: pointer;
  transition: color 0.2s;
}

.sub-comment-actions .action-item:hover {
  color: var(--td-brand-color);
}

.sub-comment-actions .action-item.liked {
  color: var(--td-brand-color);
}

.sub-comment-actions .action-item.delete:hover {
  color: var(--td-error-color);
}

.action-text {
  margin-left: 2px;
}

.expand-replies {
  color: var(--td-brand-color);
  font-size: 13px;
  cursor: pointer;
  padding: 8px 0;
  margin-top: 4px;
  user-select: none;
}

.expand-replies:hover {
  opacity: 0.8;
}

.replies-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
  margin-top: 4px;
  font-size: 13px;
}

.expand-more {
  color: var(--td-brand-color);
  cursor: pointer;
  user-select: none;
}

.expand-more:hover {
  opacity: 0.8;
}

.collapse-replies {
  color: var(--td-text-color-secondary);
  cursor: pointer;
  user-select: none;
}

.collapse-replies:hover {
  color: var(--td-text-color-primary);
}

/* 修复 TDesign Comment 组件的 actions 区域样式 */
:deep(.t-comment__actions) {
  margin-top: 8px;
}

:deep(.t-comment__inner) {
  padding: 12px 0;
}

.reply-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: start;
  margin-top: 12px;
  padding-left: 4px;
}

.reply-avatar {
  flex-shrink: 0;
  margin-top: 4px;
  opacity: 0.8;
}

.reply-input-container {
  flex: 1;
}

.reply-textarea {
  font-size: 14px;
}

.reply-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.comment-divider {
  margin: 24px 0;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--td-text-color-placeholder);
  font-size: 14px;
}

.load-more {
  text-align: center;
  padding: 16px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
