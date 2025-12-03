import { ref, reactive, computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'

export function useForm(options) {
  const {
    initialData,
    rules,
    submitFn,
    successMessage = '操作成功',
    errorMessage = '操作失败',
    resetAfterSubmit = false,
    transformData,
    onSuccess,
    onError
  } = options

  // State
  const formRef = ref()
  const loading = ref(false)
  const formData = reactive({ ...initialData })

  // Computed
  const isSubmitting = computed(() => loading.value)
  const hasChanges = computed(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData)
  })

  /**
   * Validate form
   */
  const validate = async () => {
    if (!formRef.value) return true
    
    try {
      const result = await formRef.value.validate()
      return result === true
    } catch (error) {
      return false
    }
  }

  /**
   * Clear validation
   */
  const clearValidate = (fields) => {
    if (!formRef.value) return
    
    if (fields) {
      fields.forEach(field => {
        formRef.value?.clearValidate([field])
      })
    } else {
      formRef.value.clearValidate()
    }
  }

  /**
   * Reset form to initial data
   */
  const reset = () => {
    Object.assign(formData, initialData)
    clearValidate()
  }

  /**
   * Update form data
   */
  const updateFormData = (data) => {
    Object.assign(formData, data)
  }

  /**
   * Set form data (replace all)
   */
  const setFormData = (data) => {
    Object.keys(formData).forEach(key => {
      delete formData[key]
    })
    Object.assign(formData, data)
  }

  /**
   * Submit form
   */
  const submit = async () => {
    // Validate first
    const isValid = await validate()
    if (!isValid) return false

    // If no submit function provided, just validate
    if (!submitFn) return true

    loading.value = true
    try {
      const plainData = { ...formData }
      const dataToSubmit = transformData ? transformData(plainData) : plainData
      const response = await submitFn(dataToSubmit)

      MessagePlugin.success(successMessage)
      
      if (resetAfterSubmit) {
        reset()
      }

      if (onSuccess) {
        onSuccess(response)
      }

      return true
    } catch (error) {
      MessagePlugin.error(error.message || errorMessage)
      
      if (onError) {
        onError(error)
      }

      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Handle form submit event
   */
  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault()
    }
    return await submit()
  }

  /**
   * Validate specific field
   */
  const validateField = async (field) => {
    if (!formRef.value) return true
    
    try {
      await formRef.value.validate({ fields: [field] })
      return true
    } catch (error) {
      return false
    }
  }

  return {
    // Refs
    formRef,
    formData,
    rules,

    // State
    loading,
    isSubmitting,
    hasChanges,

    // Methods
    validate,
    clearValidate,
    reset,
    updateFormData,
    setFormData,
    submit,
    handleSubmit,
    validateField
  }
}
