/**
 * 任务数据模型：使用 zod 定义 `Task` 的字段结构与类型。
 * 提供 `taskSchema` 与推断类型 `Task` 供表格与表单校验使用。
 */
import { z } from 'zod'

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
})

export type Task = z.infer<typeof taskSchema>
