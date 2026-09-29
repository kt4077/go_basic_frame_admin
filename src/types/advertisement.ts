export interface Advertisement {
  id: number
  name: string
  ad_id: string
  format: number
  status: number
  plugin_ids: number[]
  plugin_names: string[]
  platforms: number[]
  description: string
  created_at?: string
  updated_at?: string
}

export interface AdvertisementPluginOption {
  id: number
  plugin_id: string
  name: string
  status: number
}

export interface AdvertisementFilters {
  name?: string
  format?: number
  status?: number
}
