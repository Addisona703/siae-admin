<template>
  <div>
    <!-- Mobile Overlay -->
    <Transition name="fade">
      <div v-if="isOpen" @click="$emit('close')" class="sidebar-overlay" />
    </Transition>

    <!-- Sidebar -->
    <aside :class="['sidebar', { open: isOpen }]">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-icon">S</div>
          <span class="brand-text">SIAE AI</span>
          <t-button variant="text" shape="circle" class="close-btn" @click="$emit('close')">
            <t-icon name="close" />
          </t-button>
        </div>
        
        <t-button block theme="primary" class="new-chat-btn" @click="$emit('new-chat')">
          <template #icon><t-icon name="add" /></template>
          新对话
        </t-button>
      </div>

      <!-- History -->
      <div class="history-container">
        <div v-for="group in historyGroups" :key="group.label" class="history-group">
          <div class="group-label">{{ group.label }}</div>
          <div 
            v-for="chat in group.items" 
            :key="chat.sessionId"
            @click="$emit('select', chat.sessionId)"
            :class="['history-item', { active: currentSessionId === chat.sessionId }]"
          >
            <t-icon name="chat" class="item-icon" />
            <span class="item-title">{{ chat.title }}</span>
            <div class="item-actions" @click.stop>
              <t-button variant="text" size="small" shape="circle" @click="$emit('edit', chat)">
                <t-icon name="edit" />
              </t-button>
              <t-button variant="text" size="small" shape="circle" theme="danger" @click="$emit('delete', chat)">
                <t-icon name="delete" />
              </t-button>
            </div>
          </div>
        </div>
        
        <div v-if="historyGroups.length === 0" class="empty-history">
          <t-icon name="chat" />
          <p>暂无对话记录</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="sidebar-footer">
        <div class="user-card">
          <t-avatar size="36px" :image="userAvatar">{{ userInitial }}</t-avatar>
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-badge">Pro</span>
          </div>
          <t-dropdown :options="userMenuOptions" @click="handleUserMenu">
            <t-button variant="text" shape="circle">
              <t-icon name="more" />
            </t-button>
          </t-dropdown>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  sessions: { type: Array, default: () => [] },
  currentSessionId: String,
  userName: { type: String, default: '用户' },
  userAvatar: String
})

defineEmits(['close', 'new-chat', 'select', 'edit', 'delete'])

const userInitial = computed(() => props.userName?.charAt(0) || 'U')

const userMenuOptions = [
  { content: '设置', value: 'settings' },
  { content: '帮助', value: 'help' },
  { divider: true },
  { content: '退出登录', value: 'logout' }
]

const historyGroups = computed(() => {
  const today = [], yesterday = [], older = []
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)
  
  props.sessions.forEach(session => {
    const date = new Date(session.updateTime || session.createTime)
    if (date >= todayStart) today.push(session)
    else if (date >= yesterdayStart) yesterday.push(session)
    else older.push(session)
  })
  
  const groups = []
  if (today.length) groups.push({ label: '今天', items: today })
  if (yesterday.length) groups.push({ label: '昨天', items: yesterday })
  if (older.length) groups.push({ label: '更早', items: older })
  return groups
})

const handleUserMenu = (data) => {
  console.log('User menu:', data)
}
</script>


<style scoped lang="less">
@import './styles.less';
</style>
