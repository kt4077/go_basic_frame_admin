// 部门（组织架构）模块类型
import type { BaseEntity } from './common'

/** 部门实体 */
export interface DeptItem extends BaseEntity {
  name: string
  parent_id: number
  sort: number
  leader: string
  remark: string
}

/** 部门保存请求（新增/修改共用） */
export interface DeptSaveReq {
  id?: number
  name: string
  parent_id: number
  sort: number
  leader: string
  remark: string
}

/** 部门树形表格/下拉行（平铺后的节点结构） */
export interface DeptTreeRow extends DeptItem {
  children?: DeptTreeRow[]
}
