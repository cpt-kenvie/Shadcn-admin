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

/**
 * @description 获取所有角色
 * @returns {Promise} 角色列表
 */
export const getAllRoles = () => {
  return http.get<{ success: boolean; data: Role[]; message: string }>('/roles')
}
