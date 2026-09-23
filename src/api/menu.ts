// 菜单模块接口
import { request } from './http'
import type { MenuSaveReq, MenuListReq, MenuItem } from '@/types/menu'
import type { TreeNode } from '@/types/common'

export const getMenuList = (params?: MenuListReq) => {
  return request<MenuItem[]>({ url: '/admin/menu/list', method: 'get', params })
}

export const getMenuTree = () => {
  return request<TreeNode<MenuItem>[]>({ url: '/admin/menu/tree', method: 'get' })
}

export const createMenu = (data: MenuSaveReq) => {
  return request<MenuItem>({ url: '/admin/menu/add', method: 'post', data })
}

export const updateMenu = (data: MenuSaveReq) => {
  return request<MenuItem>({ url: '/admin/menu/update', method: 'post', data })
}

export const deleteMenu = (id: number) => {
  return request<null>({ url: '/admin/menu/delete', method: 'post', data: { id } })
}
