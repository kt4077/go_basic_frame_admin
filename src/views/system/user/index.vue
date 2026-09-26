<script setup lang="ts">
// 人员管理：人员 CRUD、角色分配、重置密码、踢下线
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Key, SwitchButton, Search, Refresh } from '@element-plus/icons-vue'
import { getUserList, createUser, updateUser, deleteUser, resetUserPassword, kickUser } from '@/api/user'
import { formatDateTimeCell } from '@/utils/datetime'
import { getDeptTree } from '@/api/dept'
import { getRoleTree } from '@/api/role'
import type { UserItem } from '@/types/user'
import type { DeptItem } from '@/types/dept'
import type { RoleItem } from '@/types/role'
import type { TreeNode } from '@/types/common'
import { Status, StatusLabels, IsSuper } from '@/enums/common'
import AvatarUpload from '@/components/AvatarUpload.vue'

const loading = ref(false)
const total = ref(0)
const list = ref<UserItem[]>([])
const query = reactive({ keyword: '', status: undefined as number | undefined, dept_id: undefined as number | undefined, page: 1, page_size: 20 })

// 部门树与角色列表（下拉用）
interface DeptRow extends DeptItem {
  children?: DeptRow[]
}

/** el-tree-select 要求 id/name 在节点顶层，后端树是 {data, children} 包裹结构，需平铺转换 */
const toDeptRows = (nodes: TreeNode<DeptItem>[]): DeptRow[] => {
  return nodes.map((n) => ({
    ...n.data,
    children: n.children && n.children.length > 0 ? toDeptRows(n.children) : undefined,
  }))
}

const deptTree = ref<DeptRow[]>([])
const roleOptions = ref<RoleItem[]>([])

const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)

const form = reactive({
  username: '', password: '', nickname: '', avatar: '', mobile: '', email: '',
  dept_id: undefined as number | undefined, status: Status.Enabled, is_super: IsSuper.No, role_ids: [] as number[],
})

const load = async () => {
  loading.value = true
  try {
    const res = await getUserList({
      keyword: query.keyword || undefined,
      status: query.status,
      dept_id: query.dept_id,
      page: query.page,
      page_size: query.page_size,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const loadOptions = async () => {
  const [depts, roles] = await Promise.all([getDeptTree(), getRoleTree()])
  deptTree.value = toDeptRows(depts)
  roleOptions.value = flattenRoles(roles)
}

const flattenRoles = (nodes: TreeNode<RoleItem>[]): RoleItem[] => {
  const out: RoleItem[] = []
  const walk = (list: TreeNode<RoleItem>[], prefix: string) => {
    for (const n of list) {
      const name = prefix + n.data.name
      out.push({ ...n.data, name })
      if (n.children) walk(n.children, name + ' / ')
    }
  }
  walk(nodes, '')
  return out
}

const openCreate = () => {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, {
    username: '', password: '', nickname: '', avatar: '', mobile: '', email: '',
    dept_id: undefined, status: Status.Enabled, is_super: IsSuper.No, role_ids: [],
  })
  dialogVisible.value = true
}

const openEdit = (row: UserItem) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    username: row.username, password: '', nickname: row.nickname, avatar: row.avatar, mobile: row.mobile,
    email: row.email, dept_id: row.dept_id || undefined, status: row.status, is_super: row.is_super,
    role_ids: row.roles.map((r) => r.id),
  })
  dialogVisible.value = true
}

const submit = async () => {
  if (!isEdit.value && (!form.username.trim() || form.password.length < 6)) {
    ElMessage.warning('请填写用户名，密码至少6位')
    return
  }
  if (isEdit.value) {
    await updateUser({ ...form, id: editId.value, dept_id: form.dept_id ?? 0 })
  } else {
    await createUser({ ...form, dept_id: form.dept_id ?? 0 })
  }
  ElMessage.success('保存成功')
  dialogVisible.value = false
  await load()
}

const onDelete = async (row: UserItem) => {
  await ElMessageBox.confirm(`确认删除用户「${row.username}」吗？`, '提示', { type: 'warning' })
  await deleteUser(row.id)
  ElMessage.success('删除成功')
  await load()
}

const onResetPassword = async (row: UserItem) => {
  const { value } = await ElMessageBox.prompt(`为用户「${row.username}」设置新密码（至少6位）`, '重置密码', {
    inputType: 'password',
    inputPattern: /^.{6,}$/,
    inputErrorMessage: '密码至少6位',
  })
  await resetUserPassword(row.id, value)
  ElMessage.success('重置成功，该账号已下线')
}

const onKick = async (row: UserItem) => {
  await ElMessageBox.confirm(`确认踢用户「${row.username}」下线吗？`, '提示', { type: 'warning' })
  await kickUser(row.id)
  ElMessage.success('操作成功')
}

