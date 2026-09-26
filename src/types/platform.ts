/** 管理端平台配置。 */
export interface AdminPlatformConfig {
  logo: string
  logo_path: string
  system_name: string
  version: string
}

/** 管理端平台配置保存参数。 */
export interface AdminPlatformConfigSave {
  logo: string
  system_name: string
}

/** 用户端平台配置。 */
export interface UserPlatformConfig {
  default_nickname: string
  default_avatar: string
  default_avatar_path: string
}

/** 用户端平台配置保存参数。 */
export interface UserPlatformConfigSave {
  default_nickname: string
  default_avatar: string
}
