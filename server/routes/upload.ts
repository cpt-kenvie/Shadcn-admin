import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { randomUUID } from 'crypto'
import { authenticate } from '../middleware/auth.js'
import { sendSuccess } from '../utils/response.js'
import * as uploadService from '../services/uploadService.js'

const router = Router()

const UPLOAD_DIR = path.resolve(process.cwd(), 'server/upload')

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    uploadService.ensureUploadDir().then(() => cb(null, UPLOAD_DIR))
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${randomUUID()}${ext}`)
  },
})

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('仅支持 JPEG、PNG、GIF、WebP、SVG 格式'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

router.use(authenticate)

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ success: false, message: '请选择文件' })
    }

    const url = `/upload/files/${file.filename}`
    const record = await uploadService.createUploadRecord({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url,
      uploaderId: req.user!.userId,
      newsId: req.body.newsId || undefined,
    })

    sendSuccess(res, record, '上传成功')
  } catch (error) {
    next(error)
  }
})

router.get('/list', async (req, res, next) => {
  try {
    const newsId = req.query.newsId as string | undefined
    const files = newsId
      ? await uploadService.getUploadsByNewsId(newsId)
      : await uploadService.getUploadsByUser(req.user!.userId)
    sendSuccess(res, files, '获取文件列表成功')
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/use', async (req, res, next) => {
  try {
    const { newsId } = req.body
    if (!newsId) {
      return res.status(400).json({ success: false, message: '缺少 newsId' })
    }
    const file = await uploadService.markFileAsUsed(req.params.id, newsId)
    sendSuccess(res, file, '标记成功')
  } catch (error) {
    next(error)
  }
})

router.patch('/:id/unuse', async (req, res, next) => {
  try {
    const file = await uploadService.markFileAsUnused(req.params.id)
    sendSuccess(res, file, '取消标记成功')
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await uploadService.deleteUploadFile(req.params.id, req.user!.userId)
    sendSuccess(res, null, '删除成功')
  } catch (error) {
    next(error)
  }
})

router.post('/sync', async (req, res, next) => {
  try {
    const { newsId, usedUrls } = req.body
    if (!newsId || !Array.isArray(usedUrls)) {
      return res.status(400).json({ success: false, message: '参数错误' })
    }
    await uploadService.syncFileUsage(newsId, usedUrls)
    sendSuccess(res, null, '同步成功')
  } catch (error) {
    next(error)
  }
})

export default router
