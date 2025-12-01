/**
 * 模块功能：角色管理页面
 * 最后修改：2025-11-29
 * 依赖项：@tanstack/react-query, @/api/roles
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { toast } from 'sonner'
import * as rolesApi from '@/api/roles'
import { RoleDialog } from './components/role-dialog'

export default function Roles() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // 获取角色列表
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await rolesApi.getAllRoles()
      return response.data
    },
  })

  const roles = data?.data || []

  const handleEdit = (role: any) => {
    setSelectedRole(role)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setSelectedRole(null)
    setDialogOpen(true)
  }

  const handleDeleteClick = (role: any) => {
    setRoleToDelete(role)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return

    setIsDeleting(true)
    try {
      await rolesApi.deleteRole(roleToDelete.id)
      toast.success('角色删除成功')
      refetch()
      setDeleteDialogOpen(false)
      setRoleToDelete(null)
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
            <h2 className='text-2xl font-bold tracking-tight'>角色管理</h2>
            <p className='text-muted-foreground'>
              管理系统角色和权限配置。共 {roles.length} 个角色
            </p>
          </div>
          <PermissionGuard action='CREATE' resource='role'>
            <Button onClick={handleCreate} className='space-x-1'>
              <IconPlus size={18} />
              <span>创建角色</span>
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
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {roles.map((role: any) => (
              <Card key={role.id} className='relative'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='flex items-center gap-2'>
                        {role.displayName}
                        {role.isSystem && (
                          <Badge variant='outline' className='text-xs'>
                            系统角色
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className='mt-1'>
                        {role.description || '暂无描述'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>用户数量</span>
                      <Badge variant='secondary'>{role.userCount || 0}</Badge>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>权限数量</span>
                      <Badge variant='secondary'>
                        {role.permissions?.length || 0}
                      </Badge>
                    </div>
                    <div className='flex gap-2 pt-2'>
                      <PermissionGuard action='UPDATE' resource='role'>
                        <Button
                          variant='outline'
                          size='sm'
                          className='flex-1'
                          onClick={() => handleEdit(role)}
                        >
                          编辑角色
                        </Button>
                      </PermissionGuard>
                      {!role.isSystem && (
                        <PermissionGuard action='DELETE' resource='role'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='text-destructive hover:bg-destructive hover:text-destructive-foreground'
                            onClick={() => handleDeleteClick(role)}
                          >
                            <IconTrash size={16} />
                          </Button>
                        </PermissionGuard>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>

      <RoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        role={selectedRole}
        onSuccess={refetch}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除角色</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除角色 <strong>{roleToDelete?.displayName}</strong> 吗？
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
