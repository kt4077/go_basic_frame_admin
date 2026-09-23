import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPublicAdminPlatformConfig } from '@/api/platform'
import type { AdminPlatformConfig } from '@/types/platform'

const defaultAdminConfig = (): AdminPlatformConfig => ({
  logo: '',
  logo_path: '',
  system_name: '后台管理系统',
})

/** 平台公开配置状态，供登录页和管理端品牌区域共用。 */
export const usePlatformStore = defineStore('platform', () => {
  const adminConfig = ref<AdminPlatformConfig>(defaultAdminConfig())
  const loaded = ref(false)

  const loadAdminConfig = async () => {
    if (loaded.value) return
    try {
      const result = await getPublicAdminPlatformConfig()
      adminConfig.value = {
        ...result,
        system_name: result.system_name || defaultAdminConfig().system_name,
      }
    } catch {
      // 公共配置加载失败时保留内置品牌信息，不阻断登录及其他业务。
    } finally {
      loaded.value = true
    }
  }

  const setAdminConfig = (config: AdminPlatformConfig) => {
    adminConfig.value = config
    loaded.value = true
  }

  return { adminConfig, loaded, loadAdminConfig, setAdminConfig }
})