const reset = () => {
  query.keyword = ''
  query.status = undefined
  query.dept_id = undefined
  query.page = 1
  load()
}

onMounted(() => {
  load()
  loadOptions()
})
</script>

<template>
  <div class="page-card">
    <div class="toolbar">
      <div class="toolbar-left">
        <h4>人员管理</h4>
        <el-input v-model="query.keyword" placeholder="用户名/姓名/手机号" clearable style="width: 200px" @change="query.page = 1; load()" />
        <el-select v-model="query.status" placeholder="状态" clearable style="width: 110px" @change="query.page = 1; load()">
          <el-option label="启用" :value="Status.Enabled" />
          <el-option label="禁用" :value="Status.Disabled" />
        </el-select>
        <el-tree-select
          v-model="query.dept_id"
          :data="deptTree"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          node-key="id"
          value-key="id"
          check-strictly
          clearable
          default-expand-all
          placeholder="所属部门"
          style="width: 180px"
          @change="query.page = 1; load()"
        />
        <el-button type="primary" :icon="Search" @click="query.page = 1; load()">搜索</el-button>
        <el-button :icon="Refresh" @click="reset">重置</el-button>
      </div>
      <el-button v-perm="'POST:/admin/user/add'" type="primary" @click="openCreate()">新增人员</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column label="用户" min-width="180">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="34" :src="row.avatar">
              {{ (row.nickname || row.username).slice(0, 1) }}
            </el-avatar>
            <div><div>{{ row.username }}</div><small>{{ row.nickname || '未设置姓名' }}</small></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="角色" min-width="160">
        <template #default="{ row }">
          <el-tag v-for="r in row.roles" :key="r.id" size="small" style="margin-right: 4px">{{ r.name }}</el-tag>
          <span v-if="row.is_super === IsSuper.Yes"><el-tag size="small" type="danger">超级管理员</el-tag></span>
        </template>
      </el-table-column>
      <el-table-column prop="mobile" label="手机号" width="130" />
      <el-table-column prop="email" label="邮箱" min-width="170" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === Status.Enabled ? 'success' : 'danger'">
            {{ StatusLabels[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="170" :formatter="formatDateTimeCell" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <div class="table-operations">
            <el-tooltip content="修改" placement="top">
              <el-icon v-perm="'POST:/admin/user/update'" class="op-icon is-edit" @click="openEdit(row)"><Edit /></el-icon>
            </el-tooltip>
            <el-tooltip content="重置密码" placement="top">
              <el-icon v-perm="'POST:/admin/user/reset_password'" class="op-icon" @click="onResetPassword(row)"><Key /></el-icon>
            </el-tooltip>
            <el-tooltip v-if="row.is_super !== IsSuper.Yes" content="踢下线" placement="top">
              <el-icon v-perm="'POST:/admin/user/kick'" class="op-icon is-warning" @click="onKick(row)"><SwitchButton /></el-icon>
            </el-tooltip>
            <el-tooltip v-if="row.is_super !== IsSuper.Yes" content="删除" placement="top">
              <el-icon v-perm="'POST:/admin/user/delete'" class="op-icon is-danger" @click="onDelete(row)"><Delete /></el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <AppPagination
      v-model:page="query.page"
      v-model:page-size="query.page_size"
      :total="total"
      @change="load"
    />

    <el-dialog v-model="dialogVisible" :title="isEdit ? '修改人员' : '新增人员'" width="540px">
      <el-form label-position="left" label-width="90px">
        <el-form-item label="用户名" required>
          <el-input v-model="form.username" :disabled="isEdit" maxlength="32" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="初始密码" required>
          <el-input v-model="form.password" type="password" show-password placeholder="至少6位" autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.nickname" maxlength="32" />
        </el-form-item>
        <el-form-item label="头像">
          <AvatarUpload v-model="form.avatar" />
        </el-form-item>
        <el-form-item label="所属部门">
          <el-tree-select
            v-model="form.dept_id"
            :data="deptTree"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            node-key="id"
            value-key="id"
            check-strictly
            clearable
            placeholder="可选"
            default-expand-all
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role_ids" multiple style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="form.mobile" maxlength="16" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="form.email" maxlength="64" />
        </el-form-item>
        <el-form-item label="超级管理员">
          <el-switch :model-value="form.is_super === IsSuper.Yes"
            @update:model-value="form.is_super = $event ? IsSuper.Yes : IsSuper.No" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio-button :value="Status.Enabled">启用</el-radio-button>
            <el-radio-button :value="Status.Disabled">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.user-cell { display: flex; align-items: center; gap: 10px; }
.user-cell small { color: var(--el-text-color-secondary); }
</style>
