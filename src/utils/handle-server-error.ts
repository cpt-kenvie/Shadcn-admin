import { AxiosError } from 'axios'
import { toast } from 'sonner'

/**
 * @description 处理服务器错误，提取并显示错误消息
 * @param {unknown} error 错误对象
 */
export function handleServerError(error: unknown) {
  // eslint-disable-next-line no-console
  console.log(error)

  let errMsg = '出错了！'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = '内容未找到。'
  }

  if (error instanceof AxiosError) {
    // 尝试从多个可能的字段中提取错误消息
    const responseData = error.response?.data
    errMsg =
      responseData?.message ||
      responseData?.title ||
      responseData?.error ||
      error.message ||
      '请求失败'
  }

  toast.error(errMsg)
}
