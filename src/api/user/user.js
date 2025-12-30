import request from '@/utils/request.js'

export const getAllUserList = (data) => {
  return request.post('/user/page', data)
}

export const getAllMemberShips = (data) => {
  return request.post('/user/memberships/page', data)
}

export const postUser = (data) => {
  return request.post('/user/', data)
}

export const searchUser = (params) => {
  return request.post('/user/page', params)
}

export const searchUserDetail = (params) => {
  return request.get(`/user/${params.id}`)
}

export const deleteUser = (id) => {
  return request.delete(`/user/${id}`)
}

export const EditUser = (data) => {
  return request.put(`/user/${data.id}`, data)
}

export const getDepartments = () => {
  return request.get('/user/departments')
}

export const getAwards = (id) => {
  return request.get(`/user/awards/${id}`)
}

// 根据用户ID分页获取奖项列表
export const getAwardsByUserId = (userId, pageParams = { pageNum: 1, pageSize: 10 }) => {
  return request.post(`/user/awards/user/${userId}/page`, pageParams)
}

export const getMemberDetail = (id) => {
  return request.get(`/user/memberships/${id}/detail`)
}

export const approve = (id) => {
  return request.put(`/user/memberships/${id}/approve`)
}

export const approveReject = (id) => {
  return request.put(`/user/memberships/${id}/reject`)
}

export const deleteMember = (id) => {
  return request.delete(`/user/memberships/${id}`)
}

export const getPositions = () => {
  return request.get('/user/positions')
}

export const promoteToOfficial = (id, data) => {
  return request.put(`/user/memberships/${id}/promote`, data)
}

export const expelMember = (id) => {
  return request.put(`/user/memberships/${id}/expel`)
}

export const disableUser = (id) => {
  return request.put(`/user/${id}`, { status: 0 })
}
