<template>
  <t-card :bordered="false" class="search-card">
    <t-form ref="formRef" :data="formData" @submit="handleSubmit" @reset="handleReset" layout="inline">
      <t-row :gutter="[16, 16]" class="w-full">
        <!-- 关键词搜索 -->
        <t-col :span="3">
          <t-input v-model="formData.keyword" placeholder="姓名 / 学号" clearable>
            <template #prefix-icon>
              <t-icon name="search" />
            </template>
          </t-input>
        </t-col>

        <!-- 状态筛选 -->
        <t-col :span="2">
          <t-select v-model="formData.lifecycleStatus" placeholder="成员状态" clearable>
            <t-option label="正式成员" :value="1" />
            <t-option label="候选成员" :value="0" />
          </t-select>
        </t-col>

        <!-- 部门筛选 -->
        <t-col :span="2">
          <t-select v-model="formData.departmentId" placeholder="所属部门" clearable>
            <t-option v-for="dept in departments" :key="dept.id" :label="dept.name" :value="dept.id" />
          </t-select>
        </t-col>

        <!-- 职位筛选 -->
        <t-col :span="2">
          <t-select v-model="formData.positionId" placeholder="职位" clearable>
            <t-option v-for="pos in positions" :key="pos.id" :label="pos.name" :value="pos.id" />
          </t-select>
        </t-col>

        <!-- 状态筛选 -->
        <t-col :span="2">
          <t-select v-model="formData.status" placeholder="记录状态" clearable>
            <t-option label="正常" value="NORMAL" />
            <t-option label="已离会" value="LEFT" />
            <t-option label="已毕业" value="GRADUATED" />
          </t-select>
        </t-col>

        <!-- 操作按钮 -->
        <t-col class="flex-1 flex justify-end gap-2">
          <t-button theme="primary" type="submit">查询</t-button>
          <t-button theme="default" type="reset">重置</t-button>
        </t-col>
      </t-row>
    </t-form>
  </t-card>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      keyword: '',
      lifecycleStatus: null,
      status: null,
      departmentId: null,
      positionId: null
    })
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

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

const formRef = ref()
const formData = ref(props.modelValue)

const handleSubmit = () => {
  emit('update:modelValue', formData.value)
  emit('search')
}

const handleReset = () => {
  formData.value = {
    keyword: '',
    lifecycleStatus: null,
    status: null,
    departmentId: null,
    positionId: null
  }
  emit('update:modelValue', formData.value)
  emit('reset')
}
</script>

<style scoped lang="less">
.search-card {
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.w-full {
  width: 100%;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1;
}

.justify-end {
  justify-content: flex-end;
}

.gap-2 {
  gap: 8px;
}
</style>
