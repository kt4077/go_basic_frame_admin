import { request } from './http'
import type { Advertisement, AdvertisementFilters, AdvertisementPluginOption } from '@/types/advertisement'

export const getAdvertisements = (params?: AdvertisementFilters) =>
  request<Advertisement[]>({ url: '/admin/advertisement/list', method: 'get', params })

export const getAdvertisementPluginOptions = () =>
  request<AdvertisementPluginOption[]>({ url: '/admin/advertisement/plugin/options', method: 'get' })

export const saveAdvertisement = (data: Advertisement) =>
  request<null>({ url: '/admin/advertisement/save', method: 'post', data })

export const deleteAdvertisement = (id: number) =>
  request<null>({ url: '/admin/advertisement/delete', method: 'post', data: { id } })
