import { ref, reactive, computed } from 'vue'
import { MessagePlugin } from 'tdesign-vue-next'

export function useTable(options) {
  const {
    fetchFn,
    pageSize = 10,
    page = 1,
    immediate = true,
    errorMessage = '加载数据失败',
    transformParams
  } = options

  // State
  const loading = ref(false)
  const data = ref([])
  const searchParams = reactive({})

  // Pagination
  const pagination = reactive({
    current: page,
    pageSize: pageSize,
    total: 0
  })

  // Computed
  const hasData = computed(() => data.value.length > 0)
  const isEmpty = computed(() => !loading.value && data.value.length === 0)

  /**
   * Fetch data with current params
   */
  const fetchData = async () => {
    loading.value = true
    try {
      const params = {
        page: pagination.current,
        size: pagination.pageSize,
        ...searchParams
      }

      const transformedParams = transformParams ? transformParams(params) : params
      const response = await fetchFn(transformedParams)

      data.value = response.items || response.data?.items || []
      pagination.total = response.total || response.data?.total || 0
    } catch (error) {
      MessagePlugin.error(error.message || errorMessage)
      data.value = []
      pagination.total = 0
    } finally {
      loading.value = false
    }
  }

  /**
   * Handle page change
   */
  const handlePageChange = (pageInfo) => {
    pagination.current = pageInfo.current
    pagination.pageSize = pageInfo.pageSize
    fetchData()
  }

  /**
   * Search with params (reset to page 1)
   */
  const search = (params) => {
    if (params) {
      Object.assign(searchParams, params)
    }
    pagination.current = 1
    fetchData()
  }

  /**
   * Reset search params and reload
   */
  const reset = () => {
    Object.keys(searchParams).forEach(key => {
      delete searchParams[key]
    })
    pagination.current = 1
    fetchData()
  }

  /**
   * Reload current page
   */
  const reload = () => {
    fetchData()
  }

  /**
   * Update search params without triggering fetch
   */
  const updateSearchParams = (params) => {
    Object.assign(searchParams, params)
  }

  /**
   * Clear search params without triggering fetch
   */
  const clearSearchParams = () => {
    Object.keys(searchParams).forEach(key => {
      delete searchParams[key]
    })
  }

  // Initialize
  if (immediate) {
    fetchData()
  }

  return {
    // State
    loading,
    data,
    pagination,
    searchParams,

    // Computed
    hasData,
    isEmpty,

    // Methods
    fetchData,
    handlePageChange,
    search,
    reset,
    reload,
    updateSearchParams,
    clearSearchParams
  }
}
