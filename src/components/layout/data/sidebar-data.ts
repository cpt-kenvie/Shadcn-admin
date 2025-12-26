import { Command } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Kenvie',
    email: 'admin@kenvie.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn 管理',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
  ],
  navGroups: [],
}
