import request from '@/utils/request.js'

export const getAllAwardsList = (data) => {
  return request.post('user/awards/page', data)
}
