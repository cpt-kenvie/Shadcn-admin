/**
 * 模块功能：API 响应类型定义
 * 最后修改：2025-11-29
 * 依赖项：无
 */

/**
 * @description 统一的 API 响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  code: number
  timestamp: string
}

/**
 * @description 分页响应数据
 */
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * @description 错误响应详情
 */
export interface ErrorDetail {
  field?: string
  message: string
  code?: string
}
