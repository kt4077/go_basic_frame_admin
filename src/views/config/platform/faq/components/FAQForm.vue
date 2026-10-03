<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import RichTextEditor from '@/components/RichTextEditor.vue'
import type { FAQ, FAQGroup, FAQSave } from '@/types/faq'
import { Status } from '@/enums/common'

const props = defineProps<{ modelValue: boolean; faq?: FAQ | null; groups: FAQGroup[]; submitting?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; submit: [value: FAQSave] }>()
const formRef = ref<FormInstance>()
const form = reactive<FAQSave>({ id: 0, group_id: 0, name: '', content: '', status: Status.Enabled, sort: 0 })
const rules: FormRules = {
  group_id: [{ required: true, message: '请选择所属分组', trigger: 'change' }],
  name: [{ required: true, message: '请输入问题名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入问题内容', trigger: 'change' }],
}
watch(() => props.modelValue, (visible) => {
  if (!visible) return
  Object.assign(form, { id: props.faq?.id || 0, group_id: props.faq?.group_id || props.groups[0]?.id || 0, name: props.faq?.name || '', content: props.faq?.content || '', status: props.faq?.status || Status.Enabled, sort: props.faq?.sort || 0 })
  formRef.value?.clearValidate()
})
const submit = async () => { if (await formRef.value?.validate().catch(() => false)) emit('submit', { ...form }) }
</script>

<template>
  <el-drawer :model-value="modelValue" :title="form.id ? '修改常见问题' : '新增常见问题'" size="78%" destroy-on-close @update:model-value="emit('update:modelValue', $event)">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="92px">
      <div class="form-grid">
        <el-form-item label="问题名称" prop="name"><el-input v-model="form.name" maxlength="255" show-word-limit placeholder="请输入问题名称" /></el-form-item>
        <el-form-item label="所属分组" prop="group_id"><el-select v-model="form.group_id" style="width:100%" placeholder="请选择所属分组"><el-option v-for="item in groups" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
        <el-form-item label="启用状态"><el-radio-group v-model="form.status"><el-radio-button :value="Status.Enabled">启用</el-radio-button><el-radio-button :value="Status.Disabled">停用</el-radio-button></el-radio-group></el-form-item>
        <el-form-item label="排序值"><el-input-number v-model="form.sort" :min="0" :max="999999" /></el-form-item>
      </div>
      <el-form-item label="问题内容" prop="content"><RichTextEditor v-model="form.content" placeholder="请输入问题答案，可使用标题、列表、图片、链接等富文本格式" :min-height="480" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="emit('update:modelValue', false)">取消</el-button><el-button type="primary" :loading="submitting" @click="submit">保存问题</el-button></template>
  </el-drawer>
</template>

<style scoped>.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 20px}@media(max-width:900px){.form-grid{grid-template-columns:1fr}}</style>
