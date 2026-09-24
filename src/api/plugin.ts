// 插件管理接口
import { request } from './http'
import type { PageResult } from '@/types/common'
import type {
  PluginDetail,
  PluginInfoUpdateReq,
  PluginItem,
  PluginListReq,
  PluginStatusReq,
} from '@/types/plugin'

export const getPluginList = (params: PluginListReq) => {
  return request<PageResult<PluginItem>>({ url: '/admin/plugin/list', method: 'get', params })
}

export const getPluginDetail = (pluginID: string) => {
  return request<PluginDetail>({
    url: '/admin/plugin/detail',
    method: 'get',
    params: { plugin_id: pluginID },
  })
}

export const updatePluginStatus = (data: PluginStatusReq) => {
  return request<null>({ url: '/admin/plugin/status', method: 'post', data })
}

export const updatePluginInfo = (data: PluginInfoUpdateReq) => {
  return request<null>({ url: '/admin/plugin/info', method: 'post', data })
}
