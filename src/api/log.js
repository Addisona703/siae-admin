import { post, get } from './client'

export const logApi = {
    /**
     * 获取登录日志
     * @param {Object} pageDTO 分页查询参数
     * @returns {Promise}
     */
    getLoginLogs: (pageDTO) => {
        return post('/auth/logs/login', pageDTO)
    },

    /**
     * 获取仪表盘统计数据
     * @param {number} days 统计天数
     * @returns {Promise}
     */
    getDashboardStats: (days) => {
        return get(`/auth/logs/dashboard/stats/${days}`)
    }
}
