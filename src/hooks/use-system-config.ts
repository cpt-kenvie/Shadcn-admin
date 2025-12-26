/**
 * 妯″潡鍔熻兘锛氱郴缁熼厤缃瓾ook
 * 鏈€鍚庝慨鏀癸細2025-12-03
 * 渚濊禆椤癸細@tanstack/react-query, @/api/systemConfig
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSystemConfig,
  getAllSystemConfigs,
  setSystemConfig,
  setSystemConfigs,
  deleteSystemConfig,
  type SystemConfigInput,
} from '@/api/systemConfig'
import { toast } from 'sonner'

/**
 * @description 鑾峰彇鍗曚釜绯荤粺閰嶇疆鐨凥ook
 * @param {string} key - 閰嶇疆閿悕
 * @returns {object} React Query缁撴灉瀵硅薄
 */
export function useSystemConfigByKey(key: string) {
  return useQuery({
    queryKey: ['systemConfig', key],
    queryFn: () => getSystemConfig(key),
    enabled: !!key,
  })
}

/**
 * @description 鑾峰彇鎵€鏈夌郴缁熼厤缃殑Hook
 * @param {string} category - 鍙€夌殑閰嶇疆鍒嗙被
 * @returns {object} React Query缁撴灉瀵硅薄
 */
export function useSystemConfigs(category?: string) {
  return useQuery({
    queryKey: ['systemConfigs', category],
    queryFn: () => getAllSystemConfigs(category),
  })
}

/**
 * @description 鑾峰彇绯荤粺閰嶇疆鐨凥ook锛堣繑鍥為敭鍊煎瀵硅薄锛? * @returns {object} 鍖呭惈閰嶇疆瀵硅薄鍜屽姞杞界姸鎬? */
export function useSystemConfig() {
  const { data, isLoading, error } = useSystemConfigs('appearance')

  // 瀹夊叏澶勭悊绌烘暟鎹拰undefined鎯呭喌
  const configMap = data?.data && Array.isArray(data.data) && data.data.length > 0
    ? data.data.reduce(
        (acc, config) => {
          acc[config.key] = config.value
          return acc
        },
        {} as Record<string, string>
      )
    : {}

  return {
    data: {
      logoUrl: configMap.logoUrl || '/images/Logo.png',
      darkLogoUrl: configMap.darkLogoUrl || '/images/white-Logo.webp',
    },
    isLoading,
    error,
  }
}

/**
 * @description 璁剧疆绯荤粺閰嶇疆鐨凪utation Hook
 * @returns {object} React Query Mutation瀵硅薄
 */
export function useSetSystemConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SystemConfigInput) => setSystemConfig(data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['systemConfig', variables.key] })
      queryClient.invalidateQueries({ queryKey: ['systemConfigs'] })
      toast.success('配置已保存')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '淇濆瓨閰嶇疆澶辫触')
    },
  })
}

/**
 * @description 鎵归噺璁剧疆绯荤粺閰嶇疆鐨凪utation Hook
 * @returns {object} React Query Mutation瀵硅薄
 */
export function useSetSystemConfigs() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SystemConfigInput[]) => setSystemConfigs(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemConfig'] })
      queryClient.invalidateQueries({ queryKey: ['systemConfigs'] })
      toast.success('配置已批量保存')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '鎵归噺淇濆瓨閰嶇疆澶辫触')
    },
  })
}

/**
 * @description 鍒犻櫎绯荤粺閰嶇疆鐨凪utation Hook
 * @returns {object} React Query Mutation瀵硅薄
 */
export function useDeleteSystemConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (key: string) => deleteSystemConfig(key),
    onSuccess: (_response, key) => {
      queryClient.invalidateQueries({ queryKey: ['systemConfig', key] })
      queryClient.invalidateQueries({ queryKey: ['systemConfigs'] })
      toast.success('配置已删除')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '鍒犻櫎閰嶇疆澶辫触')
    },
  })
}
