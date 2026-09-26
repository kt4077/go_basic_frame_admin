// 插件管理类型
import type { BaseEntity, PageQuery } from './common'

/** 插件列表查询参数 */
export interface PluginListReq extends PageQuery {
  keyword?: string
  status?: number
}

/** 已安装插件信息 */
export interface PluginItem extends BaseEntity {
  plugin_id: string
  name: string
  version: string
  code_version: string
  logo: string
  logo_url: string
  author: string
  homepage: string
  description: string
  status: number
  compiled: boolean
}

/** 插件数据库迁移记录 */
export interface PluginMigrationItem {
  id: number
  version: string
  checksum: string
  status: number
  execution_ms: number
  error_message: string
  executed_at: string
}

/** 插件详情 */
export interface PluginDetail extends PluginItem {
  manifest: string
  migrations: PluginMigrationItem[]
}

/** 插件状态修改参数 */
export interface PluginStatusReq {
  plugin_id: string
  status: number
}

/** 插件展示信息修改参数 */
export interface PluginInfoUpdateReq {
  plugin_id: string
  logo: string
  author: string
  homepage: string
  description: string
}
