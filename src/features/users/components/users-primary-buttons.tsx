import { IconMailPlus, IconUserPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/components/permission-guard'
import { useUsers } from '../context/users-context'

interface UsersPrimaryButtonsProps {
  onRefresh?: () => void
}

export function UsersPrimaryButtons({ onRefresh }: UsersPrimaryButtonsProps) {
  const { setOpen } = useUsers()

  return (
    <div className='flex gap-2'>
      {/* 邀请用户按钮 - 需要 IMPORT user 权限 */}
      <PermissionGuard action='IMPORT' resource='user'>
        <Button
          variant='outline'
          className='space-x-1'
          onClick={() => setOpen('invite')}
        >
          <span>邀请用户</span> <IconMailPlus size={18} />
        </Button>
      </PermissionGuard>

      {/* 添加用户按钮 - 需要 CREATE user 权限 */}
      <PermissionGuard action='CREATE' resource='user'>
        <Button className='space-x-1' onClick={() => setOpen('add')}>
          <span>添加用户</span> <IconUserPlus size={18} />
        </Button>
      </PermissionGuard>
    </div>
  )
}
