/**
 * 模块功能：角色管理服务
 * 最后修改：2025-11-29
 * 依赖项：@prisma/client, ../config/database, ../utils/error
 */

import { prisma } from '../config/database.js'
import { createValidationError, createNotFoundError } from '../utils/error.js'

/**
 * @description 创建角色请求接口
 */
export interface CreateRoleRequest {
  name: string
  displayName: string
  description?: string
  permissionIds: string[]
}

/**
 * @description 更新角色请求接口
 */
export interface UpdateRoleRequest {
  displayName?: string
  description?: string
  permissionIds?: string[]
}

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

/**
 * @description 获取角色详情
 * @param {string} id 角色 ID
 * @returns {Promise<Object>} 角色详情
 * @throws {ApiError} 角色不存在时抛出
 */
export async function getRoleById(id: string) {
  const role = await prisma.role.findUnique({
    where: { id },
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

  if (!role) {
    throw createNotFoundError('角色不存在')
  }

  return {
    ...role,
    permissions: role.rolePermissions.map((rp) => rp.permission),
    userCount: role._count.userRoles,
    rolePermissions: undefined,
    _count: undefined,
  }
}

/**
 * @description 创建角色
 * @param {CreateRoleRequest} data 角色数据
 * @returns {Promise<Object>} 创建的角色
 * @throws {ApiError} 创建失败时抛出
 */
export async function createRole(data: CreateRoleRequest) {
  const { name, displayName, description, permissionIds } = data

  // 验证角色名称是否已存在
  const existingRole = await prisma.role.findUnique({
    where: { name },
  })

  if (existingRole) {
    throw createValidationError('角色名称已存在')
  }

  // 创建角色
  const role = await prisma.role.create({
    data: {
      name,
      displayName,
      description,
      isSystem: false,
      rolePermissions: permissionIds.length > 0 ? {
        create: permissionIds.map((permissionId) => ({
          permissionId,
        })),
      } : undefined,
    },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  })

  return {
    ...role,
    permissions: role.rolePermissions.map((rp) => rp.permission),
    rolePermissions: undefined,
  }
}

/**
 * @description 更新角色
 * @param {string} id 角色 ID
 * @param {UpdateRoleRequest} data 更新数据
 * @returns {Promise<Object>} 更新后的角色
 * @throws {ApiError} 更新失败时抛出
 */
export async function updateRole(id: string, data: UpdateRoleRequest) {
  const { displayName, description, permissionIds } = data

  // 检查角色是否存在
  const existingRole = await prisma.role.findUnique({
    where: { id },
  })

  if (!existingRole) {
    throw createNotFoundError('角色不存在')
  }

  // 不允许修改系统角色
  if (existingRole.isSystem) {
    throw createValidationError('系统角色不可修改')
  }

  // 更新角色基本信息
  const role = await prisma.role.update({
    where: { id },
    data: {
      displayName,
      description,
    },
  })

  // 更新权限
  if (permissionIds !== undefined) {
    // 删除现有权限
    await prisma.rolePermission.deleteMany({
      where: { roleId: id },
    })

    // 添加新权限
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
      })
    }
  }

  // 重新查询角色以获取更新后的权限
  const updatedRole = await prisma.role.findUnique({
    where: { id },
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
    },
  })

  return {
    ...updatedRole,
    permissions: updatedRole!.rolePermissions.map((rp) => rp.permission),
    rolePermissions: undefined,
  }
}

/**
 * @description 删除角色
 * @param {string} id 角色 ID
 * @throws {ApiError} 删除失败时抛出
 */
export async function deleteRole(id: string) {
  // 检查角色是否存在
  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          userRoles: true,
        },
      },
    },
  })

  if (!role) {
    throw createNotFoundError('角色不存在')
  }

  // 不允许删除系统角色
  if (role.isSystem) {
    throw createValidationError('系统角色不可删除')
  }

  // 检查是否有用户使用此角色
  if (role._count.userRoles > 0) {
    throw createValidationError('该角色正在被使用，无法删除')
  }

  // 删除角色（级联删除关联的权限）
  await prisma.role.delete({
    where: { id },
  })
}
