
import { prisma } from '../config/database.js'

export interface SystemConfigData {
  key: string
  value: string
  category?: string
  description?: string
}

/**
 * @description 获取系统配置
 * @param {string} key - 配置键名
 * @returns {Promise<SystemConfig | null>} 配置对象
 * @throws {Error} 数据库查询错误
 */
export async function getSystemConfig(key: string) {
  try {
    return await prisma.systemConfig.findUnique({
      where: { key },
    })
  } catch (error) {
    console.error('获取系统配置失败:', error)
    throw new Error('获取系统配置失败')
  }
}

/**
 * @description 获取所有系统配置
 * @param {string} category - 可选的配置分类
 * @returns {Promise<SystemConfig[]>} 配置列表
 * @throws {Error} 数据库查询错误
 */
export async function getAllSystemConfigs(category?: string) {
  try {
    return await prisma.systemConfig.findMany({
      where: category ? { category } : undefined,
      orderBy: { key: 'asc' },
    })
  } catch (error) {
    console.error('获取系统配置列表失败:', error)
    throw new Error('获取系统配置列表失败')
  }
}

/**
 * @description 设置系统配置
 * @param {SystemConfigData} data - 配置数据
 * @returns {Promise<SystemConfig>} 更新后的配置对象
 * @throws {Error} 数据库操作错误
 */
export async function setSystemConfig(data: SystemConfigData) {
  try {
    return await prisma.systemConfig.upsert({
      where: { key: data.key },
      update: {
        value: data.value,
        category: data.category,
        description: data.description,
      },
      create: {
        key: data.key,
        value: data.value,
        category: data.category || 'general',
        description: data.description,
      },
    })
  } catch (error) {
    console.error('设置系统配置失败:', error)
    throw new Error('设置系统配置失败')
  }
}

/**
 * @description 批量设置系统配置
 * @param {SystemConfigData[]} configs - 配置数据数组
 * @returns {Promise<void>}
 * @throws {Error} 数据库操作错误
 */
export async function setSystemConfigs(configs: SystemConfigData[]) {
  try {
    await prisma.$transaction(
      configs.map((config) =>
        prisma.systemConfig.upsert({
          where: { key: config.key },
          update: {
            value: config.value,
            category: config.category,
            description: config.description,
          },
          create: {
            key: config.key,
            value: config.value,
            category: config.category || 'general',
            description: config.description,
          },
        })
      )
    )
  } catch (error) {
    console.error('批量设置系统配置失败:', error)
    throw new Error('批量设置系统配置失败')
  }
}

/**
 * @description 删除系统配置
 * @param {string} key - 配置键名
 * @returns {Promise<void>}
 * @throws {Error} 数据库操作错误
 */
export async function deleteSystemConfig(key: string) {
  try {
    await prisma.systemConfig.delete({
      where: { key },
    })
  } catch (error) {
    console.error('删除系统配置失败:', error)
    throw new Error('删除系统配置失败')
  }
}
