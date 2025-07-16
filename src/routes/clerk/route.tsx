import { createFileRoute, Outlet } from '@tanstack/react-router'
import { IconExternalLink, IconKeyOff } from '@tabler/icons-react'
import { ClerkProvider } from '@clerk/clerk-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/clerk')({
  component: RouteComponent,
})

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

function RouteComponent() {
  if (!PUBLISHABLE_KEY) {
    return <MissingClerkPubKey />
  }

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl='/clerk/sign-in'
      signInUrl='/clerk/sign-in'
      signUpUrl='/clerk/sign-up'
      signInFallbackRedirectUrl='/clerk/user-management'
      signUpFallbackRedirectUrl='/clerk/user-management'
    >
      <Outlet />
    </ClerkProvider>
  )
}

function MissingClerkPubKey() {
  const codeBlock =
    'bg-foreground/10 rounded-sm py-0.5 px-1 text-xs text-foreground font-bold'
  return (
    <AuthenticatedLayout>
      <div className='bg-background flex h-16 justify-between p-4'>
        <SidebarTrigger variant='outline' className='scale-125 sm:scale-100' />
        <ThemeSwitch />
      </div>
      <Main className='flex flex-col items-center justify-start'>
        <div className='max-w-2xl'>
          <Alert>
            <IconKeyOff className='size-4' />
            <AlertTitle>未找到发布密钥！</AlertTitle>
            <AlertDescription>
              <p className='text-balance'>
                您需要从 Clerk 生成一个发布密钥，并将其放入 <code className={codeBlock}>.env</code> 文件中。
              </p>
            </AlertDescription>
          </Alert> 

          <h1 className='mt-4 text-2xl font-bold'>设置您的 Clerk API 密钥</h1>
          <div className='text-foreground/75 mt-4 flex flex-col gap-y-4'>
            <ol className='list-inside list-decimal space-y-1.5'>
              <li>
                在{' '}
                <a
                  href='https://go.clerk.com/GttUAaK'
                  target='_blank'
                  className='underline decoration-dashed underline-offset-4 hover:decoration-solid'
                >
                  Clerk
                  <sup>
                    <IconExternalLink className='inline-block size-4' />
                  </sup>
                </a>{' '}
                仪表板中，导航到 API 密钥页面。
              </li>
              <li>
                在 <strong>快速复制</strong> 部分，复制您的 Clerk 发布密钥。
              </li>
              <li>
                重命名 <code className={codeBlock}>.env.example</code> 为{' '}
                <code className={codeBlock}>.env</code>。
              </li>
              <li>
                将您的密钥粘贴到您的 <code className={codeBlock}>.env</code> 文件中。
              </li>
            </ol>
            <p>最终结果应类似于以下内容：</p>

            <div className='@container space-y-2 rounded-md bg-slate-800 px-3 py-3 text-sm text-slate-200'>
              <span className='pl-1'>.env</span>
              <pre className='overflow-auto overscroll-x-contain rounded bg-slate-950 px-2 py-1 text-xs'>
                <code>
                  <span className='before:text-slate-400 md:before:pr-2 md:before:content-["1."]'>
                    VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
                  </span>
                </code>
              </pre>
            </div>
          </div>

          <Separator className='my-4 w-full' />

          <Alert>
            <AlertTitle>Clerk 集成是可选的</AlertTitle>
            <AlertDescription>
              <p className='text-balance'>
                Clerk 集成完全位于{' '}
                <code className={codeBlock}>src/routes/clerk</code>。如果您计划使用 Clerk 作为您的认证服务，您可能希望将 <code className={codeBlock}>ClerkProvider</code> 放置在根路由中。
              </p>
              <p>
                但是，如果您不计划使用 Clerk，您可以安全地删除此目录和相关依赖项{' '}
                <code className={codeBlock}>@clerk/clerk-react</code>.
              </p>
              <p className='mt-2 text-sm'>
                此设置是模块化的，不会影响应用程序的其余部分。
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </Main>
    </AuthenticatedLayout>
  )
}
