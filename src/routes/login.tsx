import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  // beforeLoad: () => {
  //   // 重定向到 /sign-in
  //   throw redirect({
  //     to: '/sign-in',
  //   })
  // },
})
