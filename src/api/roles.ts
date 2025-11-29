/**
 * 模块功能：角色管理 API 请求
 * 最后修改：2025-11-29
 * 依赖项：@/utils/http
 */

import http from '@/utils/http'

export interface Role {
  id: string
  name: string
  displayName: string
  description: string | null
  isSystem: boolean
  createdAt: string
  updatedAt: string
  permissions: Array<{
    id: string
    resource: string
    action: string
    description: string | null
  }>
  userCount: number
}

export interface CreateRoleRequest {
  name: string
  displayName: string
  description?: string
  permissionIds: string[]
}

export interface UpdateRoleRequest {
  displayName?: string
  description?: string
  permissionIds?: string[]
}

/**
 * @description 获取所有角色
 * @returns {Promise} 角色列表
 */
export const getAllRoles = () => {
  return http.get<{ success: boolean; data: Role[]; message: string }>('/roles')
}

/**
 * @description 获取角色详情
 * @param {string} id 角色 ID
 * @returns {Promise} 角色详情
 */
export const getRoleById = (id: string) => {
  return http.get(`/roles/${id}`)
}

/**
 * @description 创建角色
 * @param {CreateRoleRequest} data 角色数据
 * @returns {Promise} 创建的角色
 */
export const createRole = (data: CreateRoleRequest) => {
  return http.post('/roles', data)
}

/**
 * @description 更新角色
 * @param {string} id 角色 ID
 * @param {UpdateRoleRequest} data 更新数据
 * @returns {Promise} 更新后的角色
 */
export const updateRole = (id: string, data: UpdateRoleRequest) => {
  return http.put(`/roles/${id}`, data)
}

/**
 * @description 删除角色
 * @param {string} id 角色 ID
 * @returns {Promise} 删除响应
 */
export const deleteRole = (id: string) => {
  return http.delete(`/roles/${id}`)
}
