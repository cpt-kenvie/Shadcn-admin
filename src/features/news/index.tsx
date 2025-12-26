import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { columns } from './components/columns'
import { DataTable } from './components/data-table'
import { NewsDialogs } from './components/news-dialogs'
import { NewsPrimaryButtons } from './components/news-primary-buttons'
import NewsProvider from './context/news-context'
import * as newsApi from '@/api/news'
import type { NewsItem } from '@/api/news'

export default function News() {
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
    <NewsProvider>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>新闻管理</h2>
            <p className='text-muted-foreground'>在这里维护新闻内容，共 {total} 条。</p>
          </div>
          <NewsPrimaryButtons onRefresh={refetch} />
        </div>

        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {isLoading ? (
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Skeleton className='h-8 w-[260px]' />
                <Skeleton className='h-8 w-[140px]' />
              </div>
              <div className='rounded-md border'>
                <div className='space-y-2 p-4'>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className='h-10 w-full' />
                  ))}
                </div>
              </div>
            </div>
          ) : error ? (
            <Alert variant='destructive'>
              <AlertTitle>加载失败</AlertTitle>
              <AlertDescription className='flex items-center justify-between gap-3'>
                <p>请检查网络或稍后重试。</p>
                <Button variant='outline' onClick={() => refetch()}>
                  重试
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <DataTable data={items} columns={columns} />
          )}
        </div>
      </Main>

      <NewsDialogs />
    </NewsProvider>
  )
}
