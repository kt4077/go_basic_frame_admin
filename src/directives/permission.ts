// v-perm 按钮权限指令：用法 v-perm="'POST:/admin/user/add'"
// 无权限时隐藏元素（display:none），不破坏 DOM 结构与 tooltip 触发器。超级管理员后端返回 ['*']。
import type { Directive } from 'vue'
import { useUserStore } from '@/store/user'

const perm: Directive<HTMLElement, string | string[]> = {
  mounted: (el, binding) => {
    const userStore = useUserStore()
    const need = Array.isArray(binding.value) ? binding.value : [binding.value]
    const ok = need.some((api) => userStore.hasPerm(api))
    if (!ok) {
      el.style.display = 'none'
    }
  },
}

export default perm
