/**
 * 模块功能：权限验证中间件
 * 最后修改：2025-11-29
 * 依赖项：express, @casl/ability, ../utils/error
 */

import { Request, Response, NextFunction } from 'express'
import { AbilityBuilder, PureAbility, AbilityClass } from '@casl/ability'
import { createForbiddenError } from '../utils/error.js'

type Actions = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'MANAGE' | 'IMPORT' | 'EXPORT'
type Subjects = 'user' | 'role' | 'permission' | 'dashboard' | 'settings' | 'all'

export type AppAbility = PureAbility<[Actions, Subjects]>

/**
 * @description 根据用户权限创建 CASL Ability 实例
 * @param {string[]} permissions 用户权限列表
 * @returns {AppAbility} CASL Ability 实例
 */
export function defineAbilityFor(permissions: string[]): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(
    PureAbility as AbilityClass<AppAbility>
  )

  for (const permission of permissions) {
    const [resource, action] = permission.split(':')
    can(action as Actions, resource as Subjects)
  }

  return build()
}

/**
 * @description 权限验证中间件工厂函数
 * @param {Actions} action 操作类型
 * @param {Subjects} subject 资源类型
 * @returns {Function} Express 中间件函数
 */
export function requirePermission(action: Actions, subject: Subjects) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createForbiddenError('未授权访问')
      }

      const ability = defineAbilityFor(req.user.permissions || [])

      if (!ability.can(action, subject)) {
        throw createForbiddenError(`您没有权限${action} ${subject}`)
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * @description 检查是否拥有任意一个权限
 * @param {Array<[Actions, Subjects]>} permissions 权限列表
 * @returns {Function} Express 中间件函数
 */
export function requireAnyPermission(permissions: Array<[Actions, Subjects]>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw createForbiddenError('未授权访问')
      }

      const ability = defineAbilityFor(req.user.permissions || [])
      const hasPermission = permissions.some(([action, subject]) =>
        ability.can(action, subject)
      )

      if (!hasPermission) {
        throw createForbiddenError('权限不足')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
