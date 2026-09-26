/** 插件启停状态，与后端枚举保持一致 */
export const PluginStatus = {
  Enabled: 1,
  Disabled: 2,
} as const

export const PluginStatusLabels: Record<number, string> = {
  1: '已启用',
  2: '已停用',
}

/** 插件迁移执行状态 */
export const PluginMigrationStatus = {
  Success: 1,
  Failed: 2,
} as const

export const PluginMigrationStatusLabels: Record<number, string> = {
  1: '成功',
  2: '失败',
}
