import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import * as newsApi from '@/api/news'
import type { CreateNewsRequest, NewsItem, UpdateNewsRequest } from '@/api/news'
import { NewsForm, newsFormSchema, type NewsFormValues } from './news-form'

const formId = 'news-form'

export function NewsMutateDrawer({
  open,
  onOpenChange,
  current,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  current?: NewsItem
}) {
  const queryClient = useQueryClient()
  const isUpdate = !!current

  const defaultValues = useMemo<NewsFormValues>(() => {
    if (current) {
      return {
        title: current.title,
        summary: current.summary,
        status: current.status,
        coverImageUrl: current.coverImageUrl || '',
        tags: current.tags || [],
        content: current.content || '',
      }
    }
    return {
      title: '',
      summary: '',
      status: 'DRAFT',
      coverImageUrl: '',
      tags: [],
      content: '',
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

      if (isUpdate) {
        const payload: UpdateNewsRequest = payloadBase
        return newsApi.updateNews(current!.id, payload)
      }

      const payload: CreateNewsRequest = payloadBase
      return newsApi.createNews(payload)
    },
    onSuccess: async () => {
      toast.success(isUpdate ? '更新成功' : '创建成功')
      await queryClient.invalidateQueries({ queryKey: ['news'] })
      onOpenChange(false)
    },
  })

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) form.reset(defaultValues)
      }}
    >
      <SheetContent className='flex w-[92vw] flex-col sm:w-[70vw] sm:max-w-[70vw]'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? '编辑新闻' : '创建新闻'}</SheetTitle>
        </SheetHeader>

        <Separator />

        <NewsForm
          form={form}
          formId={formId}
          onSubmit={(values) => mutation.mutate(values)}
          className='flex-1 space-y-5 overflow-auto px-1'
        />

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={mutation.isPending}>
              关闭
            </Button>
          </SheetClose>
          <Button form={formId} type='submit' disabled={mutation.isPending}>
            保存
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

