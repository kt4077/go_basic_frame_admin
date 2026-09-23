// 操作日志接口
import { request } from './http'
import type { OperationLogItem } from '@/types/operation_log'
import type { PageResult } from '@/types/common'

export const getOperationLogList = (params?: {
  username?: string
  start_time?: string
  end_time?: string
  page?: number
  page_size?: number
}) => {
  return request<PageResult<OperationLogItem>>({ url: '/admin/log/operation/list', method: 'get', params })
}
