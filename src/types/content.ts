export interface ContentBase {
  id: number
  position: number
  platforms: number[]
  link_type: number
  link_url: string
  status: number
  sort: number
  remark: string
  created_at?: string
  updated_at?: string
}

export interface ContentMenu extends ContentBase {
  name: string
  display_type: number
  icon: string
  image_path: string
  image_url?: string
}

export interface ContentBanner extends ContentBase {
  title: string
  image_path: string
  image_url?: string
}
