/**
 * 模块功能：用户偏好设置初始化组件
 * 最后修改：2025-12-04
 * 依赖项：react, @/hooks/use-user-preference, @/context/font-context, @/context/theme-context
 */

import { useEffect } from 'react'
import { useUserPreference } from '@/hooks/use-user-preference'
import { useFont } from '@/context/font-context'
import { useTheme } from '@/context/theme-context'
import { useAuth } from '@/stores/authStore'

/**
 * @description 用户偏好设置初始化组件
 * 在用户登录后从后端加载偏好设置并应用到Context
 */
export function PreferenceInitializer() {
  const { isAuthenticated } = useAuth()
  const { data: userPreference, isLoading } = useUserPreference()
  const { setFont } = useFont()
  const { setTheme } = useTheme()

  useEffect(() => {
    // 只在用户已登录且数据加载完成后执行
    if (isAuthenticated && !isLoading && userPreference?.data) {
      const { theme, font } = userPreference.data

      // 应用主题设置（如果与当前不同）
      if (theme && (theme === 'light' || theme === 'dark')) {
        setTheme(theme)
      }

      // 应用字体设置（如果与当前不同）
      if (font) {
        setFont(font as any)
      }
    }
  }, [isAuthenticated, isLoading, userPreference, setFont, setTheme])

  // 这是一个纯逻辑组件，不渲染任何UI
  return null
}
