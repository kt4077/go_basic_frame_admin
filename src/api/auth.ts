// 认证模块接口
import { request } from './http'
import type { LoginReq, LoginRes, UserInfo, ChangePasswordReq, ProfileUpdateReq, AvatarUpdateReq } from '@/types/auth'
import type { MenuItem } from '@/types/menu'
import type { TreeNode } from '@/types/common'

export const login = (data: LoginReq) => {
  return request<LoginRes>({ url: '/admin/login', method: 'post', data })
}

export const logout = () => {
  return request<null>({ url: '/admin/logout', method: 'post' })
}

export const getMe = () => {
  return request<UserInfo>({ url: '/admin/me', method: 'get' })
}

/** 当前用户菜单树（目录+菜单） */
export const getRouters = () => {
  return request<TreeNode<MenuItem>[]>({ url: '/admin/routers', method: 'get' })
}

/** 当前用户接口权限列表（按钮显隐用），超级管理员返回 ['*'] */
export const getPermissions = () => {
  return request<string[]>({ url: '/admin/permissions', method: 'get' })
}

export const changePassword = (data: ChangePasswordReq) => {
  return request<null>({ url: '/admin/change_password', method: 'post', data })
}

export const updateProfile = (data: ProfileUpdateReq) => {
  return request<UserInfo>({ url: '/admin/profile/update', method: 'post', data })
}

/** 单独更新当前管理员头像。 */
export const updateAvatar = (data: AvatarUpdateReq) => {
  return request<UserInfo>({ url: '/admin/profile/avatar', method: 'post', data })
}
