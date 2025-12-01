/**
 * 模块功能：菜单 API 请求
 * 最后修改：2025-11-29
 * 依赖项：@/utils/http
 */

import http from '@/utils/http'

export interface MenuItem {
  id: string
  path: string
  name: string
  title: string
  icon: string | null
  order: number
  children?: MenuItem[]
}

/**
 * @description 获取当前用户的菜单（根据权限过滤）
 * @returns {Promise} 菜单列表
 */
export const getUserMenus = () => {
  return http.get<{ success: boolean; data: MenuItem[]; message: string }>('/menus')
}

/**
 * @description 检查用户是否有权访问指定路由
 * @param {string} path 路由路径
 * @returns {Promise} 访问权限检查结果
 */
export const checkRouteAccess = (path: string) => {
  return http.post<{ success: boolean; data: { hasAccess: boolean }; message: string }>('/menus/check', { path })
}
