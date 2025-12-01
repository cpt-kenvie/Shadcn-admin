/**
 * 模块功能：路由创建/编辑对话框
 * 最后修改：2025-11-29
 * 依赖项：react-hook-form, zod, @/api/routes
 */

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import * as routesApi from '@/api/routes'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'

// 资源名称映射
const RESOURCE_LABELS: Record<string, string> = {
  user: '用户管理',
  role: '角色管理',
  permission: '权限管理',
  route: '路由管理',
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
  path: z.string().min(1, '路由路径不能为空').regex(/^\//, '路径必须以 / 开头'),
  name: z.string().min(1, '路由名称不能为空'),
  component: z.string().optional(),
  title: z.string().min(1, '标题不能为空'),
  icon: z.string().optional(),
  parentId: z.string().optional().nullable(),
  order: z.number().min(0, '排序不能小于0'),
  hidden: z.boolean(),
  permissions: z.array(z.string()),
})

type RouteForm = z.infer<typeof formSchema>

interface RouteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  route?: any
  onSuccess?: () => void
}

interface PermissionAction {
  action: string
  label: string
  permissionId: string
}

interface PermissionGroup {
  resource: string
  label: string
  actions: PermissionAction[]
}

export function RouteDialog({ open, onOpenChange, route, onSuccess }: RouteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!route

  // 获取所有权限
  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await permissionsApi.getAllPermissions()
      return response.data
    },
    enabled: open,
  })

  // 获取所有路由（用于选择父路由）
  const { data: routesData } = useQuery({
    queryKey: ['routes-flat'],
    queryFn: async () => {
      const response = await routesApi.getAllRoutesFlat()
      return response.data
    },
    enabled: open,
  })

  const allPermissions = permissionsData?.data || []
  const allRoutes = routesData?.data || []

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
  }, [] as PermissionGroup[])

  const form = useForm<RouteForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      path: '',
      name: '',
      component: '',
      title: '',
      icon: '',
      parentId: null,
      order: 0,
      hidden: false,
      permissions: [],
    },
  })

  // 当路由数据变化时更新表单
  useEffect(() => {
    if (route) {
      const permissionIds = route.permissions?.map((p: any) => `${p.resource}:${p.action}`) || []
      form.reset({
        path: route.path || '',
        name: route.name || '',
        component: route.component || '',
        title: route.title || '',
        icon: route.icon || '',
        parentId: route.parentId || null,
        order: route.order || 0,
        hidden: route.hidden || false,
        permissions: permissionIds,
      })
    } else {
      form.reset({
        path: '',
        name: '',
        component: '',
        title: '',
        icon: '',
        parentId: null,
        order: 0,
        hidden: false,
        permissions: [],
      })
    }
  }, [route, form, open])

  const onSubmit = async (values: RouteForm) => {
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
        await routesApi.updateRoute(route.id, {
          path: values.path,
          name: values.name,
          component: values.component || undefined,
          title: values.title,
          icon: values.icon || undefined,
          parentId: values.parentId || null,
          order: values.order,
          hidden: values.hidden,
          permissionIds,
        })
        toast.success('路由更新成功')
      } else {
        await routesApi.createRoute({
          path: values.path,
          name: values.name,
          component: values.component,
          title: values.title,
          icon: values.icon,
          parentId: values.parentId || null,
          order: values.order,
          hidden: values.hidden,
          permissionIds,
        })
        toast.success('路由创建成功')
      }

      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      const message = error.response?.data?.message || '操作失败，请重试'
      toast.error(message)
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

  // 过滤掉当前编辑的路由（避免循环引用）
  const availableParentRoutes = allRoutes.filter(r => !isEdit || r.id !== route?.id)

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isSubmitting) {
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{isEdit ? '编辑路由' : '创建路由'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '编辑路由信息和权限配置' : '创建新路由并分配权限'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <ScrollArea className='h-[500px] pr-4'>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='path'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>路由路径 *</FormLabel>
                        <FormControl>
                          <Input placeholder='例如：/users' {...field} />
                        </FormControl>
                        <FormDescription>路由的 URL 路径</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>路由名称 *</FormLabel>
                        <FormControl>
                          <Input placeholder='例如：users' {...field} />
                        </FormControl>
                        <FormDescription>路由的唯一标识符</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>标题 *</FormLabel>
                        <FormControl>
                          <Input placeholder='例如：用户管理' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='component'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>组件路径</FormLabel>
                        <FormControl>
                          <Input placeholder='例如：@/features/users' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='icon'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>图标</FormLabel>
                        <FormControl>
                          <Input placeholder='例如：👥' {...field} />
                        </FormControl>
                        <FormDescription>显示在菜单中的图标</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='order'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>排序 *</FormLabel>
                        <FormControl>
                          <Input
                            type='number'
                            placeholder='0'
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>数值越小越靠前</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='parentId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>父路由</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='无（顶级路由）' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='__none__'>无（顶级路由）</SelectItem>
                          {availableParentRoutes.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.title} ({r.path})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>选择父路由创建多级菜单</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='hidden'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>隐藏路由</FormLabel>
                        <FormDescription>
                          隐藏的路由不会在菜单中显示
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
                        <FormLabel className='text-base'>权限配置</FormLabel>
                        <FormDescription>
                          选择访问该路由需要的权限
                        </FormDescription>
                      </div>
                      <ScrollArea className='h-[200px] w-full rounded-md border p-4'>
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
              </div>
            </ScrollArea>

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
