import type { PageResult } from './common'

export interface ScheduledTask {
  id: number
  name: string
  handler: string
  cron_expression: string
  payload: string
  status: number
  timeout_seconds: number
  remark: string
  last_run_at: string | null
  last_status: number
  last_error: string
  next_run_at: string | null
  created_at: string
  updated_at: string
}

export interface ScheduledTaskFilters {
  keyword?: string
  status?: number
}

export interface ScheduledTaskHandlerOption {
  value: string
  label: string
  description: string
  example: string
}

export interface ScheduledTaskCronExample {
  label: string
  value: string
}

export interface ScheduledTaskOptions {
  handlers: ScheduledTaskHandlerOption[]
  cron_examples: ScheduledTaskCronExample[]
}

export interface ScheduledTaskLog {
  id: number
  task_id: number
  task_name: string
  handler: string
  status: number
  started_at: string
  finished_at: string
  duration_ms: number
  error_message: string
}

export type ScheduledTaskLogPage = PageResult<ScheduledTaskLog>

