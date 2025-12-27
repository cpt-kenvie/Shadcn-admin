import { useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import * as newsApi from '@/api/news'
import type { CreateNewsRequest, UpdateNewsRequest } from '@/api/news'
import { NewsForm, newsFormSchema, type NewsFormValues } from './components/news-form'
import { ImageUploader } from './components/image-uploader'
import type { Editor } from '@tiptap/react'

const formId = 'news-upsert-form'

type MarkdownStorage = {
  markdown?: { getMarkdown?: () => string }
}

function getMarkdownFromEditor(editor: Editor) {
  const storage = editor.storage as unknown as MarkdownStorage
  return storage.markdown?.getMarkdown?.()
}

export default function NewsUpsert({ newsId }: { newsId?: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const isEdit = !!newsId
  const editorRef = useRef<Editor | null>(null)
  const lastSelectionRef = useRef<{ from: number; to: number } | null>(null)

  const insertImageToEditor = (url: string) => {
    const editor = editorRef.current
    if (!editor || editor.isDestroyed) {
      if (import.meta.env.DEV) {
        console.info('[news:insertImage] editor missing/destroyed', { hasEditor: !!editor, isDestroyed: editor?.isDestroyed })
      }
      return false
    }

    const range = lastSelectionRef.current ?? { from: editor.state.selection.from, to: editor.state.selection.to }

    const maxPos = editor.state.doc.content.size
    const from = Math.max(0, Math.min(range.from, maxPos))
    const to = Math.max(0, Math.min(range.to, maxPos))

    if (import.meta.env.DEV) {
      console.info('[news:insertImage] start', {
        url,
        editable: editor.isEditable,
        from,
        to,
        currentSelection: { from: editor.state.selection.from, to: editor.state.selection.to },
        lastSelection: lastSelectionRef.current,
        canSetImage: editor.can().setImage({ src: url, alt: '' }),
      })
    }

    const inserted = editor.chain().focus().setTextSelection({ from, to }).setImage({ src: url, alt: '' }).run()

    if (import.meta.env.DEV) {
      console.info('[news:insertImage] result', {
        inserted,
        selectionAfter: { from: editor.state.selection.from, to: editor.state.selection.to },
        markdown: getMarkdownFromEditor(editor),
      })
    }
    if (inserted) return true

    editor.commands.focus('end')
    const insertedAtEnd = editor.commands.setImage({ src: url, alt: '' })
    if (import.meta.env.DEV) {
      console.info('[news:insertImage] fallback(end)', {
        insertedAtEnd,
        selectionAfter: { from: editor.state.selection.from, to: editor.state.selection.to },
        markdown: getMarkdownFromEditor(editor),
      })
    }
    return insertedAtEnd
  }

  const { data: tagsData } = useQuery({
    queryKey: ['news-tags'],
    queryFn: newsApi.getNewsTags,
  })
  const tagSuggestions = tagsData?.data ?? []

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['news', newsId],
    enabled: isEdit,
    queryFn: async () => {
      const response = await newsApi.getNewsById(newsId!)
      return response.data
    },
  })

  const current = data?.data

  const defaultValues = useMemo<NewsFormValues>(() => {
    if (!current) {
      return {
        title: '',
        summary: '',
        status: 'DRAFT',
        coverImageUrl: '',
        tags: [],
        content: '',
      }
    }
    return {
      title: current.title,
      summary: current.summary,
      status: current.status,
      coverImageUrl: current.coverImageUrl || '',
      tags: current.tags || [],
      content: current.content || '',
    }
  }, [current])

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues,
    values: defaultValues,
  })

  const mutation = useMutation({
    mutationFn: async (values: NewsFormValues) => {
      const payloadBase = {
        title: values.title.trim(),
        summary: values.summary.trim(),
        content: values.content,
        status: values.status,
        coverImageUrl: values.coverImageUrl?.trim() ? values.coverImageUrl.trim() : null,
        tags: values.tags,
      }

      if (isEdit) {
        const payload: UpdateNewsRequest = payloadBase
        return newsApi.updateNews(newsId!, payload)
      }

      const payload: CreateNewsRequest = payloadBase
      return newsApi.createNews(payload)
    },
    onSuccess: async () => {
      toast.success(isEdit ? '更新成功' : '创建成功')
      await queryClient.invalidateQueries({ queryKey: ['news'] })
      if (isEdit) {
        await queryClient.invalidateQueries({ queryKey: ['news', newsId] })
      }
      navigate({ to: '/news/list' })
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || (isEdit ? '更新失败，请重试' : '创建失败，请重试')
      toast.error(message)
    },
  })

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{isEdit ? '编辑新闻' : '新建新闻'}</h2>
            <p className='text-muted-foreground'>支持 Markdown 编辑与预览</p>
          </div>
          <div className='flex items-center gap-2'>
            <Button asChild variant='outline'>
              <Link to='/news'>返回</Link>
            </Button>
            <Button form={formId} type='submit' disabled={mutation.isPending || (isEdit && (isLoading || !current))}>
              保存
            </Button>
          </div>
        </div>

        {isEdit && isLoading ? (
          <div className='space-y-4'>
            <Skeleton className='h-10 w-[360px]' />
            <div className='rounded-md border p-6'>
              <div className='space-y-3'>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className='h-10 w-full' />
                ))}
              </div>
            </div>
          </div>
        ) : isEdit && error ? (
          <Alert variant='destructive'>
            <AlertTitle>加载失败</AlertTitle>
            <AlertDescription className='flex items-center justify-between gap-3'>
              <p>请检查网络或稍后重试。</p>
              <Button variant='outline' onClick={() => refetch()}>
                重试
              </Button>
            </AlertDescription>
          </Alert>
        ) : isEdit && !current ? (
          <Alert variant='destructive'>
            <AlertTitle>未找到新闻</AlertTitle>
            <AlertDescription className='flex items-center justify-between gap-3'>
              <p>该新闻可能已被删除。</p>
              <Button variant='outline' onClick={() => navigate({ to: '/news' })}>
                返回列表
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]'>
            <Card>
              <CardHeader>
                <CardTitle>内容</CardTitle>
                <CardDescription>填写标题、摘要、状态与正文内容。</CardDescription>
              </CardHeader>
              <CardContent>
                <NewsForm
                  form={form}
                  formId={formId}
                  onSubmit={(values) => mutation.mutate(values)}
                  tagSuggestions={tagSuggestions}
                  className='space-y-6'
                  newsId={newsId}
                  onEditorReady={(editor) => {
                    if (editorRef.current === editor) return
                    editorRef.current = editor
                    const syncSelection = () => {
                      lastSelectionRef.current = { from: editor.state.selection.from, to: editor.state.selection.to }
                    }

                    syncSelection()
                    editor.on('selectionUpdate', syncSelection)
                    editor.on('transaction', syncSelection)
                    editor.on('blur', syncSelection)
                    editor.on('destroy', () => {
                      if (editorRef.current === editor) {
                        editorRef.current = null
                        lastSelectionRef.current = null
                      }
                    })

                    if (import.meta.env.DEV) {
                      console.info('[news:editor] ready', { editable: editor.isEditable })
                    }
                  }}
                />
              </CardContent>
            </Card>
            <Card className='h-fit'>
              <CardHeader>
                <CardTitle>图片上传</CardTitle>
                <CardDescription>点击图片插入到编辑器</CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUploader
                  newsId={newsId}
                  pickSuccessMessage='已插入图片'
                  pickErrorMessage='插入失败'
                  onPick={(url) => {
                    return insertImageToEditor(url)
                  }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </Main>
    </>
  )
}

