import axios from 'axios'

import { handleServerError } from './handle-server-error'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器：自动注入 token
http.interceptors.request.use(
  (config) => {
    // 兼容 SSR/非 hook 场景
    let token = ''
    try {
      // 直接从 localStorage 取 token
      token = localStorage.getItem('token') || ''

      // 调试日志
      if (!token) {
        console.warn('[HTTP] 未找到 token，请确保已登录')
      }
    } catch (_e) {
      token = ''
      console.error('[HTTP] 读取 token 失败:', _e)
    }
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一错误处理
http.interceptors.response.use(
  (response) => {
    // 统一处理响应数据
    const data = response.data

    // 如果是标准 API 响应格式
    if (data && typeof data === 'object' && 'success' in data) {
      // 成功响应
      if (data.success) {
        return response
      }

      // 业务错误
      const errorMessage = data.message || '请求失败'
      handleServerError({
        response: {
          status: response.status,
          data: { message: errorMessage }
        }
      })
      return Promise.reject(new Error(errorMessage))
    }

    return response
  },
  (error) => {
    handleServerError(error)
    return Promise.reject(error)
  }
)

export default http 
