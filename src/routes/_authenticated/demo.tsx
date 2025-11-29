import { createFileRoute } from '@tanstack/react-router'
import Demo from '@/features/demo'

export const Route = createFileRoute('/_authenticated/demo')({
  component: Demo,
})
