/**
 * 模块功能：自定义错误类
 * 最后修改：2025-11-29
 * 依赖项：../constants/errorCodes
 */

import { ErrorCode, ErrorMessages } from '../constants/errorCodes.js'

/**
 * @description 自定义 API 错误类
 */
export class ApiError extends Error {
  public code: ErrorCode
  public statusCode: number
  public isOperational: boolean

  /**
   * @param {ErrorCode} code 错误代码
   * @param {string} message 错误消息
   * @param {number} statusCode HTTP 状态码
   * @param {boolean} isOperational 是否为可预期的操作错误
   */
  constructor(
    code: ErrorCode,
    message?: string,
    statusCode: number = 400,
    isOperational: boolean = true
  ) {
    super(message || ErrorMessages[code])
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational

    // 保持正确的堆栈跟踪
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * @description 创建未授权错误
 * @param {string} message 错误消息
 * @returns {ApiError} API 错误实例
 */
export function createUnauthorizedError(message?: string): ApiError {
  return new ApiError(ErrorCode.UNAUTHORIZED, message, 401)
}

/**
 * @description 创建禁止访问错误
 * @param {string} message 错误消息
 * @returns {ApiError} API 错误实例
 */
export function createForbiddenError(message?: string): ApiError {
  return new ApiError(ErrorCode.FORBIDDEN, message, 403)
}

/**
 * @description 创建资源不存在错误
 * @param {string} message 错误消息
 * @returns {ApiError} API 错误实例
 */
export function createNotFoundError(message?: string): ApiError {
  return new ApiError(ErrorCode.NOT_FOUND, message, 404)
}

/**
 * @description 创建验证错误
 * @param {string} message 错误消息
 * @returns {ApiError} API 错误实例
 */
export function createValidationError(message?: string): ApiError {
  return new ApiError(ErrorCode.VALIDATION_ERROR, message, 400)
}

/**
 * @description 创建服务器错误
 * @param {string} message 错误消息
 * @returns {ApiError} API 错误实例
 */
export function createInternalError(message?: string): ApiError {
  return new ApiError(ErrorCode.INTERNAL_ERROR, message, 500, false)
}
