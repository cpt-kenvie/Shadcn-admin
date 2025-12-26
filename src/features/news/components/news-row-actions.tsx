import { useState } from 'react'
import { IconDots } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { NewsItem } from '@/api/news'
import { NewsMutateDrawer } from './news-mutate-drawer'
import { NewsDeleteDialog } from './news-delete-dialog'

export function NewsRowActions({ item }: { item: NewsItem }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon'>
            <IconDots className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-36'>
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>编辑</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDeleteOpen(true)} className='text-destructive'>
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NewsMutateDrawer open={editOpen} onOpenChange={setEditOpen} current={item} />
      <NewsDeleteDialog open={deleteOpen} onOpenChange={setDeleteOpen} current={item} />
    </>
  )
}

