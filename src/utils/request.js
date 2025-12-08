import axios from 'axios'
import { APP_CONFIG } from '@/config/app.config'

const baseURL = APP_CONFIG.apiBaseUrl

const instance = axios.create({
  baseURL,
  // 使用自定义的 transformResponse 来处理大数字
  transformResponse: [
    function (data) {
      if (typeof data === 'string') {
        try {
          // 使用正则替换大数字为字符串，避免精度丢失
          // 匹配 "id": 数字 的模式，将数字转为字符串
          data = data.replace(/"id":\s*(\d{15,})/g, '"id":"$1"')
          return JSON.parse(data)
        } catch (e) {
          return data
        }
      }
      return data
    },
  ],
})

instance.interceptors.response.use(
  //成功回调
  (result) => {
    if (result.data.code === 200) {
      // alert('^^^^^^^^^^^^^^^')
      return result.data
    }
    alert(result.data.msg)
    console.log('!!!!!!!!!!!!!!!!')

    return Promise.reject(result.data)
  },
  //失败回调
  (err) => {
    alert('服务异常')
    return Promise.reject(err)
  },
)

export default instance
