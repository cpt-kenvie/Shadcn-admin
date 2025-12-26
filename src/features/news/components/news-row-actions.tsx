import { IconEdit, IconTrash } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import type { NewsItem } from '@/api/news'
import { Button } from '@/components/ui/button'
import { useNews } from '../context/news-context'

export function NewsRowActions({ item }: { item: NewsItem }) {
  const { setOpen, setCurrentRow } = useNews()

  return (
    <div className='flex justify-end gap-2'>
      <Button variant='ghost' size='sm' asChild>
        <Link to='/news/create' search={{ newsId: item.id }} aria-label='编辑' title='编辑'>
          <IconEdit size={16} />
        </Link>
      </Button>
      <Button
        variant='ghost'
        size='sm'
        className='text-destructive hover:bg-destructive hover:text-destructive-foreground'
        onClick={() => {
          setCurrentRow(item)
          setOpen('delete')
        }}
      >
        <IconTrash size={16} />
      </Button>
    </div>
  )
}
