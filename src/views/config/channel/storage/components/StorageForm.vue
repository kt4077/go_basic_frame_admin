<script setup lang="ts">
// 存储渠道新增/修改弹窗（组件化，父组件通过 ref 调用 openCreate / openEdit）
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createStorage, updateStorage } from '@/api/storage'
import type { StorageItem, StorageSaveReq } from '@/types/storage'
import { StorageChannelLabels, StorageChannelParams, StorageDefault } from '@/enums/storage'
import { Status } from '@/enums/common'

const emit = defineEmits<{
  (e: 'success'): void
}>()

defineProps<{
  /** 当前渠道总数（系统内第一个渠道默认设为默认渠道） */
  totalCount: number
}>()

const visible = ref(false)
const isEdit = ref(false)
const editId = ref(0)

const form = reactive({
  name: '',
  channel: 'local',
  params: {} as Record<string, string>,
  is_default: StorageDefault.No,
  status: Status.Enabled,
  sort: 0,
  remark: '',
})

const openCreate = (totalCount: number) => {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, {
    name: '',
    channel: 'local',
    params: {},
    is_default: totalCount === 0 ? StorageDefault.Yes : StorageDefault.No,
    status: Status.Enabled,
    sort: 0,
    remark: '',
  })
  visible.value = true
}

const openEdit = (row: StorageItem) => {
  isEdit.value = true
  editId.value = row.id
  let params: Record<string, string> = {}
  try {
    params = row.params ? JSON.parse(row.params) : {}
  } catch {
    params = {}
  }
  Object.assign(form, {
    name: row.name,
    channel: row.channel,
    params,
    is_default: row.is_default,
    status: row.status,
    sort: row.sort,
    remark: row.remark,
  })
  visible.value = true
}

/** 切换渠道类型时，按字段模板重置参数表单 */
const onChannelChange = () => {
  const next: Record<string, string> = {}
  for (const field of StorageChannelParams[form.channel] ?? []) {
    next[field.key] = form.params[field.key] ?? ''
  }
  form.params = next
}

const submit = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请填写渠道名称')
    return
  }
  const base: StorageSaveReq = {
    name: form.name,
    channel: form.channel,
    params: JSON.stringify(form.params),
    is_default: form.is_default,
    status: form.status,
    sort: form.sort,
    remark: form.remark,
  }
  if (isEdit.value) {
    await updateStorage({ ...base, id: editId.value })
  } else {
    await createStorage(base)
  }
  ElMessage.success('保存成功')
  visible.value = false
  emit('success')
}

defineExpose({ openCreate, openEdit })
</script>

<template>
  <el-dialog v-model="visible" :title="isEdit ? '修改存储渠道' : '新增存储渠道'" width="520px">
    <el-form label-position="left" label-width="100px">
      <el-form-item label="渠道名称" required>
        <el-input v-model="form.name" maxlength="64" placeholder="如 阿里云OSS-生产" />
      </el-form-item>
      <el-form-item label="渠道类型" required>
        <el-select v-model="form.channel" style="width: 100%" @change="onChannelChange">
          <el-option
            v-for="(label, channel) in StorageChannelLabels"
            :key="channel"
            :label="label"
            :value="channel"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-for="field in StorageChannelParams[form.channel] ?? []"
        :key="field.key"
        :label="field.label"
      >
        <el-input v-model="form.params[field.key]" :placeholder="field.placeholder" />
      </el-form-item>
      <el-form-item label="设为默认">
        <el-switch :model-value="form.is_default === StorageDefault.Yes"
          @update:model-value="form.is_default = $event ? StorageDefault.Yes : StorageDefault.No" />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio-button :value="Status.Enabled">启用</el-radio-button>
          <el-radio-button :value="Status.Disabled">禁用</el-radio-button>
        </el-radio-group>
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
