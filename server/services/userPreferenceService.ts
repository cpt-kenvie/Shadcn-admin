/**
 * 模块功能：用户偏好设置服务
 * 最后修改：2025-12-04
 * 依赖项：@prisma/client
 */

import { prisma } from '../config/database.js'

const VALID_FONTS = ['maple', 'system'] as const
const DEFAULT_FONT = 'system'

function normalizeFont(font: string): string {
  return VALID_FONTS.includes(font as any) ? font : DEFAULT_FONT
}

/**
 * @description 获取用户偏好设置
 * @param {string} userId - 用户ID
 * @returns {Promise} 用户偏好设置对象
 * @throws {Error} 数据库查询失败
 */
export async function getUserPreference(userId: string) {
  try {
    let preference = await prisma.userPreference.findUnique({
      where: { userId },
    })

    // 如果用户没有偏好设置，创建默认设置
    if (!preference) {
      preference = await prisma.userPreference.create({
        data: {
          userId,
          theme: 'light',
          font: DEFAULT_FONT,
          language: 'zh-CN',
        },
      })
    }

    return {
      ...preference,
      font: normalizeFont(preference.font),
    }
  } catch (error) {
    console.error('获取用户偏好设置失败:', error)
    throw error
  }
}

/**
 * @description 更新用户偏好设置
 * @param {string} userId - 用户ID
 * @param {object} data - 偏好设置数据
 * @returns {Promise} 更新后的偏好设置对象
 * @throws {Error} 数据库更新失败
 */
export async function updateUserPreference(
  userId: string,
  data: {
    theme?: string
    font?: string
    language?: string
  }
) {
  try {
    const normalizedData = {
      ...data,
      ...(data.font && { font: normalizeFont(data.font) }),
    }

    const preference = await prisma.userPreference.upsert({
      where: { userId },
      update: normalizedData,
      create: {
        userId,
        theme: data.theme || 'light',
        font: normalizeFont(data.font || DEFAULT_FONT),
        language: data.language || 'zh-CN',
      },
    })

    return {
      ...preference,
      font: normalizeFont(preference.font),
    }
  } catch (error) {
    console.error('更新用户偏好设置失败:', error)
    throw error
  }
}

/**
 * @description 删除用户偏好设置
 * @param {string} userId - 用户ID
 * @returns {Promise} 删除结果
 * @throws {Error} 数据库删除失败
 */
export async function deleteUserPreference(userId: string) {
  try {
    await prisma.userPreference.delete({
      where: { userId },
    })
  } catch (error) {
    console.error('删除用户偏好设置失败:', error)
    throw error
  }
}
