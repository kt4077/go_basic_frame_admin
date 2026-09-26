/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 管理端后端接口域名，例如 http://127.0.0.1:8001 */
  readonly VITE_ADMIN_API_BASE_URL: string
  /** 管理端请求超时时间，单位毫秒，允许范围 1000-300000 */
  readonly VITE_ADMIN_API_TIMEOUT_MS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
