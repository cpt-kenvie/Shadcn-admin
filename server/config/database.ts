/**
 * 模块功能：数据库连接配置
 * 最后修改：2025-11-29
 * 依赖项：@prisma/client
 */

import { PrismaClient } from '@prisma/client'

// 全局 Prisma 实例，避免热重载时创建多个连接
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

/**
 * @description 创建或获取 Prisma Client 实例
 * @returns {PrismaClient} Prisma 客户端实例
 */
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

/**
 * @description 优雅关闭数据库连接
 */
export async function disconnectDatabase() {
  await prisma.$disconnect()
}
