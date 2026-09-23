<script setup lang="ts">
// 人员新增/修改弹窗（组件化，父组件通过 ref 调用 openCreate / openEdit）
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createUser, updateUser } from '@/api/user'
import type { UserItem, UserSaveReq } from '@/types/user'
import type { DeptTreeRow } from '@/types/dept'
import type { RoleItem } from '@/types/role'
import { Status, IsSuper } from '@/enums/common'
import AvatarUpload from '@/components/AvatarUpload.vue'

const emit = defineEmits<{
  (e: 'success'): void
}>()

defineProps<{
  /** 所属部门下拉的树数据 */
  deptTree: DeptTreeRow[]
  /** 角色下拉选项（平铺带层级前缀） */
  roleOptions: RoleItem[]
}>()

const visible = ref(false)
const isEdit = ref(false)
const editId = ref(0)

const form = reactive({
  username: '',
  password: '',
  nickname: '',
  avatar: '',
  mobile: '',
  email: '',
  dept_id: undefined as number | undefined,
  status: Status.Enabled,
  is_super: IsSuper.No,
  role_ids: [] as number[],
})

const openCreate = () => {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, {
    username: '',
    password: '',
    nickname: '',
    avatar: '',
    mobile: '',
    email: '',
    dept_id: undefined,
    status: Status.Enabled,
    is_super: IsSuper.No,
    role_ids: [],
  })
  visible.value = true
}

const openEdit = (row: UserItem) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    username: row.username,
    password: '',
    nickname: row.nickname,
    avatar: row.avatar,
    mobile: row.mobile,
    email: row.email,
    dept_id: row.dept_id || undefined,
    status: row.status,
    is_super: row.is_super,
    role_ids: row.roles.map((r) => r.id),
  })
  visible.value = true
}

const submit = async () => {
  if (!isEdit.value && (!form.username.trim() || form.password.length < 6)) {
    ElMessage.warning('请填写用户名，密码至少6位')
    return
  }
  const base: UserSaveReq = { ...form, dept_id: form.dept_id ?? 0 }
  if (isEdit.value) {
    await updateUser({ ...base, id: editId.value })
  } else {
    await createUser(base)
  }
  ElMessage.success('保存成功')
  visible.value = false
  emit('success')
}

defineExpose({ openCreate, openEdit })
</script>

<template>
  <el-dialog v-model="visible" :title="isEdit ? '修改人员' : '新增人员'" width="540px">
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
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>
