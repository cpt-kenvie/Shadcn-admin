/**
 * 模块功能：角色管理路由
 * 最后修改：2025-11-29
 * 依赖项：express, ../services/roleService, ../middleware/auth, ../middleware/permission, ../utils/response
 */

import { Router } from 'express'
import * as roleService from '../services/roleService.js'
import { authenticate } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permission.js'
import { sendSuccess } from '../utils/response.js'

const router = Router()

// 所有角色路由都需要认证
router.use(authenticate)

/**
 * @route GET /api/roles
 * @description 获取所有角色
 * @access Private (需要 READ role 权限)
 */
router.get('/', requirePermission('READ', 'role'), async (req, res, next) => {
  try {
    const roles = await roleService.getAllRoles()
    sendSuccess(res, roles, '获取角色列表成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route GET /api/roles/:id
 * @description 获取角色详情
 * @access Private (需要 READ role 权限)
 */
router.get('/:id', requirePermission('READ', 'role'), async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id)
    sendSuccess(res, role, '获取角色详情成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route POST /api/roles
 * @description 创建角色
 * @access Private (需要 CREATE role 权限)
 */
router.post('/', requirePermission('CREATE', 'role'), async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body)
    sendSuccess(res, role, '创建角色成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route PUT /api/roles/:id
 * @description 更新角色
 * @access Private (需要 UPDATE role 权限)
 */
router.put('/:id', requirePermission('UPDATE', 'role'), async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body)
    sendSuccess(res, role, '更新角色成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route DELETE /api/roles/:id
 * @description 删除角色
 * @access Private (需要 DELETE role 权限)
 */
router.delete('/:id', requirePermission('DELETE', 'role'), async (req, res, next) => {
  try {
    await roleService.deleteRole(req.params.id)
    sendSuccess(res, null, '删除角色成功')
  } catch (error) {
    next(error)
  }
})

export default router
