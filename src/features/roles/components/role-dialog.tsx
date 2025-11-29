/**
 * 模块功能：角色创建/编辑对话框
 * 最后修改：2025-11-29
 * 依赖项：react-hook-form, zod, @/api/roles
 */

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as rolesApi from '@/api/roles'
import * as permissionsApi from '@/api/permissions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// 资源名称映射
const RESOURCE_LABELS: Record<string, string> = {
  user: '用户管理',
  role: '角色管理',
  permission: '权限管理',
  dashboard: '仪表盘',
  settings: '系统设置',
}

// 操作名称映射
const ACTION_LABELS: Record<string, string> = {
  CREATE: '创建',
  READ: '查看',
  UPDATE: '更新',
  DELETE: '删除',
  MANAGE: '管理',
  IMPORT: '导入',
  EXPORT: '导出',
}

const getResourceLabel = (resource: string) => {
  return RESOURCE_LABELS[resource] || resource
}

const getActionLabel = (action: string) => {
  return ACTION_LABELS[action] || action
}

const formSchema = z.object({
  name: z.string().min(1, '角色名称不能为空'),
  displayName: z.string().min(1, '显示名称不能为空'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, '至少选择一个权限'),
})

type RoleForm = z.infer<typeof formSchema>

interface RoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: any
  onSuccess?: () => void
}

export function RoleDialog({ open, onOpenChange, role, onSuccess }: RoleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!role

  // 获取所有权限
  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await permissionsApi.getAllPermissions()
      return response.data
    },
    enabled: open,
  })

  const allPermissions = permissionsData?.data || []

  // 根据实际数据库权限动态生成分组
  const permissionGroups = allPermissions.reduce((groups, permission) => {
    const existing = groups.find(g => g.resource === permission.resource)
    if (existing) {
      existing.actions.push({
        action: permission.action,
        label: getActionLabel(permission.action),
        permissionId: permission.id,
      })
    } else {
      groups.push({
        resource: permission.resource,
        label: getResourceLabel(permission.resource),
        actions: [{
          action: permission.action,
          label: getActionLabel(permission.action),
          permissionId: permission.id,
        }],
      })
    }
    return groups
  }, [] as any[])

  const form = useForm<RoleForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
      permissions: [],
    },
  })

  // 当角色数据变化时更新表单
  useEffect(() => {
    if (role) {
      const permissionIds = role.permissions?.map((p: any) => `${p.resource}:${p.action}`) || []
      form.reset({
        name: role.name || '',
        displayName: role.displayName || '',
        description: role.description || '',
        permissions: permissionIds,
      })
    } else {
      form.reset({
        name: '',
        displayName: '',
        description: '',
        permissions: [],
      })
    }
  }, [role, form, open])

  const onSubmit = async (values: RoleForm) => {
    setIsSubmitting(true)
    try {
      // 将 permission ID 字符串转换为实际的权限 ID
      const permissionIds = values.permissions
        .map(p => {
          const [resource, action] = p.split(':')
          const permission = allPermissions.find(
            perm => perm.resource === resource && perm.action === action
          )
          return permission?.id
        })
        .filter(Boolean) as string[]

      if (isEdit) {
        await rolesApi.updateRole(role.id, {
          displayName: values.displayName,
          description: values.description,
          permissionIds,
        })
        toast.success('角色更新成功')
      } else {
        await rolesApi.createRole({
          name: values.name,
          displayName: values.displayName,
          description: values.description,
          permissionIds,
        })
        toast.success('角色创建成功')
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('提交失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    const current = form.getValues('permissions')
    if (checked) {
      form.setValue('permissions', [...current, permissionId])
    } else {
      form.setValue('permissions', current.filter(id => id !== permissionId))
    }
  }

  const handleResourceToggle = (resource: string, actions: any[], checked: boolean) => {
    const current = form.getValues('permissions')
    const resourcePermissions = actions.map(a => `${resource}:${a.action}`)

    if (checked) {
      // 添加该资源的所有权限
      const newPermissions = [...new Set([...current, ...resourcePermissions])]
      form.setValue('permissions', newPermissions)
    } else {
      // 移除该资源的所有权限
      const filtered = current.filter(p => !p.startsWith(`${resource}:`))
      form.setValue('permissions', filtered)
    }
  }

  const selectedPermissions = form.watch('permissions') || []

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isSubmitting) {
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑角色' : '创建角色'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '编辑角色信息和权限配置' : '创建新角色并分配权限'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色名称 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='例如：manager'
                      {...field}
                      disabled={isEdit}
                    />
                  </FormControl>
                  <FormDescription>
                    角色的唯一标识符，创建后不可修改
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='displayName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>显示名称 *</FormLabel>
                  <FormControl>
                    <Input placeholder='例如：经理' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='角色描述...'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name='permissions'
              render={() => (
                <FormItem>
                  <div className='mb-4'>
                    <FormLabel className='text-base'>权限配置 *</FormLabel>
                    <FormDescription>
                      选择该角色拥有的权限
                    </FormDescription>
                  </div>
                  <ScrollArea className='h-[300px] w-full rounded-md border p-4'>
                    <div className='space-y-4'>
                      {permissionGroups.map((group) => {
                        const groupPermissions = group.actions.map(a => `${group.resource}:${a.action}`)
                        const allSelected = groupPermissions.every(p => selectedPermissions.includes(p))
                        const someSelected = groupPermissions.some(p => selectedPermissions.includes(p))

                        return (
                          <div key={group.resource} className='space-y-2'>
                            <div className='flex items-center space-x-2'>
                              <Checkbox
                                checked={allSelected}
                                onCheckedChange={(checked) =>
                                  handleResourceToggle(group.resource, group.actions, checked as boolean)
                                }
                                className={someSelected && !allSelected ? 'data-[state=checked]:bg-muted' : ''}
                              />
                              <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                                {group.label}
                              </label>
                            </div>
                            <div className='ml-6 grid grid-cols-3 gap-2'>
                              {group.actions.map((action) => {
                                const permissionId = `${group.resource}:${action.action}`
                                return (
                                  <div key={permissionId} className='flex items-center space-x-2'>
                                    <Checkbox
                                      checked={selectedPermissions.includes(permissionId)}
                                      onCheckedChange={(checked) =>
                                        handlePermissionToggle(permissionId, checked as boolean)
                                      }
                                      id={permissionId}
                                    />
                                    <label
                                      htmlFor={permissionId}
                                      className='text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                                    >
                                      {action.label}
                                    </label>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
