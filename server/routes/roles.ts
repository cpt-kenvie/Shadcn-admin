/**
 * 模块功能：角色管理路由
 * 最后修改：2025-11-29
 * 依赖项：express, ../services/roleService, ../middleware/auth, ../utils/response
 */

import { Router } from 'express'
import * as roleService from '../services/roleService.js'
import { authenticate } from '../middleware/auth.js'
import { sendSuccess } from '../utils/response.js'

const router = Router()

// 所有角色路由都需要认证
router.use(authenticate)

/**
 * @route GET /api/roles
 * @description 获取所有角色
 * @access Private
 */
router.get('/', async (req, res, next) => {
  try {
    const roles = await roleService.getAllRoles()
    sendSuccess(res, roles, '获取角色列表成功')
  } catch (error) {
    next(error)
  }
})

export default router
