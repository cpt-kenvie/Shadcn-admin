/**
 * 模块功能：应用Logo组件
 * 最后修改：2025-12-26
 * 依赖项：@/components/ui/sidebar, @/hooks/use-system-config, @/context/theme-context
 */

import { useSidebar } from '@/components/ui/sidebar'
import { useTheme } from '@/context/theme-context'
import { useSystemConfig } from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'

interface AppLogoProps {
  className?: string
}

/**
 * @description 应用Logo组件，显示在侧边栏顶部，根据主题自动切换logo
 * @param {string} className - 额外的CSS类名
 * @returns {JSX.Element} Logo组件
 */
export function AppLogo({ className }: AppLogoProps) {
  const { state } = useSidebar()
  const { effectiveTheme } = useTheme()
  const { data: systemConfig } = useSystemConfig()
  const isCollapsed = state === 'collapsed'

  const defaultLightLogo = '/images/logo-black2.png'
  const defaultDarkLogo = '/images/logo-white2.png'

  const lightLogo = systemConfig.logoUrl
  const darkLogo = systemConfig.darkLogoUrl 
  const displayLogo = effectiveTheme === 'dark' ? darkLogo : lightLogo

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-3',
        isCollapsed && 'justify-center',
        className
      )}
    >
      <img
        src={displayLogo}
        alt='Logo'
        className={cn(
          'object-contain transition-all',
          isCollapsed ? 'h-8 w-8' : 'h-10 w-auto max-w-[180px]'
        )}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          const fallbackLogo = effectiveTheme === 'dark' ? defaultDarkLogo : defaultLightLogo
          if (target.src !== fallbackLogo) {
            target.src = fallbackLogo
          }
        }}
      />
    </div>
  )
}
