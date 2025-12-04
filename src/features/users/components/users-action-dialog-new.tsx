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

const formSchema = z
  .object({
    nickname: z
      .string()
      .min(1, { message: '昵称是必填的' })
      .max(100, { message: '昵称不能超过100个字符' }),
    avatar: z
      .string()
      .url({ message: '头像地址格式无效' })
      .optional()
      .or(z.literal('')),
    username: z
      .string()
      .min(3, { message: '用户名至少3个字符' })
      .max(50, { message: '用户名不能超过50个字符' })
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message: '用户名只能包含字母、数字、下划线和连字符',
      }),
    phoneNumber: z.string().optional(),
    email: z
      .string()
      .email({ message: '邮箱格式无效' })
      .optional()
      .or(z.literal('')),
    password: z.string().optional(),
    roleId: z.string().min(1, { message: '角色是必填的' }),
    isEdit: z.boolean().optional(),
  })
  .superRefine(({ isEdit, password }, ctx) => {
    // 新建用户时密码是必填的
    if (!isEdit && (!password || password.length < 8)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '密码至少8个字符',
        path: ['password'],
      })
    }
    // 编辑用户时，如果填写了密码，必须至少8个字符
    if (isEdit && password && password.length > 0 && password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '密码至少8个字符',
        path: ['password'],
      })
    }
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
      nickname: '',
      avatar: '',
      username: '',
      email: '',
      roleId: '',
      phoneNumber: '',
      password: '',
      isEdit: false,
    },
  })

  // 重置表单当打开/关闭对话框时
  useEffect(() => {
    if (open) {
      if (isEdit && currentRow) {
        // 编辑模式：回填用户数据
        form.reset({
          nickname: currentRow.nickname || '',
          avatar: currentRow.avatar || '',
          username: currentRow.username,
          email: currentRow.email || '',
          roleId: currentRow.roles?.[0]?.id || '',
          phoneNumber: currentRow.phoneNumber || '',
          password: '',
          isEdit: true,
        })
      } else {
        // 新建模式：清空表单
        form.reset({
          nickname: '',
          avatar: '',
          username: '',
          email: '',
          roleId: '',
          phoneNumber: '',
          password: '',
          isEdit: false,
        })
      }
    }
  }, [open, isEdit, currentRow, form])

  const onSubmit = async (values: UserForm) => {
    setIsSubmitting(true)
    try {
      if (isEdit && currentRow) {
        // 更新用户
        const updateData: usersApi.UpdateUserRequest = {
          email: values.email || undefined,
          nickname: values.nickname,
          avatar: values.avatar || undefined,
          phoneNumber: values.phoneNumber || undefined,
          roleIds: [values.roleId],
        }

        // 如果填写了新密码，包含在更新数据中
        if (values.password && values.password.trim().length > 0) {
          updateData.password = values.password
        }

        await usersApi.updateUser(currentRow.id, updateData)
        toast.success('用户更新成功')
      } else {
        // 创建用户
        if (!values.password) {
          toast.error('创建用户时密码是必填的')
          return
        }

        await usersApi.createUser({
          username: values.username,
          email: values.email || undefined,
          password: values.password,
          nickname: values.nickname,
          avatar: values.avatar || undefined,
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
                        disabled={isEdit}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='nickname'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      昵称 *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='张三'
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
                name='avatar'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-right'>
                      头像地址
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='https://example.com/avatar.jpg'
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
                      {isEdit ? '新密码' : '密码 *'}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={
                          isEdit
                            ? '留空表示不修改密码'
                            : '至少8个字符'
                        }
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
