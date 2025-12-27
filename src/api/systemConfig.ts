/**
 * 模块功能：系统配置API客户端
 * 最后修改：2025-12-03
 * 依赖项：@/utils/http
 */

import http from '@/utils/http'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: any[]
}

export interface SystemConfig {
  id: string
  key: string
  value: string
  category: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface SystemConfigInput {
  key: string
  value: string
  category?: string
  description?: string
}

/**
 * @description 获取单个系统配置
 * @param {string} key - 配置键名
 * @returns {Promise} API响应
 * @throws {Error} 网络请求错误
 */
export const getSystemConfig = (key: string) => {
  return http.get<ApiResponse<SystemConfig>>(`/system-config/${key}`)
}

/**
 * @description 获取所有系统配置
 * @param {string} category - 可选的配置分类
 * @returns {Promise} API响应
 * @throws {Error} 网络请求错误
 */
export const getAllSystemConfigs = (category?: string) => {
  return http.get<ApiResponse<SystemConfig[]>>('/system-config', {
    params: category ? { category } : undefined,
  })
}

/**
 * @description 设置单个系统配置
 * @param {SystemConfigInput} data - 配置数据
 * @returns {Promise} API响应
 * @throws {Error} 网络请求错误
 */
export const setSystemConfig = (data: SystemConfigInput) => {
  return http.post<ApiResponse<SystemConfig>>('/system-config', data)
}

/**
 * @description 批量设置系统配置
 * @param {SystemConfigInput[]} data - 配置数据数组
 * @returns {Promise} API响应
 * @throws {Error} 网络请求错误
 */
export const setSystemConfigs = (data: SystemConfigInput[]) => {
  return http.post('/system-config/batch', data)
}

/**
 * @description 删除系统配置
 * @param {string} key - 配置键名
 * @returns {Promise} API响应
 * @throws {Error} 网络请求错误
 */
export const deleteSystemConfig = (key: string) => {
  return http.delete(`/system-config/${key}`)
}
