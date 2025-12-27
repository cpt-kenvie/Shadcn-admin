/**
 * 模块功能：系统配置Hook
 * 最后修改：2025-12-03
 * 依赖项：@tanstack/react-query, @/api/systemConfig
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSystemConfig,
  getAllSystemConfigs,
  setSystemConfig,
  setSystemConfigs,
  deleteSystemConfig,
  type SystemConfig,
  type SystemConfigInput,
} from '@/api/systemConfig'
import { toast } from 'sonner'

/**
 * @description 获取单个系统配置的Hook
 * @param {string} key - 配置键名
 * @returns {object} React Query结果对象
 */
export function useSystemConfigByKey(key: string) {
  return useQuery({
    queryKey: ['systemConfig', key],
    queryFn: async () => {
      const response = await getSystemConfig(key)
      return response.data.data
    },
    enabled: !!key,
  })
}

/**
 * @description 获取所有系统配置的Hook
 * @param {string} category - 可选的配置分类
 * @returns {object} React Query结果对象
 */
export function useSystemConfigs(category?: string) {
  return useQuery({
    queryKey: ['systemConfigs', category],
    queryFn: async () => {
      const response = await getAllSystemConfigs(category)
      return response.data.data ?? []
    },
  })
}

/**
 * @description 获取系统配置的Hook（返回键值对对象）
 * @returns {object} 包含配置对象和加载状态
 */
export function useSystemConfig() {
  const { data, isLoading, error } = useSystemConfigs('appearance')

  const configMap =
    data && Array.isArray(data) && data.length > 0
      ? data.reduce(
          (acc, config: SystemConfig) => {
            acc[config.key] = config.value
            return acc
          },
          {} as Record<string, string>
        )
      : {}

  return {
    data: {
      logoUrl: configMap.logoUrl ?? '/images/logo-black3.png',
      darkLogoUrl: configMap.darkLogoUrl ?? '/images/logo-white3.png',
    },
    isLoading,
    error,
  }
}

/**
 * @description 设置系统配置的Mutation Hook
 * @returns {object} React Query Mutation对象
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
      toast.error(error.response?.data?.message || '保存配置失败')
    },
  })
}

/**
 * @description 批量设置系统配置的Mutation Hook
 * @returns {object} React Query Mutation对象
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
      toast.error(error.response?.data?.message || '批量保存配置失败')
    },
  })
}

/**
 * @description 删除系统配置的Mutation Hook
 * @returns {object} React Query Mutation对象
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
      toast.error(error.response?.data?.message || '删除配置失败')
    },
  })
}
