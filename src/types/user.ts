// 用户模块类型
import type { BaseEntity, PageQuery } from './common'
import type { RoleBrief } from './auth'

/** 用户实体 */
export interface UserItem extends BaseEntity {
  username: string
  nickname: string
  avatar: string
  mobile: string
  email: string
  dept_id: number
  status: number
  is_super: number
  roles: RoleBrief[]
}

/** 用户列表查询参数 */
export interface UserListReq extends PageQuery {
  keyword?: string
  status?: number
  dept_id?: number
}

/** 用户保存请求（新增/修改共用；新增需要 password） */
export interface UserSaveReq {
  id?: number
  username?: string
  password?: string
  nickname: string
  avatar: string
  mobile: string
  email: string
  dept_id: number
  status: number
  is_super: number
  role_ids: number[]
}
