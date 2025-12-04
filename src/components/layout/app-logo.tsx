/**
 * 模块功能：应用Logo组件
 * 最后修改：2025-12-03
 * 依赖项：@/components/ui/sidebar, @/hooks/use-system-config
 */

import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface AppLogoProps {
  logoUrl?: string
  className?: string
}

/**
 * @description 应用Logo组件，显示在侧边栏顶部
 * @param {string} logoUrl - Logo图片URL
 * @param {string} className - 额外的CSS类名
 * @returns {JSX.Element} Logo组件
 */
export function AppLogo({ logoUrl, className }: AppLogoProps) {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  const defaultLogo = 'https://img.keai.cool/2024/07/1/668a957f2a02f.png'
  const displayLogo = logoUrl || defaultLogo

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
          // 图片加载失败时使用默认logo
          const target = e.target as HTMLImageElement
          if (target.src !== defaultLogo) {
            target.src = defaultLogo
          }
        }}
      />
    </div>
  )
}
