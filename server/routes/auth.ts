/**
 * 模块功能：认证路由
 * 最后修改：2025-11-29
 * 依赖项：express, ../services/authService, ../middleware/auth, ../utils/response
 */

import { Router } from 'express'
import * as authService from '../services/authService.js'
import { authenticate } from '../middleware/auth.js'
import { sendSuccess } from '../utils/response.js'
import { config } from '../config/env.js'

const router = Router()

/**
 * @route POST /api/auth/login
 * @description 用户登录
 * @access Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const result = await authService.login(req.body)

    // 设置 HTTP-Only Cookie
    res.cookie('token', result.token, config.cookie)
    res.cookie('refreshToken', result.refreshToken, {
      ...config.cookie,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 天
    })

    sendSuccess(res, result, '登录成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route POST /api/auth/logout
 * @description 用户登出
 * @access Private
 */
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // 清除 Cookies
    res.clearCookie('token')
    res.clearCookie('refreshToken')

    sendSuccess(res, null, '登出成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route GET /api/auth/me
 * @description 获取当前用户信息
 * @access Private
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user!.userId)
    sendSuccess(res, user, '获取用户信息成功')
  } catch (error) {
    next(error)
  }
})

/**
 * @route POST /api/auth/refresh
 * @description 刷新访问令牌
 * @access Public
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({ message: '缺少刷新令牌' })
    }

    const result = await authService.refreshAccessToken(refreshToken)

    // 更新 Cookie
    res.cookie('token', result.token, config.cookie)

    sendSuccess(res, result, '令牌刷新成功')
  } catch (error) {
    next(error)
  }
})

export default router
