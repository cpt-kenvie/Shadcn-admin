/**
 * 模块功能：权限管理服务
 * 最后修改：2025-11-29
 * 依赖项：@prisma/client, ../config/database
 */

import { prisma } from '../config/database.js'

/**
 * @description 获取所有权限
 * @returns {Promise<Array>} 权限列表
 * @throws {Error} 数据库操作失败时抛出
 */
export async function getAllPermissions() {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
      ],
    })

    return permissions
  } catch (error) {
    console.error('获取权限列表失败:', error)
    throw error
  }
}

/**
 * @description 按资源分组获取权限
 * @returns {Promise<Object>} 分组的权限列表
 * @throws {Error} 数据库操作失败时抛出
 */
export async function getPermissionsByResource() {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
      ],
    })

    // 按资源分组
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = []
      }
      acc[permission.resource].push(permission)
      return acc
    }, {} as Record<string, any[]>)

    return grouped
  } catch (error) {
    console.error('获取分组权限失败:', error)
    throw error
  }
}
