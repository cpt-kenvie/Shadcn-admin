/**
 * 模块功能：权限管理路由
 * 最后修改：2025-11-29
 * 依赖项：express, ../services/permissionService, ../middleware/auth, ../middleware/permission, ../utils/response
 */

import { Router } from 'express'
import * as permissionService from '../services/permissionService.js'
import { authenticate } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permission.js'
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

/**
 * @route GET /api/permissions/:id
 * @description 获取权限详情
 * @access Private (需要 READ permission 权限)
 */
router.get('/:id', requirePermission('READ', 'permission'), async (req, res, next) => {
  try {
    const permission = await permissionService.getPermissionById(req.params.id)
    sendSuccess(res, permission, '获取权限详情成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route POST /api/permissions
 * @description 创建权限
 * @access Private (需要 CREATE permission 权限)
 */
router.post('/', requirePermission('CREATE', 'permission'), async (req, res, next) => {
  try {
    const permission = await permissionService.createPermission(req.body)
    sendSuccess(res, permission, '创建权限成功', 201)
  } catch (error) {
    next(error)
  }
})

/**
 * @route POST /api/permissions/batch
 * @description 批量创建权限
 * @access Private (需要 CREATE permission 权限)
 */
router.post('/batch', requirePermission('CREATE', 'permission'), async (req, res, next) => {
  try {
    const { permissions } = req.body

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的权限列表',
      })
    }

    const results = await permissionService.createPermissionsBatch(permissions)
    sendSuccess(res, results, '批量创建权限完成', 201)
  } catch (error) {
    next(error)
  }
})

/**
 * @route PUT /api/permissions/:id
 * @description 更新权限
 * @access Private (需要 UPDATE permission 权限)
 */
router.put('/:id', requirePermission('UPDATE', 'permission'), async (req, res, next) => {
  try {
    const permission = await permissionService.updatePermission(req.params.id, req.body)
    sendSuccess(res, permission, '更新权限成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route DELETE /api/permissions/:id
 * @description 删除权限
 * @access Private (需要 DELETE permission 权限)
 */
router.delete('/:id', requirePermission('DELETE', 'permission'), async (req, res, next) => {
  try {
    await permissionService.deletePermission(req.params.id)
    sendSuccess(res, null, '删除权限成功')
  } catch (error) {
    next(error)
  }
})

export default router
