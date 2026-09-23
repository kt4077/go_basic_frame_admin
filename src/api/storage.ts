// 存储渠道配置接口
import { request } from './http'
import type { StorageSaveReq, StorageItem } from '@/types/storage'

export const getStorageList = () => {
  return request<StorageItem[]>({ url: '/admin/storage/list', method: 'get' })
}

export const createStorage = (data: StorageSaveReq) => {
  return request<StorageItem>({ url: '/admin/storage/add', method: 'post', data })
}

export const updateStorage = (data: StorageSaveReq) => {
  return request<StorageItem>({ url: '/admin/storage/update', method: 'post', data })
}

export const setDefaultStorage = (id: number) => {
  return request<null>({ url: '/admin/storage/set_default', method: 'post', data: { id } })
}

export const deleteStorage = (id: number) => {
  return request<null>({ url: '/admin/storage/delete', method: 'post', data: { id } })
}
