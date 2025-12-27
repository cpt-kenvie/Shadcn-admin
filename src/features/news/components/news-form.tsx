import { z } from 'zod'
import type { UseFormReturn } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { MarkdownEditor } from '@/components/markdown-editor'
import { TagInput } from '@/components/tag-input'
import type { NewsStatus } from '@/api/news'

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
  tags: z.array(z.string()),
  content: z.string().min(1, '请输入内容（Markdown）'),
})

export type NewsFormValues = z.infer<typeof newsFormSchema>

export function NewsForm({
  form,
  formId,
  onSubmit,
  className,
  tagSuggestions = [],
}: {
  form: UseFormReturn<NewsFormValues>
  formId: string
  onSubmit: (values: NewsFormValues) => void
  className?: string
  tagSuggestions?: string[]
}) {
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
          name='tags'
          render={({ field }) => (
            <FormItem className='space-y-1'>
              <FormLabel>标签</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  suggestions={tagSuggestions}
                  placeholder='输入标签后按回车添加'
                />
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
              <FormControl>
                <MarkdownEditor
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  height={400}
                  placeholder='# 标题\n\n正文...'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
