/**
 * 模块功能：动态侧边栏数据 - 根据后端菜单API生成
 * 最后修改：2025-11-29
 * 依赖项：@/api/menus, @tabler/icons-react
 */

import { IconLayoutDashboard } from '@tabler/icons-react'
import type { MenuItem } from '@/api/menus'
import type { NavGroup, NavItem } from '../types'
import { ICON_MAP } from './icon-map'

/**
 * @description 获取图标组件
 * @param {string | null} iconName 图标名称
 * @returns {React.ElementType | undefined} 图标组件
 */
function getIcon(iconName: string | null): React.ElementType | undefined {
  if (!iconName) return undefined
  return ICON_MAP[iconName] || IconLayoutDashboard
}

/**
 * @description 将后端菜单数据转换为侧边栏导航项
 * @param {MenuItem} menuItem 菜单项
 * @returns {NavItem} 导航项
 */
function convertMenuItemToNavItem(menuItem: MenuItem): NavItem {
  const hasChildren = menuItem.children && menuItem.children.length > 0

  if (hasChildren) {
    // 有子菜单
    return {
      title: menuItem.title,
      icon: getIcon(menuItem.icon),
      items: menuItem.children!.map((child) => ({
        title: child.title,
        url: child.path as any,
        icon: getIcon(child.icon),
      })),
    }
  } else {
    // 无子菜单
    return {
      title: menuItem.title,
      url: menuItem.path as any,
      icon: getIcon(menuItem.icon),
    }
  }
}

/**
 * @description 将后端菜单数据转换为侧边栏导航组
 * @param {MenuItem[]} menus 菜单列表
 * @returns {NavGroup[]} 导航组列表
 */
export function convertMenusToNavGroups(menus: MenuItem[]): NavGroup[] {
  if (!menus || menus.length === 0) {
    return []
  }

  // 简单实现：将所有菜单放在一个默认组中
  // 你可以根据需要自定义分组逻辑
  return [
    {
      title: '系统菜单',
      items: menus.map(convertMenuItemToNavItem),
    },
  ]
}

/**
 * @description 从菜单数据获取侧边栏数据
 * @param {MenuItem[]} menus 菜单列表
 * @param {Object} user 用户信息
 * @returns {Object} 侧边栏数据
 */
export function getSidebarDataFromMenus(
  menus: MenuItem[],
  user?: { name?: string; email?: string; avatar?: string }
) {
  return {
    user: user || {
      name: '用户',
      email: 'user@example.com',
      avatar: '/avatars/default.jpg',
    },
    teams: [
      {
        name: 'Shadcn 管理',
        logo: IconLayoutDashboard,
        plan: 'Vite + ShadcnUI',
      },
    ],
    navGroups: convertMenusToNavGroups(menus),
  }
}
