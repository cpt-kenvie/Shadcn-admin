import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { NewsItem } from '@/api/news'
import { NewsRowActions } from './news-row-actions'

export const newsColumns: ColumnDef<NewsItem>[] = [
  {
    accessorKey: 'title',
    header: '标题',
    cell: ({ row }) => {
      const item = row.original
      const statusLabel =
        item.status === 'PUBLISHED' ? '已发布' : item.status === 'ARCHIVED' ? '归档' : '草稿'

      return (
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <span className='max-w-[32rem] truncate font-medium'>{item.title}</span>
            <Badge variant={item.status === 'PUBLISHED' ? 'default' : 'secondary'}>
              {statusLabel}
            </Badge>
          </div>
          <p className='text-muted-foreground max-w-[40rem] truncate text-sm'>
            {item.summary}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: 'author',
    header: '发布人',
    cell: ({ row }) => {
      const a = row.original.author
      return <span className='text-sm'>{a?.nickname || a?.username || '-'}</span>
    },
  },
  {
    accessorKey: 'publishedAt',
    header: '发布日期',
    cell: ({ row }) => {
      const publishedAt = row.original.publishedAt
      if (!publishedAt) return <span className='text-sm text-muted-foreground'>-</span>
      return <span className='text-sm'>{format(new Date(publishedAt), 'yyyy-MM-dd')}</span>
    },
  },
  {
    accessorKey: 'views',
    header: '浏览',
    cell: ({ row }) => <span className='text-sm'>{row.original.views}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => <NewsRowActions item={row.original} />,
  },
]

