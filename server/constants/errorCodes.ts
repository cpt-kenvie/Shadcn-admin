/**
 * 模块功能：系统错误代码定义
 * 最后修改：2025-11-29
 * 依赖项：无
 */

/**
 * @description 系统错误代码枚举
 */
export enum ErrorCode {
  // 通用错误 (1000-1999)
  SUCCESS = 1000,
  UNKNOWN_ERROR = 1001,
  INVALID_REQUEST = 1002,
  VALIDATION_ERROR = 1003,
  NOT_FOUND = 1004,
  INTERNAL_ERROR = 1005,

  // 认证错误 (2000-2099)
  UNAUTHORIZED = 2000,
  INVALID_TOKEN = 2001,
  TOKEN_EXPIRED = 2002,
  INVALID_CREDENTIALS = 2003,
  ACCOUNT_DISABLED = 2004,
  ACCOUNT_NOT_FOUND = 2005,
  PASSWORD_INCORRECT = 2006,

  // 权限错误 (2100-2199)
  FORBIDDEN = 2100,
  INSUFFICIENT_PERMISSIONS = 2101,
  ROLE_NOT_FOUND = 2102,
  PERMISSION_DENIED = 2103,

  // 用户错误 (3000-3099)
  USER_NOT_FOUND = 3000,
  USER_ALREADY_EXISTS = 3001,
  EMAIL_ALREADY_EXISTS = 3002,
  USERNAME_ALREADY_EXISTS = 3003,
  INVALID_USER_STATUS = 3004,

  // 角色错误 (3100-3199)
  ROLE_ALREADY_EXISTS = 3100,
  CANNOT_DELETE_SYSTEM_ROLE = 3101,
  ROLE_IN_USE = 3102,

  // 权限错误 (3200-3299)
  PERMISSION_NOT_FOUND = 3200,
  PERMISSION_ALREADY_EXISTS = 3201,

  // 资源错误 (4000-4099)
  RESOURCE_NOT_FOUND = 4000,
  RESOURCE_ALREADY_EXISTS = 4001,
  RESOURCE_IN_USE = 4002,
}

/**
 * @description 错误代码对应的消息
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // 通用错误
  [ErrorCode.SUCCESS]: '操作成功',
  [ErrorCode.UNKNOWN_ERROR]: '未知错误',
  [ErrorCode.INVALID_REQUEST]: '无效的请求',
  [ErrorCode.VALIDATION_ERROR]: '数据验证失败',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.INTERNAL_ERROR]: '服务器内部错误',

  // 认证错误
  [ErrorCode.UNAUTHORIZED]: '未授权访问',
  [ErrorCode.INVALID_TOKEN]: '无效的令牌',
  [ErrorCode.TOKEN_EXPIRED]: '令牌已过期',
  [ErrorCode.INVALID_CREDENTIALS]: '用户名或密码错误',
  [ErrorCode.ACCOUNT_DISABLED]: '账户已被禁用',
  [ErrorCode.ACCOUNT_NOT_FOUND]: '账户不存在',
  [ErrorCode.PASSWORD_INCORRECT]: '密码错误',

  // 权限错误
  [ErrorCode.FORBIDDEN]: '禁止访问',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: '权限不足',
  [ErrorCode.ROLE_NOT_FOUND]: '角色不存在',
  [ErrorCode.PERMISSION_DENIED]: '权限被拒绝',

  // 用户错误
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_ALREADY_EXISTS]: '用户已存在',
  [ErrorCode.EMAIL_ALREADY_EXISTS]: '邮箱已被使用',
  [ErrorCode.USERNAME_ALREADY_EXISTS]: '用户名已被使用',
  [ErrorCode.INVALID_USER_STATUS]: '无效的用户状态',

  // 角色错误
  [ErrorCode.ROLE_ALREADY_EXISTS]: '角色已存在',
  [ErrorCode.CANNOT_DELETE_SYSTEM_ROLE]: '系统角色不可删除',
  [ErrorCode.ROLE_IN_USE]: '角色正在使用中',

  // 权限错误
  [ErrorCode.PERMISSION_NOT_FOUND]: '权限不存在',
  [ErrorCode.PERMISSION_ALREADY_EXISTS]: '权限已存在',

  // 资源错误
  [ErrorCode.RESOURCE_NOT_FOUND]: '资源不存在',
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: '资源已存在',
  [ErrorCode.RESOURCE_IN_USE]: '资源正在使用中',
}
