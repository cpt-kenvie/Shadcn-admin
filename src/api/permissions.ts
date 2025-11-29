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
