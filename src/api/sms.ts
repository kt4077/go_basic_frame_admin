import { request } from './http'
import type { SMSConfig, SMSConfigSave, SMSSignature, SMSSignatureSave, SMSTemplate, SMSTemplateSave, SMSLogPage } from '@/types/sms'
export const getSMSConfigs = () => request<SMSConfig[]>({ url: '/admin/sms/config/list', method: 'get' })
export const saveSMSConfig = (data: SMSConfigSave) => request<SMSConfig>({ url: '/admin/sms/config/save', method: 'post', data })
export const deleteSMSConfig = (id: number) => request<null>({ url: '/admin/sms/config/delete', method: 'post', data: { id } })
export const getSMSSignatures = () => request<SMSSignature[]>({ url: '/admin/sms/signature/list', method: 'get' })
export const saveSMSSignature = (data: SMSSignatureSave) => request<SMSSignature>({ url: '/admin/sms/signature/save', method: 'post', data })
export const deleteSMSSignature = (id: number) => request<null>({ url: '/admin/sms/signature/delete', method: 'post', data: { id } })
export const getSMSTemplates = () => request<SMSTemplate[]>({ url: '/admin/sms/template/list', method: 'get' })
export const saveSMSTemplate = (data: SMSTemplateSave) => request<SMSTemplate>({ url: '/admin/sms/template/save', method: 'post', data })
export const deleteSMSTemplate = (id: number) => request<null>({ url: '/admin/sms/template/delete', method: 'post', data: { id } })
export const getSMSLogs = (params: { mobile?: string; status?: number; page: number; page_size: number }) => request<SMSLogPage>({ url: '/admin/sms/log/list', method: 'get', params })
