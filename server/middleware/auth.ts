/**
 * 模块功能：认证中间件
 * 最后修改：2025-11-29
 * 依赖项：express, ../utils/jwt, ../utils/error, ../config/database
 */

import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt.js'
import { createUnauthorizedError } from '../utils/error.js'
import { prisma } from '../config/database.js'

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        permissions?: string[]
      }
    }
  }
}

/**
 * @description 认证中间件 - 验证 JWT 令牌
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 * @param {NextFunction} next 下一个中间件
 * @throws {ApiError} 令牌无效或过期时抛出
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // 从 Header 或 Cookie 获取令牌
    const token = extractToken(req)

    if (!token) {
      throw createUnauthorizedError('未提供令牌')
    }

    // 验证令牌
    const payload = verifyToken(token)

    // 验证用户是否存在且激活
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw createUnauthorizedError('用户不存在')
    }

    if (user.status !== 'ACTIVE') {
      throw createUnauthorizedError('账户已被禁用')
    }

    // 提取权限
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => `${rp.permission.resource}:${rp.permission.action}`)
    )

    // 将用户信息附加到请求对象
    req.user = {
      ...payload,
      permissions,
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * @description 可选认证中间件 - 有令牌则验证，无令牌则跳过
 * @param {Request} req 请求对象
 * @param {Response} res 响应对象
 * @param {NextFunction} next 下一个中间件
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const token = extractToken(req)

    if (token) {
      const payload = verifyToken(token)
      req.user = payload
    }

    next()
  } catch (error) {
    // 可选认证失败时跳过，不抛出错误
    next()
  }
}

/**
 * @description 从请求中提取令牌
 * @param {Request} req 请求对象
 * @returns {string | null} JWT 令牌
 */
function extractToken(req: Request): string | null {
  // 从 Authorization Header 获取
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // 从 Cookie 获取
  if (req.cookies && req.cookies.token) {
    return req.cookies.token
  }

  return null
}
