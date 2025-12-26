import { prisma } from '../config/database.js'
import { createNotFoundError, createValidationError } from '../utils/error.js'
import { NewsStatus } from '@prisma/client'

export interface CreateNewsRequest {
  title: string
  summary?: string
  content: string
  coverImageUrl?: string | null
  status?: NewsStatus
}

export interface UpdateNewsRequest {
  title?: string
  summary?: string
  content?: string
  coverImageUrl?: string | null
  status?: NewsStatus
}

function extractFirstMarkdownImageUrl(markdown: string): string | null {
  const match = markdown.match(/!\[[^\]]*]\(\s*<?([^\s>")]+)>?(?:\s+"[^"]*")?\s*\)/m)
  return match?.[1] ?? null
}

function deriveSummary(markdown: string): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\(([^)]*)\)/g, ' ')
    .replace(/[#>*_~\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text.slice(0, 180)
}

function formatNewsBase(news: {
  id: string
  title: string
  summary: string
  content?: string
  coverImageUrl: string | null
  status: NewsStatus
  publishedAt: Date | null
  views: number
  createdAt: Date
  updatedAt: Date
  author?: { id: string; username: string; nickname: string | null; avatar: string | null }
  updatedBy?: { id: string; username: string; nickname: string | null; avatar: string | null } | null
}) {
  const firstImageUrl = extractFirstMarkdownImageUrl(news.content ?? '')
  const heroImageUrl = news.coverImageUrl || firstImageUrl

  return {
    id: news.id,
    title: news.title,
    summary: news.summary,
    content: news.content,
    coverImageUrl: news.coverImageUrl,
    firstImageUrl,
    heroImageUrl,
    status: news.status,
    publishedAt: news.publishedAt?.toISOString() ?? null,
    views: news.views,
    createdAt: news.createdAt.toISOString(),
    updatedAt: news.updatedAt.toISOString(),
    author: news.author,
    updatedBy: news.updatedBy ?? undefined,
  }
}

export async function getAdminNews(params: {
  page?: number
  pageSize?: number
  search?: string
  status?: NewsStatus
}) {
  const { page = 1, pageSize = 20, search, status } = params

  const where: Record<string, unknown> = {}

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { summary: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status) {
    where.status = status
  }

  const total = await prisma.news.count({ where })

  const items = await prisma.news.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      coverImageUrl: true,
      status: true,
      publishedAt: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
    },
  })

  return {
    items: items.map((n) => formatNewsBase(n)),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getAdminNewsById(id: string) {
  const news = await prisma.news.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      coverImageUrl: true,
      status: true,
      publishedAt: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
    },
  })

  if (!news) {
    throw createNotFoundError('新闻不存在')
  }

  return formatNewsBase(news)
}

export async function createNews(authorId: string, data: CreateNewsRequest) {
  const title = data.title?.trim()
  const content = data.content ?? ''
  const summary = (data.summary ?? deriveSummary(content)).trim()

  if (!title) {
    throw createValidationError('标题不能为空')
  }

  if (!content.trim()) {
    throw createValidationError('内容不能为空')
  }

  if (!summary) {
    throw createValidationError('摘要不能为空')
  }

  const status = data.status ?? NewsStatus.DRAFT
  const publishedAt = status === NewsStatus.PUBLISHED ? new Date() : null

  const created = await prisma.news.create({
    data: {
      title,
      summary,
      content,
      coverImageUrl: data.coverImageUrl ?? null,
      status,
      publishedAt,
      authorId,
      updatedById: authorId,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      coverImageUrl: true,
      status: true,
      publishedAt: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
    },
  })

  return formatNewsBase(created)
}

export async function updateNews(id: string, updaterId: string, data: UpdateNewsRequest) {
  const existing = await prisma.news.findUnique({
    where: { id },
    select: {
      status: true,
      publishedAt: true,
    },
  })

  if (!existing) {
    throw createNotFoundError('新闻不存在')
  }

  const nextTitle = data.title?.trim()
  if (data.title !== undefined && !nextTitle) {
    throw createValidationError('标题不能为空')
  }

  const nextContent = data.content
  if (data.content !== undefined && !nextContent.trim()) {
    throw createValidationError('内容不能为空')
  }

  const nextSummary = data.summary?.trim()
  if (data.summary !== undefined && !nextSummary) {
    throw createValidationError('摘要不能为空')
  }

  const nextStatus = data.status ?? existing.status
  const publishedAt =
    nextStatus === NewsStatus.PUBLISHED
      ? (existing.publishedAt ?? new Date())
      : null

  const updated = await prisma.news.update({
    where: { id },
    data: {
      title: nextTitle,
      summary: nextSummary,
      content: nextContent,
      coverImageUrl: data.coverImageUrl === undefined ? undefined : data.coverImageUrl,
      status: nextStatus,
      publishedAt,
      updatedById: updaterId,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      coverImageUrl: true,
      status: true,
      publishedAt: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
    },
  })

  return formatNewsBase(updated)
}

export async function deleteNews(id: string) {
  const existing = await prisma.news.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!existing) {
    throw createNotFoundError('新闻不存在')
  }

  await prisma.news.delete({ where: { id } })
}

export async function getPublicNews(params: { page?: number; pageSize?: number }) {
  const { page = 1, pageSize = 20 } = params

  const where = { status: NewsStatus.PUBLISHED }
  const total = await prisma.news.count({ where })

  const items = await prisma.news.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: [
      { publishedAt: 'desc' },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      coverImageUrl: true,
      status: true,
      publishedAt: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
    },
  })

  return {
    items: items.map((n) => formatNewsBase(n)),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getPublicNewsById(id: string) {
  const news = await prisma.news.findFirst({
    where: { id, status: NewsStatus.PUBLISHED },
    select: {
      id: true,
      title: true,
      summary: true,
      content: true,
      coverImageUrl: true,
      status: true,
      publishedAt: true,
      views: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
        },
      },
    },
  })

  if (!news) {
    throw createNotFoundError('新闻不存在')
  }

  return formatNewsBase(news)
}

export async function incrementPublicNewsViews(id: string) {
  const result = await prisma.news.updateMany({
    where: { id, status: NewsStatus.PUBLISHED },
    data: { views: { increment: 1 } },
  })

  if (result.count === 0) {
    throw createNotFoundError('新闻不存在')
  }

  const updated = await prisma.news.findUnique({
    where: { id },
    select: { views: true },
  })

  return { views: updated!.views }
}
