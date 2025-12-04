/**
 * 模块功能：用户偏好设置API路由
 * 最后修改：2025-12-04
 * 依赖项：express, zod, userPreferenceService, authenticate
 */

import { Router } from 'express'
import { z } from 'zod'
import {
  getUserPreference,
  updateUserPreference,
  deleteUserPreference,
} from '../services/userPreferenceService.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// 偏好设置验证schema
const preferenceSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  font: z.string().min(1).max(50).optional(),
  language: z.string().min(2).max(10).optional(),
})

/**
 * @description 获取当前用户的偏好设置
 * @route GET /api/user-preference
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权',
      })
    }

    const preference = await getUserPreference(userId)

    res.json({
      success: true,
      data: preference,
    })
  } catch (error) {
    console.error('获取用户偏好设置失败:', error)
    res.status(500).json({
      success: false,
      message: '获取用户偏好设置失败',
    })
  }
})

/**
 * @description 更新当前用户的偏好设置
 * @route PUT /api/user-preference
 */
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权',
      })
    }

    const validatedData = preferenceSchema.parse(req.body)
    const preference = await updateUserPreference(userId, validatedData)

    res.json({
      success: true,
      data: preference,
      message: '偏好设置已更新',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: '数据验证失败',
        errors: error.errors,
      })
    }

    console.error('更新用户偏好设置失败:', error)
    res.status(500).json({
      success: false,
      message: '更新用户偏好设置失败',
    })
  }
})

/**
 * @description 删除当前用户的偏好设置
 * @route DELETE /api/user-preference
 */
router.delete('/', authenticate, async (req, res) => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未授权',
      })
    }

    await deleteUserPreference(userId)

    res.json({
      success: true,
      message: '偏好设置已删除',
    })
  } catch (error) {
    console.error('删除用户偏好设置失败:', error)
    res.status(500).json({
      success: false,
      message: '删除用户偏好设置失败',
    })
  }
})

export default router
