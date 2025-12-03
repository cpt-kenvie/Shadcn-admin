import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import {IconLoader2 } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import * as authApi from '@/api/auth'

type UserAuthFormProps = HTMLAttributes<HTMLFormElement>

const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: '请输入你的用户名' }),
    // .email({ message: '邮箱地址无效' }),
  password: z
    .string()
    .min(1, {
      message: '请输入你的密码',
    })
    .min(7, {
      message: '密码至少需要7个字符',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // 登录
      const loginRes = await authApi.login({
        username: data.username,
        password: data.password,
      })

      const loginData = loginRes.data
      if (loginData.success && loginData.data?.token) {
        const { token } = loginData.data

        // 保存 token
        localStorage.setItem('token', token)
        useAuthStore.getState().auth.setAccessToken(token)

        // 获取完整的用户信息（包括权限）
        const userRes = await authApi.getCurrentUser()
        const userData = userRes.data

        if (userData.success && userData.data) {
          useAuthStore.getState().auth.setUser(userData.data)
          toast.success(loginData.data.message || '登录成功')
          navigate({ to: '/' })
        } else {
          toast.error('获取用户信息失败')
        }
      } else {
        toast.error(loginData.message || '登录失败')
      }
    } catch (error: any) {
      // 错误已由拦截器统一处理，这里只需要更新状态
      console.error('登录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder='你的用户名' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute -top-0.5 right-0 text-sm font-medium hover:opacity-75'
              >
                忘记密码？
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' type='submit' disabled={isLoading} aria-busy={isLoading}>
          {isLoading && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
          {isLoading ? '登录中…' : '登录'}
        </Button>
      </form>
    </Form>
  )
}
