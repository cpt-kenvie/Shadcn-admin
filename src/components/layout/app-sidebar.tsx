import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { TeamSwitcher } from '@/components/layout/team-switcher'
import { sidebarData } from './data/sidebar-data'
import { useUserMenus } from '@/hooks/use-user-menus'
import { getSidebarDataFromMenus } from './data/dynamic-sidebar-data'
import { useAuth } from '@/stores/authStore'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: menusData, isLoading } = useUserMenus()
  const { user } = useAuth()

  // 如果菜单数据加载中或失败，使用默认侧边栏数据
  const dynamicSidebarData = menusData?.data
    ? getSidebarDataFromMenus(menusData.data, {
        name: user?.username || '用户',
        email: user?.email || 'user@example.com',
        avatar: '/avatars/shadcn.jpg',
      })
    : sidebarData

  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={dynamicSidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className='flex items-center justify-center p-4'>
            <p className='text-sm text-muted-foreground'>加载菜单中...</p>
          </div>
        ) : (
          dynamicSidebarData.navGroups.map((props) => (
            <NavGroup key={props.title} {...props} />
          ))
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={dynamicSidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
