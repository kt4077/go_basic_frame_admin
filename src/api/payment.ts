import { request } from './http'
import type { PaymentConfig, PaymentConfigSave } from '@/types/payment'
export const getPaymentConfigs = (channel?: number) => request<PaymentConfig[]>({ url: '/admin/payment/config/list', method: 'get', params: { channel } })
export const savePaymentConfig = (data: PaymentConfigSave) => request<PaymentConfig>({ url: '/admin/payment/config/save', method: 'post', data })
export const deletePaymentConfig = (id: number) => request<null>({ url: '/admin/payment/config/delete', method: 'post', data: { id } })
