import { Router } from 'express'
import { sendSuccess } from '../utils/response.js'
import * as newsService from '../services/newsService.js'

const router = Router()

function parsePositiveInt(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) return undefined
  return n
}

router.get('/', async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page)
    const pageSize = parsePositiveInt(req.query.pageSize)
    const result = await newsService.getPublicNews({ page, pageSize })
    sendSuccess(res, result, '获取新闻列表成功')
  } catch (error) {
    next(error)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    const item = await newsService.getPublicNewsById(req.params.id)
    sendSuccess(res, item, '获取新闻详情成功')
  } catch (error) {
    next(error)
  }
})

router.post('/:id/views', async (req, res, next) => {
  try {
    const result = await newsService.incrementPublicNewsViews(req.params.id)
    sendSuccess(res, result, '更新浏览次数成功')
  } catch (error) {
    next(error)
  }
})

export default router
