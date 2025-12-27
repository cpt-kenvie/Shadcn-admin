import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { fonts } from '@/config/fonts'
import { cn } from '@/lib/utils'
import { useFont } from '@/context/font-context'
import { useTheme } from '@/context/theme-context'
import { useSetSystemConfig, useSystemConfig } from '@/hooks/use-system-config'
import { useUserPreference, useUpdateUserPreference } from '@/hooks/use-user-preference'
import { Button, buttonVariants } from '@/components/ui/button'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const appearanceFormSchema = z.object({
  theme: z.enum(['light', 'dark', 'system'], {
    required_error: '请选择主题。',
  }),
  font: z.enum(fonts, {
    invalid_type_error: 'Select a font',
    required_error: '请选择字体。',
  }),
  logoUrl: z.string()
    .refine(
      (val) => !val || val.startsWith('/') || /^https?:\/\//.test(val),
      '请输入有效的URL或相对路径（以/开头）'
    )
    .optional()
    .or(z.literal('')),
  darkLogoUrl: z.string()
    .refine(
      (val) => !val || val.startsWith('/') || /^https?:\/\//.test(val),
      '请输入有效的URL或相对路径（以/开头）'
    )
    .optional()
    .or(z.literal('')),
})

type AppearanceFormValues = z.infer<typeof appearanceFormSchema>

export function AppearanceForm() {
  const { font, setFont } = useFont()
  const { theme, setTheme } = useTheme()
  const { data: systemConfig } = useSystemConfig()
  const { data: userPreference, isFetched } = useUserPreference()
  const setSystemConfigMutation = useSetSystemConfig()
  const updateUserPreferenceMutation = useUpdateUserPreference()

  const apiTheme = userPreference?.data?.theme as 'light' | 'dark' | 'system' | undefined
  const apiFont = userPreference?.data?.font as typeof font | undefined

  const form = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    values: isFetched ? {
      theme: apiTheme || theme,
      font: apiFont || font,
      logoUrl: systemConfig?.logoUrl || '',
      darkLogoUrl: systemConfig?.darkLogoUrl || '',
    } : undefined,
    defaultValues: {
      theme: theme as 'light' | 'dark' | 'system',
      font: font,
      logoUrl: '',
      darkLogoUrl: '',
    },
  })

  function onSubmit(data: AppearanceFormValues) {
    if (data.font != font) setFont(data.font)
    if (data.theme != theme) setTheme(data.theme)

    updateUserPreferenceMutation.mutate({
      theme: data.theme,
      font: data.font,
    })

    if (data.logoUrl !== systemConfig?.logoUrl) {
      setSystemConfigMutation.mutate({
        key: 'logoUrl',
        value: data.logoUrl || '',
        category: 'appearance',
        description: '浅色主题Logo地址',
      })
    }

    if (data.darkLogoUrl !== systemConfig?.darkLogoUrl) {
      setSystemConfigMutation.mutate({
        key: 'darkLogoUrl',
        value: data.darkLogoUrl || '',
        category: 'appearance',
        description: '深色主题Logo地址',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='logoUrl'
          render={({ field }) => (
            <FormItem>
              <FormLabel>浅色主题Logo地址</FormLabel>
              <FormControl>
                <Input
                  placeholder='https://example.com/logo.png 或 /images/logo-black.png'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                设置浅色主题下侧边栏顶部显示的Logo图片地址。留空使用默认Logo。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='darkLogoUrl'
          render={({ field }) => (
            <FormItem>
              <FormLabel>深色主题Logo地址</FormLabel>
              <FormControl>
                <Input
                  placeholder='https://example.com/dark-logo.png 或 /images/dark-logo.png'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                设置深色主题下侧边栏顶部显示的Logo图片地址。留空使用默认Logo。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='font'
          render={({ field }) => (
            <FormItem>
              <FormLabel>字体</FormLabel>
              <div className='relative w-max'>
                <FormControl>
                  <select
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-[200px] appearance-none font-normal capitalize',
                      'dark:bg-background dark:hover:bg-background'
                    )}
                    {...field}
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <ChevronDownIcon className='absolute top-2.5 right-3 h-4 w-4 opacity-50' />
              </div>
              <FormDescription>
                设置你希望在仪表盘上使用的字体。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='theme'
          render={({ field }) => (
            <FormItem className='space-y-1'>
              <FormLabel>主题</FormLabel>
              <FormDescription>
                选择仪表盘的主题。
              </FormDescription>
              <FormMessage />
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className='grid max-w-2xl grid-cols-3 gap-8 pt-2'
              >
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='light' className='sr-only' />
                    </FormControl>
                    <div className='border-muted hover:border-accent items-center rounded-md border-2 p-1'>
                      <div className='space-y-2 rounded-sm bg-[#ecedef] p-2'>
                        <div className='space-y-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-2 w-[80px] rounded-lg bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-white p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-[#ecedef]' />
                          <div className='h-2 w-[100px] rounded-lg bg-[#ecedef]' />
                        </div>
                      </div>
                    </div>
                    <span className='block w-full p-2 text-center font-normal'>
                      浅色
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='dark' className='sr-only' />
                    </FormControl>
                    <div className='border-muted bg-popover hover:bg-accent hover:text-accent-foreground items-center rounded-md border-2 p-1'>
                      <div className='space-y-2 rounded-sm bg-slate-950 p-2'>
                        <div className='space-y-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-2 w-[80px] rounded-lg bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-slate-400' />
                        </div>
                      </div>
                    </div>
                    <span className='block w-full p-2 text-center font-normal'>
                      深色
                    </span>
                  </FormLabel>
                </FormItem>
                <FormItem>
                  <FormLabel className='[&:has([data-state=checked])>div]:border-primary'>
                    <FormControl>
                      <RadioGroupItem value='system' className='sr-only' />
                    </FormControl>
                    <div className='border-muted hover:border-accent items-center rounded-md border-2 p-1'>
                      <div className='space-y-2 rounded-sm bg-gradient-to-r from-[#ecedef] to-slate-950 p-2'>
                        <div className='space-y-2 rounded-md bg-gradient-to-r from-white to-slate-800 p-2 shadow-xs'>
                          <div className='h-2 w-[80px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-gradient-to-r from-white to-slate-800 p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-gradient-to-r from-[#ecedef] to-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400' />
                        </div>
                        <div className='flex items-center space-x-2 rounded-md bg-gradient-to-r from-white to-slate-800 p-2 shadow-xs'>
                          <div className='h-4 w-4 rounded-full bg-gradient-to-r from-[#ecedef] to-slate-400' />
                          <div className='h-2 w-[100px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400' />
                        </div>
                      </div>
                    </div>
                    <span className='block w-full p-2 text-center font-normal'>
                      跟随系统
                    </span>
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormItem>
          )}
        />

        <Button type='submit'>更新偏好</Button>
      </form>
    </Form>
  )
}
