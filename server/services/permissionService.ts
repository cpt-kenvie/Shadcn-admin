/**
 * 模块功能：权限管理服务
 * 最后修改：2025-11-29
 * 依赖项：@prisma/client, ../config/database
 */

import { prisma } from '../config/database.js'
import { createValidationError, createNotFoundError } from '../utils/error.js'
import { PermissionAction } from '@prisma/client'

/**
 * @description 创建权限请求接口
 */
export interface CreatePermissionRequest {
  resource: string
  action: PermissionAction
  description?: string
  conditions?: Record<string, any>
}

/**
 * @description 更新权限请求接口
 */
export interface UpdatePermissionRequest {
  resource?: string
  action?: PermissionAction
  description?: string
  conditions?: Record<string, any>
}

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

/**
 * @description 根据ID获取权限详情
 * @param {string} id 权限ID
 * @returns {Promise<Object>} 权限详情
 * @throws {ApiError} 权限不存在时抛出
 */
export async function getPermissionById(id: string) {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                displayName: true,
              },
            },
          },
        },
        routePermissions: {
          include: {
            route: {
              select: {
                id: true,
                path: true,
                title: true,
              },
            },
          },
        },
      },
    })

    if (!permission) {
      throw createNotFoundError('权限不存在')
    }

    return {
      ...permission,
      roles: permission.rolePermissions.map((rp) => rp.role),
      routes: permission.routePermissions.map((rp) => rp.route),
      rolePermissions: undefined,
      routePermissions: undefined,
    }
  } catch (error) {
    console.error('获取权限详情失败:', error)
    throw error
  }
}

/**
 * @description 创建权限
 * @param {CreatePermissionRequest} data 权限数据
 * @returns {Promise<Object>} 创建的权限
 * @throws {ApiError} 创建失败时抛出
 */
export async function createPermission(data: CreatePermissionRequest) {
  try {
    const { resource, action, description, conditions } = data

    // 验证资源名称格式（小写字母、数字、下划线）
    if (!/^[a-z0-9_]+$/.test(resource)) {
      throw createValidationError(
        '资源名称只能包含小写字母、数字和下划线'
      )
    }

    // 检查权限是否已存在
    const existingPermission = await prisma.permission.findUnique({
      where: {
        resource_action: {
          resource,
          action,
        },
      },
    })

    if (existingPermission) {
      throw createValidationError(
        `权限 ${action} ${resource} 已存在`
      )
    }

    // 创建权限
    const permission = await prisma.permission.create({
      data: {
        resource,
        action,
        description: description || `${action} ${resource}`,
        conditions: conditions || null,
      },
    })

    return permission
  } catch (error) {
    console.error('创建权限失败:', error)
    throw error
  }
}

/**
 * @description 批量创建权限
 * @param {CreatePermissionRequest[]} dataList 权限数据列表
 * @returns {Promise<Object>} 创建结果统计
 * @throws {ApiError} 创建失败时抛出
 */
export async function createPermissionsBatch(dataList: CreatePermissionRequest[]) {
  try {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const data of dataList) {
      try {
        await createPermission(data)
        results.success++
      } catch (error: any) {
        results.failed++
        results.errors.push(
          `${data.action} ${data.resource}: ${error.message}`
        )
      }
    }

    return results
  } catch (error) {
    console.error('批量创建权限失败:', error)
    throw error
  }
}

/**
 * @description 更新权限
 * @param {string} id 权限ID
 * @param {UpdatePermissionRequest} data 更新数据
 * @returns {Promise<Object>} 更新后的权限
 * @throws {ApiError} 更新失败时抛出
 */
export async function updatePermission(
  id: string,
  data: UpdatePermissionRequest
) {
  try {
    const { resource, action, description, conditions } = data

    // 检查权限是否存在
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    })

    if (!existingPermission) {
      throw createNotFoundError('权限不存在')
    }

    // 如果修改了 resource 或 action，检查新组合是否冲突
    if (resource || action) {
      const newResource = resource || existingPermission.resource
      const newAction = action || existingPermission.action

      // 只有当 resource 或 action 真的改变时才检查
      if (
        newResource !== existingPermission.resource ||
        newAction !== existingPermission.action
      ) {
        const conflictPermission = await prisma.permission.findUnique({
          where: {
            resource_action: {
              resource: newResource,
              action: newAction,
            },
          },
        })

        if (conflictPermission) {
          throw createValidationError(
            `权限 ${newAction} ${newResource} 已存在`
          )
        }
      }
    }

    // 验证资源名称格式
    if (resource && !/^[a-z0-9_]+$/.test(resource)) {
      throw createValidationError(
        '资源名称只能包含小写字母、数字和下划线'
      )
    }

    // 更新权限
    const permission = await prisma.permission.update({
      where: { id },
      data: {
        resource,
        action,
        description,
        conditions: conditions !== undefined ? conditions : undefined,
      },
    })

    return permission
  } catch (error) {
    console.error('更新权限失败:', error)
    throw error
  }
}

/**
 * @description 删除权限
 * @param {string} id 权限ID
 * @throws {ApiError} 删除失败时抛出
 */
export async function deletePermission(id: string) {
  try {
    // 检查权限是否存在
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
        routePermissions: {
          include: {
            route: true,
          },
        },
      },
    })

    if (!permission) {
      throw createNotFoundError('权限不存在')
    }

    // 检查权限是否被使用
    const usedByRoles = permission.rolePermissions.length > 0
    const usedByRoutes = permission.routePermissions.length > 0

    if (usedByRoles || usedByRoutes) {
      const details = []
      if (usedByRoles) {
        const roleNames = permission.rolePermissions
          .map((rp) => rp.role.displayName)
          .join('、')
        details.push(`角色：${roleNames}`)
      }
      if (usedByRoutes) {
        const routeTitles = permission.routePermissions
          .map((rp) => rp.route.title)
          .join('、')
        details.push(`路由：${routeTitles}`)
      }

      throw createValidationError(
        `权限正在被使用，无法删除。使用方：${details.join('；')}`
      )
    }

    // 删除权限
    await prisma.permission.delete({
      where: { id },
    })
  } catch (error) {
    console.error('删除权限失败:', error)
    throw error
  }
}
