'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { User } from '../data/schema'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')

  const handleDelete = () => {
    if (value.trim() !== currentRow.username) return

    onOpenChange(false)
    showSubmittedData(currentRow, '以下用户已被删除：')
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{' '}
          删除用户
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            你确定要删除{' '}
            <span className='font-bold'>{currentRow.username}</span>?
            <br />
            此操作将永久删除具有{' '}
            <span className='font-bold'>
              {currentRow.role.toUpperCase()}
            </span>{' '}
            角色的用户。此操作无法撤销。
          </p>

          <Label className='my-2'>
            用户名:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='输入用户名以确认删除。'
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告！</AlertTitle>
            <AlertDescription>
              请小心，此操作无法撤销。
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      destructive
    />
  )
}
