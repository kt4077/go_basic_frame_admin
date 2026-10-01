// 系统总览页面模拟数据：电商口径，后端接口未就绪前在页面内展示，后续替换为接口数据时仅改本文件。

export interface OverviewStatTile {
  label: string
  value: string
  color: string
}

export const overviewStats: OverviewStatTile[] = [
  { label: '今日销售额（元）', value: '8500265.22', color: '#3b82f6' },
  { label: '今日退款金额（元）', value: '8690.4', color: '#22c55e' },
  { label: '近7天销售额（元）', value: '39972227.36', color: '#f59e0b' },
  { label: '近7天退款金额（元）', value: '22014.5', color: '#f43f5e' },
  { label: '本月销售额（元）', value: '85002652.2', color: '#6366f1' },
  { label: '本月退款金额（元）', value: '86904.4', color: '#10b981' },
  { label: '待结算货款（元）', value: '399722.36', color: '#0ea5e9' },
  { label: '今日佣金收入（元）', value: '22371.2', color: '#84cc16' },
  { label: '昨日销售额（元）', value: '7860123.45', color: '#8b5cf6' },
  { label: '昨日退款金额（元）', value: '7621.8', color: '#fb7185' },
  { label: '待付款订单金额（元）', value: '528630.0', color: '#14b8a6' },
  { label: '优惠券核销金额（元）', value: '36210.75', color: '#ec4899' },
]

export interface QuickEntry {
  label: string
  color: string
}

export const quickEntries: QuickEntry[] = [
  { label: '商品管理', color: '#3b6ef6' },
  { label: '订单管理', color: '#f59e0b' },
  { label: '财务结算', color: '#22c55e' },
  { label: '营销活动', color: '#ef4444' },
  { label: '会员管理', color: '#0ea5e9' },
  { label: '应用中心', color: '#8b5cf6' },
  { label: '物流配送', color: '#14b8a6' },
  { label: '数据分析', color: '#f97316' },
]

export interface DeviceStat {
  type: string
  count: number
  online: number
  offline: number
}

/** 支付渠道维度：笔数 / 支付成功 / 支付失败 */
export const deviceStats: DeviceStat[] = [
  { type: '微信支付', count: 1286, online: 1254, offline: 32 },
  { type: '支付宝', count: 864, online: 851, offline: 13 },
  { type: '银联', count: 212, online: 205, offline: 7 },
  { type: '余额支付', count: 356, online: 356, offline: 0 },
  { type: '货到付款', count: 48, online: 45, offline: 3 },
]

export interface RoomSummaryItem {
  name: string
  value: number
  color: string
}

/** 商品状态分布 */
export const roomSummary = {
  total: 373,
  items: [
    { name: '在售', value: 190, color: '#22c55e' },
    { name: '下架', value: 140, color: '#909399' },
    { name: '售罄', value: 33, color: '#e6a23c' },
    { name: '禁售', value: 10, color: '#f56c6c' },
  ] as RoomSummaryItem[],
}

export const ratePrice = {
  averagePrice: 96.35,
  rates: [
    { name: '支付转化率', value: 12.6 },
    { name: '退款率', value: 4.8 },
    { name: '复购率', value: 28.4 },
  ],
}

export const vacancyAlert = {
  legend: '库存商品',
  items: [
    { name: '0-10件', value: 86 },
    { name: '11-50件', value: 120 },
    { name: '51-100件', value: 230 },
    { name: '101-200件', value: 162 },
    { name: '201-500件', value: 228 },
    { name: '500件以上', value: 140 },
  ],
}

export const rentTrend = {
  months: ['1月', '2月', '3月', '4月', '5月', '6月'],
  renew: [85, 120, 90, 160, 140, 210],
  newRent: [95, 70, 110, 85, 60, 130],
}

export const dealTrend = {
  months: ['1月', '2月', '3月', '4月', '5月', '6月'],
  values: [32, 45, 28, 60, 52, 74],
}

export interface ApprovalItem {
  title: string
  tag: string
  desc: string
  author: string
  time: string
}

export const approvals: ApprovalItem[] = [
  {
    title: '商品上架审批',
    tag: '运营负责人审批',
    desc: '京东自营旗舰店/手机通讯类目/iPhone 17 系列新品上架申请',
    author: '王强',
    time: '2026-10-01 10:58:54',
  },
  {
    title: '促销活动审批',
    tag: '市场负责人审批',
    desc: '双11预热专场/跨店满减与限时秒杀活动配置申请',
    author: '陈静',
    time: '2026-10-01 10:58:54',
  },
]

export interface NoticeTenant {
  name: string
  amount: string
}

export const noticeTenants: NoticeTenant[] = [
  { name: '无线蓝牙耳机 Pro', amount: '128.00' },
  { name: '智能手环 S6', amount: '299.00' },
  { name: '机械键盘 K87', amount: '459.00' },
  { name: '便携蓝牙音箱', amount: '199.00' },
  { name: '65W 氮化镓充电器', amount: '89.00' },
  { name: '降噪头戴耳机', amount: '899.00' },
]

export interface InvestmentReminder {
  name: string
  tag: string
  time: string
}

export const investmentReminders: InvestmentReminder[] = [
  { name: '李明', tag: '申请仅退款', time: '2026-10-01 10:58:54' },
  { name: '张伟', tag: '申请退货', time: '2026-10-01 10:58:54' },
  { name: '刘洋', tag: '投诉待处理', time: '2026-10-01 10:58:54' },
  { name: '陈晨', tag: '申请仅退款', time: '2026-10-01 10:58:54' },
  { name: '赵磊', tag: '申请换货', time: '2026-10-01 10:58:54' },
  { name: '孙浩', tag: '申请退货', time: '2026-10-01 10:58:54' },
]
