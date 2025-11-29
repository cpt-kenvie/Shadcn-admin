/**
 * 模块功能：角色管理服务
 * 最后修改：2025-11-29
 * 依赖项：@prisma/client, ../config/database
 */

import { prisma } from '../config/database.js'

/**
 * @description 获取所有角色
 * @returns {Promise<Array>} 角色列表
 */
export async function getAllRoles() {
  const roles = await prisma.role.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          userRoles: true,
        },
      },
    },
  })

  return roles.map((role) => ({
    ...role,
    permissions: role.rolePermissions.map((rp) => rp.permission),
    userCount: role._count.userRoles,
    rolePermissions: undefined,
    _count: undefined,
  }))
}
