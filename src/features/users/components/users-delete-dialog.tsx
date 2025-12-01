/**
 * 模块功能：用户删除对话框
 * 最后修改：2025-11-29
 * 依赖项：react, @tabler/icons-react, sonner
 */

'use client'

import { useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import * as usersApi from '@/api/users'
import type { User } from '@/api/users'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
  onSuccess?: () => void
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: Props) {
  const [value, setValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (value.trim() !== currentRow.username) {
      toast.error('用户名输入不正确')
      return
    }

    setIsDeleting(true)
    try {
      await usersApi.deleteUser(currentRow.id)
      toast.success(`用户 ${currentRow.username} 已被删除`)
      onOpenChange(false)
      setValue('')
      onSuccess?.()
    } catch (error: any) {
      // 错误已由拦截器处理
      console.error('删除失败:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(state) => {
        if (!isDeleting) {
          onOpenChange(state)
          if (!state) {
            setValue('')
          }
        }
      }}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.username || isDeleting}
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
              {currentRow.roles?.[0]?.displayName || currentRow.role}
            </span>{' '}
            角色的用户。此操作无法撤销。
          </p>

          <Label className='my-2'>
            用户名:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='输入用户名以确认删除'
              disabled={isDeleting}
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
      confirmText={isDeleting ? '删除中...' : '删除'}
      destructive
    />
  )
}
