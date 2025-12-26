import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/news/new')({
  beforeLoad: () => {
    throw redirect({ to: '/news/create' })
  },
  component: () => null,
})
