import { request } from './http'
import type {
  AdminPlatformConfig,
  AdminPlatformConfigSave,
  UserPlatformConfig,
  UserPlatformConfigSave,
} from '@/types/platform'

/** 查询公开的管理端品牌配置，登录页和顶栏使用。 */
export const getPublicAdminPlatformConfig = () =>
  request<AdminPlatformConfig>({ url: '/admin/platform/public', method: 'get' })

/** 查询管理端平台配置。 */
export const getAdminPlatformConfig = () =>
  request<AdminPlatformConfig>({ url: '/admin/platform/admin/detail', method: 'get' })

/** 保存管理端平台配置。 */
export const saveAdminPlatformConfig = (data: AdminPlatformConfigSave) =>
  request<AdminPlatformConfig>({ url: '/admin/platform/admin/save', method: 'post', data })

/** 查询用户端平台配置。 */
export const getUserPlatformConfig = () =>
  request<UserPlatformConfig>({ url: '/admin/platform/user/detail', method: 'get' })

/** 保存用户端平台配置。 */
export const saveUserPlatformConfig = (data: UserPlatformConfigSave) =>
  request<UserPlatformConfig>({ url: '/admin/platform/user/save', method: 'post', data })
