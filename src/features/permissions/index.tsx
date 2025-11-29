/**
 * 模块功能：权限管理页面
 * 最后修改：2025-11-29
 * 依赖项：@tanstack/react-query, @/api/permissions
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PermissionGuard } from '@/components/permission-guard'
import {
  IconPlus,
  IconFolderPlus,
  IconEdit,
  IconTrash,
  IconInfoCircle,
} from '@tabler/icons-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { toast } from 'sonner'
import * as permissionsApi from '@/api/permissions'
import { PermissionDialog } from './components/permission-dialog'
import { BatchCreateDialog } from './components/batch-create-dialog'

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

const getActionBadgeVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (action) {
    case 'READ':
      return 'secondary'
    case 'CREATE':
      return 'default'
    case 'UPDATE':
      return 'outline'
    case 'DELETE':
      return 'destructive'
    default:
      return 'outline'
  }
}

export default function Permissions() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [batchDialogOpen, setBatchDialogOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permissionToDelete, setPermissionToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 获取权限列表
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await permissionsApi.getAllPermissions()
      return response.data
    },
  })

  const permissions = data?.data || []

  // 按资源分组
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = []
    }
    acc[permission.resource].push(permission)
    return acc
  }, {} as Record<string, any[]>)

  const handleCreate = () => {
    setSelectedPermission(null)
    setDialogOpen(true)
  }

  const handleEdit = (permission: any) => {
    setSelectedPermission(permission)
    setDialogOpen(true)
  }

  const handleDeleteClick = (permission: any) => {
    setPermissionToDelete(permission)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!permissionToDelete) return

    setIsDeleting(true)
    try {
      await permissionsApi.deletePermission(permissionToDelete.id)
      toast.success('权限删除成功')
      refetch()
      setDeleteDialogOpen(false)
      setPermissionToDelete(null)
    } catch (error: any) {
      const message = error.response?.data?.message || '删除失败，请重试'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-6 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>权限管理</h2>
            <p className='text-muted-foreground'>
              管理系统权限配置。共 {permissions.length} 个权限
            </p>
          </div>
          <div className='flex gap-2'>
            <PermissionGuard action='CREATE' resource='permission'>
              <Button onClick={handleCreate} variant='outline' className='space-x-1'>
                <IconPlus size={18} />
                <span>创建权限</span>
              </Button>
            </PermissionGuard>
            <PermissionGuard action='CREATE' resource='permission'>
              <Button onClick={() => setBatchDialogOpen(true)} className='space-x-1'>
                <IconFolderPlus size={18} />
                <span>批量创建</span>
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <p>加载中...</p>
          </div>
        ) : error ? (
          <div className='flex items-center justify-center py-8'>
            <p className='text-red-500'>加载失败，请重试</p>
          </div>
        ) : (
          <div className='space-y-6'>
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <Card key={resource}>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    {getResourceLabel(resource)}
                    <Badge variant='outline'>{perms.length} 个权限</Badge>
                  </CardTitle>
                  <CardDescription>
                    资源标识：<code className='rounded bg-muted px-2 py-1'>{resource}</code>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>操作</TableHead>
                        <TableHead>权限标识</TableHead>
                        <TableHead>描述</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead className='text-right'>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {perms.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(permission.action)}>
                              {getActionLabel(permission.action)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <code className='rounded bg-muted px-2 py-1 text-sm'>
                              {permission.resource}:{permission.action}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <span className='text-muted-foreground'>
                                {permission.description || '-'}
                              </span>
                              {permission.conditions && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <IconInfoCircle
                                        size={14}
                                        className='text-muted-foreground'
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>包含条件限制</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm text-muted-foreground'>
                              {new Date(permission.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex justify-end gap-2'>
                              <PermissionGuard action='UPDATE' resource='permission'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleEdit(permission)}
                                >
                                  <IconEdit size={16} />
                                </Button>
                              </PermissionGuard>
                              <PermissionGuard action='DELETE' resource='permission'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleDeleteClick(permission)}
                                  className='text-destructive hover:bg-destructive/10'
                                >
                                  <IconTrash size={16} />
                                </Button>
                              </PermissionGuard>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}

            {Object.keys(groupedPermissions).length === 0 && (
              <div className='flex items-center justify-center py-12 text-muted-foreground'>
                暂无权限数据
              </div>
            )}
          </div>
        )}
      </Main>

      <PermissionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        permission={selectedPermission}
        onSuccess={refetch}
      />

      <BatchCreateDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        onSuccess={refetch}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除权限</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除权限{' '}
              <strong>
                {permissionToDelete?.resource}:{permissionToDelete?.action}
              </strong>{' '}
              吗？
              <br />
              此操作无法撤销，如果权限正在使用中将无法删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
