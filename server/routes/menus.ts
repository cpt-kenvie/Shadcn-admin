/**
 * 模块功能：菜单管理路由
 * 最后修改：2025-11-29
 * 依赖项：express, ../services/menuService, ../middleware/auth, ../utils/response
 */

import { Router } from 'express'
import * as menuService from '../services/menuService.js'
import { authenticate } from '../middleware/auth.js'
import { sendSuccess } from '../utils/response.js'

const router = Router()

// 所有菜单路由都需要认证
router.use(authenticate)

/**
 * @route GET /api/menus
 * @description 获取当前用户的菜单（根据权限过滤）
 * @access Private
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.userId
    const menus = await menuService.getUserMenus(userId)
    sendSuccess(res, menus, '获取菜单成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route POST /api/menus/check
 * @description 检查用户是否有权访问指定路由
 * @access Private
 */
router.post('/check', async (req, res, next) => {
  try {
    const userId = req.user!.userId
    const { path } = req.body
    const hasAccess = await menuService.checkRouteAccess(userId, path)
    sendSuccess(res, { hasAccess }, hasAccess ? '有权限访问' : '无权限访问')
  } catch (error) {
    next(error)
  }
})

export default router
