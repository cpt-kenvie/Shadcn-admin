import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { requirePermission } from '../middleware/permission.js'
import { sendSuccess } from '../utils/response.js'
import * as newsService from '../services/newsService.js'
import { NewsStatus } from '@prisma/client'

const router = Router()

router.use(authenticate)

const NEWS_STATUSES: readonly NewsStatus[] = [
  NewsStatus.DRAFT,
  NewsStatus.PUBLISHED,
  NewsStatus.ARCHIVED,
]

function parsePositiveInt(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) return undefined
  return n
}

function parseNewsStatus(value: unknown): NewsStatus | undefined {
  if (typeof value !== 'string') return undefined
  return NEWS_STATUSES.find((s) => s === value)
}

router.get('/', requirePermission('READ', 'news'), async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page)
    const pageSize = parsePositiveInt(req.query.pageSize)
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const status = parseNewsStatus(req.query.status)

    const result = await newsService.getAdminNews({ page, pageSize, search, status })
    sendSuccess(res, result, '获取新闻列表成功')
  } catch (error) {
    next(error)
  }
})

router.get('/:id', requirePermission('READ', 'news'), async (req, res, next) => {
  try {
    const item = await newsService.getAdminNewsById(req.params.id)
    sendSuccess(res, item, '获取新闻详情成功')
  } catch (error) {
    next(error)
  }
})

router.post('/', requirePermission('CREATE', 'news'), async (req, res, next) => {
  try {
    const created = await newsService.createNews(req.user!.userId, req.body)
    sendSuccess(res, created, '创建新闻成功')
  } catch (error) {
    next(error)
  }
})

router.put('/:id', requirePermission('UPDATE', 'news'), async (req, res, next) => {
  try {
    const updated = await newsService.updateNews(req.params.id, req.user!.userId, req.body)
    sendSuccess(res, updated, '更新新闻成功')
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', requirePermission('DELETE', 'news'), async (req, res, next) => {
  try {
    await newsService.deleteNews(req.params.id)
    sendSuccess(res, null, '删除新闻成功')
  } catch (error) {
    next(error)
  }
})

export default router
