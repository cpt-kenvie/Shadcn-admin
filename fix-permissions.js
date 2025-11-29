/**
 * 模块功能：快速修复脚本 - 为角色分配路由权限
 * 最后修改：2025-11-29
 * 依赖项：@prisma/client
 *
 * 使用方法：node fix-permissions.js
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixPermissions() {
  console.log('========================================')
  console.log('  快速修复：添加路由权限')
  console.log('========================================\n')

  try {
    // 1. 确保route权限存在
    console.log('[1/4] 检查并创建route权限...')
    const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE', 'IMPORT', 'EXPORT']
    const permissions = []

    for (const action of actions) {
      const permission = await prisma.permission.upsert({
        where: {
          resource_action: {
            resource: 'route',
            action: action,
          },
        },
        update: {},
        create: {
          resource: 'route',
          action: action,
          description: `${action} route`,
        },
      })
      permissions.push(permission)
    }
    console.log(`✓ 创建/更新了 ${permissions.length} 个route权限\n`)

    // 2. 获取所有角色
    console.log('[2/4] 查找现有角色...')
    const roles = await prisma.role.findMany()
    console.log(`✓ 找到 ${roles.length} 个角色:`)
    roles.forEach(role => {
      console.log(`   - ${role.name} (${role.displayName})`)
    })
    console.log('')

    // 3. 为admin_a角色分配所有route权限
    console.log('[3/4] 为角色分配权限...')
    const adminARole = roles.find(r => r.name === 'admin_a')
    if (adminARole) {
      let count = 0
      for (const permission of permissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminARole.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: adminARole.id,
            permissionId: permission.id,
          },
        })
        count++
      }
      console.log(`✓ 为 admin_a 分配了 ${count} 个route权限`)
    }

    // 为admin_b角色分配READ权限
    const adminBRole = roles.find(r => r.name === 'admin_b')
    if (adminBRole) {
      const readPermission = permissions.find(p => p.action === 'READ')
      if (readPermission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: adminBRole.id,
              permissionId: readPermission.id,
            },
          },
          update: {},
          create: {
            roleId: adminBRole.id,
            permissionId: readPermission.id,
          },
        })
        console.log(`✓ 为 admin_b 分配了 READ route 权限`)
      }
    }
    console.log('')

    // 4. 验证权限分配
    console.log('[4/4] 验证权限分配...')
    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        permission: {
          resource: 'route',
        },
      },
      include: {
        role: true,
        permission: true,
      },
    })

    console.log(`✓ 已分配 ${rolePermissions.length} 个route权限:\n`)

    const grouped = rolePermissions.reduce((acc, rp) => {
      if (!acc[rp.role.name]) {
        acc[rp.role.name] = []
      }
      acc[rp.role.name].push(rp.permission.action)
      return acc
    }, {})

    for (const [roleName, actions] of Object.entries(grouped)) {
      console.log(`   ${roleName}: ${actions.join(', ')}`)
    }

    console.log('\n========================================')
    console.log('  ✓ 修复完成！')
    console.log('========================================\n')
    console.log('请执行以下步骤：')
    console.log('  1. 重新登录系统（刷新权限缓存）')
    console.log('  2. 使用 admin_a 账号登录')
    console.log('  3. 访问角色管理页面测试\n')

  } catch (error) {
    console.error('\n❌ 错误:', error.message)
    console.error('\n可能的原因：')
    console.error('  1. 数据库连接失败（检查 .env 配置）')
    console.error('  2. 权限表不存在（需要先运行 prisma migrate）')
    console.error('  3. 角色不存在（需要先运行 prisma db seed）\n')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 执行修复
fixPermissions()
