// 菜单模块类型
import type { BaseEntity } from './common'

/** 菜单/按钮实体（type/status 取值见 enums/menu.ts） */
export interface MenuItem extends BaseEntity {
  name: string
  type: number
  parent_id: number
  path: string
  api_path: string
  icon: string
  sort: number
  status: number
  remark: string
}

/** 菜单保存请求（新增/修改共用，修改时传 id） */
export interface MenuSaveReq {
  id?: number
  name: string
  type: number
  parent_id: number
  path: string
  api_path: string
  icon: string
  sort: number
  status: number
  remark: string
}

/** 菜单列表查询参数 */
export interface MenuListReq {
  name?: string
  type?: number
}

/** 菜单树形表格/下拉行（平铺后的节点结构） */
export interface MenuTreeRow extends MenuItem {
  children?: MenuTreeRow[]
}
