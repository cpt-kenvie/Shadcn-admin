/**
 * 模块功能：用户管理服务
 * 最后修改：2025-12-03
 * 依赖项：@prisma/client, bcryptjs, ../config/database, ../utils/error
 */

import bcrypt from 'bcryptjs'
import { prisma } from '../config/database.js'
import { createValidationError, createNotFoundError } from '../utils/error.js'
import { UserStatus } from '@prisma/client'

/**
 * @description 创建用户请求接口
 */
export interface CreateUserRequest {
  username: string
  email?: string
  password: string
  nickname?: string
  avatar?: string
  bio?: string
  urls?: string[]
  birthDate?: Date | string
  phoneNumber?: string
  status?: UserStatus
  roleIds: string[]
}

/**
 * @description 更新用户请求接口
 */
export interface UpdateUserRequest {
  email?: string
  nickname?: string
  avatar?: string
  bio?: string
  urls?: string[]
  birthDate?: Date | string
  phoneNumber?: string
  status?: UserStatus
  roleIds?: string[]
  password?: string
}

/**
 * @description 查询用户列表
 * @param {Object} params 查询参数
 * @returns {Promise<Object>} 用户列表和分页信息
 */
export async function getUsers(params: {
  page?: number
  pageSize?: number
  search?: string
  status?: UserStatus
  roleId?: string
}) {
  const { page = 1, pageSize = 20, search, status, roleId } = params

  const where: any = {}

  // 搜索条件
  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { nickname: { contains: search, mode: 'insensitive' } },
    ]
  }

  // 状态筛选
  if (status) {
    where.status = status
  }

  // 角色筛选
  if (roleId) {
    where.userRoles = {
      some: {
        roleId,
      },
    }
  }

  // 查询总数
  const total = await prisma.user.count({ where })

  // 查询用户列表
  const users = await prisma.user.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      nickname: true,
      avatar: true,
      bio: true,
      urls: true,
      birthDate: true,
      phoneNumber: true,
      status: true,
      lastLogin: true,
      loginCount: true,
      createdAt: true,
      updatedAt: true,
      userRoles: {
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
    },
  })

  // 格式化用户数据
  const formattedUsers = users.map((user) => ({
    ...user,
    role: user.userRoles[0]?.role?.name || 'user',
    roles: user.userRoles.map((ur) => ur.role),
    userRoles: undefined,
  }))

  return {
    items: formattedUsers,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * @description 获取用户详情
 * @param {string} id 用户 ID
 * @returns {Promise<Object>} 用户详情
 * @throws {ApiError} 用户不存在时抛出
 */
export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: {
        include: {
          role: {
            select: {
              id: true,
              name: true,
              displayName: true,
              description: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    throw createNotFoundError('用户不存在')
  }

  return {
    ...user,
    passwordHash: undefined, // 不返回密码哈希
    roles: user.userRoles.map((ur) => ur.role),
    userRoles: undefined,
  }
}

/**
 * @description 创建用户
 * @param {CreateUserRequest} data 用户数据
 * @returns {Promise<Object>} 创建的用户
 * @throws {ApiError} 创建失败时抛出
 */
export async function createUser(data: CreateUserRequest) {
  const { username, email, password, nickname, avatar, bio, urls, birthDate, phoneNumber, status, roleIds } = data

  // 验证必填字段
  if (!username || !password) {
    throw createValidationError('用户名和密码不能为空')
  }

  // 验证用户名格式
  if (username.length < 3 || username.length > 50) {
    throw createValidationError('用户名长度必须在3-50个字符之间')
  }

  // 验证密码强度
  if (password.length < 8) {
    throw createValidationError('密码至少需要8个字符')
  }

  // 验证用户名是否已存在
  const existingUser = await prisma.user.findUnique({
    where: { username },
  })

  if (existingUser) {
    throw createValidationError('用户名已存在')
  }

  // 验证邮箱是否已存在
  if (email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingEmail) {
      throw createValidationError('邮箱已被使用')
    }
  }

  // 验证角色是否存在
  if (roleIds && roleIds.length > 0) {
    const validRoles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
    })

    if (validRoles.length !== roleIds.length) {
      throw createValidationError('部分角色不存在')
    }
  }

  // 加密密码
  const passwordHash = await bcrypt.hash(password, 10)

  // 创建用户
  try {
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        nickname,
        avatar,
        bio,
        urls: urls ? urls : undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        phoneNumber,
        status: status || UserStatus.ACTIVE,
        userRoles: roleIds && roleIds.length > 0 ? {
          create: roleIds.map((roleId) => ({
            roleId,
          })),
        } : undefined,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    })

    return {
      ...user,
      passwordHash: undefined,
      roles: user.userRoles.map((ur) => ur.role),
      userRoles: undefined,
    }
  } catch (error) {
    console.error('创建用户失败:', error)
    throw createValidationError('创建用户失败，请稍后重试')
  }
}

