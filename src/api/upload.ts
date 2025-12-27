import http from '@/utils/http'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface UploadFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  isUsed: boolean
  newsId: string | null
  uploaderId: string
  createdAt: string
  updatedAt: string
}

export const uploadFile = (file: File, newsId?: string) => {
  const formData = new FormData()
  formData.append('file', file)
  if (newsId) formData.append('newsId', newsId)
  return http.post<ApiResponse<UploadFile>>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getUploadList = (newsId?: string) => {
  return http.get<ApiResponse<UploadFile[]>>('/upload/list', { params: { newsId } })
}

export const markFileUsed = (id: string, newsId: string) => {
  return http.patch<ApiResponse<UploadFile>>(`/upload/${id}/use`, { newsId })
}

export const markFileUnused = (id: string) => {
  return http.patch<ApiResponse<UploadFile>>(`/upload/${id}/unuse`)
}

export const deleteUploadFile = (id: string) => {
  return http.delete(`/upload/${id}`)
}

export const syncFileUsage = (newsId: string, usedUrls: string[]) => {
  return http.post('/upload/sync', { newsId, usedUrls })
}
