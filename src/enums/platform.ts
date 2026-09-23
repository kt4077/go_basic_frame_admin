/** 平台配置类型，枚举值与后端保持一致并从 1 开始。 */
export const PlatformType = {
  Admin: 1,
  Api: 2,
} as const

export type PlatformTypeValue = (typeof PlatformType)[keyof typeof PlatformType]
