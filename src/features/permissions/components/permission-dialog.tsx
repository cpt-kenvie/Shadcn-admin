/**
 * 模块功能：权限创建/编辑对话框
 * 最后修改：2025-11-29
 * 依赖项：react-hook-form, @tanstack/react-query, @/api/permissions
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import * as permissionsApi from '@/api/permissions'

interface PermissionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  permission?: any
  onSuccess: () => void
}

const PERMISSION_ACTIONS = [
  { value: 'CREATE', label: '创建 (CREATE)' },
  { value: 'READ', label: '查看 (READ)' },
  { value: 'UPDATE', label: '更新 (UPDATE)' },
  { value: 'DELETE', label: '删除 (DELETE)' },
  { value: 'MANAGE', label: '管理 (MANAGE)' },
  { value: 'IMPORT', label: '导入 (IMPORT)' },
  { value: 'EXPORT', label: '导出 (EXPORT)' },
]

export function PermissionDialog({
  open,
  onOpenChange,
  permission,
  onSuccess,
}: PermissionDialogProps) {
  const [action, setAction] = useState<string>('')
  const isEdit = !!permission

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      resource: '',
      action: '',
      description: '',
    },
  })

  useEffect(() => {
    if (permission) {
      setValue('resource', permission.resource)
      setValue('action', permission.action)
      setValue('description', permission.description || '')
      setAction(permission.action)
    } else {
      reset()
      setAction('')
    }
  }, [permission, setValue, reset])

  const createMutation = useMutation({
    mutationFn: permissionsApi.createPermission,
    onSuccess: () => {
      toast.success('权限创建成功')
      onOpenChange(false)
      reset()
      onSuccess()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '创建失败，请重试'
      toast.error(message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      permissionsApi.updatePermission(id, data),
    onSuccess: () => {
      toast.success('权限更新成功')
      onOpenChange(false)
      reset()
      onSuccess()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '更新失败，请重试'
      toast.error(message)
    },
  })

  const onSubmit = (data: any) => {
    const payload = {
      ...data,
      action,
    }

    if (isEdit) {
      updateMutation.mutate({ id: permission.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑权限' : '创建权限'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改权限配置信息' : '创建新的权限配置'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='resource'>
              资源名称 <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='resource'
              placeholder='例如: user, article, order'
              {...register('resource', {
                required: '资源名称不能为空',
                pattern: {
                  value: /^[a-z0-9_]+$/,
                  message: '只能包含小写字母、数字和下划线',
                },
              })}
              disabled={isEdit || isLoading}
            />
            {errors.resource && (
              <p className='text-sm text-red-500'>{errors.resource.message}</p>
            )}
            <p className='text-xs text-muted-foreground'>
              使用小写字母、数字和下划线，例如: user, article_category
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='action'>
              操作类型 <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={action}
              onValueChange={setAction}
              disabled={isEdit || isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder='选择操作类型' />
              </SelectTrigger>
              <SelectContent>
                {PERMISSION_ACTIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!action && (
              <p className='text-sm text-red-500'>请选择操作类型</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>描述</Label>
            <Textarea
              id='description'
              placeholder='权限的用途说明'
              {...register('description')}
              disabled={isLoading}
              rows={3}
            />
            <p className='text-xs text-muted-foreground'>
              可选，描述此权限的用途和使用场景
            </p>
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button type='submit' disabled={isLoading || !action}>
              {isLoading
                ? isEdit
                  ? '更新中...'
                  : '创建中...'
                : isEdit
                  ? '更新权限'
                  : '创建权限'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
