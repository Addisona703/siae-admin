<template>
  <t-dialog v-model:visible="dialogVisible" :header="title" :width="width" :confirm-btn="confirmBtnConfig"
    :cancel-btn="cancelBtnConfig" :destroy-on-close="destroyOnClose" :close-on-overlay-click="closeOnOverlayClick"
    @confirm="handleConfirm" @cancel="handleCancel" @close="handleClose">
    <t-form ref="formRef" :data="formData" :rules="rules" :label-width="labelWidth" :layout="layout"
      @submit="handleSubmit">
      <slot :form-data="formData" />
    </t-form>

    <!-- Custom footer slot -->
    <template v-if="$slots.footer" #footer>
      <slot name="footer" :loading="loading" :confirm="handleConfirm" :cancel="handleCancel" />
    </template>
  </t-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  formData: {
    type: Object,
    required: true
  },
  rules: {
    type: Object,
    default: () => ({})
  },
  width: {
    type: [String, Number],
    default: '600px'
  },
  labelWidth: {
    type: [String, Number],
    default: '100px'
  },
  layout: {
    type: String,
    default: 'vertical',
    validator: (value) => ['vertical', 'inline'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  destroyOnClose: {
    type: Boolean,
    default: true
  },
  closeOnOverlayClick: {
    type: Boolean,
    default: false
  },
  validateOnConfirm: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel', 'close'])

const formRef = ref(null)
const dialogVisible = ref(props.visible)

// Watch for external visibility changes
watch(() => props.visible, (newValue) => {
  dialogVisible.value = newValue
})

// Watch for internal visibility changes
watch(dialogVisible, (newValue) => {
  emit('update:visible', newValue)
})

// Computed button configs
const confirmBtnConfig = computed(() => ({
  content: props.confirmText,
  theme: 'primary',
  loading: props.loading
}))

const cancelBtnConfig = computed(() => ({
  content: props.cancelText
}))

// Handlers
const handleConfirm = async () => {
  if (props.validateOnConfirm) {
    try {
      const valid = await formRef.value?.validate()
      if (!valid) return
    } catch (error) {
      // Validation failed
      return
    }
  }

  emit('confirm', props.formData)
}

const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}

const handleClose = () => {
  emit('close')
}

const handleSubmit = (e) => {
  e.preventDefault()
  handleConfirm()
}

// Expose form methods
const validate = () => formRef.value?.validate()
const clearValidate = () => formRef.value?.clearValidate()
const reset = () => formRef.value?.reset()

defineExpose({
  validate,
  clearValidate,
  reset
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
