import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import NewsUpsert from '@/features/news/upsert'

export const Route = createFileRoute('/_authenticated/news/create')({
  validateSearch: (search) =>
    z
      .object({
        newsId: z.string().optional(),
      })
      .parse(search),
  component: NewsCreateRouteComponent,
})

function NewsCreateRouteComponent() {
  const { newsId } = Route.useSearch()
  return <NewsUpsert newsId={newsId} />
}
