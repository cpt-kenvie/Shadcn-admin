import { useEffect } from 'react'
import { useUserPreference } from '@/hooks/use-user-preference'
import { useFont } from '@/context/font-context'
import { useTheme } from '@/context/theme-context'
import { useAuth } from '@/stores/authStore'
import { fonts } from '@/config/fonts'

export function PreferenceInitializer() {
  const { user, accessToken } = useAuth()
  const { data: userPreference, isLoading } = useUserPreference()
  const { setFont } = useFont()
  const { setTheme } = useTheme()

  useEffect(() => {
    if ((!accessToken && !user) || isLoading || !userPreference?.data) return

    const { theme, font } = userPreference.data

    if (theme === 'light' || theme === 'dark') {
      setTheme(theme)
    }

    if (font) {
      const nextFont = fonts.find((f) => f === font)
      if (nextFont) setFont(nextFont)
    }
  }, [accessToken, user, isLoading, userPreference, setFont, setTheme])

  return null
}
