/**
 * 模块功能：权限控制 Hook
 * 最后修改：2025-11-29
 * 依赖项：@/stores/authStore
 */

import { useAuth } from '@/stores/authStore'

type Action = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE' | 'IMPORT' | 'EXPORT'
type Resource = 'user' | 'role' | 'permission' | 'dashboard' | 'settings'

/**
 * @description 权限检查 Hook
 * @returns {Object} 权限检查函数
 */
export function usePermission() {
  const { user } = useAuth()

  /**
   * @description 检查是否拥有指定权限
   * @param {Action} action 操作类型
   * @param {Resource} resource 资源类型
   * @returns {boolean} 是否拥有权限
   */
  const hasPermission = (action: Action, resource: Resource): boolean => {
    if (!user || !user.permissions) {
      return false
    }

    // 检查是否有 MANAGE 权限（管理权限包含所有操作）
    const hasManagePermission = user.permissions.some(
      (p) => p.resource === resource && p.action === 'MANAGE'
    )

    if (hasManagePermission) {
      return true
    }

    // 检查是否有指定的权限
    return user.permissions.some(
      (p) => p.resource === resource && p.action === action
    )
  }

  /**
   * @description 检查是否拥有任意一个权限
   * @param {Array<[Action, Resource]>} permissions 权限列表
   * @returns {boolean} 是否拥有任意一个权限
   */
  const hasAnyPermission = (permissions: Array<[Action, Resource]>): boolean => {
    return permissions.some(([action, resource]) => hasPermission(action, resource))
  }

  /**
   * @description 检查是否拥有所有权限
   * @param {Array<[Action, Resource]>} permissions 权限列表
   * @returns {boolean} 是否拥有所有权限
   */
  const hasAllPermissions = (permissions: Array<[Action, Resource]>): boolean => {
    return permissions.every(([action, resource]) => hasPermission(action, resource))
  }

  /**
   * @description 检查是否拥有指定角色
   * @param {string | string[]} roleNames 角色名称或角色名称列表
   * @returns {boolean} 是否拥有角色
   */
  const hasRole = (roleNames: string | string[]): boolean => {
    if (!user || !user.roles) {
      return false
    }

    const roles = Array.isArray(roleNames) ? roleNames : [roleNames]
    return user.roles.some((r) => roles.includes(r.name))
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    user,
  }
}
