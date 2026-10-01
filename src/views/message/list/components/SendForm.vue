<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import { MsgJumpType, MsgJumpTypeLabels, msgTypeOptions } from '@/enums/message'
import type { MessageSend, MessageTemplate, MessageTemplateVariable } from '@/types/message'

const props = defineProps<{ modelValue: boolean; templates: MessageTemplate[]; loading?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; 'submit': [value: MessageSend] }>()

/** 单次发送的接收会员上限，与后端校验一致 */
const MAX_RECEIVERS = 100

const empty = (): MessageSend => ({
  template_code: '',
  receiver_sns: [],
  variables: {},
  msg_type: 'system',
  title: '',
  content: '',
  jump_type: 0,
  jump_url: '',
})

const form = reactive<MessageSend>(empty())
const receiverText = ref('')
const variableItems = ref<MessageTemplateVariable[]>([])

// 与接口语义一致：template_code 填写与否决定发送方式，非必填
const hasTemplate = computed(() => !!form.template_code)

/** 解析接收会员编号：支持逗号、顿号、分号、空格与换行分隔 */
const parseReceiverSNs = (text: string): string[] => {
  const seen = new Set<string>()
  for (const part of text.split(/[\s,，、;；]+/)) {
    const sn = part.trim()
    if (sn) seen.add(sn)
  }
  return [...seen]
}

const parsedReceiverSNs = computed(() => parseReceiverSNs(receiverText.value))

const selectedTemplate = computed(() =>
  props.templates.find((item) => item.template_code === form.template_code),
)

const loadVariableItems = () => {
  variableItems.value = []
  const raw = selectedTemplate.value?.variables ?? ''
  if (!raw.trim()) return
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      variableItems.value = parsed.filter(
        (item): item is MessageTemplateVariable =>
          typeof item === 'object' && item !== null && String((item as MessageTemplateVariable).name ?? '').trim() !== '',
      )
    }
  } catch {
    variableItems.value = []
  }
}

watch(
  () => props.modelValue,
  (value: boolean) => {
    if (!value) return
    Object.assign(form, empty())
    receiverText.value = ''
    loadVariableItems()
  },
)

/** 导入 txt 名单：文件内容同样按分隔符解析，与已填编号合并去重 */
const onFileChange = async (file: UploadFile) => {
  const raw = file.raw
  if (!raw) return
  if (!raw.name.toLowerCase().endsWith('.txt')) {
    ElMessage.warning('仅支持 txt 文件')
    return
  }
  if (raw.size > 2 * 1024 * 1024) {
    ElMessage.warning('txt 文件不能超过 2MB')
    return
  }
  const text = await raw.text()
  const imported = parseReceiverSNs(text)
  if (imported.length === 0) {
    ElMessage.warning('文件中未解析到会员编号')
    return
  }
  receiverText.value = [...new Set([...parseReceiverSNs(receiverText.value), ...imported])].join('\n')
  ElMessage.success(`已导入 ${imported.length} 个会员编号`)
}

const submit = () => {
  const receiverSNs = parseReceiverSNs(receiverText.value)
  if (receiverSNs.length === 0) return ElMessage.warning('请填写接收会员编号')
  if (receiverSNs.length > MAX_RECEIVERS) return ElMessage.warning(`单次发送最多支持 ${MAX_RECEIVERS} 个接收会员`)
  if (hasTemplate.value) {
    for (const item of variableItems.value) {
      if (item.required === 1 && !String(form.variables?.[item.name] ?? '').trim()) {
        return ElMessage.warning(`请填写模板变量「${item.label || item.name}」`)
      }
    }
    const { msg_type: _m, title: _t, content: _c, jump_type: _j, jump_url: _u, ...rest } = form
    emit('submit', { ...rest, receiver_sns: receiverSNs, variables: { ...(form.variables ?? {}) } })
    return
  }
  if (!form.msg_type) return ElMessage.warning('请选择消息类型')
  if (!form.title?.trim()) return ElMessage.warning('请填写消息标题')
  const { template_code: _c2, variables: _v, ...custom } = form
  emit('submit', { ...custom, receiver_sns: receiverSNs })
}
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    title="发送消息"
    size="760px"
    @close="emit('update:modelValue', false)"
  >
    <el-form label-width="110px">
      <el-form-item label="接收会员" required>
        <el-input
          v-model="receiverText"
          type="textarea"
          :rows="5"
          placeholder="多个会员编号用逗号、顿号、分号、空格或换行分隔，最多 100 个"
        />
        <div class="form-help">
          <span>已解析 {{ parsedReceiverSNs.length }} 个会员编号；也可上传 txt 名单批量导入（每行一个或分隔符隔开）</span>
          <el-upload
            :auto-upload="false"
            :show-file-list="false"
            accept=".txt"
            :on-change="onFileChange"
          >
            <el-button :icon="Upload" size="small">导入 txt</el-button>
          </el-upload>
        </div>
      </el-form-item>
      <el-form-item label="消息模板">
        <el-select
          v-model="form.template_code"
          clearable
          placeholder="留空则发送自定义站内消息"
          @change="loadVariableItems"
        >
          <el-option
            v-for="item in templates"
            :key="item.id"
            :label="`${item.name}（${item.template_code}）`"
            :value="item.template_code"
          />
        </el-select>
        <div class="form-help">
          选择模板后按模板渲染标题内容并推送小程序订阅消息；留空则按下方自定义内容仅发送站内消息
        </div>
      </el-form-item>
      <template v-if="hasTemplate">
        <el-form-item
          v-for="item in variableItems"
          :key="item.name"
          :label="item.label || item.name"
          :required="item.required === 1"
        >
          <el-input v-model="form.variables![item.name]" :placeholder="`变量 {{${item.name}}}`" />
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item label="消息类型" required>
          <el-select v-model="form.msg_type">
            <el-option v-for="item in msgTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="消息标题" required>
          <el-input v-model="form.title" maxlength="200" />
        </el-form-item>
        <el-form-item label="消息内容">
          <el-input v-model="form.content" type="textarea" :rows="4" />
        </el-form-item>
        <el-form-item label="跳转类型">
          <el-select v-model="form.jump_type" style="width: 160px">
            <el-option
              v-for="(label, value) in MsgJumpTypeLabels"
              :key="value"
              :label="label"
              :value="Number(value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.jump_type !== MsgJumpType.None" label="跳转地址">
          <el-input v-model="form.jump_url" maxlength="500" placeholder="站内页路径、网页地址或小程序页面路径" />
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="props.loading" @click="submit">发送</el-button>
    </template>
  </el-drawer>
</template>

<style scoped>
.form-help {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}
</style>
