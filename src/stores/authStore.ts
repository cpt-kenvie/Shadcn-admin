import Cookies from 'js-cookie'
import { create } from 'zustand'

const ACCESS_TOKEN = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'htec_access_token'

interface AuthUser {
  id: string
  username: string
  email: string | null
  nickname?: string | null
  avatar?: string | null
  bio?: string | null
  urls?: string[] | null
  birthDate?: string | null
  phoneNumber?: string | null
  status: string
  lastLogin: string | null
  loginCount: number
  createdAt: string
  updatedAt: string
  roles: Array<{
    id: string
    name: string
    displayName: string
  }>
  permissions: Array<{
    resource: string
    action: string
  }>
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = Cookies.get(ACCESS_TOKEN)
  const initToken = cookieState ? JSON.parse(cookieState) : ''

  // 尝试从 localStorage 恢复用户信息
  let initUser = null
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      initUser = JSON.parse(userStr)
    }
  } catch (e) {
    // 忽略解析错误
  }

  return {
    auth: {
      user: initUser,
      setUser: (user) => {
        // 保存用户信息到 localStorage
        if (user) {
          localStorage.setItem('user', JSON.stringify(user))
        } else {
          localStorage.removeItem('user')
        }
        set((state) => ({ ...state, auth: { ...state.auth, user } }))
      },
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})

export const useAuth = () => useAuthStore((state) => state.auth)
