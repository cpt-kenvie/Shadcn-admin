/**
 * 模块功能：初始化路由数据
 * 最后修改：2025-11-29
 * 依赖项：@prisma/client
 *
 * 使用方法：node seed-routes.js
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedRoutes() {
  console.log('========================================')
  console.log('  初始化路由数据')
  console.log('========================================\n')

  try {
    // 1. 获取权限ID的辅助函数
    async function getPermissionId(resource, action) {
      const permission = await prisma.permission.findUnique({
        where: {
          resource_action: {
            resource,
            action,
          },
        },
      })
      return permission?.id
    }

    console.log('[1/3] 创建顶级路由...')

    // 仪表盘
    const dashboard = await prisma.route.upsert({
      where: { path: '/' },
      update: {},
      create: {
        path: '/',
        name: 'dashboard',
        title: '仪表盘',
        icon: 'IconLayoutDashboard',
        order: 0,
        hidden: false,
      },
    })

    // 用户管理（父菜单）
    const userManagement = await prisma.route.upsert({
      where: { path: '/user-management' },
      update: {},
      create: {
        path: '/user-management',
        name: 'user-management',
        title: '用户管理',
        icon: 'IconUsers',
        order: 10,
        hidden: false,
      },
    })

    console.log('✓ 创建了 2 个顶级路由\n')

    console.log('[2/3] 创建子路由...')

    // 用户列表
    const users = await prisma.route.upsert({
      where: { path: '/users' },
      update: {},
      create: {
        path: '/users',
        name: 'users',
        title: '用户列表',
        icon: 'IconUsers',
        parentId: userManagement.id,
        order: 1,
        hidden: false,
      },
    })

    // 角色管理
    const roles = await prisma.route.upsert({
      where: { path: '/roles' },
      update: {},
      create: {
        path: '/roles',
        name: 'roles',
        title: '角色管理',
        icon: 'IconShield',
        parentId: userManagement.id,
        order: 2,
        hidden: false,
      },
    })

    // 权限管理
    const permissions = await prisma.route.upsert({
      where: { path: '/permissions' },
      update: {},
      create: {
        path: '/permissions',
        name: 'permissions',
        title: '权限管理',
        icon: 'IconKey',
        parentId: userManagement.id,
        order: 3,
        hidden: false,
      },
    })

    // 路由管理
    const routesPage = await prisma.route.upsert({
      where: { path: '/routes' },
      update: {},
      create: {
        path: '/routes',
        name: 'routes',
        title: '路由管理',
        icon: 'IconRoute',
        order: 20,
        hidden: false,
      },
    })

    console.log('✓ 创建了 4 个子路由\n')

    console.log('[3/3] 分配路由权限...')

    // 为路由分配权限
    const routePermissions = [
      { route: users, resource: 'user', action: 'READ' },
      { route: roles, resource: 'role', action: 'READ' },
      { route: permissions, resource: 'permission', action: 'READ' },
      { route: routesPage, resource: 'route', action: 'READ' },
    ]

    let assignedCount = 0
    for (const { route, resource, action } of routePermissions) {
      const permissionId = await getPermissionId(resource, action)
      if (permissionId) {
        await prisma.routePermission.upsert({
          where: {
            routeId_permissionId: {
              routeId: route.id,
              permissionId: permissionId,
            },
          },
          update: {},
          create: {
            routeId: route.id,
            permissionId: permissionId,
          },
        })
        assignedCount++
      }
    }

    console.log(`✓ 分配了 ${assignedCount} 个路由权限\n`)

    console.log('========================================')
    console.log('  ✓ 路由数据初始化完成！')
    console.log('========================================\n')
    console.log('创建的路由：')
    console.log('  - / (仪表盘)')
    console.log('  - /user-management (用户管理)')
    console.log('    - /users (用户列表)')
    console.log('    - /roles (角色管理)')
    console.log('    - /permissions (权限管理)')
    console.log('  - /routes (路由管理)\n')

  } catch (error) {
    console.error('\n❌ 错误:', error.message)
    console.error('\n可能的原因：')
    console.error('  1. 数据库连接失败（检查 .env 配置）')
    console.error('  2. routes表不存在（需要先运行 prisma db push）')
    console.error('  3. 权限数据不存在（需要先运行 prisma db seed）\n')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行种子
seedRoutes()
