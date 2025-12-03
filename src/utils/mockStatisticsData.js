// 模拟统计数据（用于开发测试）

export const mockMemberOverview = {
  totalUsers: 1250,
  enabledUsers: 1180,
  disabledUsers: 70,
  formalMembers: 850,
  candidateMembers: 330,
  newUsersThisMonth: 45,
  newUsersThisYear: 320
}

export const mockAwardOverview = {
  totalAwards: 456,
  thisYearAwards: 128,
  thisMonthAwards: 23,
  teamAwards: 156,
  individualAwards: 300
}

export const mockDepartmentStats = [
  {
    departmentId: 1,
    departmentName: '技术部',
    totalMembers: 320,
    formalMembers: 250,
    candidateMembers: 70,
    withPosition: 45
  },
  {
    departmentId: 2,
    departmentName: '设计部',
    totalMembers: 180,
    formalMembers: 140,
    candidateMembers: 40,
    withPosition: 25
  },
  {
    departmentId: 3,
    departmentName: '运营部',
    totalMembers: 220,
    formalMembers: 170,
    candidateMembers: 50,
    withPosition: 30
  },
  {
    departmentId: 4,
    departmentName: '市场部',
    totalMembers: 150,
    formalMembers: 120,
    candidateMembers: 30,
    withPosition: 20
  }
]

export const mockPositionStats = [
  { positionId: 1, positionName: '部长', count: 8 },
  { positionId: 2, positionName: '副部长', count: 16 },
  { positionId: 3, positionName: '组长', count: 32 },
  { positionId: 4, positionName: '干事', count: 120 },
  { positionId: 5, positionName: '成员', count: 650 }
]

export const mockGenderStats = [
  { gender: 'male', genderName: '男', count: 720, percentage: 57.6 },
  { gender: 'female', genderName: '女', count: 480, percentage: 38.4 },
  { gender: 'unknown', genderName: '未知', count: 50, percentage: 4.0 }
]

export const mockGradeStats = [
  { grade: '2024', count: 320 },
  { grade: '2023', count: 380 },
  { grade: '2022', count: 350 },
  { grade: '2021', count: 150 },
  { grade: '2020', count: 50 }
]

export const mockMajorStats = [
  { majorId: 1, majorName: '计算机科学', count: 280 },
  { majorId: 2, majorName: '软件工程', count: 220 },
  { majorId: 3, majorName: '人工智能', count: 180 },
  { majorId: 4, majorName: '数据科学', count: 150 },
  { majorId: 5, majorName: '网络工程', count: 120 }
]

export const mockMembershipTrend = [
  { period: '2024-01', formalCount: 800, candidateCount: 280 },
  { period: '2024-02', formalCount: 810, candidateCount: 290 },
  { period: '2024-03', formalCount: 820, candidateCount: 300 },
  { period: '2024-04', formalCount: 825, candidateCount: 305 },
  { period: '2024-05', formalCount: 830, candidateCount: 310 },
  { period: '2024-06', formalCount: 835, candidateCount: 315 },
  { period: '2024-07', formalCount: 838, candidateCount: 318 },
  { period: '2024-08', formalCount: 840, candidateCount: 320 },
  { period: '2024-09', formalCount: 843, candidateCount: 323 },
  { period: '2024-10', formalCount: 846, candidateCount: 326 },
  { period: '2024-11', formalCount: 848, candidateCount: 328 },
  { period: '2024-12', formalCount: 850, candidateCount: 330 }
]

export const mockAwardTrend = [
  { period: '2024-01', count: 8 },
  { period: '2024-02', count: 12 },
  { period: '2024-03', count: 15 },
  { period: '2024-04', count: 10 },
  { period: '2024-05', count: 18 },
  { period: '2024-06', count: 14 },
  { period: '2024-07', count: 9 },
  { period: '2024-08', count: 11 },
  { period: '2024-09', count: 16 },
  { period: '2024-10', count: 13 },
  { period: '2024-11', count: 20 },
  { period: '2024-12', count: 23 }
]

export const mockAwardLevelStats = [
  { id: 1, name: '国家级', count: 45 },
  { id: 2, name: '省级', count: 120 },
  { id: 3, name: '校级', count: 291 }
]

export const mockAwardTypeStats = [
  { id: 1, name: '学术竞赛', count: 180 },
  { id: 2, name: '创新创业', count: 95 },
  { id: 3, name: '文体活动', count: 78 },
  { id: 4, name: '社会实践', count: 56 },
  { id: 5, name: '其他', count: 47 }
]

export const mockAwardRanking = [
  {
    userId: 1,
    username: 'zhangsan',
    realName: '张三',
    avatarUrl: null,
    awardCount: 12,
    nationalCount: 2,
    provincialCount: 5,
    schoolCount: 5
  },
  {
    userId: 2,
    username: 'lisi',
    realName: '李四',
    avatarUrl: null,
    awardCount: 10,
    nationalCount: 1,
    provincialCount: 4,
    schoolCount: 5
  },
  {
    userId: 3,
    username: 'wangwu',
    realName: '王五',
    avatarUrl: null,
    awardCount: 9,
    nationalCount: 1,
    provincialCount: 3,
    schoolCount: 5
  },
  {
    userId: 4,
    username: 'zhaoliu',
    realName: '赵六',
    avatarUrl: null,
    awardCount: 8,
    nationalCount: 0,
    provincialCount: 4,
    schoolCount: 4
  },
  {
    userId: 5,
    username: 'sunqi',
    realName: '孙七',
    avatarUrl: null,
    awardCount: 7,
    nationalCount: 1,
    provincialCount: 2,
    schoolCount: 4
  }
]
