/**
 * 模块功能：环境变量配置
 * 最后修改：2025-11-29
 * 依赖项：dotenv
 */

import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

/**
 * @description 服务器配置
 */
export const config = {
  // 服务器端口
  port: parseInt(process.env.PORT || '3001', 10),

  // 环境
  env: process.env.NODE_ENV || 'development',

  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'S7865324.',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // CORS 配置
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8888',
    credentials: true,
  },

  // Cookie 配置
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 天
  },
}

/**
 * @description 验证必需的环境变量
 * @throws {Error} 缺少必需环境变量时抛出
 */
export function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET']

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`缺少必需的环境变量: ${key}`)
    }
  }
}
