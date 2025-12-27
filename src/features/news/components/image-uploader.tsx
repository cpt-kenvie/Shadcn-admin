import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import * as uploadApi from '@/api/upload'
import type { UploadFile } from '@/api/upload'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

function getFullUrl(url: string) {
  if (url.startsWith('http')) return url
  return `${API_BASE_URL}${url}`
}

interface ImageUploaderProps {
  newsId?: string
  onPick?: (url: string) => boolean | void
  toastOnPick?: boolean
  pickSuccessMessage?: string
  pickErrorMessage?: string
  selectedUrl?: string
  className?: string
}

export function ImageUploader({
  newsId,
  onPick,
  toastOnPick = true,
  pickSuccessMessage = '已选择图片',
  pickErrorMessage = '选择失败',
  selectedUrl,
  className,
}: ImageUploaderProps) {
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['uploads', newsId],
    queryFn: () => uploadApi.getUploadList(newsId).then((res) => res.data?.data ?? []),
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadApi.uploadFile(file, newsId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads', newsId] })
      toast.success('上传成功')
    },
    onError: () => toast.error('上传失败'),
  })

  const deleteMutation = useMutation({
    mutationFn: uploadApi.deleteUploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads', newsId] })
      toast.success('删除成功')
    },
    onError: () => toast.error('删除失败'),
  })

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true)
      for (const file of acceptedFiles) {
        await uploadMutation.mutateAsync(file)
      }
      setUploading(false)
    },
    [uploadMutation]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'] },
    maxSize: 5 * 1024 * 1024,
  })

  const handlePick = (file: UploadFile) => {
    if (!onPick) return

    const result = onPick(getFullUrl(file.url))
    const success = result === undefined ? true : result

    if (!toastOnPick) return
    if (success) toast.success(pickSuccessMessage)
    else toast.error(pickErrorMessage)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        ) : (
          <Upload className='h-8 w-8 text-muted-foreground' />
        )}
        <p className='text-sm text-muted-foreground'>
          {isDragActive ? '释放以上传' : '拖拽图片到此处，或点击选择'}
        </p>
        <p className='text-xs text-muted-foreground'>支持 JPEG、PNG、GIF、WebP、SVG，最大 5MB</p>
      </div>

      <div className='text-sm font-medium'>已上传文件</div>
      {isLoading ? (
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin' />
        </div>
      ) : files.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-8 text-muted-foreground'>
          <ImageIcon className='h-8 w-8 mb-2' />
          <p className='text-sm'>暂无上传文件</p>
        </div>
      ) : (
        <ScrollArea className='h-[300px]'>
          <div className='grid grid-cols-3 gap-2'>
            {files.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onPick={() => handlePick(file)}
                onDelete={() => handleDelete(file.id)}
                deleting={deleteMutation.isPending}
                selected={selectedUrl ? isSameUrl(selectedUrl, file.url) || isSameUrl(selectedUrl, getFullUrl(file.url)) : false}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

function isSameUrl(a: string, b: string) {
  const normalize = (v: string) => v.replace(/\/+$/, '')
  return normalize(a) === normalize(b)
}

function FileItem({
  file,
  onPick,
  onDelete,
  deleting,
  selected,
}: {
  file: UploadFile
  onPick: () => void
  onDelete: () => void
  deleting: boolean
  selected: boolean
}) {
  return (
    <div className={cn('group relative aspect-square rounded-md border overflow-hidden bg-muted', selected && 'ring-2 ring-primary')}>
      <img
        src={getFullUrl(file.url)}
        alt={file.originalName}
        className='h-full w-full object-cover cursor-pointer transition-opacity hover:opacity-80'
        onClick={onPick}
        title='点击选择'
      />
      {selected && (
        <div className='absolute bottom-1 left-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground'>
          <Check className='h-4 w-4' />
        </div>
      )}
      <Button
        variant='destructive'
        size='icon'
        className='absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        disabled={deleting}
      >
        <X className='h-3 w-3' />
      </Button>
      {file.isUsed && (
        <div className='absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-xs text-center py-0.5'>
          已使用
        </div>
      )}
    </div>
  )
}
