/**
 * 模块功能：路由管理 API 请求
 * 最后修改：2025-11-29
 * 依赖项：@/utils/http
 */

import http from '@/utils/http'

export interface Route {
  id: string
  path: string
  name: string
  component: string | null
  title: string
  icon: string | null
  parentId: string | null
  order: number
  hidden: boolean
  createdAt: string
  updatedAt: string
  permissions: Array<{
    id: string
    resource: string
    action: string
    description: string | null
  }>
  children?: Route[]
  parent?: {
    id: string
    title: string
  }
}

export interface CreateRouteRequest {
  path: string
  name: string
  component?: string
  title: string
  icon?: string
  parentId?: string | null
  order: number
  hidden?: boolean
  permissionIds: string[]
}

export interface UpdateRouteRequest {
  path?: string
  name?: string
  component?: string
  title?: string
  icon?: string
  parentId?: string | null
  order?: number
  hidden?: boolean
  permissionIds?: string[]
}

/**
 * @description 获取所有路由（树形结构）
 * @returns {Promise} 路由树列表
 */
export const getAllRoutes = () => {
  return http.get<{ success: boolean; data: Route[]; message: string }>('/routes')
}

/**
 * @description 获取所有路由（扁平结构）
 * @returns {Promise} 路由列表
 */
export const getAllRoutesFlat = () => {
  return http.get<{ success: boolean; data: Route[]; message: string }>('/routes/flat')
}

/**
 * @description 获取路由详情
 * @param {string} id 路由 ID
 * @returns {Promise} 路由详情
 */
export const getRouteById = (id: string) => {
  return http.get(`/routes/${id}`)
}

/**
 * @description 创建路由
 * @param {CreateRouteRequest} data 路由数据
 * @returns {Promise} 创建的路由
 */
export const createRoute = (data: CreateRouteRequest) => {
  return http.post('/routes', data)
}

/**
 * @description 更新路由
 * @param {string} id 路由 ID
 * @param {UpdateRouteRequest} data 更新数据
 * @returns {Promise} 更新后的路由
 */
export const updateRoute = (id: string, data: UpdateRouteRequest) => {
  return http.put(`/routes/${id}`, data)
}

/**
 * @description 删除路由
 * @param {string} id 路由 ID
 * @returns {Promise} 删除响应
 */
export const deleteRoute = (id: string) => {
  return http.delete(`/routes/${id}`)
}
