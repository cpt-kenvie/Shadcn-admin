/**
 * 模块功能：批量创建权限对话框
 * 最后修改：2025-11-29
 * 依赖项：react-hook-form, @tanstack/react-query, @/api/permissions
 */

import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import * as permissionsApi from '@/api/permissions'

interface BatchCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const PERMISSION_ACTIONS = [
  { value: 'CREATE', label: '创建 (CREATE)', description: '创建新资源' },
  { value: 'READ', label: '查看 (READ)', description: '查看资源信息' },
  { value: 'UPDATE', label: '更新 (UPDATE)', description: '修改资源信息' },
  { value: 'DELETE', label: '删除 (DELETE)', description: '删除资源' },
  { value: 'MANAGE', label: '管理 (MANAGE)', description: '完全管理权限' },
  { value: 'IMPORT', label: '导入 (IMPORT)', description: '批量导入资源' },
  { value: 'EXPORT', label: '导出 (EXPORT)', description: '导出资源数据' },
]

export function BatchCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: BatchCreateDialogProps) {
  const [selectedActions, setSelectedActions] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      resource: '',
    },
  })

  const batchCreateMutation = useMutation({
    mutationFn: permissionsApi.batchCreatePermissions,
    onSuccess: (response) => {
      const result = response.data.data
      if (result.success > 0) {
        toast.success(
          `批量创建完成！成功 ${result.success} 个，失败 ${result.failed} 个`
        )
        if (result.errors.length > 0) {
          console.error('创建失败的权限:', result.errors)
        }
      }
      onOpenChange(false)
      reset()
      setSelectedActions([])
      onSuccess()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || '批量创建失败，请重试'
      toast.error(message)
    },
  })

  const toggleAction = (actionValue: string) => {
    setSelectedActions((prev) =>
      prev.includes(actionValue)
        ? prev.filter((a) => a !== actionValue)
        : [...prev, actionValue]
    )
  }

  const selectAll = () => {
    if (selectedActions.length === PERMISSION_ACTIONS.length) {
      setSelectedActions([])
    } else {
      setSelectedActions(PERMISSION_ACTIONS.map((a) => a.value))
    }
  }

  const onSubmit = (data: any) => {
    if (selectedActions.length === 0) {
      toast.error('请至少选择一个操作类型')
      return
    }

    const permissions = selectedActions.map((action) => ({
      resource: data.resource,
      action,
      description: `${action} ${data.resource}`,
    }))

    batchCreateMutation.mutate({ permissions })
  }

  const isLoading = batchCreateMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!isLoading) {
          onOpenChange(newOpen)
          if (!newOpen) {
            reset()
            setSelectedActions([])
          }
        }
      }}
    >
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle>批量创建权限</DialogTitle>
          <DialogDescription>
            为单个资源快速创建多个操作权限
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='resource'>
              资源名称 <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='resource'
              placeholder='例如: article, product, category'
              {...register('resource', {
                required: '资源名称不能为空',
                pattern: {
                  value: /^[a-z0-9_]+$/,
                  message: '只能包含小写字母、数字和下划线',
                },
              })}
              disabled={isLoading}
            />
            {errors.resource && (
              <p className='text-sm text-red-500'>{errors.resource.message}</p>
            )}
          </div>

          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>
                选择操作类型 <span className='text-red-500'>*</span>
              </Label>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={selectAll}
                disabled={isLoading}
              >
                {selectedActions.length === PERMISSION_ACTIONS.length
                  ? '取消全选'
                  : '全选'}
              </Button>
            </div>

            <ScrollArea className='h-[240px] rounded-md border p-4'>
              <div className='space-y-3'>
                {PERMISSION_ACTIONS.map((action) => (
                  <div
                    key={action.value}
                    className='flex items-start space-x-3 rounded-lg p-2 hover:bg-muted/50'
                  >
                    <Checkbox
                      id={action.value}
                      checked={selectedActions.includes(action.value)}
                      onCheckedChange={() => toggleAction(action.value)}
                      disabled={isLoading}
                    />
                    <div className='flex-1 space-y-1'>
                      <label
                        htmlFor={action.value}
                        className='cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        {action.label}
                      </label>
                      <p className='text-xs text-muted-foreground'>
                        {action.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {selectedActions.length === 0 && (
              <p className='text-sm text-muted-foreground'>
                已选择 0 个操作，请至少选择一个
              </p>
            )}
            {selectedActions.length > 0 && (
              <p className='text-sm text-muted-foreground'>
                已选择 {selectedActions.length} 个操作，将创建{' '}
                {selectedActions.length} 个权限
              </p>
            )}
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
            <Button
              type='submit'
              disabled={isLoading || selectedActions.length === 0}
            >
              {isLoading ? '创建中...' : `创建 ${selectedActions.length} 个权限`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
