// 用户管理模块枚举

/** 性别 */
export const Gender = {
  Male: 1,
  Female: 2,
  Unknown: 3,
} as const

export const GenderLabels: Record<number, string> = {
  1: '男',
  2: '女',
  3: '未知',
}

/** 注册来源 */
export const RegisterSource = {
  WechatMini: 1,
  WechatOA: 2,
  iOS: 3,
  Android: 4,
  H5: 5,
  AlipayMini: 6,
  BaiduMini: 7,
  DouyinMini: 8,
  QQMini: 9,
  KuaishouMini: 10,
} as const

export const RegisterSourceLabels: Record<number, string> = {
  1: '微信小程序',
  2: '微信公众号',
  3: 'iOS',
  4: 'Android',
  5: 'H5',
  6: '支付宝小程序',
  7: '百度小程序',
  8: '抖音小程序',
  9: 'QQ小程序',
  10: '快手小程序',
}
