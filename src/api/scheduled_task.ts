import { request } from './http'
import type { ScheduledTask, ScheduledTaskFilters, ScheduledTaskLogPage, ScheduledTaskOptions } from '@/types/scheduled_task'

export const getScheduledTasks = (params?: ScheduledTaskFilters) =>
  request<ScheduledTask[]>({ url: '/admin/scheduled_task/list', method: 'get', params })

export const getScheduledTaskOptions = () =>
  request<ScheduledTaskOptions>({ url: '/admin/scheduled_task/options', method: 'get' })

export const saveScheduledTask = (data: ScheduledTask) =>
  request<ScheduledTask>({ url: '/admin/scheduled_task/save', method: 'post', data })

export const deleteScheduledTask = (id: number) =>
  request<null>({ url: '/admin/scheduled_task/delete', method: 'post', data: { id } })

export const runScheduledTask = (id: number) =>
  request<null>({ url: '/admin/scheduled_task/run', method: 'post', data: { id } })

export const getScheduledTaskLogs = (params: { task_id: number; status?: number; page: number; page_size: number }) =>
  request<ScheduledTaskLogPage>({ url: '/admin/scheduled_task/log/list', method: 'get', params })

