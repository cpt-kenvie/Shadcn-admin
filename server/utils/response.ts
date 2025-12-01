/**
 * 模块功能：统一响应处理工具
 * 最后修改：2025-11-29
 * 依赖项：../types/response, ../constants/errorCodes
 */

import { Response } from 'express'
import type { ApiResponse } from '../types/response.js'
import { ErrorCode, ErrorMessages } from '../constants/errorCodes.js'

/**
 * @description 发送成功响应
 * @param {Response} res Express 响应对象
 * @param {any} data 响应数据
 * @param {string} message 成功消息
 * @param {ErrorCode} code 成功代码
 */
export function sendSuccess<T = any>(
  res: Response,
  data?: T,
  message: string = ErrorMessages[ErrorCode.SUCCESS],
  code: ErrorCode = ErrorCode.SUCCESS
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    code,
    timestamp: new Date().toISOString(),
  }

  res.status(200).json(response)
}

/**
 * @description 发送错误响应
 * @param {Response} res Express 响应对象
 * @param {ErrorCode} code 错误代码
 * @param {string} message 自定义错误消息
 * @param {number} statusCode HTTP 状态码
 */
export function sendError(
  res: Response,
  code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
  message?: string,
  statusCode: number = 400
) {
  const response: ApiResponse = {
    success: false,
    message: message || ErrorMessages[code] || ErrorMessages[ErrorCode.UNKNOWN_ERROR],
    code,
    timestamp: new Date().toISOString(),
  }

  res.status(statusCode).json(response)
}

/**
 * @description 发送未授权响应
 * @param {Response} res Express 响应对象
 * @param {string} message 错误消息
 */
export function sendUnauthorized(res: Response, message?: string) {
  sendError(res, ErrorCode.UNAUTHORIZED, message, 401)
}

/**
 * @description 发送禁止访问响应
 * @param {Response} res Express 响应对象
 * @param {string} message 错误消息
 */
export function sendForbidden(res: Response, message?: string) {
  sendError(res, ErrorCode.FORBIDDEN, message, 403)
}

/**
 * @description 发送资源不存在响应
 * @param {Response} res Express 响应对象
 * @param {string} message 错误消息
 */
export function sendNotFound(res: Response, message?: string) {
  sendError(res, ErrorCode.NOT_FOUND, message, 404)
}

/**
 * @description 发送服务器错误响应
 * @param {Response} res Express 响应对象
 * @param {string} message 错误消息
 */
export function sendInternalError(res: Response, message?: string) {
  sendError(res, ErrorCode.INTERNAL_ERROR, message, 500)
}

/**
 * @description 发送验证错误响应
 * @param {Response} res Express 响应对象
 * @param {string} message 错误消息
 */
export function sendValidationError(res: Response, message?: string) {
  sendError(res, ErrorCode.VALIDATION_ERROR, message, 400)
}
