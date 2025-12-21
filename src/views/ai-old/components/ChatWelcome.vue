<template>
  <div class="welcome">
    <div class="welcome-content">
      <!-- Logo -->
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
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
