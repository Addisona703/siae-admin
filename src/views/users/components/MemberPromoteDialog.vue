<template>
  <t-dialog v-model:visible="dialogVisible" header="成员转正办理" width="600px" placement="center" :confirm-btn="{
    content: '确认转正',
    theme: 'primary',
    loading: loading
  }" @confirm="handleConfirm">
    <div v-if="member" class="promote-dialog-content">
      <div class="member-card">
        <t-avatar :image="member.headshotUrl" size="large">
          {{ member.realName?.[0] || '?' }}
        </t-avatar>
        <div>
          <div class="dialog-member-name">
            {{ member.realName || '-' }}
          </div>
          <div class="dialog-member-info">
            用户ID: {{ member.userId }} ·
            <span class="candidate-badge">候选成员</span>
          </div>
        </div>
      </div>

      <t-form :data="formData" label-align="top">
        <div class="form-row">
          <t-form-item label="转正日期" name="joinDate" class="form-item-half">
            <t-date-picker v-model="formData.joinDate" class="w-full" />
          </t-form-item>

          <t-form-item label="任命部门" name="departmentId" class="form-item-half">
            <t-select v-model="formData.departmentId" class="w-full" placeholder="请选择">
              <t-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
            </t-select>
          </t-form-item>
        </div>

        <div class="form-row">
          <t-form-item label="授予职位" name="positionId" class="form-item-half">
            <t-select v-model="formData.positionId" class="w-full" placeholder="请选择">
              <t-option v-for="pos in positions" :key="pos.id" :label="pos.name" :value="pos.id" />
            </t-select>
          </t-form-item>

          <t-form-item label="生效日期" name="positionStartDate" class="form-item-half">
            <t-date-picker v-model="formData.positionStartDate" class="w-full" />
          </t-form-item>
        </div>

        <t-form-item label="考核备注" name="remark">
          <t-textarea v-model="formData.remark" placeholder="填写转正评语..." :maxlength="500"
            :autosize="{ minRows: 3, maxRows: 6 }" />
        </t-form-item>
      </t-form>
    </div>
  </t-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  member: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  departments: {
    type: Array,
    default: () => []
  },
  positions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

const dialogVisible = ref(props.visible)
const formData = ref({
  joinDate: new Date().toISOString().slice(0, 10),
  departmentId: null,
  positionId: null,
  positionStartDate: new Date().toISOString().slice(0, 10),
  remark: ''
})

watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val
    if (val) {
      // 重置表单
      formData.value = {
        joinDate: new Date().toISOString().slice(0, 10),
        departmentId: null,
        positionId: null,
        positionStartDate: new Date().toISOString().slice(0, 10),
        remark: ''
      }
    }
  }
)

watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const handleConfirm = () => {
  emit('confirm', formData.value)
}
</script>

<style scoped lang="less">
.promote-dialog-content {
  padding: 8px 4px;

  .member-card {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
    background: var(--td-bg-color-container-select);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--td-component-border);

    .dialog-member-name {
      font-size: 20px;
      font-weight: 600;
      color: var(--td-text-color-primary);
      margin-bottom: 6px;
    }

    .dialog-member-info {
      font-size: 14px;
      color: var(--td-text-color-secondary);

      .candidate-badge {
        color: var(--td-warning-color);
        font-weight: 500;
      }
    }
  }

  .w-full {
    width: 100%;
  }

  // 2列布局
  .form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;

    .form-item-half {
      flex: 1;
      margin-bottom: 0 !important;
    }
  }

  // 表单样式优化
  :deep(.t-form-item) {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  :deep(.t-form__label) {
    font-weight: 500;
    color: var(--td-text-color-primary);
    font-size: 14px;
  }

  // 输入框样式
  :deep(.t-input),
  :deep(.t-select),
  :deep(.t-date-picker) {
    width: 100%;
  }

  // 文本域样式
  :deep(.t-textarea__inner) {
    min-height: 80px;
  }
}
</style>
