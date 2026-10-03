import type { BaseEntity, PageQuery, PageResult } from './common'

export interface FAQGroup extends BaseEntity {
  name: string
  status: number
  sort: number
  faq_count: number
}

export interface FAQGroupSave {
  id?: number
  name: string
  status: number
  sort: number
}

export interface FAQ extends BaseEntity {
  group_id: number
  group_name: string
  name: string
  content: string
  status: number
  sort: number
}

export interface FAQQuery extends PageQuery {
  keyword?: string
  group_id?: number
  status?: number
}

export interface FAQSave {
  id?: number
  group_id: number
  name: string
  content: string
  status: number
  sort: number
}

export type FAQPage = PageResult<FAQ>
