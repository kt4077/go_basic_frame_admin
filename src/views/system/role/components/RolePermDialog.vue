<script setup lang="ts">
// 角色分配权限弹窗（组件化，父组件通过 ref 调用 open）
import { nextTick, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getRoleMenuIds, assignRoleMenus } from '@/api/role'
import { getMenuTree } from '@/api/menu'
import type { RoleItem } from '@/types/role'
import type { MenuItem } from '@/types/menu'
import type { TreeNode } from '@/types/common'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const visible = ref(false)
const roleName = ref('')
const roleId = ref(0)
const permTreeRef = ref()
const permTreeData = ref<RoleMenuNode[]>([])

interface RoleMenuNode {
  id: number
  name: string
  type: number
  children?: RoleMenuNode[]
}

const state = reactive({ loading: false })

const toMenuNodes = (nodes: TreeNode<MenuItem>[]): RoleMenuNode[] => {
  return nodes.map((n) => ({
    id: n.data.id,
    name: n.data.name,
    type: n.data.type,
    children: n.children && n.children.length > 0 ? toMenuNodes(n.children) : undefined,
  }))
}

/** 判断某 id 在原始树中是否为父节点（回显时只勾叶子） */
const isParentId = (nodes: TreeNode<MenuItem>[], id: number): boolean => {
  for (const n of nodes) {
    if (n.data.id === id) return (n.children ?? []).length > 0
    if (n.children && isParentId(n.children, id)) return true
  }
  return false
}

const open = async (row: RoleItem) => {
  roleId.value = row.id
  roleName.value = row.name
  state.loading = true
  try {
    const [tree, checked] = await Promise.all([getMenuTree(), getRoleMenuIds(row.id)])
    permTreeData.value = toMenuNodes(tree)
    visible.value = true
    // 等树渲染完再回显勾选（仅叶子 id 回显，避免父级半选干扰）
    nextTick(() => {
      permTreeRef.value?.setCheckedKeys(checked.filter((id) => !isParentId(tree, id)))
    })
  } finally {
    state.loading = false
  }
}

const submit = async () => {
  const checked = permTreeRef.value?.getCheckedKeys() as number[]
  const halfChecked = permTreeRef.value?.getHalfCheckedKeys() as number[]
  await assignRoleMenus(roleId.value, [...halfChecked, ...checked])
  ElMessage.success('权限分配成功')
  visible.value = false
  emit('success')
}

defineExpose({ open })
</script>

<template>
  <el-dialog v-model="visible" :title="`分配权限 - ${roleName}`" width="460px">
    <el-alert type="info" :closable="false" title="上级角色自动拥有其子级、孙级角色的权限" style="margin-bottom: 12px" />
    <el-tree
      ref="permTreeRef"
      v-loading="state.loading"
      :data="permTreeData"
      :props="{ label: 'name', children: 'children' }"
      node-key="id"
      show-checkbox
      default-expand-all
    />
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>
