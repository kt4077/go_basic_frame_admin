import type { BaseEntity } from './common'
export interface WechatConfig extends BaseEntity { name: string; type: number; app_id: string; status: number; remark: string }
export interface WechatConfigSave extends Omit<WechatConfig, keyof BaseEntity> { id?: number; app_secret?: string; token?: string; aes_key?: string }
