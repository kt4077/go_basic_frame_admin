// 存储渠道枚举与各渠道参数字段模板

/** 渠道类型 */
export const StorageChannelLabels: Record<string, string> = {
  local: '本地存储',
  alioss: '阿里云OSS',
  cos: '腾讯云COS',
  qiniu: '七牛云Kodo',
  minio: 'MinIO',
}

/** 渠道参数字段模板：选择渠道后表单按模板动态渲染 */
export interface StorageParamField {
  key: string
  label: string
  placeholder?: string
}

export const StorageChannelParams: Record<string, StorageParamField[]> = {
  local: [
    { key: 'root_path', label: '存储目录', placeholder: '如 ./uploads' },
    { key: 'domain', label: '访问域名', placeholder: '可选，如 https://static.example.com；留空使用当前站点' },
  ],
  alioss: [
    { key: 'endpoint', label: 'Endpoint', placeholder: '如 oss-cn-hangzhou.aliyuncs.com' },
    { key: 'bucket', label: 'Bucket' },
    { key: 'access_key_id', label: 'AccessKey ID' },
    { key: 'access_key_secret', label: 'AccessKey Secret' },
    { key: 'domain', label: '访问域名', placeholder: '可选，如 https://cdn.example.com' },
  ],
  cos: [
    { key: 'region', label: '地域', placeholder: '如 ap-guangzhou' },
    { key: 'bucket', label: 'Bucket（含APPID）', placeholder: '如 example-1250000000' },
    { key: 'secret_id', label: 'SecretId' },
    { key: 'secret_key', label: 'SecretKey' },
    { key: 'domain', label: '访问域名', placeholder: '可选' },
  ],
  qiniu: [
    { key: 'bucket', label: 'Bucket' },
    { key: 'access_key', label: 'AccessKey' },
    { key: 'secret_key', label: 'SecretKey' },
    { key: 'domain', label: '访问域名', placeholder: '如 https://cdn.example.com' },
  ],
  minio: [
    { key: 'endpoint', label: 'Endpoint', placeholder: '如 http://127.0.0.1:9000' },
    { key: 'bucket', label: 'Bucket' },
    { key: 'access_key', label: 'AccessKey' },
    { key: 'secret_key', label: 'SecretKey' },
    { key: 'domain', label: '访问域名', placeholder: '可选' },
  ],
}

/** 默认渠道标志 */
export const StorageDefault = {
  Yes: 1,
  No: 0,
}
