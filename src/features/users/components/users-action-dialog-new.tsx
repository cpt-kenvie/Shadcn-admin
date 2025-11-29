/**
 * 模块功能：用户创建/编辑对话框
 * 最后修改：2025-11-29
 * 依赖项：react-hook-form, zod, @tanstack/react-query
 */

'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import * as usersApi from '@/api/users'
import * as rolesApi from '@/api/roles'
import type { User } from '@/api/users'

const formSchema = z.object({
  firstName: z.string().min(1, { message: '名字是必填的' }),
  lastName: z.string().min(1, { message: '姓氏是必填的' }),
  username: z.string().min(1, { message: '用户名是必填的' }),
  phoneNumber: z.string().optional(),
  email: z
    .string()
    .email({ message: '邮箱无效' })
    .optional()
    .or(z.literal('')),
  password: z.string().min(8, { message: '密码至少8个字符' }),
  roleId: z.string().min(1, { message: '角色是必填的' }),
})

type UserForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const isEdit = !!currentRow
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 获取角色列表
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await rolesApi.getAllRoles()
      return response.data
    },
    enabled: open,
  })

  const roles = rolesData?.data || []

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      roleId: '',
      phoneNumber: '',
      password: '',
    },
  })

  // 重置表单当打开/关闭对话框时
  useEffect(() => {
    if (open && !isEdit) {
      form.reset({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        roleId: '',
        phoneNumber: '',
        password: '',
      })
    }
  }, [open, isEdit, form])

  const onSubmit = async (values: UserForm) => {
    setIsSubmitting(true)
    try {
      if (isEdit) {
        // TODO: 更新用户
        toast.success('用户更新成功')
      } else {
        // 创建用户
        await usersApi.createUser({
          username: values.username,
          email: values.email || undefined,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
          phoneNumber: values.phoneNumber || undefined,
          roleIds: [values.roleId],
        })
        toast.success('用户创建成功')
      }

      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      // 错误已由拦截器处理
      console.error('提交失败:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!isSubmitting) {
          form.reset()
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? '编辑用户' : '添加新用户'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '在这里更新用户信息。' : '在这里创建新用户。'}
            点击保存完成操作。
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-auto max-h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      用户名 *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john_doe'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      名字 *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='John'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      姓氏 *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Doe'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      邮箱
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='john.doe@example.com'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      电话号码
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='+86 138-0000-0000'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='roleId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      角色 *
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className='col-span-4'>
                        <SelectTrigger>
                          <SelectValue placeholder='选择角色' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      密码 *
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='至少8个字符'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button type='submit' form='user-form' disabled={isSubmitting}>
            {isSubmitting ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
