import type { BaseEntity, PageQuery, PageResult } from './common'

/** 消息模板 */
export interface MessageTemplate extends BaseEntity {
  template_code: string
  name: string
  msg_type: string
  title_template: string
  content_template: string
  cover_image: string
  cover_url: string
  jump_type: number
  jump_url_template: string
  miniapp_wechat: string
  miniapp_alipay: string
  miniapp_baidu: string
  miniapp_douyin: string
  miniapp_qq: string
  miniapp_ks: string
  push_channels: number[]
  variables: string
  status: number
  remark: string
}

/** 消息模板保存参数 */
export type MessageTemplateSave = Omit<MessageTemplate, keyof BaseEntity> & { id?: number }

/** 消息发送参数：传 template_code 按模板发送，否则为自定义内容发送 */
export interface MessageSend {
  template_code?: string
  receiver_sns: string[]
  variables?: Record<string, string>
  msg_type?: string
  title?: string
  content?: string
  jump_type?: number
  jump_url?: string
}

/** 单渠道推送结果汇总 */
export interface MessageSendChannelResult {
  channel: number
  success: number
  failed: number
}

/** 消息发送结果 */
export interface MessageSendResult {
  total: number
  pushes: MessageSendChannelResult[]
}

/** 站内消息记录（管理端） */
export interface MessageRecord extends BaseEntity {
  receiver_sn: string
  receiver_nickname: string
  receiver_avatar: string
  msg_type: string
  title: string
  content: string
  cover_image: string
  cover_url: string
  jump_type: number
  jump_url: string
  is_read: number
  read_at: string | null
  biz_type: string
  biz_id: string
  template_id: number
  template_name: string
  send_source: number
}

/** 消息记录分页 */
export type MessageRecordPage = PageResult<MessageRecord>

/** 消息记录查询参数 */
export interface MessageRecordQuery extends PageQuery {
  receiver_sn?: string
  msg_type?: string
}

/** 小程序推送记录 */
export interface MessagePushRecord extends BaseEntity {
  message_id: number
  template_id: number
  receiver_sn: string
  channel: number
  openid: string
  template_data: string
  status: number
  fail_reason: string
  third_party_msg_id: string
  sent_at: string | null
}

/** 推送记录分页 */
export type MessagePushRecordPage = PageResult<MessagePushRecord>

/** 推送记录查询参数 */
export interface MessagePushRecordQuery extends PageQuery {
  message_id?: number
  receiver_sn?: string
  channel?: number
  status?: number
}

/** 小程序订阅授权记录 */
export interface MessageSubscription extends BaseEntity {
  member_sn: string
  member_nickname: string
  member_avatar: string
  channel: number
  template_code: string
  template_id: number
  platform_template_id: string
  platform_subscribe_id: string
  subscribe_count: number
  remain_count: number
  subscribed_at: string
}

/** 订阅记录分页 */
export type MessageSubscriptionPage = PageResult<MessageSubscription>

/** 订阅记录查询参数 */
export interface MessageSubscriptionQuery extends PageQuery {
  template_code?: string
  receiver_sn?: string
  channel?: number
}

/** 模板变量定义（variables JSON 数组元素） */
export interface MessageTemplateVariable {
  name: string
  label: string
  required: number
}
