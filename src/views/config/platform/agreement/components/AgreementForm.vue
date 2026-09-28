<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import RichTextEditor from '@/components/RichTextEditor.vue'
import type { Agreement, AgreementSave } from '@/types/agreement'
import { AgreementType, AgreementTypeLabels } from '@/enums/agreement'
import { Status } from '@/enums/common'

const props = defineProps<{
  modelValue: boolean
  agreement?: Agreement | null
  submitting?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [value: AgreementSave]
}>()

const formRef = ref<FormInstance>()
const form = reactive<AgreementSave>({
  id: 0,
  title: '',
  type: AgreementType.Service,
  content: '',
  status: Status.Enabled,
  sort: 0,
  remark: '',
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入协议标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择协议类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入协议内容', trigger: 'change' }],
}

const reset = () => {
  Object.assign(form, {
    id: props.agreement?.id || 0,
    title: props.agreement?.title || '',
    type: props.agreement?.type || AgreementType.Service,
    content: props.agreement?.content || '',
    status: props.agreement?.status || Status.Enabled,
    sort: props.agreement?.sort || 0,
    remark: props.agreement?.remark || '',
  })
  formRef.value?.clearValidate()
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) reset()
  },
)

const submit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('submit', { ...form })
}
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    :title="form.id ? '修改协议' : '新增协议'"
    size="78%"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="92px">
      <div class="form-grid">
        <el-form-item label="协议标题" prop="title">
          <el-input v-model="form.title" maxlength="128" show-word-limit />
        </el-form-item>
        <el-form-item label="协议类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option
              v-for="(label, value) in AgreementTypeLabels"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态">
          <el-radio-group v-model="form.status">
            <el-radio-button :value="Status.Enabled">启用</el-radio-button>
            <el-radio-button :value="Status.Disabled">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序值">
          <el-input-number v-model="form.sort" :min="0" :max="9999" />
        </el-form-item>
      </div>
      <el-form-item label="协议内容" prop="content">
        <RichTextEditor
          v-model="form.content"
          placeholder="请输入协议正文，可使用标题、列表、链接等富文本格式"
          :min-height="480"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="255" show-word-limit />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">保存协议</el-button>
    </template>
  </el-drawer>
</template>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 20px;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
