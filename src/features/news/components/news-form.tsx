import { useState } from 'react'
import { z } from 'zod'
import type { UseFormReturn } from 'react-hook-form'
import type { Editor } from '@tiptap/react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SelectDropdown } from '@/components/select-dropdown'
import { MarkdownEditor } from '@/components/markdown-editor'
import { TagInput } from '@/components/tag-input'
import { ImageUploader } from './image-uploader'
import { Button } from '@/components/ui/button'
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
  onEditorReady,
  newsId,
}: {
  form: UseFormReturn<NewsFormValues>
  formId: string
  onSubmit: (values: NewsFormValues) => void
  className?: string
  tagSuggestions?: string[]
  onEditorReady?: (editor: Editor) => void
  newsId?: string
}) {
  const [coverPickerOpen, setCoverPickerOpen] = useState(false)

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
                <div className='flex items-start gap-3'>
                  <div className='relative h-20 w-36 overflow-hidden rounded-md border bg-muted'>
                    {field.value ? (
                      <img src={field.value} alt='' className='h-full w-full object-cover' />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center text-xs text-muted-foreground'>
                        未选择
                      </div>
                    )}
                  </div>

                  <div className='flex flex-1 flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      <Dialog open={coverPickerOpen} onOpenChange={setCoverPickerOpen}>
                        <DialogTrigger asChild>
                          <Button type='button' variant='outline'>
                            {field.value ? '更换' : '选择'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className='sm:max-w-3xl'>
                          <DialogHeader>
                            <DialogTitle>选择头图</DialogTitle>
                          </DialogHeader>
                          <ImageUploader
                            newsId={newsId}
                            selectedUrl={field.value || undefined}
                            toastOnPick={false}
                            onPick={(url) => {
                              field.onChange(url)
                              setCoverPickerOpen(false)
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      {field.value && (
                        <Button type='button' variant='ghost' onClick={() => field.onChange('')}>
                          移除
                        </Button>
                      )}
                    </div>
                    <input type='hidden' {...field} />
                    {field.value && <div className='text-xs text-muted-foreground break-all'>{field.value}</div>}
                  </div>
                </div>
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
                  onEditorReady={onEditorReady}
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
