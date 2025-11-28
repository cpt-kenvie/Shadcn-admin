/**
 * 页头主操作按钮：触发导入任务与创建任务的对话框。
 * 与 `useTasks` 上下文交互以打开对应的 UI。
 */
import { IconDownload, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useTasks } from '../context/tasks-context'

export function TasksPrimaryButtons() {
  const { setOpen } = useTasks()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>导入</span> <IconDownload size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
