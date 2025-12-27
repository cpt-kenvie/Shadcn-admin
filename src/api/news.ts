import http from '@/utils/http'

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface NewsAuthor {
  id: string
  username: string
  nickname: string | null
  avatar: string | null
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  content?: string
  coverImageUrl: string | null
  firstImageUrl: string | null
  heroImageUrl: string | null
  tags: string[]
  status: NewsStatus
  publishedAt: string | null
  views: number
  createdAt: string
  updatedAt: string
  author?: NewsAuthor
  updatedBy?: NewsAuthor
}

export interface GetNewsParams {
  page?: number
  pageSize?: number
  search?: string
  status?: NewsStatus
}

export interface CreateNewsRequest {
  title: string
  summary: string
  content: string
  coverImageUrl?: string | null
  tags?: string[]
  status?: NewsStatus
}

export interface UpdateNewsRequest {
  title?: string
  summary?: string
  content?: string
  coverImageUrl?: string | null
  tags?: string[]
  status?: NewsStatus
}

export const getNews = (params?: GetNewsParams) => {
  return http.get('/news', { params })
}

export const getNewsById = (id: string) => {
  return http.get(`/news/${id}`)
}

export const createNews = (data: CreateNewsRequest) => {
  return http.post('/news', data)
}

export const updateNews = (id: string, data: UpdateNewsRequest) => {
  return http.put(`/news/${id}`, data)
}

export const deleteNews = (id: string) => {
  return http.delete(`/news/${id}`)
}

export interface NewsStats {
  totalViews: number
  todayViews: number
  todayGrowth: number
  monthlyViews: number
  monthlyGrowth: number
}

export interface ViewsTrendItem {
  name: string
  total: number
}

export interface TopNewsItem {
  id: string
  title: string
  views: number
  publishedAt: string | null
  author: NewsAuthor
}

export const getNewsStats = () => {
  return http.get<ApiResponse<NewsStats>>('/news/stats')
}

export const getNewsViewsTrend = (days?: number) => {
  return http.get<ApiResponse<ViewsTrendItem[]>>('/news/stats/trend', { params: { days } })
}

export const getTopViewedNews = (limit?: number) => {
  return http.get<ApiResponse<TopNewsItem[]>>('/news/stats/top', { params: { limit } })
}

export const getNewsTags = () => {
  return http.get<string[]>('/news/tags')
}

