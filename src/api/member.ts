// 用户管理模块接口
import { request } from './http'
import type { MemberItem, MemberListReq } from '@/types/member'
import type { PageResult } from '@/types/common'

export const getMemberList = (params?: Partial<MemberListReq>) => {
  return request<PageResult<MemberItem>>({ url: '/admin/member/list', method: 'get', params })
}

export const setMemberStatus = (id: number, status: number) => {
  return request<null>({ url: '/admin/member/set_status', method: 'post', data: { id, status } })
}
