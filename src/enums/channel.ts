export const SMSProvider = { Aliyun: 1, Tencent: 2, SMSBao: 3, SMSCN: 4, Yunpian: 5 } as const
export const SMSProviderLabels: Record<number, string> = {
  1: '阿里云短信',
  2: '腾讯云短信',
  3: '短信宝',
  4: 'SMS.cn',
  5: '云片',
}
export const SMSDefault = { No: 0, Yes: 1 } as const
export const SMSTemplateType = { VerifyCode: 1, Notice: 2, Marketing: 3 } as const
export const SMSTemplateTypeLabels: Record<number, string> = { 1: '验证码', 2: '通知', 3: '营销' }
export const SMSSendStatusLabels: Record<number, string> = { 1: '待发送', 2: '成功', 3: '失败' }
export const WechatType = { Official: 1, Open: 2, MiniApp: 3 } as const
export const WechatTypeLabels: Record<number, string> = { 1: '微信公众号', 2: '微信开放平台', 3: '微信小程序' }
export const PaymentChannel = { Wechat: 1, Alipay: 2 } as const
export const PaymentChannelLabels: Record<number, string> = { 1: '微信支付', 2: '支付宝' }
