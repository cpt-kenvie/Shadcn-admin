import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NewsPrimaryButtons } from './components/news-primary-buttons'
import { NewsTable } from './components/news-table'
import { newsColumns } from './components/news-columns'
import { NewsMutateDrawer } from './components/news-mutate-drawer'
import * as newsApi from '@/api/news'
import type { NewsItem } from '@/api/news'

export default function News() {
  const [createOpen, setCreateOpen] = useState(false)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['news'],
    queryFn: async () => {
      const response = await newsApi.getNews({ page: 1, pageSize: 50 })
      return response.data
    },
  })

  const items: NewsItem[] = data?.data?.items || []
  const total: number = data?.data?.total || 0

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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>新闻管理</h2>
            <p className='text-muted-foreground'>在这里维护新闻内容，共 {total} 条。</p>
          </div>
          <NewsPrimaryButtons onCreate={() => setCreateOpen(true)} onRefresh={refetch} />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <p>加载中...</p>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-destructive'>加载失败，请重试</p>
            </div>
          ) : (
            <NewsTable data={items} columns={newsColumns} />
          )}
        </div>
      </Main>

      <NewsMutateDrawer open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
