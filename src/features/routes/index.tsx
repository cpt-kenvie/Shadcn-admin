/**
 * 模块功能：路由管理页面
 * 最后修改：2025-11-29
 * 依赖项：@tanstack/react-query, @/api/routes
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { IconPlus, IconTrash, IconEdit, IconEye, IconEyeOff } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import { PermissionGuard } from '@/components/permission-guard'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import * as routesApi from '@/api/routes'
import { RouteDialog } from './components/route-dialog'

export default function Routes() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [routeToDelete, setRouteToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 获取路由列表
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const response = await routesApi.getAllRoutesFlat()
      return response.data
    },
  })

  const routes = data?.data || []

  const handleEdit = (route: any) => {
    setSelectedRoute(route)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedRoute(null)
    setDialogOpen(true)
  }

  const handleDeleteClick = (route: any) => {
    setRouteToDelete(route)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!routeToDelete) return

    setIsDeleting(true)
    try {
      await routesApi.deleteRoute(routeToDelete.id)
      toast.success('路由删除成功')
      refetch()
      setDeleteDialogOpen(false)
      setRouteToDelete(null)
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
            <h2 className='text-2xl font-bold tracking-tight'>路由管理</h2>
            <p className='text-muted-foreground'>
              管理系统路由和权限配置。共 {routes.length} 条路由
            </p>
          </div>
          <PermissionGuard action='CREATE' resource='route'>
            <Button onClick={handleCreate} className='space-x-1'>
              <IconPlus size={18} />
              <span>创建路由</span>
            </Button>
          </PermissionGuard>
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
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>标题</TableHead>
                  <TableHead>路径</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>父路由</TableHead>
                  <TableHead>图标</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>权限数</TableHead>
                  <TableHead className='text-right'>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className='text-center text-muted-foreground'>
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  routes.map((route: any) => (
                    <TableRow key={route.id}>
                      <TableCell className='font-medium'>{route.title}</TableCell>
                      <TableCell>
                        <code className='rounded bg-muted px-2 py-1 text-sm'>
                          {route.path}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className='rounded bg-muted px-2 py-1 text-sm'>
                          {route.name}
                        </code>
                      </TableCell>
                      <TableCell>
                        {route.parent ? (
                          <Badge variant='outline'>{route.parent.title}</Badge>
                        ) : (
                          <span className='text-muted-foreground'>-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {route.icon ? (
                          <span className='text-lg'>{route.icon}</span>
                        ) : (
                          <span className='text-muted-foreground'>-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>{route.order}</Badge>
                      </TableCell>
                      <TableCell>
                        {route.hidden ? (
                          <Badge variant='outline' className='gap-1'>
                            <IconEyeOff size={14} />
                            隐藏
                          </Badge>
                        ) : (
                          <Badge variant='default' className='gap-1'>
                            <IconEye size={14} />
                            显示
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary'>{route.permissions?.length || 0}</Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <PermissionGuard action='UPDATE' resource='route'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleEdit(route)}
                            >
                              <IconEdit size={16} />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard action='DELETE' resource='route'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-destructive hover:bg-destructive hover:text-destructive-foreground'
                              onClick={() => handleDeleteClick(route)}
                            >
                              <IconTrash size={16} />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Main>

      <RouteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        route={selectedRoute}
        onSuccess={refetch}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除路由</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除路由 <strong>{routeToDelete?.title}</strong> 吗？
              <br />
              此操作无法撤销。
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
