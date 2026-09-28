import type { BaseEntity } from './common'

export interface WechatConfig extends BaseEntity {
  platform: number
  name: string
  type: number
  app_id: string
  redirect_uri: string
  status: number
  remark: string
}

export interface WechatConfigSave {
  id?: number
  platform: number
  name: string
  type: number
  app_id: string
  app_secret?: string
  token?: string
  aes_key?: string
  public_key?: string
  private_key?: string
  redirect_uri?: string
  status: number
  remark: string
}
