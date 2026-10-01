// 消息中心枚举，取值与后端 internal/common/enums/message.go 保持一致。

/** 消息类型（字符串编码） */
export const MsgType = {
  System: 'system',
  Order: 'order',
  Marketing: 'marketing',
  Interactive: 'interactive',
  Service: 'service',
} as const

/** 消息类型标签 */
export const MsgTypeLabels: Record<string, string> = {
  system: '系统通知',
  order: '订单通知',
  marketing: '营销消息',
  interactive: '互动消息',
  service: '客服消息',
}

/** 消息类型下拉选项 */
export const msgTypeOptions = (Object.keys(MsgTypeLabels) as Array<keyof typeof MsgTypeLabels>).map(
  (value) => ({ label: MsgTypeLabels[value], value }),
)

/** 消息跳转类型，0 表示不跳转 */
export const MsgJumpType = {
  None: 0,
  Inner: 1,
  H5: 2,
  MiniProgram: 3,
} as const

/** 消息跳转类型标签 */
export const MsgJumpTypeLabels: Record<number, string> = {
  0: '不跳转',
  1: '站内页',
  2: 'H5链接',
  3: '小程序页面',
}

/** 消息发送来源 */
export const MsgSendSource = {
  System: 1,
  Admin: 2,
  Business: 3,
} as const

/** 消息发送来源标签 */
export const MsgSendSourceLabels: Record<number, string> = {
  1: '系统自动',
  2: '后台手动发送',
  3: '业务触发',
}

/** 小程序订阅消息推送渠道，取值与会员注册来源一致 */
export const PushChannel = {
  WechatMiniapp: 1,
  AlipayMiniapp: 6,
  BaiduMiniapp: 7,
  DouyinMiniapp: 8,
  QQMiniapp: 9,
  KsMiniapp: 10,
} as const

/** 推送渠道标签 */
export const PushChannelLabels: Record<number, string> = {
  1: '微信小程序',
  6: '支付宝小程序',
  7: '百度小程序',
  8: '抖音小程序',
  9: 'QQ小程序',
  10: '快手小程序',
}

/** 推送渠道下拉/多选选项 */
export const pushChannelOptions = [
  PushChannel.WechatMiniapp,
  PushChannel.AlipayMiniapp,
  PushChannel.BaiduMiniapp,
  PushChannel.DouyinMiniapp,
  PushChannel.QQMiniapp,
  PushChannel.KsMiniapp,
].map((value) => ({ label: PushChannelLabels[value], value }))

/** 推送状态标签 */
export const PushStatusLabels: Record<number, string> = {
  1: '待发送',
  2: '成功',
  3: '失败',
}

/** 已读状态标签 */
export const ReadStatusLabels: Record<number, string> = {
  0: '未读',
  1: '已读',
}
