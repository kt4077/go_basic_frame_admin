import { request } from './http'
import type {
  MessagePushRecordPage,
  MessagePushRecordQuery,
  MessageRecordPage,
  MessageRecordQuery,
  MessageSend,
  MessageSendResult,
  MessageSubscriptionPage,
  MessageSubscriptionQuery,
  MessageTemplate,
  MessageTemplateSave,
} from '@/types/message'
export const getMessageTemplates = () =>
  request<MessageTemplate[]>({ url: '/admin/message/template/list', method: 'get' })
export const saveMessageTemplate = (data: MessageTemplateSave) =>
  request<MessageTemplate>({ url: '/admin/message/template/save', method: 'post', data })
export const deleteMessageTemplate = (id: number) =>
  request<null>({ url: '/admin/message/template/delete', method: 'post', data: { id } })
export const sendMessage = (data: MessageSend) =>
  // 批量接收会员时逐条执行小程序推送，耗时随人数增长，单独放宽超时
  request<MessageSendResult>({ url: '/admin/message/send', method: 'post', data, timeout: 300000 })
export const getMessageRecords = (params: MessageRecordQuery) =>
  request<MessageRecordPage>({ url: '/admin/message/list', method: 'get', params })
export const getMessagePushRecords = (params: MessagePushRecordQuery) =>
  request<MessagePushRecordPage>({ url: '/admin/message/push_record/list', method: 'get', params })
export const getMessageSubscriptions = (params: MessageSubscriptionQuery) =>
  request<MessageSubscriptionPage>({ url: '/admin/message/subscription/list', method: 'get', params })
