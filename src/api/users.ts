/**
 * 模块功能：用户管理 API 请求
 * 最后修改：2025-12-03
 * 依赖项：@/utils/http
 */

import http from '@/utils/http'

export interface User {
  id: string
  username: string
  email: string | null
  nickname: string | null
  avatar: string | null
  bio: string | null
  urls: string[] | null
  birthDate: string | null
  phoneNumber: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'INVITED' | 'SUSPENDED'
  lastLogin: string | null
  loginCount: number
  createdAt: string
  updatedAt: string
  role: string
  roles: Array<{
    id: string
    name: string
    displayName: string
  }>
}

export interface CreateUserRequest {
  username: string
  email?: string
  password: string
  nickname?: string
  avatar?: string
  bio?: string
  urls?: string[]
  birthDate?: string
  phoneNumber?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'INVITED' | 'SUSPENDED'
  roleIds: string[]
}

export interface UpdateUserRequest {
  email?: string
  nickname?: string
  avatar?: string
  bio?: string
  urls?: string[]
  birthDate?: string
  phoneNumber?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'INVITED' | 'SUSPENDED'
  roleIds?: string[]
  password?: string
}

export interface GetUsersParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  roleId?: string
}

/**
 * @description 获取用户列表
 * @param {GetUsersParams} params 查询参数
 * @returns {Promise} 用户列表
 */
export const getUsers = (params?: GetUsersParams) => {
  return http.get('/users', { params })
}

/**
 * @description 获取用户详情
 * @param {string} id 用户 ID
 * @returns {Promise} 用户详情
 */
export const getUserById = (id: string) => {
  return http.get(`/users/${id}`)
}

/**
 * @description 创建用户
 * @param {CreateUserRequest} data 用户数据
 * @returns {Promise} 创建的用户
 */
export const createUser = (data: CreateUserRequest) => {
  return http.post('/users', data)
}

/**
 * @description 更新用户
 * @param {string} id 用户 ID
 * @param {UpdateUserRequest} data 更新数据
 * @returns {Promise} 更新后的用户
 */
export const updateUser = (id: string, data: UpdateUserRequest) => {
  return http.put(`/users/${id}`, data)
}

/**
 * @description 删除用户
 * @param {string} id 用户 ID
 * @returns {Promise} 删除响应
 */
export const deleteUser = (id: string) => {
  return http.delete(`/users/${id}`)
}

/**
 * @description 批量删除用户
 * @param {string[]} ids 用户 ID 列表
 * @returns {Promise} 删除响应
 */
export const batchDeleteUsers = (ids: string[]) => {
  return http.post('/users/batch-delete', { ids })
}
