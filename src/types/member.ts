// 用户管理模块类型
import type { BaseEntity, PageQuery } from './common'

/** 系统用户实体 */
export interface MemberItem extends BaseEntity {
  nickname: string
  real_name: string
  account: string
  mobile: string
  avatar: string
  gender: number
  age: number
  birthday: string
  register_ip: string
  login_ip: string
  registered_at: string | null
  logged_at: string | null
  balance: string
  register_source: number
  status: number
}

/** 系统用户列表查询参数 */
export interface MemberListReq extends PageQuery {
  keyword?: string
  status?: number
  register_source?: number
}
