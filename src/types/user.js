// 用户管理相关类型 (JavaScript JSDoc 定义)

/**
 * 成员类型（后端返回的是描述字符串）
 * @typedef {'候选成员' | '正式成员'} MemberType
 */

/**
 * 用户详细信息
 * @typedef {Object} UserDetailVO
 * @property {number} id - User ID
 * @property {string} username - Username
 * @property {string} email - Email
 * @property {string} [realName] - Real name
 * @property {string} [studentId] - Student ID
 * @property {string} [phone] - Phone number
 * @property {string} [avatar] - Avatar URL
 */

/**
 * 成员概览统计
 * @typedef {Object} MemberOverview
 * @property {number} totalUsers - Total users
 * @property {number} enabledUsers - Enabled users
 * @property {number} disabledUsers - Disabled users
 * @property {number} formalMembers - Formal members
 * @property {number} candidateMembers - Candidate members
 */

/**
 * 部门统计
 * @typedef {Object} DepartmentStats
 * @property {number} departmentId - Department ID
 * @property {string} departmentName - Department name
 * @property {number} totalMembers - Total members
 * @property {number} formalMembers - Formal members
 * @property {number} candidateMembers - Candidate members
 */

/**
 * 获奖概览统计
 * @typedef {Object} AwardOverview
 * @property {number} totalAwards - Total awards
 * @property {number} thisYearAwards - This year awards
 * @property {number} thisMonthAwards - This month awards
 */

/**
 * 获奖分布统计
 * @typedef {Object} AwardDistribution
 * @property {number} id - ID
 * @property {string} name - Name
 * @property {number} count - Count
 */

/**
 * 趋势统计
 * @typedef {Object} TrendStats
 * @property {string} period - Period
 * @property {number} count - Count
 */

/**
 * 获奖排行榜
 * @typedef {Object} AwardRanking
 * @property {number} userId - User ID
 * @property {string} username - Username
 * @property {string} realName - Real name
 * @property {string} [avatarUrl] - Avatar URL
 * @property {number} awardCount - Award count
 */

/**
 * 性别统计
 * @typedef {Object} GenderStats
 * @property {string} gender - Gender
 * @property {string} genderName - Gender name
 * @property {number} count - Count
 * @property {number} percentage - Percentage
 */

/**
 * 年级统计
 * @typedef {Object} GradeStats
 * @property {string} grade - Grade
 * @property {number} count - Count
 */

/**
 * 专业统计
 * @typedef {Object} MajorStats
 * @property {number} majorId - Major ID
 * @property {string} majorName - Major name
 * @property {number} count - Count
 */

/**
 * 职位统计
 * @typedef {Object} PositionStats
 * @property {number} positionId - Position ID
 * @property {string} positionName - Position name
 * @property {number} count - Count
 */

/**
 * 成员信息
 * @typedef {Object} MemberVO
 * @property {number} id - Member ID
 * @property {string} username - Username
 * @property {string} studentId - Student ID
 * @property {string} nickname - Nickname
 * @property {string} memberType - Member type
 */

/**
 * 创建成员请求
 * @typedef {Object} CreateMemberRequest
 * @property {string} username - Username
 * @property {string} studentId - Student ID
 * @property {string} nickname - Nickname
 */

/**
 * 成员转正请求
 * @typedef {Object} PromoteMemberRequest
 * @property {number} memberId - Member ID
 * @property {string} [reason] - Promotion reason
 */

/**
 * 成员查询参数
 * @typedef {Object} MemberQueryParams
 * @property {number} [pageNum] - Page number
 * @property {number} [pageSize] - Page size
 * @property {string} [keyword] - Search keyword
 * @property {string} [memberType] - Member type filter
 */

export default {}
