/**
 * 模块功能：用户偏好设置API调用
 * 最后修改：2025-12-04
 * 依赖项：@/utils/http
 */

import http from '@/utils/http'

export interface UserPreference {
  id: string
  userId: string
  theme: string
  font: string
  language: string
  createdAt: string
  updatedAt: string
}

export interface UserPreferenceInput {
  theme?: string
  font?: string
  language?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: any[]
}

/**
 * @description 获取当前用户的偏好设置
 * @returns {Promise<ApiResponse<UserPreference>>} 用户偏好设置
 * @throws {Error} 网络请求失败
 */
export async function getUserPreference(): Promise<ApiResponse<UserPreference>> {
  try {
    const response = await http.get<ApiResponse<UserPreference>>('/user-preference')
    return response.data
  } catch (error) {
    console.error('获取用户偏好设置失败:', error)
    throw error
  }
}

/**
 * @description 更新当前用户的偏好设置
 * @param {UserPreferenceInput} data - 偏好设置数据
 * @returns {Promise<ApiResponse<UserPreference>>} 更新后的偏好设置
 * @throws {Error} 网络请求失败或数据验证失败
 */
export async function updateUserPreference(
  data: UserPreferenceInput
): Promise<ApiResponse<UserPreference>> {
  try {
    const response = await http.put<ApiResponse<UserPreference>>('/user-preference', data)
    return response.data
  } catch (error) {
    console.error('更新用户偏好设置失败:', error)
    throw error
  }
}

/**
 * @description 删除当前用户的偏好设置
 * @returns {Promise<ApiResponse<void>>} 删除结果
 * @throws {Error} 网络请求失败
 */
export async function deleteUserPreference(): Promise<ApiResponse<void>> {
  try {
    const response = await http.delete<ApiResponse<void>>('/user-preference')
    return response.data
  } catch (error) {
    console.error('删除用户偏好设置失败:', error)
    throw error
  }
}
