/**
 * 模块功能：菜单服务 - 根据用户权限生成动态菜单
 * 最后修改：2025-11-29
 * 依赖项：@prisma/client, ../config/database
 */

import { prisma } from '../config/database.js'

/**
 * @description 获取用户有权限访问的菜单
 * @param {string} userId 用户ID
 * @returns {Promise<Array>} 用户可访问的菜单列表
 * @throws {Error} 数据库操作失败时抛出
 */
export async function getUserMenus(userId: string) {
  try {
    // 1. 获取用户的所有权限
    const userWithPermissions = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!userWithPermissions) {
      return []
    }

    // 收集所有权限
    const permissions = new Set<string>()
    for (const userRole of userWithPermissions.userRoles) {
      for (const rolePermission of userRole.role.rolePermissions) {
        const permKey = `${rolePermission.permission.resource}:${rolePermission.permission.action}`
        permissions.add(permKey)
      }
    }

    // 2. 获取所有路由及其所需权限
    const routes = await prisma.route.findMany({
      where: {
        hidden: false, // 只显示非隐藏路由
      },
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
        parent: true,
        children: {
          where: {
            hidden: false,
          },
          orderBy: { order: 'asc' },
          include: {
            routePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    })

    // 3. 过滤用户有权访问的路由
    const accessibleRoutes = routes.filter((route) => {
      // 如果路由没有设置权限要求，则所有人都可以访问
      if (route.routePermissions.length === 0) {
        return true
      }

      // 检查用户是否有至少一个必需的权限（OR逻辑）
      return route.routePermissions.some((rp) => {
        const permKey = `${rp.permission.resource}:${rp.permission.action}`
        return permissions.has(permKey)
      })
    })

    // 4. 构建树形菜单结构（只包含顶级路由）
    const topLevelRoutes = accessibleRoutes.filter((route) => !route.parentId)

    const menuTree = topLevelRoutes.map((route) => {
      // 过滤子路由（只包含用户有权访问的）
      const accessibleChildren = route.children.filter((child) => {
        if (child.routePermissions.length === 0) {
          return true
        }
        return child.routePermissions.some((rp) => {
          const permKey = `${rp.permission.resource}:${rp.permission.action}`
          return permissions.has(permKey)
        })
      })

      return {
        id: route.id,
        path: route.path,
        name: route.name,
        title: route.title,
        icon: route.icon,
        order: route.order,
        children: accessibleChildren.map((child) => ({
          id: child.id,
          path: child.path,
          name: child.name,
          title: child.title,
          icon: child.icon,
          order: child.order,
        })),
      }
    })

    return menuTree
  } catch (error) {
    console.error('获取用户菜单失败:', error)
    throw error
  }
}

/**
 * @description 检查用户是否有权访问指定路由
 * @param {string} userId 用户ID
 * @param {string} routePath 路由路径
 * @returns {Promise<boolean>} 是否有权限
 */
export async function checkRouteAccess(userId: string, routePath: string) {
  try {
    // 获取路由信息
    const route = await prisma.route.findUnique({
      where: { path: routePath },
      include: {
        routePermissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    // 路由不存在
    if (!route) {
      return false
    }

    // 路由没有权限要求，所有人都可以访问
    if (route.routePermissions.length === 0) {
      return true
    }

    // 获取用户的所有权限
    const userWithPermissions = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!userWithPermissions) {
      return false
    }

    // 收集用户的所有权限
    const userPermissions = new Set<string>()
    for (const userRole of userWithPermissions.userRoles) {
      for (const rolePermission of userRole.role.rolePermissions) {
        const permKey = `${rolePermission.permission.resource}:${rolePermission.permission.action}`
        userPermissions.add(permKey)
      }
    }

    // 检查用户是否有路由要求的任意一个权限
    return route.routePermissions.some((rp) => {
      const permKey = `${rp.permission.resource}:${rp.permission.action}`
      return userPermissions.has(permKey)
    })
  } catch (error) {
    console.error('检查路由访问权限失败:', error)
    return false
  }
}
