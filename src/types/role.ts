// 角色模块类型
import type { BaseEntity, PageQuery } from './common'

/** 角色实体 */
export interface RoleItem extends BaseEntity {
  name: string
  code: string
  parent_id: number
  sort: number
  status: number
  remark: string
}

/** 角色列表查询参数 */
export interface RoleListReq extends PageQuery {
  name?: string
}

/** 角色保存请求（新增/修改共用） */
export interface RoleSaveReq {
  id?: number
  name: string
  code: string
  parent_id: number
  sort: number
  status: number
  remark: string
}

/** 角色树形表格/下拉行（平铺后的节点结构） */
export interface RoleTreeRow extends RoleItem {
  children?: RoleTreeRow[]
}
