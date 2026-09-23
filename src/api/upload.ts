import { request } from './http'

export interface UploadFileResult {
  id: number
  file_name: string
  mime_type: string
  size: number
  relative_path: string
  url: string
}

export const uploadFile = (file: File) => {
  const data = new FormData()
  data.append('file', file)
  return request<UploadFileResult>({
    url: '/admin/upload/file',
    method: 'post',
    data,
  })
}
