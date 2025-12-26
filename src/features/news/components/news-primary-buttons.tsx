import { Button } from '@/components/ui/button'
import { IconPlus, IconRefresh } from '@tabler/icons-react'

export function NewsPrimaryButtons({
  onCreate,
  onRefresh,
}: {
  onCreate: () => void
  onRefresh: () => void
}) {
  return (
    <div className='flex items-center gap-2'>
      <Button variant='outline' onClick={onRefresh}>
        <IconRefresh className='mr-2 h-4 w-4' />
        刷新
      </Button>
      <Button onClick={onCreate}>
        <IconPlus className='mr-2 h-4 w-4' />
        新建
      </Button>
    </div>
  )
}

