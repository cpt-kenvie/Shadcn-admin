import { z } from 'zod'
import { format } from 'date-fns'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useEffect } from 'react'
import { CalendarIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAuth, useAuthStore } from '@/stores/authStore'
import * as authApi from '@/api/auth'

const profileFormSchema = z.object({
  username: z.string().min(2, { message: '用户名至少为2个字符。' }),
  nickname: z
    .string()
    .min(2, {
      message: '昵称至少为2个字符。',
    })
    .max(100, {
      message: '昵称不能超过100个字符。',
    }),
  avatar: z
    .string()
    .url({ message: '请输入有效的头像地址。' })
    .optional()
    .or(z.literal('')),
  email: z
    .string({
      required_error: '请输入邮箱。',
    })
    .email()
    .optional()
    .or(z.literal('')),
  bio: z.string().max(500, { message: '个人简介不能超过500个字符。' }).optional().or(z.literal('')),
  birthDate: z.date().optional(),
  urls: z
    .array(
      z.object({
        value: z.string().url({ message: '请输入有效的网址。' }).optional().or(z.literal('')),
      })
    )
    .optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function ProfileForm() {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || '',
      nickname: user?.nickname || '',
      avatar: user?.avatar || '',
      email: user?.email || '',
      bio: user?.bio || '',
      birthDate: user?.birthDate ? new Date(user.birthDate) : undefined,
      urls: user?.urls?.map((url) => ({ value: url })) || [{ value: '' }],
    },
    mode: 'onChange',
  })

  // 当用户信息更新时，重置表单
  useEffect(() => {
    if (user) {
      form.reset({
        username: user.username || '',
        nickname: user.nickname || '',
        avatar: user.avatar || '',
        email: user.email || '',
        bio: user.bio || '',
        birthDate: user.birthDate ? new Date(user.birthDate) : undefined,
        urls: user.urls?.map((url) => ({ value: url })) || [{ value: '' }],
      })
    }
  }, [user, form])

  const { fields, append, remove } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  const onSubmit = async (values: ProfileFormValues) => {
    setIsSubmitting(true)
    try {
      const urls = values.urls
        ?.map((url) => url.value)
        .filter((url) => url && url.trim() !== '') as string[] || []

      const response = await authApi.updateProfile({
        nickname: values.nickname,
        avatar: values.avatar || undefined,
        email: values.email || undefined,
        bio: values.bio || undefined,
        birthDate: values.birthDate ? values.birthDate.toISOString().split('T')[0] : undefined,
        urls: urls.length > 0 ? urls : undefined,
        phoneNumber: user?.phoneNumber || undefined,
      })

      // 更新本地用户状态
      if (response.data?.data) {
        useAuthStore.getState().auth.setUser(response.data.data)
      }

      toast.success('资料更新成功')
    } catch (error: any) {
      console.error('更新资料失败:', error)
      toast.error(error.response?.data?.message || '更新资料失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>用户名</FormLabel>
              <FormControl>
                <Input placeholder='username' disabled {...field} />
              </FormControl>
              <FormDescription>
                这是你的登录用户名，不可更改。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='nickname'
          render={({ field }) => (
            <FormItem>
              <FormLabel>昵称</FormLabel>
              <FormControl>
                <Input placeholder='请输入昵称' {...field} />
              </FormControl>
              <FormDescription>
                这是你的公开显示名称，可以是真实姓名或昵称。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='avatar'
          render={({ field }) => (
            <FormItem>
              <FormLabel>头像地址</FormLabel>
              <FormControl>
                <Input placeholder='https://example.com/avatar.jpg' {...field} />
              </FormControl>
              <FormDescription>
                请输入头像图片的URL地址。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder='user@example.com' type='email' {...field} />
              </FormControl>
              <FormDescription>
                这是你的联系邮箱地址。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>个人简介</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='介绍一下你自己'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                简短介绍一下你自己，最多500个字符。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='birthDate'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>出生日期</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>选择日期</span>
                      )}
                      <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date: Date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                你的出生日期。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    网址
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    添加你的网站、博客或社交媒体链接。
                  </FormDescription>
                  <div className='flex gap-2'>
                    <FormControl className='flex-1'>
                      <Input placeholder='https://example.com' {...field} />
                    </FormControl>
                    {fields.length > 1 && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => remove(index)}
                      >
                        删除
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => append({ value: '' })}
          >
            添加网址
          </Button>
        </div>
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? '保存中...' : '更新资料'}
        </Button>
      </form>
    </Form>
  )
}
