import { z } from 'zod'
import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import type { NewsStatus } from '@/api/news'
import { renderMarkdown } from '@/utils/markdown'

export const newsStatusItems: Array<{ label: string; value: NewsStatus }> = [
  { label: '草稿', value: 'DRAFT' },
  { label: '已发布', value: 'PUBLISHED' },
  { label: '归档', value: 'ARCHIVED' },
]

export const newsFormSchema = z.object({
  title: z.string().min(1, '请输入标题'),
  summary: z.string().min(1, '请输入摘要'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  coverImageUrl: z.string().optional(),
  content: z.string().min(1, '请输入内容（Markdown）'),
})

export type NewsFormValues = z.infer<typeof newsFormSchema>

const markdownPreviewClassName =
  'rounded-md border p-4 text-sm leading-6 [&_h1]:mt-6 [&_h1]:text-xl [&_h2]:mt-6 [&_h2]:text-lg [&_h3]:mt-4 [&_h3]:text-base [&_p]:my-3 [&_pre]:my-3 [&_pre]:overflow-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_img]:my-3 [&_img]:max-w-full [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5'

export function NewsForm({
  form,
  formId,
  onSubmit,
  contentRows = 14,
  className,
}: {
  form: UseFormReturn<NewsFormValues>
  formId: string
  onSubmit: (values: NewsFormValues) => void
  contentRows?: number
  className?: string
}) {
  const content = form.watch('content') || ''
  const contentPreview = useMemo(() => renderMarkdown(content), [content])

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)} className={className}>
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
                items={newsStatusItems}
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
                    <Textarea {...field} rows={contentRows} placeholder='# 标题\n\n正文...' />
                  </FormControl>
                  <FormMessage />
                </TabsContent>
                <TabsContent value='preview' className='mt-3'>
                  <div
                    className={markdownPreviewClassName}
                    dangerouslySetInnerHTML={{ __html: contentPreview }}
                  />
                </TabsContent>
              </Tabs>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
