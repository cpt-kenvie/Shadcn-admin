import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/news/$newsId/edit')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: '/news/create',
      search: { newsId: params.newsId },
    })
  },
  component: () => null,
})
