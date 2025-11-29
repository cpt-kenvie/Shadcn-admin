/**
 * 模块功能：权限管理页面
 * 最后修改：2025-11-29
 * 依赖项：@tanstack/react-query, @/api/permissions
 */

import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import * as permissionsApi from '@/api/permissions'

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
  // 获取权限列表
  const { data, isLoading, error } = useQuery({
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
              查看系统所有权限配置。共 {permissions.length} 个权限
            </p>
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
                            <span className='text-muted-foreground'>
                              {permission.description || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className='text-sm text-muted-foreground'>
                              {new Date(permission.createdAt).toLocaleDateString('zh-CN')}
                            </span>
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
    </>
  )
}
