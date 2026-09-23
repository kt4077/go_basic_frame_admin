// 角色模块接口
import { request } from './http'
import type { RoleListReq, RoleSaveReq, RoleItem } from '@/types/role'
import type { PageResult, TreeNode } from '@/types/common'

export const getRoleList = (params?: Partial<RoleListReq>) => {
  return request<PageResult<RoleItem>>({ url: '/admin/role/list', method: 'get', params })
}

export const getRoleTree = () => {
  return request<TreeNode<RoleItem>[]>({ url: '/admin/role/tree', method: 'get' })
}

export const createRole = (data: RoleSaveReq) => {
  return request<RoleItem>({ url: '/admin/role/add', method: 'post', data })
}

export const updateRole = (data: RoleSaveReq) => {
  return request<RoleItem>({ url: '/admin/role/update', method: 'post', data })
}

export const deleteRole = (id: number) => {
  return request<null>({ url: '/admin/role/delete', method: 'post', data: { id } })
}

/** 角色已绑定的菜单/按钮 ID */
export const getRoleMenuIds = (id: number) => {
  return request<number[]>({ url: '/admin/role/menus', method: 'get', params: { id } })
}

/** 给角色分配菜单/按钮权限 */
export const assignRoleMenus = (role_id: number, menu_ids: number[]) => {
  return request<null>({ url: '/admin/role/assign_menus', method: 'post', data: { role_id, menu_ids } })
}

/** 角色下绑定的用户 ID */
export const getRoleUserIds = (id: number) => {
  return request<number[]>({ url: '/admin/role/users', method: 'get', params: { id } })
}
