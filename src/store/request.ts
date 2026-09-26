// 全局网络请求状态：查询请求轻提示，数据变更请求使用阻塞式操作提示。
import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

type RequestKind = 'query' | 'action'

interface LoadingState {
  count: number
  visible: Ref<boolean>
  showTimer?: ReturnType<typeof setTimeout>
  hideTimer?: ReturnType<typeof setTimeout>
  shownAt: number
}

const kindOf = (method?: string): RequestKind => {
  const normalized = (method || 'get').toLowerCase()
  return normalized === 'get' || normalized === 'head' || normalized === 'options' ? 'query' : 'action'
}

export const useRequestStore = defineStore('request', () => {
  const query: LoadingState = { count: 0, visible: ref(false), shownAt: 0 }
  const action: LoadingState = { count: 0, visible: ref(false), shownAt: 0 }

  const stateOf = (kind: RequestKind) => kind === 'query' ? query : action
  const showDelay = (kind: RequestKind) => kind === 'query' ? 180 : 100
  const minimumVisible = (kind: RequestKind) => kind === 'query' ? 320 : 450

  const begin = (method?: string) => {
    const kind = kindOf(method)
    const state = stateOf(kind)
    state.count += 1
    if (state.hideTimer) clearTimeout(state.hideTimer)
    if (state.visible.value || state.showTimer) return
    state.showTimer = setTimeout(() => {
      state.showTimer = undefined
      if (state.count === 0) return
      state.shownAt = Date.now()
      state.visible.value = true
    }, showDelay(kind))
  }

  const end = (method?: string) => {
    const kind = kindOf(method)
    const state = stateOf(kind)
    state.count = Math.max(0, state.count - 1)
    if (state.count > 0) return
    if (state.showTimer) {
      clearTimeout(state.showTimer)
      state.showTimer = undefined
    }
    if (!state.visible.value) return
    const remaining = Math.max(0, minimumVisible(kind) - (Date.now() - state.shownAt))
    state.hideTimer = setTimeout(() => {
      state.hideTimer = undefined
      if (state.count === 0) state.visible.value = false
    }, remaining)
  }

  return {
    queryLoading: query.visible,
    actionLoading: action.visible,
    begin,
    end,
  }
})
