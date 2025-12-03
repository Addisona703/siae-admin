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
  return request.get('/user/', { params })
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
