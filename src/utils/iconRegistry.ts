import type { Component } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'

export type AppIconSource = 'element-plus' | 'iconpark' | 'plugin'

export interface AppIconDefinition {
  name: string
  label: string
  source: AppIconSource
  component: Component
}

const elementPlusIconMap = ElementPlusIcons as unknown as Record<string, Component>
const pluginIconMap = new Map<string, Component>()
let iconParkIconMap: Record<string, Component> | null = null
let iconParkIcons: AppIconDefinition[] | null = null
let iconParkLoadingPromise: Promise<AppIconDefinition[]> | null = null

const isIconComponent = (value: unknown): value is Component =>
  typeof value === 'object' || typeof value === 'function'

const elementPlusIcons: AppIconDefinition[] = Object.entries(elementPlusIconMap)
  .filter(([, component]) => isIconComponent(component))
  .map(([name, component]) => ({
    name,
    label: name,
    source: 'element-plus',
    component,
  }))

const loadIconParkIcons = async () => {
  if (iconParkIconMap && iconParkIcons) return iconParkIcons
  if (!iconParkLoadingPromise) {
    iconParkLoadingPromise = import('@icon-park/vue-next').then((module) => {
      iconParkIconMap = module as unknown as Record<string, Component>
      iconParkIcons = Object.entries(iconParkIconMap)
        .filter(([name, component]) =>
          name !== 'DEFAULT_ICON_CONFIGS'
          && name !== 'IconProvider'
          && isIconComponent(component)
        )
        .map(([name, component]) => ({
          name: `iconpark:${name}`,
          label: name,
          source: 'iconpark',
          component,
        }))
      return iconParkIcons
    }).catch((error) => {
      iconParkLoadingPromise = null
      throw error
    })
  }
  return iconParkLoadingPromise
}

export const getAppIcons = async (source: Exclude<AppIconSource, 'plugin'>) =>
  source === 'iconpark' ? loadIconParkIcons() : elementPlusIcons

/** 插件可在入口中注册 plugin:{plugin_id}:{icon_name} 格式的本地图标。 */
export const registerPluginIcons = (pluginId: string, icons: Record<string, Component>) => {
  for (const [name, component] of Object.entries(icons)) {
    pluginIconMap.set(`plugin:${pluginId}:${name}`, component)
  }
}

export const resolveAppIcon = async (name: string): Promise<AppIconDefinition | null> => {
  const normalizedName = name.trim()
  if (!normalizedName) return null

  if (normalizedName.startsWith('iconpark:')) {
    const iconName = normalizedName.slice('iconpark:'.length)
    await loadIconParkIcons()
    const component = iconParkIconMap?.[iconName]
    return isIconComponent(component)
      ? { name: normalizedName, label: iconName, source: 'iconpark', component }
      : null
  }

  if (normalizedName.startsWith('plugin:')) {
    const component = pluginIconMap.get(normalizedName)
    return component
      ? { name: normalizedName, label: normalizedName.split(':').at(-1) || normalizedName, source: 'plugin', component }
      : null
  }

  const iconName = normalizedName.startsWith('ep:')
    ? normalizedName.slice('ep:'.length)
    : normalizedName
  const component = elementPlusIconMap[iconName]
  return isIconComponent(component)
    ? { name: normalizedName, label: iconName, source: 'element-plus', component }
    : null
}
