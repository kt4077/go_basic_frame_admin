import type { BaseEntity } from './common'
export interface PaymentConfig extends BaseEntity { name: string; channel: number; app_id: string; merchant_id: string; cert_serial_no: string; notify_url: string; status: number; sort: number; remark: string }
export interface PaymentConfigSave extends Omit<PaymentConfig, keyof BaseEntity> { id?: number; private_key?: string; public_key?: string; api_v3_key?: string }
