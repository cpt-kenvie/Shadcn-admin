import { createFileRoute, Outlet, useRouterState } from '@tanstack/react-router'
import News from '@/features/news'

export const Route = createFileRoute('/_authenticated/news')({
  component: NewsRouteComponent,
})

function NewsRouteComponent() {
  const isIndex = useRouterState({
    select: (s) => s.matches[s.matches.length - 1]?.routeId === Route.id,
  })

  return isIndex ? <News /> : <Outlet />
}
