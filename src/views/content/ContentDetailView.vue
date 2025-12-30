<template>
  <t-layout style="height: 100vh; display: flex; flex-direction: column; overflow: hidden;">
    <!-- 顶部导航栏 -->
    <t-header class="header-bar">
      <div class="header-left">
        <t-button variant="text" shape="square" @click="goBack" size="large">
          <template #icon>
            <ArrowLeftIcon />
          </template>
        </t-button>
        <div class="flex flex-col ml-2">
          <h1 class="text-lg font-bold leading-tight" style="color: var(--td-text-color-primary);">
            {{ content.title || '加载中...' }}
          </h1>
          <div class="text-xs flex items-center gap-2" style="color: var(--td-text-color-secondary);">
            <span v-if="content.type" class="px-1.5 py-0.5 rounded text-xs" style="background: var(--td-bg-color-secondarycontainer); color: var(--td-text-color-secondary);">
              {{ getTypeName(content.type) }}
            </span>
            <span>{{ formatDate(content.createTime) }}</span>
            <span v-if="content.status" :class="getStatusClass(content.status)">
              {{ getStatusName(content.status) }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex gap-2">
        <!-- 点赞按钮 -->
        <t-tooltip :content="!isPublished ? '内容未发布，无法点赞' : ''" :disabled="isPublished">
          <t-button 
            :theme="isLiked ? 'primary' : 'default'" 
            :variant="isLiked ? 'base' : 'outline'" 
            size="medium" 
            @click="handleLike"
            :loading="likeLoading"
            :disabled="!isPublished"
          >
            <template #icon> <ThumbUpIcon /> </template>
            {{ isLiked ? '已点赞' : '点赞' }} {{ content.likeCount || 0 }}
          </t-button>
        </t-tooltip>
        <!-- 收藏按钮 -->
        <t-tooltip :content="!isPublished ? '内容未发布，无法收藏' : ''" :disabled="isPublished">
          <t-button 
            :theme="isFavorited ? 'warning' : 'default'" 
            :variant="isFavorited ? 'base' : 'outline'" 
            size="medium" 
            @click="handleFavorite"
            :loading="favoriteLoading"
            :disabled="!isPublished"
          >
            <template #icon> <StarIcon /> </template>
            {{ isFavorited ? '已收藏' : '收藏' }} {{ content.favoriteCount || 0 }}
          </t-button>
        </t-tooltip>
        <t-button theme="default" variant="outline" size="medium" @click="handleEdit">
          <template #icon> <EditIcon /> </template>
          编辑
        </t-button>
        <t-button theme="danger" variant="outline" size="medium" @click="handleDelete">
          <template #icon> <DeleteIcon /> </template>
          删除
        </t-button>
      </div>
    </t-header>

    <!-- 主体布局 -->
    <div class="flex-1 flex overflow-hidden" v-if="!loading">
      <!-- 左侧：内容展示区 -->
      <main class="flex-1 flex flex-col relative min-w-0 overflow-y-auto custom-scrollbar" style="background: var(--td-bg-color-page);">
        
        <!-- 场景 A: 文字内容 (文章/笔记/提问) -->
        <div v-if="['article', 'note', 'question'].includes(content.type)" class="p-8 mx-auto w-full max-w-4xl">
          <div class="prose max-w-none" style="color: var(--td-text-color-primary);" v-html="renderedContent"></div>
        </div>

        <!-- 场景 B: 视频播放 -->
        <div v-if="content.type === 'video'" class="p-8 mx-auto w-full max-w-4xl flex flex-col items-center">
          <div class="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg relative group">
             <!-- 视频播放器 -->
             <video 
               v-if="content.detail?.url" 
               ref="videoPlayer"
               :src="content.detail.url" 
               controls 
               preload="metadata"
               class="w-full h-full"
               @waiting="videoBuffering = true"
               @playing="videoBuffering = false"
               @canplay="videoBuffering = false"
             ></video>
             <!-- 缓冲提示 -->
             <div v-if="videoBuffering" class="absolute inset-0 flex items-center justify-center bg-black/50">
               <t-loading size="large" text="缓冲中..." />
             </div>
             <div v-if="!content.detail?.url" class="flex items-center justify-center h-full text-gray-500">
               <VideoIcon size="48" />
               <span class="ml-2">视频资源加载中...</span>
             </div>
          </div>
          <div class="w-full mt-4 p-4 rounded-lg" style="background: var(--td-bg-color-container);">
             <h3 class="font-bold text-lg mb-2" style="color: var(--td-text-color-primary);">视频信息</h3>
             <div class="grid grid-cols-2 gap-4 text-sm" style="color: var(--td-text-color-secondary);">
               <div>时长: {{ formatDuration(content.detail?.duration) }}</div>
               <div>分辨率: {{ content.detail?.resolution || '未知' }}</div>
               <div>文件大小: {{ formatFileSize(content.detail?.size) }}</div>
               <div>格式: {{ content.detail?.mime || '未知' }}</div>
             </div>
          </div>
        </div>

        <!-- 场景 C: 文件下载 -->
        <div v-if="content.type === 'file'" class="p-8 mx-auto w-full max-w-4xl">
           <div class="p-6 rounded-lg border flex items-center gap-4" 
                style="background: var(--td-bg-color-container); border-color: var(--td-component-border);">
              <div class="p-4 rounded-full" style="background: var(--td-brand-color-light); color: var(--td-brand-color);">
                <FileIcon size="32" />
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-lg" style="color: var(--td-text-color-primary);">{{ content.detail?.fileName || content.title }}</h3>
                <p class="text-sm mt-1" style="color: var(--td-text-color-secondary);">
                  大小: {{ formatFileSize(content.detail?.fileSize) }}
                </p>
              </div>
              <t-space>
                <t-button theme="default" variant="outline" @click="handlePreviewFile" v-if="canPreview">
                  <template #icon><BrowseIcon /></template>
                  预览
                </t-button>
                <t-button theme="primary" @click="handleDownloadFile">
                  <template #icon><DownloadIcon /></template>
                  下载文件
                </t-button>
              </t-space>
           </div>
        </div>

        <!-- 评论区 -->
        <div class="p-8 mx-auto w-full max-w-4xl">
          <CommentSection 
            v-if="content.id"
            :content-id="content.id" 
            :content-author-id="content.uploadedBy"
            :disabled="!isPublished"
          />
        </div>

      </main>

      <!-- 右侧：侧边栏信息 -->
      <aside class="w-80 border-l flex flex-col h-full overflow-y-auto z-10 custom-scrollbar"
        style="background: var(--td-bg-color-container); border-color: var(--td-component-border);">
        
        <!-- 封面图 -->
        <div class="p-4 border-b" style="border-color: var(--td-component-border);" v-if="content.cover">
          <img :src="content.cover" class="w-full aspect-video object-cover rounded-md shadow-sm" alt="封面" />
        </div>

        <!-- 作者信息 -->
        <div class="sidebar-card">
          <h3 class="font-medium mb-3 text-sm flex items-center gap-2" style="color: var(--td-text-color-primary);">
            <InfoCircleIcon :size="16" /> 作者信息
          </h3>
          <div class="flex items-center gap-3">
            <img v-if="content.authorAvatar" :src="content.authorAvatar" class="w-10 h-10 rounded-full object-cover" alt="作者头像" />
            <div v-else class="w-10 h-10 rounded-full flex items-center justify-center" style="background: var(--td-bg-color-secondarycontainer); color: var(--td-text-color-secondary);">
              {{ content.authorName?.charAt(0) || '?' }}
            </div>
            <div>
              <div class="text-sm font-medium" style="color: var(--td-text-color-primary);">{{ content.authorName }}</div>
              <div class="text-xs" style="color: var(--td-text-color-secondary);">ID: {{ content.uploadedBy }}</div>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="sidebar-card">
          <h3 class="font-medium mb-3 text-sm flex items-center gap-2" style="color: var(--td-text-color-primary);">
            <InfoCircleIcon :size="16" /> 基本信息
          </h3>
          <div class="space-y-4">
            <div>
              <div class="text-xs mb-1" style="color: var(--td-text-color-secondary);">所属分类</div>
              <div class="text-sm font-medium" style="color: var(--td-text-color-primary);">{{ content.categoryName || '未分类' }}</div>
            </div>
            <div>
              <div class="text-xs mb-1" style="color: var(--td-text-color-secondary);">标签</div>
              <div class="flex flex-wrap gap-1">
                <t-tag v-for="tag in content.tagIds" :key="tag" variant="light" theme="default" size="small">{{ tag }}</t-tag>
                <span v-if="!content.tagIds?.length" class="text-sm" style="color: var(--td-text-color-placeholder);">-</span>
              </div>
            </div>
            <div>
              <div class="text-xs mb-1" style="color: var(--td-text-color-secondary);">摘要</div>
              <p class="text-sm leading-relaxed" style="color: var(--td-text-color-primary);">
                {{ content.description || '暂无摘要' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 数据统计 -->
        <div class="sidebar-card">
          <h3 class="font-medium mb-3 text-sm flex items-center gap-2" style="color: var(--td-text-color-primary);">
            <ChartIcon :size="16" /> 数据统计
          </h3>
          <div class="grid grid-cols-3 gap-2 text-center">
             <div class="p-2 rounded" style="background: var(--td-bg-color-secondarycontainer);">
               <div class="text-xs" style="color: var(--td-text-color-secondary);">浏览</div>
               <div class="font-bold text-lg" style="color: var(--td-brand-color);">{{ content.viewCount || 0 }}</div>
             </div>
             <div class="p-2 rounded" style="background: var(--td-bg-color-secondarycontainer);">
               <div class="text-xs" style="color: var(--td-text-color-secondary);">点赞</div>
               <div class="font-bold text-lg" style="color: var(--td-brand-color);">{{ content.likeCount || 0 }}</div>
             </div>
             <div class="p-2 rounded" style="background: var(--td-bg-color-secondarycontainer);">
               <div class="text-xs" style="color: var(--td-text-color-secondary);">收藏</div>
               <div class="font-bold text-lg" style="color: var(--td-brand-color);">{{ content.favoriteCount || 0 }}</div>
             </div>
          </div>
        </div>

        <!-- 封面信息 (仅问题) -->
        <div class="sidebar-card" v-if="content.type === 'question' && content.coverFileId">
          <h3 class="font-medium mb-3 text-sm flex items-center gap-2" style="color: var(--td-text-color-primary);">
            <ImageIcon :size="16" /> 封面
          </h3>
          <div class="cover-preview">
            <img :src="getCoverUrl(content.coverFileId)" alt="问题封面" />
          </div>
        </div>

        <!-- 时间信息 -->
        <div class="sidebar-card">
          <h3 class="font-medium mb-3 text-sm flex items-center gap-2" style="color: var(--td-text-color-primary);">
            <InfoCircleIcon :size="16" /> 时间信息
          </h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span style="color: var(--td-text-color-secondary);">创建时间</span>
              <span style="color: var(--td-text-color-primary);">{{ formatDate(content.createTime) }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color: var(--td-text-color-secondary);">更新时间</span>
              <span style="color: var(--td-text-color-primary);">{{ formatDate(content.updateTime) }}</span>
            </div>
          </div>
        </div>

      </aside>
    </div>

    <!-- 加载状态 -->
    <div v-else class="flex-1 flex items-center justify-center" style="background: var(--td-bg-color-page);">
      <t-loading size="large" text="加载内容中..." />
    </div>
  </t-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next'
import { marked } from 'marked'
import {
  ArrowLeftIcon,
  EditIcon,
  DeleteIcon,
  InfoCircleIcon,
  ChartIcon,
  WalletIcon,
  VideoIcon,
  FileIcon,
  DownloadIcon,
  BrowseIcon,
  ThumbUpIcon,
  StarIcon
} from 'tdesign-icons-vue-next'
import { contentApi } from '@/api/content'
import CommentSection from '@/components/content/CommentSection.vue'
import { APP_CONFIG } from '@/config/app.config'

const route = useRoute()
const router = useRouter()
const content = ref({})
const loading = ref(true)
const videoBuffering = ref(false)
const videoPlayer = ref(null)

// 点赞收藏状态
const isLiked = ref(false)
const isFavorited = ref(false)
const likeLoading = ref(false)
const favoriteLoading = ref(false)

// 是否已发布（只有已发布的内容才能点赞、收藏、评论）
// 后端枚举序列化为数字 code: DRAFT=0, PENDING=1, PUBLISHED=2, TRASH=3, DELETED=4
const isPublished = computed(() => content.value.status === 2 || content.value.status === 'PUBLISHED')

// 类型映射：数字/字符串 -> 字符串
const normalizeType = (type) => {
  if (typeof type === 'number') {
    const map = { 0: 'article', 1: 'note', 2: 'question', 3: 'file', 4: 'video' }
    return map[type] || 'article'
  }
  return type
}

const fetchContent = async () => {
  const id = route.params.id
  if (!id) return
  
  loading.value = true
  try {
    const res = await contentApi.getContentById(id)
    if (res.code === 200 && res.data) {
      const data = res.data
      // 规范化数据结构
      content.value = {
        ...data,
        type: normalizeType(data.type),
        // 统计数据从 statistics 对象获取
        viewCount: data.statistics?.viewCount || 0,
        likeCount: data.statistics?.likeCount || 0,
        favoriteCount: data.statistics?.favoriteCount || 0,
        commentCount: data.statistics?.commentCount || 0,
        // 封面
        cover: data.coverUrl || null,
        // 作者信息
        authorName: data.authorNickname || '未知作者',
        authorAvatar: data.authorAvatarUrl || null,
      }
      console.log('加载的内容详情:', content.value)
      // 加载完内容后检查交互状态
      await checkInteractionStatus()
    } else {
      MessagePlugin.error(res.message || '获取详情失败')
    }
  } catch (e) {
    console.error(e)
    MessagePlugin.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchContent()
})

const goBack = () => {
  router.back()
}

const handleEdit = () => {
  router.push(`/content/edit/${content.value.id}`)
}

const handleDelete = () => {
  const confirmDialog = DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除「${content.value.title}」吗？删除后将移入回收站。`,
    confirmBtn: { content: '删除', theme: 'danger' },
    cancelBtn: '取消',
    onConfirm: async () => {
      confirmDialog.update({ confirmBtn: { content: '删除中...', loading: true } })
      try {
        const res = await contentApi.deleteContent(content.value.id, 1) // 1=移入回收站
        if (res.code === 200) {
          MessagePlugin.success('删除成功')
          confirmDialog.destroy()
          router.back()
        } else {
          MessagePlugin.error(res.message || '删除失败')
          confirmDialog.update({ confirmBtn: { content: '删除', theme: 'danger', loading: false } })
        }
      } catch (e) {
        console.error('删除失败:', e)
        MessagePlugin.error('删除失败，请稍后重试')
        confirmDialog.update({ confirmBtn: { content: '删除', theme: 'danger', loading: false } })
      }
    }
  })
}

// 检查点赞收藏状态
const checkInteractionStatus = async () => {
  if (!content.value.id) return
  try {
    // 批量查询点赞状态 - targetIds 需要是 Long 类型数组
    const contentId = Number(content.value.id)
    const likedRes = await contentApi.getLikedIds([contentId], 'CONTENT')
    if (likedRes.code === 200 && likedRes.data) {
      // 后端返回的是 Set<Long>，前端收到的是数组
      isLiked.value = likedRes.data.includes(contentId)
    }
    // 检查收藏状态
    const favoriteRes = await contentApi.checkFavorite(null, contentId)
    if (favoriteRes.code === 200) {
      isFavorited.value = favoriteRes.data
    }
  } catch (e) {
    console.error('检查交互状态失败:', e)
  }
}

// 点赞 - 乐观更新
const handleLike = async () => {
  if (!content.value.id || likeLoading.value) return

  const contentId = Number(content.value.id)
  const wasLiked = isLiked.value
  const prevCount = content.value.likeCount || 0

  // 乐观更新 UI
  isLiked.value = !wasLiked
  content.value.likeCount = wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1

  const actionData = {
    targetId: contentId,
    targetType: 'CONTENT',
    actionType: 'LIKE'
  }

  try {
    const res = wasLiked
      ? await contentApi.cancelAction(actionData)
      : await contentApi.recordAction(actionData)

    if (res.code !== 200) {
      // 请求失败，回滚状态
      isLiked.value = wasLiked
      content.value.likeCount = prevCount
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (e) {
    // 请求异常，回滚状态
    isLiked.value = wasLiked
    content.value.likeCount = prevCount
    console.error('点赞操作失败:', e)
    MessagePlugin.error('操作失败，请稍后重试')
  }
}

// 收藏 - 乐观更新
const handleFavorite = async () => {
  if (!content.value.id || favoriteLoading.value) return

  const contentId = Number(content.value.id)
  const wasFavorited = isFavorited.value
  const prevCount = content.value.favoriteCount || 0

  // 乐观更新 UI
  isFavorited.value = !wasFavorited
  content.value.favoriteCount = wasFavorited ? Math.max(0, prevCount - 1) : prevCount + 1

  try {
    let res
    if (wasFavorited) {
      // 取消收藏
      res = await contentApi.cancelAction({
        targetId: contentId,
        targetType: 'CONTENT',
        actionType: 'FAVORITE'
      })
    } else {
      // 添加收藏
      res = await contentApi.addFavorite({
        contentId: contentId,
        folderId: null
      })
    }

    if (res.code !== 200) {
      // 请求失败，回滚状态
      isFavorited.value = wasFavorited
      content.value.favoriteCount = prevCount
      MessagePlugin.error(res.message || '操作失败')
    }
  } catch (e) {
    // 请求异常，回滚状态
    isFavorited.value = wasFavorited
    content.value.favoriteCount = prevCount
    console.error('收藏操作失败:', e)
    MessagePlugin.error('操作失败，请稍后重试')
  }
}

// Helpers
const getTypeName = (type) => {
  const map = {
    'article': '文章',
    'note': '笔记',
    'question': '问题',
    'file': '文件',
    'video': '视频'
  }
  return map[type] || type
}

const getStatusName = (status) => {
  // 支持数字 code 和字符串两种格式
  const map = {
    0: '草稿', 'DRAFT': '草稿',
    1: '审核中', 'PENDING': '审核中',
    2: '已发布', 'PUBLISHED': '已发布',
    3: '回收站', 'TRASH': '回收站',
    4: '已删除', 'DELETED': '已删除'
  }
  return map[status] || status
}

const getStatusClass = (status) => {
  // 支持数字 code 和字符串两种格式
  const map = {
    0: 'text-gray-500', 'DRAFT': 'text-gray-500',
    1: 'text-orange-500', 'PENDING': 'text-orange-500',
    2: 'text-green-500', 'PUBLISHED': 'text-green-500',
    3: 'text-yellow-500', 'TRASH': 'text-yellow-500',
    4: 'text-red-500', 'DELETED': 'text-red-500'
  }
  return map[status] || ''
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString()
}

const formatDuration = (seconds) => {
  if (!seconds) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getCoverUrl = (fileId) => {
  if (!fileId) return ''
  return `${APP_CONFIG.apiBaseUrl}/media/files/${fileId}/preview`
}

// 获取文件下载/预览 URL
const getFileUrl = (fileId) => {
  if (!fileId) return ''
  return `${APP_CONFIG.apiBaseUrl}/media/files/${fileId}/preview`
}

// 判断文件是否可以预览（图片、PDF等）
const canPreview = computed(() => {
  if (!content.value.detail?.fileName) return false
  const ext = content.value.detail.fileName.toLowerCase().split('.').pop()
  const previewableExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']
  return previewableExtensions.includes(ext)
})

// 预览文件（在新窗口打开）
const handlePreviewFile = () => {
  const fileId = content.value.detail?.fileId
  if (!fileId) {
    MessagePlugin.warning('文件不存在')
    return
  }
  window.open(getFileUrl(fileId), '_blank')
}

// 下载文件
const handleDownloadFile = () => {
  const fileId = content.value.detail?.fileId
  if (!fileId) {
    MessagePlugin.warning('文件不存在')
    return
  }
  // 直接打开下载链接，后端会设置 Content-Disposition 为 attachment
  window.open(getFileUrl(fileId), '_blank')
}

const renderedContent = computed(() => {
  const raw = content.value.detail?.content || ''
  if (!raw) return ''
  
  // 提问类型默认为 Markdown
  if (content.value.type === 'question') {
    return marked.parse(raw)
  }
  
  // 其他类型，如果内容以 < 开头，认为是 HTML (TinyMCE 生成)，否则尝试按 Markdown 解析
  if (raw.trim().startsWith('<')) {
    return raw
  }
  
  return marked.parse(raw)
})
</script>

<style scoped>
.header-bar {
  background: var(--td-bg-color-container);
  padding: 0 24px;
  height: 56px;
  border-bottom: 1px solid var(--td-component-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  z-index: 50;
}

.sidebar-card {
  padding: 20px;
  border-bottom: 1px solid var(--td-component-border);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: var(--td-bg-color-secondarycontainer);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--td-scrollbar-color);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--td-text-color-secondary);
}

/* Prose styles for rendered content */
.prose :deep(h1) {
  font-size: 2em;
  font-weight: bold;
  margin-bottom: 0.5em;
  border-bottom: 1px solid var(--td-component-border);
  padding-bottom: 0.3em;
  color: var(--td-text-color-primary);
}

.prose :deep(h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 1em;
  color: var(--td-text-color-primary);
}

.prose :deep(h3) {
  font-size: 1.25em;
  font-weight: bold;
  margin-bottom: 0.5em;
  margin-top: 1em;
  color: var(--td-text-color-primary);
}

.prose :deep(p) {
  margin-bottom: 1em;
  line-height: 1.6;
  color: var(--td-text-color-primary);
}

.prose :deep(ul) {
  list-style-type: disc;
  padding-left: 1.5em;
  margin-bottom: 1em;
  color: var(--td-text-color-primary);
}

.prose :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin-bottom: 1em;
  color: var(--td-text-color-primary);
}

.prose :deep(blockquote) {
  border-left: 4px solid var(--td-component-border);
  padding-left: 1em;
  color: var(--td-text-color-secondary);
  margin: 1em 0;
}

.prose :deep(code) {
  background: var(--td-bg-color-secondarycontainer);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9em;
  color: var(--td-text-color-primary);
}

.prose :deep(pre) {
  background: #1e293b;
  color: #fff;
  padding: 1em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1em 0;
}

.prose :deep(img) {
  max-width: 100%;
  border-radius: 4px;
  margin: 1em 0;
}

.prose :deep(a) {
  color: var(--td-brand-color);
  text-decoration: underline;
}
</style>
