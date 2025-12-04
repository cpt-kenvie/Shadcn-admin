/**
 * 模块功能：系统配置API路由
 * 最后修改：2025-12-03
 * 依赖项：express, zod, systemConfigService
 */

import { Router } from 'express'
import { z } from 'zod'
import {
  getSystemConfig,
  getAllSystemConfigs,
  setSystemConfig,
  setSystemConfigs,
  deleteSystemConfig,
} from '../services/systemConfigService.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// 配置数据验证schema
const configSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
  category: z.string().max(50).optional(),
  description: z.string().optional(),
})

const configsSchema = z.array(configSchema)

/**
 * @description 获取单个系统配置
 * @route GET /api/system-config/:key
 */
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params
    const config = await getSystemConfig(key)

    if (!config) {
      return res.status(404).json({
        success: false,
        message: '配置不存在',
      })
    }

    res.json({
      success: true,
      data: config,
    })
  } catch (error) {
    console.error('获取系统配置失败:', error)
    res.status(500).json({
      success: false,
      message: '获取系统配置失败',
    })
  }
})

/**
 * @description 获取所有系统配置
 * @route GET /api/system-config
 */
router.get('/', async (req, res) => {
  try {
    const { category } = req.query
    const configs = await getAllSystemConfigs(category as string | undefined)

    res.json({
      success: true,
      data: configs,
    })
  } catch (error) {
    console.error('获取系统配置列表失败:', error)
    res.status(500).json({
      success: false,
      message: '获取系统配置列表失败',
    })
  }
})

/**
 * @description 设置单个系统配置（需要认证）
 * @route POST /api/system-config
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const validatedData = configSchema.parse(req.body)
    const config = await setSystemConfig(validatedData)

    res.json({
      success: true,
      data: config,
      message: '配置已保存',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.errors,
      })
    }

    console.error('设置系统配置失败:', error)
    res.status(500).json({
      success: false,
      message: '设置系统配置失败',
    })
  }
})

/**
 * @description 批量设置系统配置（需要认证）
 * @route POST /api/system-config/batch
 */
router.post('/batch', authenticate, async (req, res) => {
  try {
    const validatedData = configsSchema.parse(req.body)
    await setSystemConfigs(validatedData)

    res.json({
      success: true,
      message: '配置已批量保存',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.errors,
      })
    }

    console.error('批量设置系统配置失败:', error)
    res.status(500).json({
      success: false,
      message: '批量设置系统配置失败',
    })
  }
})

/**
 * @description 删除系统配置（需要认证）
 * @route DELETE /api/system-config/:key
 */
router.delete('/:key', authenticate, async (req, res) => {
  try {
    const { key } = req.params
    await deleteSystemConfig(key)

    res.json({
      success: true,
      message: '配置已删除',
    })
  } catch (error) {
    console.error('删除系统配置失败:', error)
    res.status(500).json({
      success: false,
      message: '删除系统配置失败',
    })
  }
})

export default router
