import { request } from './http'
import type { Agreement, AgreementSave } from '@/types/agreement'

export const getAgreements = (params?: { type?: number; status?: number }) => request<Agreement[]>({
  url: '/admin/agreement/list',
  method: 'get',
  params,
})

export const saveAgreement = (data: AgreementSave) => request<Agreement>({
  url: '/admin/agreement/save',
  method: 'post',
  data,
})

export const deleteAgreement = (id: number) => request<null>({
  url: '/admin/agreement/delete',
  method: 'post',
  data: { id },
})
