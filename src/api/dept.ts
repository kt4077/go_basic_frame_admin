// 部门（组织架构）模块接口
import { request } from './http'
import type { DeptSaveReq, DeptItem } from '@/types/dept'
import type { TreeNode } from '@/types/common'

export const getDeptTree = () => {
  return request<TreeNode<DeptItem>[]>({ url: '/admin/dept/tree', method: 'get' })
}

export const createDept = (data: DeptSaveReq) => {
  return request<DeptItem>({ url: '/admin/dept/add', method: 'post', data })
}

export const updateDept = (data: DeptSaveReq) => {
  return request<DeptItem>({ url: '/admin/dept/update', method: 'post', data })
}

export const deleteDept = (id: number) => {
  return request<null>({ url: '/admin/dept/delete', method: 'post', data: { id } })
}
