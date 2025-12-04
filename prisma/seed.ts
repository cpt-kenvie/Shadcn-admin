/**
 * 模块功能：数据库种子数据初始化
 * 最后修改：2025-11-29
 * 依赖项：@prisma/client, bcryptjs
 */

import { PrismaClient, PermissionAction, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import 'dotenv/config'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

/**
 * @description 主种子函数，初始化所有基础数据
 * @throws {Error} 数据库操作失败时抛出异常
 */
async function main() {
  try {
    console.log('开始初始化数据库种子数据...')

    // 1. 创建权限
    console.log('创建权限...')
    const permissions = await createPermissions()
    console.log(`✓ 创建了 ${permissions.length} 个权限`)

    // 2. 创建角色
    console.log('创建角色...')
    const adminARole = await createAdminARole(permissions)
    const adminBRole = await createAdminBRole(permissions)
    console.log('✓ 创建了管理员角色')

    // 3. 创建用户
    console.log('创建用户...')
    await createUsers(adminARole.id, adminBRole.id)
    console.log('✓ 创建了示例用户')

    console.log('\n数据库种子数据初始化完成！')
  } catch (error) {
    console.error('种子数据初始化失败:', error)
    throw error
  }
}

/**
 * @description 创建所有权限
 * @returns {Promise<Permission[]>} 创建的权限列表
 */
async function createPermissions() {
  const resources = ['user', 'role', 'permission', 'route', 'dashboard', 'settings']
  const actions: PermissionAction[] = [
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'MANAGE',
    'IMPORT',
    'EXPORT',
  ]

  const permissionsData = []

  for (const resource of resources) {
    for (const action of actions) {
      permissionsData.push({
        resource,
        action,
        description: `${action} ${resource}`,
      })
    }
  }

  // 使用 upsert 避免重复创建
  const createdPermissions = []
  for (const perm of permissionsData) {
    const permission = await prisma.permission.upsert({
      where: {
        resource_action: {
          resource: perm.resource,
          action: perm.action,
        },
      },
      update: {},
      create: perm,
    })
    createdPermissions.push(permission)
  }

  return createdPermissions
}

/**
 * @description 创建管理员 A 角色（全部权限）
 * @param {Permission[]} permissions 所有权限列表
 * @returns {Promise<Role>} 创建的角色
 */
async function createAdminARole(permissions: any[]) {
  const role = await prisma.role.upsert({
    where: { name: 'admin_a' },
    update: {},
    create: {
      name: 'admin_a',
      displayName: '管理员 A',
      description: '拥有系统所有权限的超级管理员',
      isSystem: true,
    },
  })

  // 关联所有权限
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: permission.id,
      },
    })
  }

  return role
}

/**
 * @description 创建管理员 B 角色（有限权限）
 * @param {Permission[]} permissions 所有权限列表
 * @returns {Promise<Role>} 创建的角色
 */
async function createAdminBRole(permissions: any[]) {
  const role = await prisma.role.upsert({
    where: { name: 'admin_b' },
    update: {},
    create: {
      name: 'admin_b',
      displayName: '管理员 B',
      description: '有限权限管理员 - 可以导入用户但不能创建用户',
      isSystem: true,
    },
  })

  // 为管理员 B 分配特定权限
  const limitedPermissions = permissions.filter((p) => {
    // 排除用户创建权限
    if (p.resource === 'user' && p.action === 'CREATE') {
      return false
    }
    // 包含所有读取权限
    if (p.action === 'READ') return true
    // 包含用户的导入、更新、删除权限
    if (p.resource === 'user' && ['IMPORT', 'UPDATE', 'DELETE', 'EXPORT'].includes(p.action)) {
      return true
    }
    // 包含仪表盘和设置的读取权限
    if (['dashboard', 'settings'].includes(p.resource)) {
      return true
    }
    return false
  })

  for (const permission of limitedPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: role.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: role.id,
        permissionId: permission.id,
      },
    })
  }

  return role
}

/**
 * @description 创建示例用户
 * @param {string} adminARoleId 管理员 A 角色 ID
 * @param {string} adminBRoleId 管理员 B 角色 ID
 */
async function createUsers(adminARoleId: string, adminBRoleId: string) {
  // 密码哈希
  const passwordHash = await bcrypt.hash('admin123456', 10)

  // 管理员 A 用户
  const adminAUser = await prisma.user.upsert({
    where: { username: 'admin_a' },
    update: {},
    create: {
      username: 'admin_a',
      email: 'admin_a@example.com',
      passwordHash,
      nickname: '管理员A',
      phoneNumber: '+86 138-0000-0001',
      status: UserStatus.ACTIVE,
    },
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminAUser.id,
        roleId: adminARoleId,
      },
    },
    update: {},
    create: {
      userId: adminAUser.id,
      roleId: adminARoleId,
    },
  })

  // 管理员 B 用户
  const adminBUser = await prisma.user.upsert({
    where: { username: 'admin_b' },
    update: {},
    create: {
      username: 'admin_b',
      email: 'admin_b@example.com',
      passwordHash,
      nickname: '管理员B',
      phoneNumber: '+86 138-0000-0002',
      status: UserStatus.ACTIVE,
    },
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminBUser.id,
        roleId: adminBRoleId,
      },
    },
    update: {},
    create: {
      userId: adminBUser.id,
      roleId: adminBRoleId,
    },
  })

  console.log('\n示例用户信息:')
  console.log('  管理员 A - 用户名: admin_a, 密码: admin123456')
  console.log('  管理员 B - 用户名: admin_b, 密码: admin123456')
}

// 执行种子函数
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
