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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import * as newsApi from '@/api/news'
import type { CreateNewsRequest } from '@/api/news'
import { NewsForm, newsFormSchema, type NewsFormValues } from './components/news-form'

const formId = 'news-create-form'

export default function NewsCreate() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: tagsData } = useQuery({
    queryKey: ['news-tags'],
    queryFn: newsApi.getNewsTags,
  })
  const tagSuggestions = tagsData?.data ?? []

  const defaultValues = useMemo<NewsFormValues>(
    () => ({
      title: '',
      summary: '',
      status: 'DRAFT',
      coverImageUrl: '',
      tags: [],
      content: '',
    }),
    []
  )

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues,
    values: defaultValues,
  })

  const mutation = useMutation({
    mutationFn: async (values: NewsFormValues) => {
      const payload: CreateNewsRequest = {
        title: values.title.trim(),
        summary: values.summary.trim(),
        content: values.content,
        status: values.status,
        coverImageUrl: values.coverImageUrl?.trim() ? values.coverImageUrl.trim() : null,
        tags: values.tags,
      }
      return newsApi.createNews(payload)
    },
    onSuccess: async () => {
      toast.success('创建成功')
      await queryClient.invalidateQueries({ queryKey: ['news'] })
      navigate({ to: '/news/list' })
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || '创建失败，请重试'
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
            <h2 className='text-2xl font-bold tracking-tight'>新建新闻</h2>
            <p className='text-muted-foreground'>支持 Markdown 编辑与预览，建议先保存为草稿。</p>
          </div>
          <div className='flex items-center gap-2'>
            <Button asChild variant='outline'>
              <Link to='/news'>返回</Link>
            </Button>
            <Button form={formId} type='submit' disabled={mutation.isPending}>
              保存
            </Button>
          </div>
        </div>

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
            />
          </CardContent>
        </Card>
      </Main>
    </>
  )
}

