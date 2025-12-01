/**
 * 模块功能：JWT 令牌工具
 * 最后修改：2025-11-29
 * 依赖项：jsonwebtoken, ../config/env
 */

import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

/**
 * @description JWT Payload 接口
 */
export interface JwtPayload {
  userId: string
  username: string
  email?: string
  roles: string[]
}

/**
 * @description 生成访问令牌
 * @param {JwtPayload} payload 令牌负载
 * @returns {string} JWT 令牌
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
}

/**
 * @description 生成刷新令牌
 * @param {JwtPayload} payload 令牌负载
 * @returns {string} JWT 刷新令牌
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  })
}

/**
 * @description 验证令牌
 * @param {string} token JWT 令牌
 * @returns {JwtPayload} 解码后的负载
 * @throws {Error} 令牌无效或过期时抛出
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload
}

/**
 * @description 解码令牌（不验证）
 * @param {string} token JWT 令牌
 * @returns {JwtPayload | null} 解码后的负载
 */
export function decodeToken(token: string): JwtPayload | null {
  return jwt.decode(token) as JwtPayload | null
}
