<template>
  <div class="welcome">
    <div class="welcome-content">
      <!-- Logo -->
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        </div>
        <div class="logo-glow" />
      </div>
      
      <!-- Title -->
      <h1 class="title">有什么可以帮你的？</h1>
      <p class="subtitle">我可以帮你写代码、分析数据、回答问题，或者只是聊聊天</p>
      
      <!-- Quick Actions -->
      <div class="actions">
        <div 
          v-for="action in quickActions" 
          :key="action.title"
          class="action-card"
          @click="$emit('select', action.prompt)"
        >
          <div class="action-icon" :style="{ background: action.color }">
            <t-icon :name="action.icon" />
          </div>
          <div class="action-content">
            <span class="action-title">{{ action.title }}</span>
            <span class="action-desc">{{ action.desc }}</span>
          </div>
          <t-icon name="chevron-right" class="action-arrow" />
        </div>
      </div>
      
      <!-- Capabilities -->
      <div class="capabilities">
        <div class="cap-item" v-for="cap in capabilities" :key="cap.text">
          <t-icon :name="cap.icon" />
          <span>{{ cap.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['select'])

const quickActions = [
  {
    icon: 'code',
    title: '写代码',
    desc: '用 Vue3 写一个待办事项组件',
    prompt: '用 Vue3 + Composition API 写一个待办事项组件，要求支持添加、删除、标记完成',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: 'chart-bar',
    title: '数据分析',
    desc: '分析 2024 年 AI 行业趋势',
    prompt: '分析一下 2024 年 AI 行业的发展趋势，包括技术突破、市场规模、主要玩家等方面',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: 'edit',
    title: '文案创作',
    desc: '帮我写一篇产品介绍',
    prompt: '帮我写一篇科技产品的介绍文案，要求简洁有力、突出卖点',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: 'lightbulb',
    title: '头脑风暴',
    desc: '给我一些创业点子',
    prompt: '给我一些 2024 年有潜力的创业点子，结合 AI 技术和市场需求',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
]

const capabilities = [
  { icon: 'check-circle', text: '实时对话' },
  { icon: 'check-circle', text: '代码生成' },
  { icon: 'check-circle', text: '多轮记忆' },
  { icon: 'check-circle', text: '工具调用' }
]
</script>


<style scoped lang="less">
@import './styles.less';
</style>
