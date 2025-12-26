import { useMemo } from 'react'
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

const formId = 'news-upsert-form'

export default function NewsUpsert({ newsId }: { newsId?: string }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const isEdit = !!newsId

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
        content: '',
      }
    }
    return {
      title: current.title,
      summary: current.summary,
      status: current.status,
      coverImageUrl: current.coverImageUrl || '',
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
      } else {
        navigate({ to: '/news' })
      }
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
                contentRows={20}
                className='space-y-6'
              />
            </CardContent>
          </Card>
        )}
      </Main>
    </>
  )
}

