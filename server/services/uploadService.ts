import { prisma } from '../config/database.js'
import { createNotFoundError, createForbiddenError } from '../utils/error.js'
import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.resolve(process.cwd(), 'server/upload')

export async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR)
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function createUploadRecord(data: {
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  uploaderId: string
  newsId?: string
}) {
  return prisma.uploadFile.create({ data })
}

export async function getUploadsByUser(uploaderId: string) {
  return prisma.uploadFile.findMany({
    where: { uploaderId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getUploadsByNewsId(newsId: string) {
  return prisma.uploadFile.findMany({
    where: { newsId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function markFileAsUsed(id: string, newsId: string) {
  const file = await prisma.uploadFile.findUnique({ where: { id } })
  if (!file) throw createNotFoundError('文件不存在')

  return prisma.uploadFile.update({
    where: { id },
    data: { isUsed: true, newsId },
  })
}

export async function markFileAsUnused(id: string) {
  return prisma.uploadFile.update({
    where: { id },
    data: { isUsed: false, newsId: null },
  })
}

export async function deleteUploadFile(id: string, uploaderId: string) {
  const file = await prisma.uploadFile.findUnique({ where: { id } })
  if (!file) throw createNotFoundError('文件不存在')
  if (file.uploaderId !== uploaderId) throw createForbiddenError('无权删除此文件')

  const filePath = path.join(UPLOAD_DIR, file.filename)
  try {
    await fs.unlink(filePath)
  } catch {
    // 文件可能已被删除
  }

  return prisma.uploadFile.delete({ where: { id } })
}

export async function cleanUnusedFiles() {
  const unusedFiles = await prisma.uploadFile.findMany({
    where: { isUsed: false },
  })

  for (const file of unusedFiles) {
    const filePath = path.join(UPLOAD_DIR, file.filename)
    try {
      await fs.unlink(filePath)
    } catch {
      // ignore
    }
  }

  return prisma.uploadFile.deleteMany({ where: { isUsed: false } })
}

export async function syncFileUsage(newsId: string, usedUrls: string[]) {
  const files = await prisma.uploadFile.findMany({ where: { newsId } })

  for (const file of files) {
    const isUsed = usedUrls.includes(file.url)
    if (file.isUsed !== isUsed) {
      await prisma.uploadFile.update({
        where: { id: file.id },
        data: { isUsed },
      })
    }
  }
}