/**
 * @description 更新用户
 * @param {string} id 用户 ID
 * @param {UpdateUserRequest} data 更新数据
 * @returns {Promise<Object>} 更新后的用户
 * @throws {ApiError} 更新失败时抛出
 */
export async function updateUser(id: string, data: UpdateUserRequest) {
  const { email, nickname, avatar, bio, urls, birthDate, phoneNumber, status, roleIds, password } = data

  // 检查用户是否存在
  const existingUser = await prisma.user.findUnique({
    where: { id },
  })

  if (!existingUser) {
    throw createNotFoundError('用户不存在')
  }

  // 验证邮箱是否被其他用户使用
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
    })

    if (emailExists) {
      throw createValidationError('邮箱已被使用')
    }
  }

  // 如果提供了新密码，进行加密
  let passwordHash: string | undefined
  if (password && password.trim().length > 0) {
    if (password.length < 8) {
      throw createValidationError('密码至少需要8个字符')
    }
    passwordHash = await bcrypt.hash(password, 10)
  }

  // 验证角色是否存在
  if (roleIds && roleIds.length > 0) {
    const validRoles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
    })

    if (validRoles.length !== roleIds.length) {
      throw createValidationError('部分角色不存在')
    }
  }

  // 更新用户
  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        email,
        nickname,
        avatar,
        bio,
        urls: urls !== undefined ? urls : undefined,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        phoneNumber,
        status,
        ...(passwordHash && { passwordHash }),
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    })

    // 更新角色
    if (roleIds !== undefined && roleIds.length > 0) {
      // 删除现有角色
      await prisma.userRole.deleteMany({
        where: { userId: id },
      })

      // 添加新角色
      await prisma.userRole.createMany({
        data: roleIds.map((roleId) => ({
          userId: id,
          roleId,
        })),
      })
    }
  } catch (error) {
    console.error('更新用户失败:', error)
    throw createValidationError('更新用户失败，请稍后重试')
  }

  // 重新查询用户以获取更新后的角色
  const updatedUser = await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  })

  return {
    ...updatedUser,
    passwordHash: undefined,
    roles: updatedUser!.userRoles.map((ur) => ur.role),
    userRoles: undefined,
  }
}

/**
 * @description 删除用户
 * @param {string} id 用户 ID
 * @throws {ApiError} 删除失败时抛出
 */
export async function deleteUser(id: string) {
  // 检查用户是否存在
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  })

  if (!user) {
    throw createNotFoundError('用户不存在')
  }

  // 防止删除系统管理员（可选的安全检查）
  const isSuperAdmin = user.userRoles.some((ur) => ur.role.name === 'superadmin')
  if (isSuperAdmin) {
    // 检查是否是最后一个超级管理员
    const superAdminCount = await prisma.user.count({
      where: {
        userRoles: {
          some: {
            role: {
              name: 'superadmin',
            },
          },
        },
      },
    })

    if (superAdminCount <= 1) {
      throw createValidationError('不能删除最后一个超级管理员')
    }
  }

  // 删除用户（级联删除关联的角色）
  try {
    await prisma.user.delete({
      where: { id },
    })
  } catch (error) {
    console.error('删除用户失败:', error)
    throw createValidationError('删除用户失败，请稍后重试')
  }
}

/**
 * @description 批量删除用户
 * @param {string[]} ids 用户 ID 列表
 * @returns {Promise<number>} 删除的用户数量
 */
export async function deleteUsers(ids: string[]) {
  if (!ids || ids.length === 0) {
    throw createValidationError('请选择要删除的用户')
  }

  // 检查是否试图删除所有超级管理员
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  })

  const deletingSuperAdmins = users.filter((user) =>
    user.userRoles.some((ur) => ur.role.name === 'superadmin')
  )

  if (deletingSuperAdmins.length > 0) {
    const totalSuperAdmins = await prisma.user.count({
      where: {
        userRoles: {
          some: {
            role: {
              name: 'superadmin',
            },
          },
        },
      },
    })

    if (totalSuperAdmins <= deletingSuperAdmins.length) {
      throw createValidationError('不能删除所有超级管理员')
    }
  }

  try {
    const result = await prisma.user.deleteMany({
      where: {
        id: { in: ids },
      },
    })

    return result.count
  } catch (error) {
    console.error('批量删除用户失败:', error)
    throw createValidationError('批量删除用户失败，请稍后重试')
  }
}
