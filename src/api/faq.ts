import { request } from './http'
import type { FAQ, FAQGroup, FAQGroupSave, FAQPage, FAQQuery, FAQSave } from '@/types/faq'

export const getFAQGroups = (params?: { keyword?: string; status?: number }) => request<FAQGroup[]>({ url: '/admin/faq/group/list', method: 'get', params })
export const saveFAQGroup = (data: FAQGroupSave) => request<FAQGroup>({ url: '/admin/faq/group/save', method: 'post', data })
export const deleteFAQGroup = (id: number) => request<void>({ url: '/admin/faq/group/delete', method: 'post', data: { id } })
export const getFAQs = (params: FAQQuery) => request<FAQPage>({ url: '/admin/faq/list', method: 'get', params })
export const saveFAQ = (data: FAQSave) => request<FAQ>({ url: '/admin/faq/save', method: 'post', data })
export const deleteFAQ = (id: number) => request<void>({ url: '/admin/faq/delete', method: 'post', data: { id } })
