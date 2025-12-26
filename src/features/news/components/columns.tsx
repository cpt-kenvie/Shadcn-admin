import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import type { NewsItem, NewsStatus } from '@/api/news'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from './data-table-column-header'
import { NewsRowActions } from './news-row-actions'

const statusLabel: Record<NewsStatus, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  ARCHIVED: '归档',
}

function statusBadgeVariant(status: NewsStatus) {
  if (status === 'PUBLISHED') return 'default'
  if (status === 'ARCHIVED') return 'outline'
  return 'secondary'
}

export const columns: ColumnDef<NewsItem>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='标题' />
    ),
    cell: ({ row }) => {
      const item = row.original
      return (
        <div className='space-y-1'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {item.title}
          </span>
          <p className='text-muted-foreground max-w-[40rem] truncate text-sm'>
            {item.summary}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const value = row.getValue('status') as NewsStatus
      return <Badge variant={statusBadgeVariant(value)}>{statusLabel[value]}</Badge>
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: 'author',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='发布人' />
    ),
    accessorFn: (row) => row.author?.nickname || row.author?.username || '-',
    cell: ({ row }) => <span className='text-sm'>{row.getValue('author')}</span>,
  },
  {
    accessorKey: 'publishedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='发布日期' />
    ),
    cell: ({ row }) => {
      const publishedAt = row.original.publishedAt
      if (!publishedAt) return <span className='text-sm text-muted-foreground'>-</span>
      return (
        <span className='text-sm'>{format(new Date(publishedAt), 'yyyy-MM-dd')}</span>
      )
    },
  },
  {
    accessorKey: 'views',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='浏览' />
    ),
    cell: ({ row }) => <span className='text-sm'>{row.original.views}</span>,
  },
  {
    id: 'actions',
    header: () => <div className='text-right'>操作</div>,
    cell: ({ row }) => <NewsRowActions item={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
]
