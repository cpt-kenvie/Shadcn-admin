import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'sonner'
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
import * as authApi from '@/api/auth'

const securityFormSchema = z
  .object({
    currentPassword: z.string().min(1, { message: '请输入当前密码' }),
    newPassword: z
      .string()
      .min(6, { message: '新密码至少6个字符' })
      .max(50, { message: '新密码不能超过50个字符' }),
    confirmPassword: z.string().min(1, { message: '请确认新密码' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: '新密码不能与当前密码相同',
    path: ['newPassword'],
  })

type SecurityFormValues = z.infer<typeof securityFormSchema>

export default function SecurityForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: SecurityFormValues) => {
    setIsSubmitting(true)
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success('密码修改成功，请重新登录')
      localStorage.clear()
      window.location.href = 'http://localhost:8888/sign-in'
    } catch (error: any) {
      toast.error(error.response?.data?.message || '密码修改失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <FormField
          control={form.control}
          name='currentPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>当前密码</FormLabel>
              <FormControl>
                <Input type='password' placeholder='请输入当前密码' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='newPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>新密码</FormLabel>
              <FormControl>
                <Input type='password' placeholder='请输入新密码' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>确认新密码</FormLabel>
              <FormControl>
                <Input type='password' placeholder='请再次输入新密码' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? '修改中...' : '修改密码'}
        </Button>
      </form>
    </Form>
  )
}
