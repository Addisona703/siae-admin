import request from '@/utils/request.js'

export const getAllContentList = (data) => {
  return request.post('/content/page', data)
}

export const getAllCategories = (data) => {
  return request.post('/content/categories/page', data)
}
