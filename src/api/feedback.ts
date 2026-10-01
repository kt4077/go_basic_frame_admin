import { request } from './http'
import type { FeedbackPage, FeedbackQuery } from '@/types/feedback'
export const getFeedbackList = (params: FeedbackQuery) => request<FeedbackPage>({ url:'/admin/feedback/list', method:'get', params })
export const processFeedback = (id:number) => request<void>({ url:'/admin/feedback/process', method:'post', data:{ id } })
