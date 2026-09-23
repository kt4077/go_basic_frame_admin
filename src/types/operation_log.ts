// 操作日志类型
import type { BaseEntity } from './common'

/** 操作日志实体 */
export interface OperationLogItem extends BaseEntity {
  user_id: number | null
  username: string
  method: string
  path: string
  /** 请求参数（敏感字段已脱敏） */
  request_params: string
  /** 接口响应内容（超长截断） */
  response_params: string
  ip: string
  user_agent: string
  /** 业务响应码，0=成功 */
  code: number
  /** 耗时（毫秒） */
  cost_ms: number
  client: string
}
