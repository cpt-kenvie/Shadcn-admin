/**
 * 模块功能：路由管理服务
 * 最后修改：2025-11-29
 * 依赖项：@prisma/client, ../config/database, ../utils/error
 */

import { prisma } from '../config/database.js'
import { createValidationError, createNotFoundError } from '../utils/error.js'

/**
 * @description 创建路由请求接口
 */
export interface CreateRouteRequest {
  path: string
  name: string
  component?: string
  title: string
  icon?: string
  parentId?: string | null
  order: number
  hidden?: boolean
  permissionIds: string[]
}

/**
 * @description 更新路由请求接口
 */
export interface UpdateRouteRequest {
  path?: string
  name?: string
  component?: string
  title?: string
  icon?: string
  parentId?: string | null
  order?: number
  hidden?: boolean
  permissionIds?: string[]
}

/**
 * @description 获取所有路由（树形结构）
 * @returns {Promise<Array>} 路由树列表
 * @throws {Error} 数据库操作失败时抛出
 */
export async function getAllRoutes() {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { order: 'asc' },
      include: {
        routePermissions: {
          include: {
            permission: true,
          },
        },
        children: {
          include: {
            routePermissions: {
              include: {
                permission: true,
              },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      where: {
        parentId: null,
      },
    })

    return routes.map((route) => ({
      ...route,
      permissions: route.routePermissions.map((rp) => rp.permission),
      routePermissions: undefined,
      children: route.children.map((child) => ({
        ...child,
        permissions: child.routePermissions.map((rp) => rp.permission),
        routePermissions: undefined,
      })),
    }))
  } catch (error) {
    console.error('获取路由列表失败:', error)
    throw error
  }
}

/**
 * @description 获取所有路由（扁平结构）
 * @returns {Promise<Array>} 路由列表
 * @throws {Error} 数据库操作失败时抛出
 */
export async function getAllRoutesFlat() {
  try {
    const routes = await prisma.route.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        routePermissions: {
          include: {
            permission: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return routes.map((route) => ({
      ...route,
      permissions: route.routePermissions.map((rp) => rp.permission),
      routePermissions: undefined,
    }))
  } catch (error) {
    console.error('获取路由列表失败:', error)
    throw error
  }
}

/**
 * @description 获取路由详情
 * @param {string} id 路由 ID
 * @returns {Promise<Object>} 路由详情
 * @throws {ApiError} 路由不存在时抛出
 */
export async function getRouteById(id: string) {
  const route = await prisma.route.findUnique({
    where: { id },
    include: {
      routePermissions: {
        include: {
          permission: true,
        },
      },
      parent: {
        select: {
          id: true,
          title: true,
        },
      },
      children: {
        include: {
          routePermissions: {
            include: {
              permission: true,
            },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!route) {
    throw createNotFoundError('路由不存在')
  }

  return {
    ...route,
    permissions: route.routePermissions.map((rp) => rp.permission),
    routePermissions: undefined,
    children: route.children.map((child) => ({
      ...child,
      permissions: child.routePermissions.map((rp) => rp.permission),
      routePermissions: undefined,
    })),
  }
}

/**
 * @description 创建路由
 * @param {CreateRouteRequest} data 路由数据
 * @returns {Promise<Object>} 创建的路由
 * @throws {ApiError} 创建失败时抛出
 */
export async function createRoute(data: CreateRouteRequest) {
  const { path, name, component, title, icon, parentId, order, hidden, permissionIds } = data

  // 验证路由路径是否已存在
  const existingRoute = await prisma.route.findUnique({
    where: { path },
  })

  if (existingRoute) {
    throw createValidationError('路由路径已存在')
  }

  // 验证路由名称是否已存在
  const existingName = await prisma.route.findUnique({
    where: { name },
  })

  if (existingName) {
    throw createValidationError('路由名称已存在')
  }

  // 如果有父路由，验证父路由是否存在
  if (parentId) {
    const parentRoute = await prisma.route.findUnique({
      where: { id: parentId },
    })

    if (!parentRoute) {
      throw createNotFoundError('父路由不存在')
    }
  }

  // 创建路由
  const route = await prisma.route.create({
    data: {
      path,
      name,
      component,
      title,
      icon,
      parentId,
      order,
      hidden: hidden || false,
      routePermissions: permissionIds && permissionIds.length > 0 ? {
        create: permissionIds.map((permissionId) => ({
          permissionId,
        })),
      } : undefined,
    },
    include: {
      routePermissions: {
        include: {
          permission: true,
        },
      },
    },
  })

  return {
    ...route,
    permissions: route.routePermissions.map((rp) => rp.permission),
    routePermissions: undefined,
  }
}

/**
 * @description 更新路由
 * @param {string} id 路由 ID
 * @param {UpdateRouteRequest} data 更新数据
 * @returns {Promise<Object>} 更新后的路由
 * @throws {ApiError} 更新失败时抛出
 */
export async function updateRoute(id: string, data: UpdateRouteRequest) {
  const { path, name, component, title, icon, parentId, order, hidden, permissionIds } = data

  // 检查路由是否存在
  const existingRoute = await prisma.route.findUnique({
    where: { id },
  })

  if (!existingRoute) {
    throw createNotFoundError('路由不存在')
  }

  // 验证路由路径是否与其他路由冲突
  if (path && path !== existingRoute.path) {
    const conflictRoute = await prisma.route.findUnique({
      where: { path },
    })

    if (conflictRoute) {
      throw createValidationError('路由路径已存在')
    }
  }

  // 验证路由名称是否与其他路由冲突
  if (name && name !== existingRoute.name) {
    const conflictName = await prisma.route.findUnique({
      where: { name },
    })

    if (conflictName) {
      throw createValidationError('路由名称已存在')
    }
  }

  // 如果修改父路由，验证父路由是否存在
  if (parentId !== undefined && parentId !== null) {
    const parentRoute = await prisma.route.findUnique({
      where: { id: parentId },
    })

    if (!parentRoute) {
      throw createNotFoundError('父路由不存在')
    }

    // 防止循环引用
    if (parentId === id) {
      throw createValidationError('不能将路由设置为自己的父路由')
    }
  }

  // 更新路由基本信息
  const route = await prisma.route.update({
    where: { id },
    data: {
      path,
      name,
      component,
      title,
      icon,
      parentId,
      order,
      hidden,
    },
  })

  // 更新权限
  if (permissionIds !== undefined) {
    // 删除现有权限
    await prisma.routePermission.deleteMany({
      where: { routeId: id },
    })

    // 添加新权限
    if (permissionIds.length > 0) {
      await prisma.routePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          routeId: id,
          permissionId,
        })),
      })
    }
  }

  // 重新查询路由以获取更新后的权限
  const updatedRoute = await prisma.route.findUnique({
    where: { id },
    include: {
      routePermissions: {
        include: {
          permission: true,
        },
      },
    },
  })

  return {
    ...updatedRoute,
    permissions: updatedRoute!.routePermissions.map((rp) => rp.permission),
    routePermissions: undefined,
  }
}

/**
 * @description 删除路由
 * @param {string} id 路由 ID
 * @throws {ApiError} 删除失败时抛出
 */
export async function deleteRoute(id: string) {
  // 检查路由是否存在
  const route = await prisma.route.findUnique({
    where: { id },
    include: {
      children: true,
    },
  })

  if (!route) {
    throw createNotFoundError('路由不存在')
  }

  // 检查是否有子路由
  if (route.children && route.children.length > 0) {
    throw createValidationError('该路由下有子路由，无法删除')
  }

  // 删除路由（级联删除关联的权限）
  await prisma.route.delete({
    where: { id },
  })
}
