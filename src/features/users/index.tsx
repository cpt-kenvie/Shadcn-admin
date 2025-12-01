import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { columns } from './components/users-columns'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersTable } from './components/users-table'
import UsersProvider from './context/users-context'
import * as usersApi from '@/api/users'

export default function Users() {
  const [page] = useState(1)
  const [pageSize] = useState(20)

  // 从 API 获取用户列表
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: async () => {
      const response = await usersApi.getUsers({ page, pageSize })
      return response.data
    },
  })

  const userList = data?.data?.items || []
  const total = data?.data?.total || 0

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>用户列表</h2>
            <p className='text-muted-foreground'>
              在这里管理你的用户及其角色。共 {total} 个用户
            </p>
          </div>
          <UsersPrimaryButtons onRefresh={refetch} />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <p>加载中...</p>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-red-500'>加载失败，请重试</p>
            </div>
          ) : (
            <UsersTable data={userList} columns={columns} />
          )}
        </div>
      </Main>

      <UsersDialogs onSuccess={refetch} />
    </UsersProvider>
  )
}
