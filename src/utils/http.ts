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
    } catch (_e) {
      token = ''
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
    // 业务错误可在此处理
    return response
  },
  (error) => {
    handleServerError(error)
    return Promise.reject(error)
  }
)

export default http 
