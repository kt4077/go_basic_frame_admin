import { request } from './http'
import type { FinanceOrderItem, FinanceOrderListResult, FinanceOrderQuery, FinanceReportOverview } from '@/types/financeOrder'

export const getFinanceOrders = (params: FinanceOrderQuery) => request<FinanceOrderListResult>({
  url: '/admin/finance/order/list',
  method: 'get',
  params,
})

export const getFinanceOrderDetail = (uid: string) => request<FinanceOrderItem>({
  url: '/admin/finance/order/detail',
  method: 'get',
  params: { uid },
})

export const getFinanceReportOverview = () => request<FinanceReportOverview>({
  url: '/admin/finance/report/overview',
  method: 'get',
})
