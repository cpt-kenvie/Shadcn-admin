import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getTopViewedNews, type TopNewsItem } from '@/api/news'

export function RecentSales() {
  const [items, setItems] = useState<TopNewsItem[]>([])

  useEffect(() => {
    getTopViewedNews(5).then((res) => {
      if (res.data.success) {
        setItems(res.data.data)
      }
    })
  }, [])

  return (
    <div className='space-y-8'>
      {items.map((item) => (
        <div key={item.id} className='flex items-center gap-4'>
          <Avatar className='h-9 w-9'>
            <AvatarImage src={item.author.avatar ?? ''} alt={item.author.nickname ?? item.author.username} />
            <AvatarFallback>{(item.author.nickname ?? item.author.username).slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className='flex flex-1 flex-wrap items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-sm leading-none font-medium line-clamp-1'>{item.title}</p>
              <p className='text-muted-foreground text-sm'>{item.author.nickname ?? item.author.username}</p>
            </div>
            <div className='font-medium'>{item.views.toLocaleString()} 浏览</div>
          </div>
        </div>
      ))}
    </div>
  )
}
