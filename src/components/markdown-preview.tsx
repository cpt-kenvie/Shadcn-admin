import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { renderMarkdown } from '@/utils/markdown'

const defaultClassName =
  'rounded-md border bg-background p-4 text-sm leading-6 ' +
  '[&_a]:text-primary [&_a]:underline-offset-4 [&_a:hover]:underline ' +
  '[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground ' +
  '[&_h1]:mt-6 [&_h1]:text-xl [&_h2]:mt-6 [&_h2]:text-lg [&_h3]:mt-4 [&_h3]:text-base ' +
  '[&_hr]:my-4 [&_hr]:border-border [&_p]:my-3 ' +
  '[&_pre]:my-3 [&_pre]:overflow-auto [&_pre]:rounded-md [&_pre]:border [&_pre]:bg-muted/40 [&_pre]:p-3 ' +
  '[&_code]:rounded [&_code]:border [&_code]:bg-muted/40 [&_code]:px-1 [&_code]:py-0.5 ' +
  '[&_img]:my-3 [&_img]:max-w-full ' +
  '[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-5'

export function MarkdownPreview({
  value,
  className,
  emptyText = '暂无预览内容',
}: {
  value: string
  className?: string
  emptyText?: string
}) {
  const html = useMemo(() => renderMarkdown(value), [value])

  if (!value.trim()) {
    return (
      <div className={cn(defaultClassName, 'text-muted-foreground', className)}>
        {emptyText}
      </div>
    )
  }

  return (
    <div
      className={cn(defaultClassName, className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
