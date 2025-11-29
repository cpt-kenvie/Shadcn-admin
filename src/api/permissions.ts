/**
 * 模块功能：权限管理 API 请求
 * 最后修改：2025-11-29
 * 依赖项：@/utils/http
 */

import http from '@/utils/http'

export interface Permission {
  id: string
  resource: string
  action: string
  conditions: any
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePermissionRequest {
  resource: string
  action: string
  description?: string
  conditions?: Record<string, any>
}

export interface UpdatePermissionRequest {
  resource?: string
  action?: string
  description?: string
  conditions?: Record<string, any>
}

export interface BatchCreatePermissionsRequest {
  permissions: CreatePermissionRequest[]
}

/**
 * @description 获取所有权限
 * @returns {Promise} 权限列表
 */
export const getAllPermissions = () => {
  return http.get<{ success: boolean; data: Permission[]; message: string }>('/permissions')
}

/**
 * @description 获取分组的权限
 * @returns {Promise} 分组权限
 */
export const getGroupedPermissions = () => {
  return http.get('/permissions/grouped')
}

/**
 * @description 获取权限详情
 * @param {string} id 权限ID
 * @returns {Promise} 权限详情
 */
export const getPermissionById = (id: string) => {
  return http.get(`/permissions/${id}`)
}

/**
 * @description 创建权限
 * @param {CreatePermissionRequest} data 权限数据
 * @returns {Promise} 创建的权限
 */
export const createPermission = (data: CreatePermissionRequest) => {
  return http.post('/permissions', data)
}

/**
 * @description 批量创建权限
 * @param {BatchCreatePermissionsRequest} data 权限数据列表
 * @returns {Promise} 创建结果
 */
export const batchCreatePermissions = (data: BatchCreatePermissionsRequest) => {
  return http.post('/permissions/batch', data)
}

/**
 * @description 更新权限
 * @param {string} id 权限ID
 * @param {UpdatePermissionRequest} data 更新数据
 * @returns {Promise} 更新后的权限
 */
export const updatePermission = (id: string, data: UpdatePermissionRequest) => {
  return http.put(`/permissions/${id}`, data)
}

/**
 * @description 删除权限
 * @param {string} id 权限ID
 * @returns {Promise} 删除结果
 */
export const deletePermission = (id: string) => {
  return http.delete(`/permissions/${id}`)
}
