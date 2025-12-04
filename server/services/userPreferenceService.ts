/**
 * 模块功能：用户偏好设置服务
 * 最后修改：2025-12-04
 * 依赖项：@prisma/client
 */

import { prisma } from '../config/database.js'

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
          font: 'manrope',
          language: 'zh-CN',
        },
      })
    }

    return preference
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
    // 使用 upsert 确保记录存在
    const preference = await prisma.userPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        theme: data.theme || 'light',
        font: data.font || 'manrope',
        language: data.language || 'zh-CN',
      },
    })

    return preference
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
