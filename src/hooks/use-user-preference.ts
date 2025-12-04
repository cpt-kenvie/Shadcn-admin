/**
 * 模块功能：用户偏好设置Hook
 * 最后修改：2025-12-04
 * 依赖项：@tanstack/react-query, @/api/userPreference
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserPreference,
  updateUserPreference,
  deleteUserPreference,
  type UserPreferenceInput,
} from '@/api/userPreference'
import { toast } from 'sonner'

/**
 * @description 获取用户偏好设置的Hook
 * @returns {object} React Query结果对象
 */
export function useUserPreference() {
  return useQuery({
    queryKey: ['userPreference'],
    queryFn: getUserPreference,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  })
}

/**
 * @description 更新用户偏好设置的Mutation Hook
 * @returns {object} React Query Mutation对象
 */
export function useUpdateUserPreference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UserPreferenceInput) => updateUserPreference(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['userPreference'] })
      toast.success(response.message || '偏好设置已更新')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '更新偏好设置失败')
    },
  })
}

/**
 * @description 删除用户偏好设置的Mutation Hook
 * @returns {object} React Query Mutation对象
 */
export function useDeleteUserPreference() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteUserPreference(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['userPreference'] })
      toast.success(response.message || '偏好设置已删除')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '删除偏好设置失败')
    },
  })
}
