import type { ContentBanner, ContentMenu } from '@/types/content'
import { request } from './http'

export const getContentMenus = (params?: { position?: number; status?: number }) =>
  request<ContentMenu[]>({
    url: '/admin/content/menu/list',
    method: 'GET',
    params,
  })

export const saveContentMenu = (data: ContentMenu) =>
  request({
    url: '/admin/content/menu/save',
    method: 'POST',
    data,
  })

export const deleteContentMenu = (id: number) =>
  request({
    url: '/admin/content/menu/delete',
    method: 'POST',
    data: { id },
  })

export const getContentBanners = (params?: { position?: number; status?: number }) =>
  request<ContentBanner[]>({
    url: '/admin/content/banner/list',
    method: 'GET',
    params,
  })

export const saveContentBanner = (data: ContentBanner) =>
  request({
    url: '/admin/content/banner/save',
    method: 'POST',
    data,
  })

export const deleteContentBanner = (id: number) =>
  request({
    url: '/admin/content/banner/delete',
    method: 'POST',
    data: { id },
  })
