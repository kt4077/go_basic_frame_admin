import type { BaseEntity } from './common'

export interface Agreement extends BaseEntity {
  title: string
  type: number
  content: string
  status: number
  sort: number
  remark: string
}

export interface AgreementSave {
  id?: number
  title: string
  type: number
  content: string
  status: number
  sort: number
  remark: string
}
