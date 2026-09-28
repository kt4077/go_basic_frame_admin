/** 平台协议类型，与后端 common/enums 保持一致并从 1 开始。 */
export const AgreementType = {
  Service: 1,
  Privacy: 2,
  Payment: 3,
  Refund: 4,
  About: 5,
} as const

export const AgreementTypeLabels: Record<number, string> = {
  1: '服务协议',
  2: '隐私协议',
  3: '支付协议',
  4: '退款协议',
  5: '关于我们',
}
