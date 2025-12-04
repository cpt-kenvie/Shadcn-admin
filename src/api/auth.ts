/**
 * 模块功能：认证 API 请求
 * 最后修改：2025-12-03
 * 依赖项：@/utils/http
 */

import http from '@/utils/http'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user_info: {
    id: string
    username: string
    email: string | null
    status: string
    created_at: string
    last_login: string | null
    login_count: number
    roles: string[]
  }
  message: string
}

export interface UpdateProfileRequest {
  nickname?: string
  avatar?: string
  bio?: string
  urls?: string[]
  birthDate?: string
  email?: string
  phoneNumber?: string
}

/**
 * @description 用户登录
 * @param {LoginRequest} data 登录数据
 * @returns {Promise} 登录响应
 */
export const login = (data: LoginRequest) => {
  return http.post<{ success: boolean; data: LoginResponse; message: string }>(
    '/auth/login',
    data
  )
}

/**
 * @description 用户登出
 * @returns {Promise} 登出响应
 */
export const logout = () => {
  return http.post('/auth/logout')
}

/**
 * @description 获取当前用户信息
 * @returns {Promise} 用户信息
 */
export const getCurrentUser = () => {
  return http.get('/auth/me')
}

/**
 * @description 刷新访问令牌
 * @param {string} refreshToken 刷新令牌
 * @returns {Promise} 新的访问令牌
 */
export const refreshToken = (refreshToken: string) => {
  return http.post('/auth/refresh', { refreshToken })
}

/**
 * @description 更新当前用户资料
 * @param {UpdateProfileRequest} data 更新数据
 * @returns {Promise} 更新后的用户信息
 */
export const updateProfile = (data: UpdateProfileRequest) => {
  return http.put('/auth/profile', data)
}
