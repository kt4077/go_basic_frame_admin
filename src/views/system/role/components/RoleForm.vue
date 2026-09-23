<script setup lang="ts">
// 角色新增/修改弹窗（组件化，父组件通过 ref 调用 openCreate / openEdit）
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createRole, updateRole } from '@/api/role'
import type { RoleItem, RoleTreeRow } from '@/types/role'
import { Status } from '@/enums/common'

const emit = defineEmits<{
  (e: 'success'): void
}>()

defineProps<{
  /** 上级角色下拉的树数据 */
  treeData: RoleTreeRow[]
}>()

const visible = ref(false)
const isEdit = ref(false)
const editId = ref(0)

const form = reactive({
  name: '',
  code: '',
  parent_id: undefined as number | undefined,
  sort: 0,
  status: Status.Enabled,
  remark: '',
})

const openCreate = (parent?: RoleTreeRow) => {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, {
    name: '',
    code: '',
    parent_id: parent?.id,
    sort: 0,
    status: Status.Enabled,
    remark: '',
  })
  visible.value = true
}

const openEdit = (row: RoleItem) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    name: row.name,
    code: row.code,
    parent_id: row.parent_id || undefined,
    sort: row.sort,
    status: row.status,
    remark: row.remark,
  })
  visible.value = true
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
  visible.value = false
  emit('success')
}

defineExpose({ openCreate, openEdit })
</script>

<template>
  <el-dialog v-model="visible" :title="isEdit ? '修改角色' : '新增角色'" width="480px">
    <el-form label-position="left" label-width="90px">
      <el-form-item label="上级角色">
        <el-tree-select
          v-model="form.parent_id"
          :data="treeData"
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
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>
