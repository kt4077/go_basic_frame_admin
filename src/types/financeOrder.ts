import type { PageQuery, PageResult } from './common'

export interface FinanceOrderProduct {
  uid: string
  name: string
  cover: string
  spec_text: string
  quantity: number
}

export interface FinanceOrderItem {
  uid: string
  source_plugin_id: string
  source_plugin_name: string
  source_order_uid: string
  order_no: string
  order_title: string
  products: FinanceOrderProduct[]
  member_nickname: string
  member_avatar: string
  member_mobile: string
  order_status: number
  status_text: string
  pay_status: number
  pay_method: string
  product_amount: string
  shipping_amount: string
  discount_amount: string
  pay_amount: string
  paid_at: string | null
  created_at: string
  updated_at: string
}

export interface FinancePluginOption {
  plugin_id: string
  name: string
  count: number
}

export interface FinanceOrderQuery extends PageQuery {
  source_plugin_id?: string
  pay_status?: number
  keyword?: string
  start_at?: string
  end_at?: string
}

export interface FinanceOrderListResult extends PageResult<FinanceOrderItem> {
  pay_counts: Record<number, number>
  plugin_options: FinancePluginOption[]
}

export interface FinanceReportTrendItem { date: string; order_count: number; pay_amount: string }
export interface FinanceReportStatusItem { pay_status: number; name: string; count: number }
export interface FinanceReportModuleItem {
  plugin_id: string
  plugin_name: string
  order_count: number
  paid_count: number
  refund_count: number
  pay_amount: string
  refund_amount: string
}
export interface FinanceReportOverview {
  order_count: number
  paid_order_count: number
  pending_count: number
  refund_count: number
  buyer_count: number
  today_order_count: number
  total_pay_amount: string
  today_pay_amount: string
  trend: FinanceReportTrendItem[]
  pay_statuses: FinanceReportStatusItem[]
  modules: FinanceReportModuleItem[]
}
