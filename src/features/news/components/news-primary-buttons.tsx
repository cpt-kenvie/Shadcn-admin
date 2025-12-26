import { IconPlus, IconRefresh } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function NewsPrimaryButtons({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className='flex gap-2'>
      <Button variant='outline' className='space-x-1' onClick={onRefresh}>
        <span>刷新</span> <IconRefresh size={18} />
      </Button>
      <Button asChild className='space-x-1'>
        <Link to='/news/create'>
          <span>新建</span>
          <IconPlus size={18} />
        </Link>
      </Button>
    </div>
  )
}
