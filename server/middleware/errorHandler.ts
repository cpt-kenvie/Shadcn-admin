/**
 * 模块功能：全局错误处理中间件
 * 最后修改：2025-11-29
 * 依赖项：express, ../utils/error, ../utils/response
 */

import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/error.js'
import { sendError, sendInternalError } from '../utils/response.js'
import { ErrorCode } from '../constants/errorCodes.js'

/**
 * @description 全局错误处理中间件
 * @param {Error} err 错误对象
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 * @param {NextFunction} next 下一个中间件
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 已发送响应，跳过
  if (res.headersSent) {
    return next(err)
  }

  // 记录错误日志
  console.error(`[错误] ${new Date().toISOString()}:`, err)

  // API 错误
  if (err instanceof ApiError) {
    return sendError(res, err.code, err.message, err.statusCode)
  }

  // Prisma 错误
  if (err.constructor.name.includes('Prisma')) {
    return handlePrismaError(err, res)
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, ErrorCode.INVALID_TOKEN, '无效的令牌', 401)
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, ErrorCode.TOKEN_EXPIRED, '令牌已过期', 401)
  }

  // 未知错误
  sendInternalError(res, process.env.NODE_ENV === 'development' ? err.message : undefined)
}

/**
 * @description 处理 Prisma 错误
 * @param {Error} err Prisma 错误对象
 * @param {Response} res 响应对象
 */
function handlePrismaError(err: any, res: Response) {
  // 唯一约束冲突
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || '字段'
    return sendError(res, ErrorCode.VALIDATION_ERROR, `${field} 已存在`, 400)
  }

  // 记录不存在
  if (err.code === 'P2025') {
    return sendError(res, ErrorCode.NOT_FOUND, '记录不存在', 404)
  }

  // 外键约束失败
  if (err.code === 'P2003') {
    return sendError(res, ErrorCode.VALIDATION_ERROR, '关联记录不存在', 400)
  }

  // 其他数据库错误
  sendInternalError(res, '数据库操作失败')
}
