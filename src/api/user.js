// 用户管理 API 服务
import { get, post, put, del } from './client'

export const userApi = {
  // ========== 用户 CRUD 操作 ==========

  /**
   * 分页查询用户列表
   * @param params 分页和筛选参数
   * @returns 返回分页用户列表
   */
  getAllUserList: async (params) => {
    return post('/user/page', params)
  },

  getUsers: async (params) => {
    return post('/user/page', params)
  },

  /**
   * 根据 ID、用户名或学号查询用户详细信息
   * @param params 查询参数（id、username 或 studentId，可选且可同时存在）
   * @returns 返回用户详细信息（包含用户基本信息、详情信息和班级关联信息）
   */
  getUser: async (params) => {
    const queryParams = new URLSearchParams()
    if (params.id !== undefined) queryParams.append('id', params.id.toString())
    if (params.username) queryParams.append('username', params.username)
    if (params.studentId) queryParams.append('studentId', params.studentId)

    const queryString = queryParams.toString()
    const url = queryString ? `/user/?${queryString}` : '/user/'

    return get(url)
  },

  /**
   * 创建新用户
   * @param userData 用户创建数据
   * @returns 返回创建的用户
   */
  createUser: async (userData) => {
    return post('/user', userData)
  },

  /**
   * 更新用户信息
   * @param id 用户 ID
   * @param userData 用户更新数据
   * @returns 返回更新后的用户
   */
  updateUser: async (id, userData) => {
    return put(`/user/${id}`, userData)
  },

  /**
   * 删除用户
   * @param id 用户 ID
   * @returns 返回布尔结果
   */
  deleteUser: async (id) => {
    return del(`/user/${id}`)
  },

  /**
   * 检查学号是否存在
   * @param studentId 学号
   * @returns 返回布尔结果
   */
  checkStudentIdExists: async (studentId) => {
    return get(`/user/check-student-id/${studentId}`)
  },

  // ========== 成员管理（统一的候选/正式成员） ==========

  /**
   * 申请成为成员（创建候选成员）
   * @param memberData 成员申请数据
   * @returns 返回创建的成员 ID
   */
  applyForMembership: async (memberData) => {
    return post('/user/memberships/apply', memberData)
  },

  /**
   * 候选成员转正为正式成员
   * @param id 成员 ID
   * @param promoteData 转正数据
   * @returns 返回布尔结果
   */
  promoteToOfficial: async (id, promoteData) => {
    return put(`/user/memberships/${id}/promote`, promoteData)
  },

  /**
   * 更新成员信息
   * @param id 成员 ID
   * @param memberData 成员更新数据
   * @returns 返回布尔结果
   */
  updateMembership: async (id, memberData) => {
    return put(`/user/memberships/${id}`, memberData)
  },

  /**
   * 删除成员
   * @param id 成员 ID
   * @returns 返回布尔结果
   */
  deleteMembership: async (id) => {
    return del(`/user/memberships/${id}`)
  },

  /**
   * 根据 ID 查询成员
   * @param id 成员 ID
   * @returns 返回成员详情
   */
  getMembershipById: async (id) => {
    return get(`/user/memberships/${id}`)
  },

  /**
   * 根据用户 ID 查询成员
   * @param userId 用户 ID
   * @returns 返回成员详情
   */
  getMembershipByUserId: async (userId) => {
    return get(`/user/memberships/by-user/${userId}`)
  },

  /**
   * 查询成员详细信息（包含关联数据）
   * @param id 成员 ID
   * @returns 返回成员详细信息
   */
  getMembershipDetail: async (id) => {
    return get(`/user/memberships/${id}/detail`)
  },

  /**
   * 分页查询成员列表
   * @param params 分页和筛选参数
   * @returns 返回分页成员列表
   */
  getMemberships: async (params) => {
    return post('/user/memberships/page', params)
  },

  /**
   * 检查用户是否为成员
   * @param userId 用户 ID
   * @returns 返回布尔结果
   */
  isMember: async (userId) => {
    return get(`/user/memberships/check/${userId}`)
  },

  /**
   * 检查用户是否为候选成员
   * @param userId 用户 ID
   * @returns 返回布尔结果
   */
  isCandidate: async (userId) => {
    return get(`/user/memberships/check/${userId}/candidate`)
  },

  /**
   * 检查用户是否为正式成员
   * @param userId 用户 ID
   * @returns 返回布尔结果
   */
  isOfficialMember: async (userId) => {
    return get(`/user/memberships/check/${userId}/official`)
  },

  // ========== 奖项类型管理 ==========

  /**
   * 查询所有奖项类型
   * @returns 返回奖项类型列表
   */
  getAwardTypes: async () => {
    return get('/user/award-types')
  },

  /**
   * 根据 ID 查询奖项类型
   * @param id 奖项类型 ID
   * @returns 返回奖项类型详情
   */
  getAwardTypeById: async (id) => {
    return get(`/user/award-types/${id}`)
  },

  /**
   * 创建新奖项类型
   * @param awardTypeData 奖项类型创建数据
   * @returns 返回创建的奖项类型
   */
  createAwardType: async (awardTypeData) => {
    return post('/user/award-types', awardTypeData)
  },

  /**
   * 更新奖项类型信息
   * @param id 奖项类型 ID
   * @param name 奖项类型名称
   * @param orderId 排序 ID
   * @returns 返回更新后的奖项类型
   */
  updateAwardType: async (id, name, orderId) => {
    const params = new URLSearchParams({ name })
    if (orderId !== undefined) {
      params.append('orderId', orderId.toString())
    }
    return put(`/user/award-types/${id}?${params.toString()}`)
  },

  /**
   * 删除奖项类型
   * @param id 奖项类型 ID
   * @returns 返回布尔结果
   */
  deleteAwardType: async (id) => {
    return del(`/user/award-types/${id}`)
  },

  // ========== 奖项等级管理 ==========

  /**
   * 查询所有奖项等级
   * @returns 返回奖项等级列表
   */
  getAwardLevels: async () => {
    return get('/user/award-levels')
  },

  /**
   * 根据 ID 查询奖项等级
   * @param id 奖项等级 ID
   * @returns 返回奖项等级详情
   */
  getAwardLevelById: async (id) => {
    return get(`/user/award-levels/${id}`)
  },

  /**
   * 创建新奖项等级
   * @param awardLevelData 奖项等级创建数据
   * @returns 返回创建的奖项等级
   */
  createAwardLevel: async (awardLevelData) => {
    return post('/user/award-levels', awardLevelData)
  },

  /**
   * 更新奖项等级信息
   * @param id 奖项等级 ID
   * @param name 奖项等级名称
   * @param orderId 排序 ID
   * @returns 返回更新后的奖项等级
   */
  updateAwardLevel: async (id, name, orderId) => {
    const params = new URLSearchParams({ name })
    if (orderId !== undefined) {
      params.append('orderId', orderId.toString())
    }
    return put(`/user/award-levels/${id}?${params.toString()}`)
  },

  /**
   * 删除奖项等级
   * @param id 奖项等级 ID
   * @returns 返回布尔结果
   */
  deleteAwardLevel: async (id) => {
    return del(`/user/award-levels/${id}`)
  },

  // ========== 用户获奖记录管理 ==========

  /**
   * 分页查询获奖记录列表
   * @param params 分页和筛选参数
   * @returns 返回分页获奖记录列表
   */
  getAwards: async (params) => {
    return post('/user/awards/page', params)
  },

  /**
   * 根据用户 ID 分页查询获奖记录
   * @param userId 用户 ID
   * @param params 分页参数
   * @returns 返回分页获奖记录列表
   */
  getAwardsByUserId: async (userId, params) => {
    return post(`/user/awards/user/${userId}/page`, params)
  },

  /**
   * 根据 ID 查询获奖记录
   * @param id 获奖记录 ID
   * @returns 返回获奖记录详情
   */
  getAwardById: async (id) => {
    return get(`/user/awards/${id}`)
  },

  /**
   * 创建新获奖记录
   * @param awardData 获奖记录创建数据
   * @returns 返回创建的获奖记录
   */
  createAward: async (awardData) => {
    return post('/user/awards', awardData)
  },

  /**
   * 更新获奖记录信息
   * @param id 获奖记录 ID
   * @param awardData 获奖记录更新数据
   * @returns 返回更新后的获奖记录
   */
  updateAward: async (id, awardData) => {
    return put(`/user/awards/${id}`, awardData)
  },

  /**
   * 删除获奖记录
   * @param id 获奖记录 ID
   * @returns 返回布尔结果
   */
  deleteAward: async (id) => {
    return del(`/user/awards/${id}`)
  },

  // ========== 统计分析接口 ==========

  /**
   * 获取成员概览统计
   * @returns 返回成员总体概况数据
   */
  getMemberOverview: async () => {
    return get('/user/statistics/overview')
  },

  /**
   * 获取部门分布统计
   * @returns 返回各部门的成员分布情况
   */
  getDepartmentStats: async () => {
    return get('/user/statistics/departments')
  },

  /**
   * 获取获奖概览统计
   * @returns 返回获奖情况的总体概况
   */
  getAwardOverview: async () => {
    return get('/user/statistics/awards/overview')
  },

  /**
   * 获取按奖项等级分布
   * @returns 返回按奖项等级分组的获奖统计
   */
  getAwardsByLevel: async () => {
    return get('/user/statistics/awards/by-level')
  },

  /**
   * 获取按奖项类型分布
   * @returns 返回按奖项类型分组的获奖统计
   */
  getAwardsByType: async () => {
    return get('/user/statistics/awards/by-type')
  },

  /**
   * 获取获奖趋势（旧版，仅总数）
   * @param period 统计周期：month(按月) 或 year(按年)
   * @param limit 返回最近N个周期的数据
   * @returns 返回获奖数量的时间趋势
   */
  getAwardTrend: async (period = 'month', limit = 12) => {
    return get('/user/statistics/awards/trend', {
      params: { period, limit }
    })
  },

  /**
   * 获取获奖趋势详细统计（含各等级分布）
   * @param period 统计周期：month(按月) 或 year(按年)
   * @param startPeriod 开始时间（格式：YYYY-MM 或 YYYY，根据period决定）
   * @param endPeriod 结束时间（格式：YYYY-MM 或 YYYY，根据period决定）
   * @returns 返回获奖数量的时间趋势，包含各等级分布
   */
  getAwardTrendDetail: async (period = 'month', startPeriod, endPeriod) => {
    const params = { period }
    if (startPeriod) params.startPeriod = startPeriod
    if (endPeriod) params.endPeriod = endPeriod

    return get('/user/statistics/awards/trend', { params })
  },

  /**
   * 获取获奖排行榜
   * @param limit 返回TOP N，最大100
   * @returns 返回获奖最多的成员排行榜
   */
  getAwardRanking: async (limit = 10) => {
    return get('/user/statistics/awards/top', { params: { limit } })
  },

  /**
   * 获取性别分布统计
   * @returns 返回成员的性别分布统计
   */
  getGenderStats: async () => {
    return get('/user/statistics/demographics/gender')
  },

  /**
   * 获取年级分布统计
   * @returns 返回成员的年级分布统计
   */
  getGradeStats: async () => {
    return get('/user/statistics/demographics/grade')
  },

  /**
   * 获取专业分布统计
   * @returns 返回成员的专业分布统计
   */
  getMajorStats: async () => {
    return get('/user/statistics/demographics/major')
  },

  /**
   * 获取职位分布统计
   * @returns 返回各职位的人数分布
   */
  getPositionStats: async () => {
    return get('/user/statistics/positions')
  },

  /**
   * 获取入会趋势统计
   * @param period 统计周期：month(按月) 或 year(按年)
   * @param limit 返回最近N个周期的数据
   * @returns 返回成员入会和转正的时间趋势
   */
  getMembershipTrend: async (period = 'month', limit = 12) => {
    return get('/user/statistics/membership/trend', {
      params: { period, limit }
    })
  },

  // ========== 部门管理 ==========

  /**
   * 查询所有部门列表
   * @returns 返回部门列表（字典数据，按orderId排序）
   */
  getDepartments: async () => {
    return get('/user/departments')
  },

  /**
   * 查询所有班级列表
   * @returns 返回班级列表
   */
  getClasses: async () => {
    return get('/user/classes')
  },

  /**
   * 查询所有职位列表
   * @returns 返回职位列表
   */
  getPositions: async () => {
    return get('/user/positions')
  }
}
