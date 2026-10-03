<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { FAQGroup, FAQGroupSave } from '@/types/faq'
import { Status } from '@/enums/common'

const props = defineProps<{ modelValue: boolean; group?: FAQGroup | null; submitting?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; submit: [value: FAQGroupSave] }>()
const formRef = ref<FormInstance>()
const form = reactive<FAQGroupSave>({ id: 0, name: '', status: Status.Enabled, sort: 0 })
const rules: FormRules = { name: [{ required: true, message: '请输入分组名称', trigger: 'blur' }] }

watch(() => props.modelValue, (visible) => {
  if (!visible) return
  Object.assign(form, { id: props.group?.id || 0, name: props.group?.name || '', status: props.group?.status || Status.Enabled, sort: props.group?.sort || 0 })
  formRef.value?.clearValidate()
})
const submit = async () => { if (await formRef.value?.validate().catch(() => false)) emit('submit', { ...form }) }
</script>

<template>
  <el-dialog :model-value="modelValue" :title="form.id ? '修改问题分组' : '新增问题分组'" width="520px" destroy-on-close @update:model-value="emit('update:modelValue', $event)">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="88px">
      <el-form-item label="分组名称" prop="name"><el-input v-model="form.name" maxlength="100" show-word-limit placeholder="请输入分组名称" /></el-form-item>
      <el-form-item label="启用状态"><el-radio-group v-model="form.status"><el-radio-button :value="Status.Enabled">启用</el-radio-button><el-radio-button :value="Status.Disabled">停用</el-radio-button></el-radio-group></el-form-item>
      <el-form-item label="排序值"><el-input-number v-model="form.sort" :min="0" :max="999999" /><span class="form-tip">数值越小越靠前</span></el-form-item>
    </el-form>
    <template #footer><el-button @click="emit('update:modelValue', false)">取消</el-button><el-button type="primary" :loading="submitting" @click="submit">保存</el-button></template>
  </el-dialog>
</template>

<style scoped>.form-tip{margin-left:10px;color:var(--el-text-color-secondary);font-size:12px}</style>
