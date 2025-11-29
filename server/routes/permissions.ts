/**
 * 模块功能：权限管理路由
 * 最后修改：2025-11-29
 * 依赖项：express, ../services/permissionService, ../middleware/auth, ../utils/response
 */

import { Router } from 'express'
import * as permissionService from '../services/permissionService.js'
import { authenticate } from '../middleware/auth.js'
import { sendSuccess } from '../utils/response.js'

const router = Router()

// 所有权限路由都需要认证
router.use(authenticate)

/**
 * @route GET /api/permissions
 * @description 获取所有权限
 * @access Private
 */
router.get('/', async (req, res, next) => {
  try {
    const permissions = await permissionService.getAllPermissions()
    sendSuccess(res, permissions, '获取权限列表成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route GET /api/permissions/grouped
 * @description 按资源分组获取权限
 * @access Private
 */
router.get('/grouped', async (req, res, next) => {
  try {
    const grouped = await permissionService.getPermissionsByResource()
    sendSuccess(res, grouped, '获取分组权限成功')
  } catch (error) {
    next(error)
  }
})

export default router
