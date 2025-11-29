import {
  IconBarrierBlock,
  IconBrowserCheck,
  IconBug,
  IconChecklist,
  IconError404,
  IconHelp,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconMessages,
  IconNotification,
  IconPackages,
  IconPalette,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUserCog,
  IconUserOff,
  IconUsers,
  IconShield,
  IconKey,
  IconRoute,
} from '@tabler/icons-react'
import { AudioWaveform, Command, GalleryVerticalEnd } from 'lucide-react'
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
    {
      name: '艾克米公司',
      logo: GalleryVerticalEnd,
      plan: '企业版',
    },
    {
      name: '艾克米集团',
      logo: AudioWaveform,
      plan: '初创版',
    },
  ],
  navGroups: [
    {
      title: '常规',
      items: [
        {
          title: '仪表盘',
          url: '/',
          icon: IconLayoutDashboard,
        },
        {
          title: '任务',
          url: '/tasks',
          icon: IconChecklist,
        },
        {
          title: '应用',
          url: '/apps',
          icon: IconPackages,
        },
        {
          title: '聊天',
          url: '/chats',
          badge: '3',
          icon: IconMessages,
        },
      ],
    },
    {
      title: '系统管理',
      items: [
        {
          title: '用户管理',
          icon: IconUsers,
          items: [
            {
              title: '用户列表',
              url: '/users',
              icon: IconUsers,
            },
            {
              title: '角色管理',
              url: '/roles',
              icon: IconShield,
            },
            {
              title: '权限管理',
              url: '/permissions',
              icon: IconKey,
            },
          ],
        },
        {
          title: '路由管理',
          url: '/routes',
          icon: IconRoute,
        },
      ],
    },
    {
      title: '页面',
      items: [
        {
          title: '认证',
          icon: IconLockAccess,
          items: [
            {
              title: '登录',
              url: '/sign-in',
            },
            {
              title: '登录（双栏）',
              url: '/sign-in-2',
            },
            {
              title: '注册',
              url: '/sign-up',
            },
            {
              title: '忘记密码',
              url: '/forgot-password',
            },
            {
              title: '验证码',
              url: '/otp',
            },
          ],
        },
        {
          title: '错误',
          icon: IconBug,
          items: [
            {
              title: '未授权',
              url: '/401',
              icon: IconLock,
            },
            {
              title: '禁止访问',
              url: '/403',
              icon: IconUserOff,
            },
            {
              title: '未找到',
              url: '/404',
              icon: IconError404,
            },
            {
              title: '服务器内部错误',
              url: '/500',
              icon: IconServerOff,
            },
            {
              title: '维护中',
              url: '/503',
              icon: IconBarrierBlock,
            },
          ],
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          title: '设置',
          icon: IconSettings,
          items: [
            {
              title: '个人资料',
              url: '/settings',
              icon: IconUserCog,
            },
            {
              title: '账户',
              url: '/settings/account',
              icon: IconTool,
            },
            {
              title: '外观',
              url: '/settings/appearance',
              icon: IconPalette,
            },
            {
              title: '通知',
              url: '/settings/notifications',
              icon: IconNotification,
            },
            {
              title: '显示',
              url: '/settings/display',
              icon: IconBrowserCheck,
            },
          ],
        },
        {
          title: '帮助中心',
          url: '/help-center',
          icon: IconHelp,
        },
      ],
    },
  ],
}
