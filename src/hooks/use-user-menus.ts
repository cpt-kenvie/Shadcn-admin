/**
 * 模块功能：用户菜单 Hook
 * 最后修改：2025-11-29
 * 依赖项：@tanstack/react-query, @/api/menus
 */

import { useQuery } from '@tanstack/react-query'
import * as menusApi from '@/api/menus'

/**
 * @description 获取当前用户的菜单
 * @returns {Object} React Query 结果
 */
export function useUserMenus() {
  return useQuery({
    queryKey: ['user-menus'],
    queryFn: async () => {
      const response = await menusApi.getUserMenus()
      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
    retry: 3,
  })
}
