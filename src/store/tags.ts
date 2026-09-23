// 页面标签状态：记录访问过的页面标签，支持关闭/关闭其他/关闭所有
// 标签随会话保存在 sessionStorage，刷新页面后恢复
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TagItem {
  path: string
  title: string
  /** 固定标签（默认首页）不可关闭 */
  affix: boolean
}

const STORAGE_KEY = 'tags_view'

const load = (): TagItem[] => {
  try {
    const list = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

const save = (tags: TagItem[]) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tags))
}

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<TagItem[]>(load())

  const add = (tag: TagItem) => {
    const existing = tags.value.find((item) => item.path === tag.path)
    if (existing) {
      // 菜单名称可能在后台调整；不能让 sessionStorage 中的旧标题长期覆盖最新路由标题。
      existing.title = tag.title
      existing.affix = tag.affix
      save(tags.value)
    } else {
      tags.value.push(tag)
      save(tags.value)
    }
  }

  const clear = () => {
    tags.value = []
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const remove = (path: string) => {
    tags.value = tags.value.filter((item) => item.path !== path || item.affix)
    save(tags.value)
  }

  const closeOthers = (path: string) => {
    tags.value = tags.value.filter((item) => item.affix || item.path === path)
    save(tags.value)
  }

  const closeAll = () => {
    tags.value = tags.value.filter((item) => item.affix)
    save(tags.value)
  }

  return { tags, add, remove, closeOthers, closeAll, clear }
})
