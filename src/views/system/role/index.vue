<script setup lang="ts">
// 角色管理：多级角色 + 分配菜单按钮权限（上级角色自动包含子级权限）
import { onMounted, nextTick, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Key } from '@element-plus/icons-vue'
import { getRoleTree, createRole, updateRole, deleteRole, getRoleMenuIds, assignRoleMenus } from '@/api/role'
import { getMenuTree } from '@/api/menu'
import type { RoleItem } from '@/types/role'
import type { MenuItem } from '@/types/menu'
import type { TreeNode } from '@/types/common'
import { Status, StatusLabels } from '@/enums/common'

interface RoleRow extends RoleItem {
  children?: RoleRow[]
}

const loading = ref(false)
const list = ref<RoleRow[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)

const form = reactive({
  name: '', code: '', parent_id: undefined as number | undefined, sort: 0, status: Status.Enabled, remark: '',
})

const toRows = (nodes: TreeNode<RoleItem>[]): RoleRow[] => {
  return nodes.map((n) => ({
    ...n.data,
    children: n.children && n.children.length > 0 ? toRows(n.children) : undefined,
  }))
}

const load = async () => {
  loading.value = true
  try {
    list.value = toRows(await getRoleTree())
  } finally {
    loading.value = false
  }
}

const openCreate = (parent?: RoleRow) => {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, {
    name: '', code: '', parent_id: parent?.id,
    sort: 0, status: Status.Enabled, remark: '',
  })
  dialogVisible.value = true
}

const openEdit = (row: RoleRow) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    name: row.name, code: row.code, parent_id: row.parent_id || undefined,
    sort: row.sort, status: row.status, remark: row.remark,
  })
  dialogVisible.value = true
}

const submit = async () => {
  if (!form.name.trim() || !form.code.trim()) {
    ElMessage.warning('请填写角色名称与编码')
    return
  }
  if (isEdit.value) {
    await updateRole({ ...form, id: editId.value, parent_id: form.parent_id ?? 0 })
  } else {
    await createRole({ ...form, parent_id: form.parent_id ?? 0 })
  }
  ElMessage.success('保存成功')
  dialogVisible.value = false
  await load()
}

const onDelete = async (row: RoleRow) => {
  await ElMessageBox.confirm(`确认删除角色「${row.name}」吗？`, '提示', { type: 'warning' })
  await deleteRole(row.id)
  ElMessage.success('删除成功')
  await load()
}

// ---------- 分配权限 ----------
const permDialogVisible = ref(false)
const permRoleId = ref(0)
const permRoleName = ref('')
const permTreeRef = ref()
const permTreeData = ref<RoleMenuNode[]>([])

interface RoleMenuNode {
  id: number
  name: string
  type: number
  children?: RoleMenuNode[]
}

const openPerm = async (row: RoleRow) => {
  permRoleId.value = row.id
  permRoleName.value = row.name
  const [tree, checked] = await Promise.all([
    getMenuTree(),
    getRoleMenuIds(row.id),
  ])
  permTreeData.value = toMenuNodes(tree)
  permDialogVisible.value = true
  // 等树渲染完再回显勾选（仅叶子 id 回显，避免父级半选干扰）
  nextTick(() => {
    permTreeRef.value?.setCheckedKeys(checked.filter((id) => !isParentId(tree, id)))
  })
}

const toMenuNodes = (nodes: TreeNode<MenuItem>[]): RoleMenuNode[] => {
  return nodes.map((n) => ({
    id: n.data.id,
    name: n.data.name,
    type: n.data.type,
    children: n.children && n.children.length > 0 ? toMenuNodes(n.children) : undefined,
  }))
}

/** 判断某 id 在原始树中是否为父节点 */
const isParentId = (nodes: TreeNode<MenuItem>[], id: number): boolean => {
  for (const n of nodes) {
    if (n.data.id === id) return (n.children ?? []).length > 0
    if (n.children && isParentId(n.children, id)) return true
  }
  return false
}

const submitPerm = async () => {
  const checked = permTreeRef.value?.getCheckedKeys() as number[]
  const halfChecked = permTreeRef.value?.getHalfCheckedKeys() as number[]
  await assignRoleMenus(permRoleId.value, [...halfChecked, ...checked])
  ElMessage.success('权限分配成功')
  permDialogVisible.value = false
}

onMounted(load)
</script>

<template>
  <div class="page-card">
    <div class="toolbar">
      <h4>角色管理</h4>
      <el-button v-perm="'POST:/admin/role/add'" type="primary" @click="openCreate()">新增角色</el-button>
    </div>

    <el-table :data="list" v-loading="loading" row-key="id"
      :tree-props="{ children: 'children' }">
      <el-table-column prop="name" label="角色名称" min-width="180" />
      <el-table-column prop="code" label="角色编码" min-width="140" />
      <el-table-column prop="sort" label="排序" width="90" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === Status.Enabled ? 'success' : 'danger'">
            {{ StatusLabels[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="160" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <div class="table-operations">
            <el-tooltip content="添加子角色" placement="top">
              <el-icon v-perm="'POST:/admin/role/add'" class="op-icon" @click="openCreate(row)"><Plus /></el-icon>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-icon v-perm="'POST:/admin/role/update'" class="op-icon is-edit" @click="openEdit(row)"><Edit /></el-icon>
            </el-tooltip>
            <el-tooltip content="分配权限" placement="top">
              <el-icon v-perm="'POST:/admin/role/assign_menus'" class="op-icon" @click="openPerm(row)"><Key /></el-icon>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-icon v-perm="'POST:/admin/role/delete'" class="op-icon is-danger" @click="onDelete(row)"><Delete /></el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '修改角色' : '新增角色'" width="480px">
      <el-form label-position="left" label-width="90px">
        <el-form-item label="上级角色">
          <el-tree-select
            v-model="form.parent_id"
            :data="list"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            node-key="id"
            value-key="id"
            check-strictly
            clearable
            placeholder="不选则为顶级角色"
            default-expand-all
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="角色名称" required>
          <el-input v-model="form.name" maxlength="32" />
        </el-form-item>
        <el-form-item label="角色编码" required>
          <el-input v-model="form.code" maxlength="32" placeholder="如 op_staff" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio-button :value="Status.Enabled">启用</el-radio-button>
            <el-radio-button :value="Status.Disabled">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="permDialogVisible" :title="`分配权限 - ${permRoleName}`" width="460px">
      <el-alert type="info" :closable="false" title="上级角色自动拥有其子级、孙级角色的权限" style="margin-bottom: 12px" />
      <el-tree
        ref="permTreeRef"
        :data="permTreeData"
        :props="{ label: 'name', children: 'children' }"
        node-key="id"
        show-checkbox
        default-expand-all
      />
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPerm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
