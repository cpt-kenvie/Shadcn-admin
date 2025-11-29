/**
 * 模块功能：用户管理路由
 * 最后修改：2025-11-29
 * 依赖项：express, ../services/userService, ../middleware/auth, ../middleware/permission, ../utils/response
 */

import { Router } from 'express'
import * as userService from '../services/userService.js'
import { authenticate } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permission.js'
import { sendSuccess } from '../utils/response.js'

const router = Router()

// 所有用户路由都需要认证
router.use(authenticate)

/**
 * @route GET /api/users
 * @description 获取用户列表
 * @access Private (需要 READ user 权限)
 */
router.get('/', requirePermission('READ', 'user'), async (req, res, next) => {
  try {
    const { page, pageSize, search, status, roleId } = req.query

    const result = await userService.getUsers({
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      search: search as string,
      status: status as any,
      roleId: roleId as string,
    })

    sendSuccess(res, result, '获取用户列表成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route GET /api/users/:id
 * @description 获取用户详情
 * @access Private (需要 READ user 权限)
 */
router.get('/:id', requirePermission('READ', 'user'), async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id)
    sendSuccess(res, user, '获取用户详情成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route POST /api/users
 * @description 创建用户
 * @access Private (需要 CREATE user 权限)
 */
router.post('/', requirePermission('CREATE', 'user'), async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body)
    sendSuccess(res, user, '创建用户成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route PUT /api/users/:id
 * @description 更新用户
 * @access Private (需要 UPDATE user 权限)
 */
router.put('/:id', requirePermission('UPDATE', 'user'), async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body)
    sendSuccess(res, user, '更新用户成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route DELETE /api/users/:id
 * @description 删除用户
 * @access Private (需要 DELETE user 权限)
 */
router.delete('/:id', requirePermission('DELETE', 'user'), async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id)
    sendSuccess(res, null, '删除用户成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route POST /api/users/batch-delete
 * @description 批量删除用户
 * @access Private (需要 DELETE user 权限)
 */
router.post('/batch-delete', requirePermission('DELETE', 'user'), async (req, res, next) => {
  try {
    const { ids } = req.body
    const count = await userService.deleteUsers(ids)
    sendSuccess(res, { count }, `成功删除 ${count} 个用户`)
  } catch (error) {
    next(error)
  }
})

export default router
