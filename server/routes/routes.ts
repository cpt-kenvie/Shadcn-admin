/**
 * 模块功能：路由管理路由
 * 最后修改：2025-11-29
 * 依赖项：express, ../services/routeService, ../middleware/auth, ../middleware/permission, ../utils/response
 */

import { Router } from 'express'
import * as routeService from '../services/routeService.js'
import { authenticate } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permission.js'
import { sendSuccess } from '../utils/response.js'

const router = Router()

// 所有路由管理路由都需要认证
router.use(authenticate)

/**
 * @route GET /api/routes
 * @description 获取所有路由（树形结构）
 * @access Private (需要 READ route 权限)
 */
router.get('/', requirePermission('READ', 'route'), async (req, res, next) => {
  try {
    const routes = await routeService.getAllRoutes()
    sendSuccess(res, routes, '获取路由列表成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route GET /api/routes/flat
 * @description 获取所有路由（扁平结构）
 * @access Private (需要 READ route 权限)
 */
router.get('/flat', requirePermission('READ', 'route'), async (req, res, next) => {
  try {
    const routes = await routeService.getAllRoutesFlat()
    sendSuccess(res, routes, '获取路由列表成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route GET /api/routes/:id
 * @description 获取路由详情
 * @access Private (需要 READ route 权限)
 */
router.get('/:id', requirePermission('READ', 'route'), async (req, res, next) => {
  try {
    const route = await routeService.getRouteById(req.params.id)
    sendSuccess(res, route, '获取路由详情成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route POST /api/routes
 * @description 创建路由
 * @access Private (需要 CREATE route 权限)
 */
router.post('/', requirePermission('CREATE', 'route'), async (req, res, next) => {
  try {
    const route = await routeService.createRoute(req.body)
    sendSuccess(res, route, '创建路由成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route PUT /api/routes/:id
 * @description 更新路由
 * @access Private (需要 UPDATE route 权限)
 */
router.put('/:id', requirePermission('UPDATE', 'route'), async (req, res, next) => {
  try {
    const route = await routeService.updateRoute(req.params.id, req.body)
    sendSuccess(res, route, '更新路由成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route DELETE /api/routes/:id
 * @description 删除路由
 * @access Private (需要 DELETE route 权限)
 */
router.delete('/:id', requirePermission('DELETE', 'route'), async (req, res, next) => {
  try {
    await routeService.deleteRoute(req.params.id)
    sendSuccess(res, null, '删除路由成功')
  } catch (error) {
    next(error)
  }
})

export default router
