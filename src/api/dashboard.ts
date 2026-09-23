// 系统总览模块接口
import { request } from './http'
import type { OverviewRes } from '@/types/dashboard'

export const getOverview = () => {
  return request<OverviewRes>({ url: '/admin/dashboard/overview', method: 'get' })
}
