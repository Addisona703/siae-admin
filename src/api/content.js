// Content management API service
import { get, post, put, del } from './client'

export const contentApi = {
  // ========== Content CRUD Operations ==========

  /**
   * Publish new content
   * @param contentData Content creation data
   * @returns Promise with created content
   */
  publishContent: async (contentData) => {
    return post('/content/', contentData)
  },

  /**
   * Edit content
   * @param contentData Content update data
   * @returns Promise with updated content
   */
  editContent: async (contentData) => {
    return put('/content/', contentData)
  },

  /**
   * Delete content
   * @param id Content ID
   * @param isTrash Whether to move to trash (0-permanent delete, 1-move to trash)
   * @returns Promise with void result
   */
  deleteContent: async (id, isTrash = 1) => {
    return del(`/content/?id=${id}&isTrash=${isTrash}`)
  },

  /**
   * Get content by ID
   * @param contentId Content ID
   * @returns Promise with content details
   */
  getContentById: async (contentId) => {
    return get(`/content/query/${contentId}`)
  },

  /**
   * Get paginated content list with filters
   * @param pageDTO Pagination and filter parameters
   * @returns Promise with paginated content list
   */
  getContentPage: async (pageDTO) => {
    return post('/content/page', pageDTO)
  },

  /**
   * Get hot content list
   * @param params Hot content query parameters
   * @returns Promise with hot content list
   */
  getHotContent: async (params) => {
    return get('/content/hot', { params })
  },

  // ========== Category Management ==========

  /**
   * Create new category
   * @param categoryData Category creation data
   * @returns Promise with created category
   */
  createCategory: async (categoryData) => {
    return post('/content/categories', categoryData)
  },

  /**
   * Update category
   * @param categoryData Category update data
   * @returns Promise with updated category
   */
  updateCategory: async (categoryData) => {
    return put('/content/categories', categoryData)
  },

  /**
   * Delete category
   * @param categoryId Category ID
   * @returns Promise with void result
   */
  deleteCategory: async (categoryId) => {
    return del(`/content/categories/${categoryId}`)
  },

  /**
   * Get paginated category list
   * @param pageDTO Pagination and filter parameters
   * @returns Promise with paginated category list
   */
  getCategoryPage: async (pageDTO) => {
    return post('/content/categories/page', pageDTO)
  },

  /**
   * Get category detail by ID
   * @param categoryId Category ID
   * @returns Promise with category details
   */
  getCategoryDetail: async (categoryId) => {
    return get(`/content/categories/detail/${categoryId}`)
  },

  /**
   * Toggle category enable status
   * @param dto Category enable toggle data
   * @returns Promise with void result
   */
  toggleCategoryEnable: async (dto) => {
    return post('/content/categories/toggle-enable', dto)
  },

  // ========== Tag Management ==========

  /**
   * Create new tag
   * @param tagData Tag creation data
   * @returns Promise with created tag
   */
  createTag: async (tagData) => {
    return post('/content/tags', tagData)
  },

  /**
   * Update tag
   * @param id Tag ID
   * @param tagData Tag update data
   * @returns Promise with updated tag
   */
  updateTag: async (id, tagData) => {
    return put(`/content/tags/${id}`, tagData)
  },

  /**
   * Delete tag
   * @param id Tag ID
   * @returns Promise with void result
   */
  deleteTag: async (id) => {
    return del(`/content/tags/${id}`)
  },

  /**
   * Get paginated tag list
   * @param pageDTO Pagination and filter parameters
   * @returns Promise with paginated tag list
   */
  getTagPage: async (pageDTO) => {
    return post('/content/tags/page', pageDTO)
  },

  // ========== Content Audit Management ==========

  /**
   * Handle audit (approve or reject)
   * @param id Audit record ID
   * @param auditData Audit handling data
   * @returns Promise with void result
   */
  handleAudit: async (id, auditData) => {
    return put(`/content/audits/${id}`, auditData)
  },

  /**
   * Get paginated audit list
   * @param pageDTO Pagination and filter parameters
   * @returns Promise with paginated audit list
   */
  getAuditPage: async (pageDTO) => {
    return post('/content/audits/page', pageDTO)
  },

  /**
   * Get audit record by target
   * @param queryDTO Query parameters with target ID and type
   * @returns Promise with audit record
   */
  getAuditRecord: async (queryDTO) => {
    return post('/content/audits/record', queryDTO)
  },

  // ========== Content Statistics ==========

  /**
   * Create content statistics record
   * @param contentId Content ID
   * @returns Promise with void result
   */
  createStatistics: async (contentId) => {
    return post(`/content/statistics/${contentId}`)
  },

  /**
   * Get content statistics
   * @param contentId Content ID
   * @returns Promise with statistics data
   */
  getStatistics: async (contentId) => {
    return get(`/content/statistics/${contentId}`)
  },

  /**
   * Update content statistics
   * @param contentId Content ID
   * @param statisticsData Statistics update data
   * @returns Promise with updated statistics
   */
  updateStatistics: async (contentId, statisticsData) => {
    return put(`/content/statistics/${contentId}`, statisticsData)
  },

  /**
   * Increment statistics (view/like/favorite +1)
   * @param contentId Content ID
   * @param actionType Action type (0=VIEW, 1=LIKE, 2=FAVORITE)
   * @returns Promise with void result
   */
  incrementStatistics: async (contentId, actionType) => {
    return post(`/content/statistics/${contentId}/increment`, null, { params: { actionType } })
  },

  /**
   * Decrement statistics (like/favorite -1)
   * @param contentId Content ID
   * @param actionType Action type (0=VIEW, 1=LIKE, 2=FAVORITE)
   * @returns Promise with void result
   */
  decrementStatistics: async (contentId, actionType) => {
    return post(`/content/statistics/${contentId}/decrement`, null, { params: { actionType } })
  },

  /**
   * Get statistics summary (for dashboard)
   * @returns Promise with statistics summary
   */
  getStatisticsSummary: async () => {
    return get('/content/statistics/summary')
  },

  /**
   * Get content type statistics
   * @returns Promise with content type statistics
   */
  getContentTypeStatistics: async () => {
    return get('/content/statistics/by-type')
  },

  /**
   * Get category statistics
   * @returns Promise with category statistics
   */
  getCategoryStatistics: async () => {
    return get('/content/statistics/by-category')
  },

  /**
   * Get trend data
   * @param days Number of days (default 7)
   * @returns Promise with trend data
   */
  getTrendData: async (days = 7) => {
    return get('/content/statistics/trend', { params: { days } })
  },

  // ========== Comment Management ==========

  /**
   * Create comment
   * @param contentId Content ID
   * @param commentData Comment creation data
   * @returns Promise with created comment
   */
  createComment: async (contentId, commentData) => {
    return post(`/content/comments/${contentId}`, commentData)
  },

  /**
   * Update comment
   * @param commentId Comment ID
   * @param commentData Comment update data
   * @returns Promise with updated comment
   */
  updateComment: async (commentId, commentData) => {
    return put(`/content/comments/${commentId}`, commentData)
  },

  /**
   * Delete comment
   * @param id Comment ID
   * @returns Promise with void result
   */
  deleteComment: async (id) => {
    return del(`/content/comments/${id}`)
  },

  /**
   * Get comment list by content ID
   * @param contentId Content ID
   * @param pageDTO Pagination parameters
   * @returns Promise with paginated comments
   */
  getCommentsByContent: async (contentId, pageDTO) => {
    return post(`/content/comments/${contentId}/page`, pageDTO)
  },

  /**
   * Get paginated comment list
   * @param pageDTO Pagination and filter parameters
   * @returns Promise with paginated comments
   */
  getCommentPage: async (pageDTO) => {
    return post('/content/comments/page', pageDTO)
  },

  // ========== User Interactions ==========

  /**
   * Record user action (like, favorite, view)
   * @param actionData Action data
   * @returns Promise with void result
   */
  recordAction: async (actionData) => {
    return post('/content/interactions/action', actionData)
  },

  /**
   * Cancel user action
   * @param actionData Action data
   * @returns Promise with void result
   */
  cancelAction: async (actionData) => {
    return del('/content/interactions/action', { data: actionData })
  },

  // ========== Favorites Management ==========

  /**
   * Create favorite folder
   * @param createDTO Folder creation data
   * @returns Promise with created folder
   */
  createFavoriteFolder: async (createDTO) => {
    return post('/content/favorites/folders', createDTO)
  },

  /**
   * Update favorite folder
   * @param updateDTO Folder update data
   * @returns Promise with updated folder
   */
  updateFavoriteFolder: async (updateDTO) => {
    return put('/content/favorites/folders', updateDTO)
  },

  /**
   * Delete favorite folder
   * @param folderId Folder ID
   * @returns Promise with void result
   */
  deleteFavoriteFolder: async (folderId) => {
    return del(`/content/favorites/folders/${folderId}`)
  },

  /**
   * Get user's favorite folders
   * @param userId User ID
   * @returns Promise with folder list
   */
  getUserFavoriteFolders: async (userId) => {
    return get(`/content/favorites/folders/user/${userId}`)
  },

  /**
   * Get favorite folder detail
   * @param folderId Folder ID
   * @returns Promise with folder detail
   */
  getFavoriteFolderDetail: async (folderId) => {
    return get(`/content/favorites/folders/${folderId}`)
  },

  /**
   * Add favorite item
   * @param addDTO Favorite item add data
   * @returns Promise with created favorite item
   */
  addFavorite: async (addDTO) => {
    return post('/content/favorites/items', addDTO)
  },

  /**
   * Update favorite item
   * @param updateDTO Favorite item update data
   * @returns Promise with updated favorite item
   */
  updateFavorite: async (updateDTO) => {
    return put('/content/favorites/items', updateDTO)
  },

  /**
   * Remove favorite item
   * @param itemId Favorite item ID
   * @returns Promise with void result
   */
  removeFavorite: async (itemId) => {
    return del(`/content/favorites/items/${itemId}`)
  },

  /**
   * Get favorite items in folder
   * @param folderId Folder ID
   * @param pageDTO Pagination parameters
   * @returns Promise with paginated favorite items
   */
  getFolderFavoriteItems: async (folderId, pageDTO) => {
    return post(`/content/favorites/items/folder/${folderId}`, pageDTO)
  },

  /**
   * Get user's all favorites
   * @param userId User ID
   * @param pageDTO Pagination parameters
   * @returns Promise with paginated favorite items
   */
  getUserFavorites: async (userId, pageDTO) => {
    return post(`/content/favorites/items/user/${userId}`, pageDTO)
  },

  /**
   * Check if content is favorited
   * @param userId User ID
   * @param contentId Content ID
   * @returns Promise with boolean result
   */
  checkFavorite: async (userId, contentId) => {
    return get('/content/favorites/items/check', { params: { userId, contentId } })
  }
}
