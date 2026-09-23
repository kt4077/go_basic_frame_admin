// 存储渠道配置类型
import type { BaseEntity } from './common'

/** 存储渠道实体（channel 取值见 enums/storage.ts） */
export interface StorageItem extends BaseEntity {
  name: string
  channel: string
  /** 渠道参数 JSON 字符串 */
  params: string
  is_default: number
  status: number
  sort: number
  remark: string
}

/** 存储渠道保存请求（新增/修改共用，修改时传 id） */
export interface StorageSaveReq {
  id?: number
  name: string
  channel: string
  params: string
  is_default: number
  status: number
  sort: number
  remark: string
}
