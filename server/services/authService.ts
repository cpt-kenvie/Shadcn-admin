/**
 * 模块功能：认证服务
 * 最后修改：2025-11-29
 * 依赖项：@prisma/client, bcryptjs, ../config/database, ../utils/jwt, ../utils/error
 */

import bcrypt from 'bcryptjs'
import { prisma } from '../config/database.js'
import { generateAccessToken, generateRefreshToken, JwtPayload } from '../utils/jwt.js'
import { createValidationError, createUnauthorizedError } from '../utils/error.js'
import { ErrorCode } from '../constants/errorCodes.js'

/**
 * @description 登录请求接口
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * @description 登录响应接口
 */
export interface LoginResponse {
  token: string
  refreshToken: string
  user_info: {
    id: string
    username: string
    email: string | null
    status: string
    created_at: Date
    last_login: Date | null
    login_count: number
    roles: string[]
  }
  message: string
}

/**
 * @description 用户登录
 * @param {LoginRequest} data 登录数据
 * @returns {Promise<LoginResponse>} 登录响应
 * @throws {ApiError} 登录失败时抛出
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const { username, password } = data

  // 验证输入
  if (!username || !password) {
    throw createValidationError('用户名和密码不能为空')
  }

  // 查找用户
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  })

  if (!user) {
    throw createUnauthorizedError('用户名或密码错误')
  }

  // 检查用户状态
  if (user.status === 'SUSPENDED') {
    throw createUnauthorizedError('账户已被暂停')
  }

  if (user.status === 'INACTIVE') {
    throw createUnauthorizedError('账户未激活')
  }

  // 验证密码
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)
  if (!isPasswordValid) {
    throw createUnauthorizedError('用户名或密码错误')
  }

  // 更新登录信息
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLogin: new Date(),
      loginCount: user.loginCount + 1,
    },
  })

  // 生成令牌
  const roles = user.userRoles.map((ur) => ur.role.name)
  const payload: JwtPayload = {
    userId: user.id,
    username: user.username,
    email: user.email || undefined,
    roles,
  }

  const token = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)

  return {
    token,
    refreshToken,
    user_info: {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      created_at: user.createdAt,
      last_login: user.lastLogin,
      login_count: user.loginCount + 1,
      roles,
    },
    message: '登录成功',
  }
}

/**
 * @description 获取当前用户信息
 * @param {string} userId 用户 ID
 * @returns {Promise<Object>} 用户信息
 * @throws {ApiError} 用户不存在时抛出
 */
export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    throw createValidationError('用户不存在')
  }

  // 提取角色和权限
  const roles = user.userRoles.map((ur) => ({
    id: ur.role.id,
    name: ur.role.name,
    displayName: ur.role.displayName,
  }))

  const permissions = user.userRoles.flatMap((ur) =>
    ur.role.rolePermissions.map((rp) => ({
      resource: rp.permission.resource,
      action: rp.permission.action,
    }))
  )

  return {
    ...user,
    userRoles: undefined, // 移除原始关联数据
    roles,
    permissions,
  }
}

/**
 * @description 更新用户资料请求接口
 */
export interface UpdateProfileRequest {
  nickname?: string
  avatar?: string
  bio?: string
  urls?: string[]
  birthDate?: Date | string
  email?: string
  phoneNumber?: string
}

/**
 * @description 更新当前用户资料
 * @param {string} userId 用户 ID
 * @param {UpdateProfileRequest} data 更新数据
 * @returns {Promise<Object>} 更新后的用户信息
 * @throws {ApiError} 更新失败时抛出
 */
export async function updateProfile(userId: string, data: UpdateProfileRequest) {
  const { nickname, avatar, bio, urls, birthDate, email, phoneNumber } = data

  // 检查用户是否存在
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!existingUser) {
    throw createValidationError('用户不存在')
  }

  // 验证邮箱是否被其他用户使用
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId },
      },
    })

    if (emailExists) {
      throw createValidationError('邮箱已被使用')
    }
  }

  // 更新用户资料
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      nickname,
      avatar,
      bio,
      urls: urls !== undefined ? urls : undefined,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      email,
      phoneNumber,
    },
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

  // 提取角色
  const roles = updatedUser.userRoles.map((ur) => ur.role)

  return {
    ...updatedUser,
    userRoles: undefined,
    roles,
  }
}

/**
 * @description 刷新访问令牌
 * @param {string} refreshToken 刷新令牌
 * @returns {Promise<{token: string}>} 新的访问令牌
 * @throws {ApiError} 令牌无效时抛出
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export async function changePassword(userId: string, data: ChangePasswordRequest): Promise<void> {
  const { currentPassword, newPassword } = data

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw createValidationError('用户不存在')
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isPasswordValid) {
    throw createValidationError('当前密码错误')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hashedPassword },
  })
}

export async function refreshAccessToken(refreshToken: string): Promise<{ token: string }> {
  try {
    const payload = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString())

    // 验证用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    })

    if (!user || user.status !== 'ACTIVE') {
      throw createUnauthorizedError('用户不存在或已被禁用')
    }

    // 生成新的访问令牌
    const roles = user.userRoles.map((ur) => ur.role.name)
    const newPayload: JwtPayload = {
      userId: user.id,
      username: user.username,
      email: user.email || undefined,
      roles,
    }

    const token = generateAccessToken(newPayload)

    return { token }
  } catch (error) {
    throw createUnauthorizedError('刷新令牌无效')
  }
}
