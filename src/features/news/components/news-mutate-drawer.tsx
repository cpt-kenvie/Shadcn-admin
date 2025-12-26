import { z } from 'zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SelectDropdown } from '@/components/select-dropdown'
import * as newsApi from '@/api/news'
import type { CreateNewsRequest, NewsItem, NewsStatus, UpdateNewsRequest } from '@/api/news'
import { renderMarkdown } from '@/utils/markdown'

const statusItems: Array<{ label: string; value: NewsStatus }> = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '归档', value: 'ARCHIVED' },
]

const formSchema = z.object({
  title: z.string().min(1, '请输入标题'),
  summary: z.string().min(1, '请输入摘要'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  coverImageUrl: z.string().optional(),
  content: z.string().min(1, '请输入内容（Markdown）'),
})

type NewsFormValues = z.infer<typeof formSchema>

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
        content: current.content || '',
      }
    }
    return {
      title: '',
      summary: '',
      status: 'DRAFT',
      coverImageUrl: '',
      content: '',
    }
  }, [current])

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema),
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

  const contentPreview = renderMarkdown(form.watch('content') || '')

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) form.reset(defaultValues)
      }}
    >
      <SheetContent className='flex flex-col sm:max-w-2xl'>
        <SheetHeader className='text-left'>
          <SheetTitle>{isUpdate ? '编辑新闻' : '创建新闻'}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            id='news-form'
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className='flex-1 space-y-5 overflow-auto px-1'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>标题</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='请输入标题' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='summary'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>摘要</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder='用于列表展示的摘要' rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>状态</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='选择状态'
                    items={statusItems}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='coverImageUrl'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>头图（可选）</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='https://...' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='content'
              render={({ field }) => (
                <FormItem className='space-y-1'>
                  <FormLabel>内容（Markdown）</FormLabel>
                  <Tabs defaultValue='edit' className='w-full'>
                    <TabsList className='grid w-full grid-cols-2'>
                      <TabsTrigger value='edit'>编辑</TabsTrigger>
                      <TabsTrigger value='preview'>预览</TabsTrigger>
                    </TabsList>
                    <TabsContent value='edit' className='mt-3'>
                      <FormControl>
                        <Textarea {...field} rows={14} placeholder='# 标题\n\n正文...' />
                      </FormControl>
                      <FormMessage />
                    </TabsContent>
                    <TabsContent value='preview' className='mt-3'>
                      <div
                        className='rounded-md border p-4 text-sm leading-6 [&_h1]:mt-6 [&_h1]:text-xl [&_h2]:mt-6 [&_h2]:text-lg [&_h3]:mt-4 [&_h3]:text-base [&_p]:my-3 [&_pre]:my-3 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_img]:my-3 [&_img]:max-w-full [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5'
                        dangerouslySetInnerHTML={{ __html: contentPreview }}
                      />
                    </TabsContent>
                  </Tabs>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline' disabled={mutation.isPending}>
              关闭
            </Button>
          </SheetClose>
          <Button form='news-form' type='submit' disabled={mutation.isPending}>
            保存
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

