// 人员模块接口
import { request } from './http'
import type { UserListReq, UserSaveReq, UserItem } from '@/types/user'
import type { PageResult } from '@/types/common'

export const getUserList = (params?: Partial<UserListReq>) => {
  return request<PageResult<UserItem>>({ url: '/admin/user/list', method: 'get', params })
}

export const createUser = (data: UserSaveReq) => {
  return request<UserItem>({ url: '/admin/user/add', method: 'post', data })
}

export const updateUser = (data: UserSaveReq) => {
  return request<UserItem>({ url: '/admin/user/update', method: 'post', data })
}

export const deleteUser = (id: number) => {
  return request<null>({ url: '/admin/user/delete', method: 'post', data: { id } })
}

export const resetUserPassword = (id: number, password: string) => {
  return request<null>({ url: '/admin/user/reset_password', method: 'post', data: { id, password } })
}

export const kickUser = (id: number) => {
  return request<null>({ url: '/admin/user/kick', method: 'post', data: { id } })
}
