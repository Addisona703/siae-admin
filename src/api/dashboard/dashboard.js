import request from '@/utils/request.js'

export const getAllMember = (data) => {
  return request.post('/user/memberships/page', data)
}

export const getAllAwards = (data) => {
  return request.post('/user/awards/page', data)
}
