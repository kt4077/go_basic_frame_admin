<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Status } from '@/enums/common'
import type { ScheduledTask, ScheduledTaskOptions } from '@/types/scheduled_task'
import CronBuilder from './CronBuilder.vue'

const props = defineProps<{
  modelValue: boolean
  data?: ScheduledTask
  options: ScheduledTaskOptions
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [value: ScheduledTask]
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const visible = computed({ get: () => props.modelValue, set: value => emit('update:modelValue', value) })
const emptyForm = (): ScheduledTask => ({
  id: 0,
  name: '',
  handler: '',
  cron_expression: '0 0 2 * * *',
  payload: '{}',
  status: Status.Disabled,
  timeout_seconds: 300,
  remark: '',
  last_run_at: null,
  last_status: 0,
  last_error: '',
  next_run_at: null,
  created_at: '',
  updated_at: '',
})
const form = reactive<ScheduledTask>(emptyForm())

const validateJSON = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  try {
    JSON.parse(value)
    callback()
  } catch {
    callback(new Error('请输入有效的JSON'))
  }
}
const rules: FormRules<ScheduledTask> = {
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  handler: [{ required: true, message: '请选择任务处理器', trigger: 'change' }],
  cron_expression: [{ required: true, message: '请输入Cron表达式', trigger: 'blur' }],
  payload: [{ required: true, validator: validateJSON, trigger: 'blur' }],
  timeout_seconds: [{ required: true, type: 'number', min: 1, max: 3600, message: '超时范围为1至3600秒', trigger: 'blur' }],
}

const selectedHandler = computed(() => props.options.handlers.find(item => item.value === form.handler))
const applyHandlerExample = () => {
  if (selectedHandler.value?.example) form.payload = selectedHandler.value.example
}

watch(() => props.modelValue, async value => {
  if (!value) return
  Object.assign(form, emptyForm(), props.data ? { ...props.data } : {})
  if (!props.data && props.options.handlers.length === 1) {
    form.handler = props.options.handlers[0].value
    form.payload = props.options.handlers[0].example || '{}'
  }
  await nextTick()
  formRef.value?.clearValidate()
})

const submit = async () => {
  await formRef.value?.validate()
  submitting.value = true
  try {
    const normalized = JSON.stringify(JSON.parse(form.payload), null, 2)
    emit('submit', { ...form, payload: normalized })
  } catch {
    ElMessage.error('任务参数不是有效的JSON')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" :title="form.id ? '编辑定时任务' : '新增定时任务'" width="680px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="任务名称" prop="name"><el-input v-model="form.name" maxlength="100" show-word-limit /></el-form-item>
      <el-form-item label="任务处理器" prop="handler">
        <el-select v-model="form.handler" style="width:100%" @change="applyHandlerExample">
          <el-option v-for="item in options.handlers" :key="item.value" :label="item.label" :value="item.value">
            <div class="handler-option"><span>{{ item.label }}</span><small>{{ item.value }}</small></div>
          </el-option>
        </el-select>
        <div v-if="selectedHandler" class="form-help">{{ selectedHandler.description }}</div>
      </el-form-item>
      <el-form-item label="Cron表达式" prop="cron_expression">
        <CronBuilder v-model="form.cron_expression" />
        <div class="form-help">使用服务器本地时区，六段依次为秒、分、时、日、月、周；已有五段表达式仍可正常运行。</div>
      </el-form-item>
      <el-form-item label="任务参数" prop="payload">
        <el-input v-model="form.payload" type="textarea" :rows="6" maxlength="10000" placeholder="JSON对象" />
      </el-form-item>
      <el-form-item label="执行超时" prop="timeout_seconds"><el-input-number v-model="form.timeout_seconds" :min="1" :max="3600" /><span class="unit">秒</span></el-form-item>
      <el-form-item label="启用状态" prop="status"><el-radio-group v-model="form.status"><el-radio :value="Status.Enabled">启用</el-radio><el-radio :value="Status.Disabled">停用</el-radio></el-radio-group></el-form-item>
      <el-form-item label="备注" prop="remark"><el-input v-model="form.remark" type="textarea" :rows="2" maxlength="255" show-word-limit /></el-form-item>
    </el-form>
    <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" :loading="submitting" @click="submit">保存</el-button></template>
  </el-dialog>
</template>

<style scoped>
.handler-option{display:flex;justify-content:space-between;gap:16px}.handler-option small,.form-help{color:var(--el-text-color-secondary);font-size:12px}.form-help{width:100%;line-height:20px}.unit{margin-left:8px;color:var(--el-text-color-secondary)}
</style>
