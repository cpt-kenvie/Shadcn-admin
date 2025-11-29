/**
 * 模块功能：权限守卫组件
 * 最后修改：2025-11-29
 * 依赖项：react, @/hooks/use-permission
 */

import { ReactNode } from 'react'
import { usePermission } from '@/hooks/use-permission'

type Action = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE' | 'IMPORT' | 'EXPORT'
type Resource = 'user' | 'role' | 'permission' | 'dashboard' | 'settings'

interface PermissionGuardProps {
  action: Action
  resource: Resource
  fallback?: ReactNode
  children: ReactNode
}

/**
 * @description 权限守卫组件 - 有权限则渲染子组件，无权限则渲染 fallback
 * @param {PermissionGuardProps} props 组件属性
 * @returns {ReactNode} 渲染内容
 */
export function PermissionGuard({
  action,
  resource,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission } = usePermission()

  if (!hasPermission(action, resource)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface RoleGuardProps {
  roles: string | string[]
  fallback?: ReactNode
  children: ReactNode
}

/**
 * @description 角色守卫组件 - 有角色则渲染子组件，无角色则渲染 fallback
 * @param {RoleGuardProps} props 组件属性
 * @returns {ReactNode} 渲染内容
 */
export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { hasRole } = usePermission()

  if (!hasRole(roles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
