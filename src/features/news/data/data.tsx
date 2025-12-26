/**
 * 任务模块静态枚举数据：标签、状态、优先级及其图标映射。
 * 供表格列渲染与筛选组件（如状态/优先级过滤）使用。
 */
import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCircle,
  IconCircleCheck,
  IconCircleX,
  IconExclamationCircle,
  IconStopwatch,
} from '@tabler/icons-react'

export const labels = [
  {
    value: 'bug',
    label: 'Bug',
  },
  {
    value: 'feature',
    label: '新功能',
  },
  {
    value: 'documentation',
    label: '文档',
  },
]

export const statuses = [
  {
    value: 'backlog',
    label: '待办',
    icon: IconExclamationCircle,
  },
  {
    value: 'todo',
    label: '待处理',
    icon: IconCircle,
  },
  {
    value: 'in progress',
    label: '进行中',
    icon: IconStopwatch,
  },
  {
    value: 'done',
    label: '已完成',
    icon: IconCircleCheck,
  },
  {
    value: 'canceled',
    label: '已取消',
    icon: IconCircleX,
  },
]

export const priorities = [
  {
    label: '低',
    value: 'low',
    icon: IconArrowDown,
  },
  {
    label: '中',
    value: 'medium',
    icon: IconArrowRight,
  },
  {
    label: '高',
    value: 'high',
    icon: IconArrowUp,
  },
]
