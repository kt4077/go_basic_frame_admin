import { request } from './http'
import type { WechatConfig, WechatConfigSave } from '@/types/wechat'
export const getWechatConfigs = (type?: number) => request<WechatConfig[]>({ url: '/admin/wechat/config/list', method: 'get', params: { type } })
export const saveWechatConfig = (data: WechatConfigSave) => request<WechatConfig>({ url: '/admin/wechat/config/save', method: 'post', data })
export const deleteWechatConfig = (id: number) => request<null>({ url: '/admin/wechat/config/delete', method: 'post', data: { id } })
