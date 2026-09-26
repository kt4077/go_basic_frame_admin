import type { BaseEntity, PageResult } from './common'

export interface SMSConfig extends BaseEntity { name: string; provider: number; access_key_id: string; endpoint: string; is_default: number; status: number; remark: string }
export interface SMSConfigSave extends Omit<SMSConfig, keyof BaseEntity> { id?: number; access_key_secret?: string }
export interface SMSSignature extends BaseEntity { config_id: number; name: string; sign_code: string; status: number; remark: string }
export interface SMSSignatureSave extends Omit<SMSSignature, keyof BaseEntity> { id?: number }
export interface SMSTemplate extends BaseEntity { config_id: number; name: string; template_code: string; type: number; content: string; status: number; remark: string }
export interface SMSTemplateSave extends Omit<SMSTemplate, keyof BaseEntity> { id?: number }
export interface SMSSendLog { id: number; created_at: string; config_id: number; signature_id: number; template_id: number; mobile: string; content: string; status: number; provider_message_id: string; error_message: string; sent_at: string | null }
export type SMSLogPage = PageResult<SMSSendLog>
