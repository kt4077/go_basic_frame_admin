// 操作日志接口
import { request } from './http'
import type { OperationLogDeleteResult, OperationLogItem } from '@/types/operation_log'
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

/** 批量物理删除操作日志，单次最多500条 */
export const deleteOperationLogs = (ids: number[]) => {
  return request<OperationLogDeleteResult>({
    url: '/admin/log/operation/delete',
    method: 'post',
    data: { ids },
  })
}

/** 全量物理清空操作日志 */
export const clearOperationLogs = () => {
  return request<OperationLogDeleteResult>({
    url: '/admin/log/operation/clear',
    method: 'post',
    data: { confirm: 'CLEAR_ALL_OPERATION_LOGS' },
  })
}
