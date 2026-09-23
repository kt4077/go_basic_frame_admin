<script setup lang="ts">
// 部门新增/修改弹窗（组件化，父组件通过 ref 调用 openCreate / openEdit）
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createDept, updateDept } from '@/api/dept'
import type { DeptItem, DeptTreeRow } from '@/types/dept'

const emit = defineEmits<{
  (e: 'success'): void
}>()

defineProps<{
  /** 上级部门下拉的树数据 */
  treeData: DeptTreeRow[]
}>()

const visible = ref(false)
const isEdit = ref(false)
const editId = ref(0)

const form = reactive({
  id: 0,
  name: '',
  parent_id: undefined as number | undefined,
  sort: 0,
  leader: '',
  remark: '',
})

const openCreate = (parent?: DeptTreeRow) => {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, { id: 0, name: '', parent_id: parent?.id, sort: 0, leader: '', remark: '' })
  visible.value = true
}

const openEdit = (row: DeptItem) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    id: row.id,
    name: row.name,
    parent_id: row.parent_id || undefined,
    sort: row.sort,
    leader: row.leader,
    remark: row.remark,
  })
  visible.value = true
}

const submit = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入部门名称')
    return
  }
  if (isEdit.value) {
    await updateDept({ ...form, parent_id: form.parent_id ?? 0 })
  } else {
    await createDept({ ...form, parent_id: form.parent_id ?? 0 })
  }
  ElMessage.success('保存成功')
  visible.value = false
  emit('success')
}

defineExpose({ openCreate, openEdit })
</script>

<template>
  <el-dialog v-model="visible" :title="isEdit ? '修改部门' : '新增部门'" width="480px">
    <el-form label-position="left" label-width="90px">
      <el-form-item label="上级部门">
        <el-tree-select
          v-model="form.parent_id"
          :data="treeData"
          :props="{ label: 'name', value: 'id', children: 'children' }"
          node-key="id"
          value-key="id"
          check-strictly
          clearable
          placeholder="不选则为顶级部门"
          :render-after-expand="false"
          default-expand-all
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="部门名称" required>
        <el-input v-model="form.name" maxlength="64" />
      </el-form-item>
      <el-form-item label="负责人">
        <el-input v-model="form.leader" maxlength="32" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="form.sort" :min="0" />
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
