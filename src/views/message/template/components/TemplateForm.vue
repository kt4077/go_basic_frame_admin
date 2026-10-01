<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import AvatarUpload from '@/components/AvatarUpload.vue'
import { MsgJumpType, MsgJumpTypeLabels, msgTypeOptions, pushChannelOptions } from '@/enums/message'
import { Status } from '@/enums/common'
import type { MessageTemplate, MessageTemplateSave, MessageTemplateVariable } from '@/types/message'

const props = defineProps<{ modelValue: boolean; data?: MessageTemplate }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; 'submit': [value: MessageTemplateSave] }>()

const empty = (): MessageTemplateSave => ({
  id: 0,
  template_code: '',
  name: '',
  msg_type: 'system',
  title_template: '',
  content_template: '',
  cover_image: '',
  cover_url: '',
  jump_type: 0,
  jump_url_template: '',
  miniapp_wechat: '',
  miniapp_alipay: '',
  miniapp_baidu: '',
  miniapp_douyin: '',
  miniapp_qq: '',
  miniapp_ks: '',
  push_channels: [],
  variables: '',
  status: Status.Enabled,
  remark: '',
})

const form = reactive<MessageTemplateSave>(empty())

/** 变量定义编辑行：requiredBool 为界面态，提交时序列化为 required 1/0 */
interface VariableRow {
  name: string
  label: string
  requiredBool: boolean
}
const variableRows = ref<VariableRow[]>([])

/** 已定义的变量名，供各渠道字段映射下拉选择 */
const variableOptions = computed(() =>
  variableRows.value.map((row) => row.name.trim()).filter((name) => name !== ''),
)

/** 渠道配置的结构化编辑态，保存时序列化回 miniapp_* JSON 字符串 */
interface ChannelMapping {
  field: string
  variable: string
}
interface ChannelConfigState {
  template_id: string
  page: string
  mappings: ChannelMapping[]
}
const channelConfigs = reactive<Record<string, ChannelConfigState>>({})

const emptyChannelConfig = (): ChannelConfigState => ({ template_id: '', page: '', mappings: [] })

const miniappConfigMeta = [
  {
    key: 'miniapp_wechat',
    label: '微信小程序配置',
    channel: 1,
    doc: 'https://developers.weixin.qq.com/miniprogram/dev/server/API/mp-message-management/subscribe-message/api_sendmessage.html',
  },
  { key: 'miniapp_alipay', label: '支付宝小程序配置', channel: 6, doc: 'https://opendocs.alipay.com/mini/03l21i' },
  { key: 'miniapp_baidu', label: '百度小程序配置', channel: 7, doc: 'https://smartprogram.baidu.com/docs/develop/serverapi/sendtemplate/' },
  {
    key: 'miniapp_douyin',
    label: '抖音小程序配置',
    channel: 8,
    doc: 'https://developer.open-douyin.com/docs/resource/zh-CN/mini-app/develop/server/reach-marketing/subscribe-notification/notify-user-v2',
  },
  { key: 'miniapp_qq', label: 'QQ小程序配置', channel: 9, doc: 'https://q.qq.com/wiki/develop/api/serverapi/subscribe.html' },
  { key: 'miniapp_ks', label: '快手小程序配置', channel: 10, doc: 'https://open.kuaishou.com/docs/develop/server/sendMessage.html' },
] as const

/** 只渲染已勾选渠道的配置块，未勾选不占空间 */
const enabledMiniappMeta = computed(() =>
  miniappConfigMeta.filter((meta) => form.push_channels.includes(meta.channel)),
)

const parseChannelConfig = (key: string, raw: string) => {
  const state = emptyChannelConfig()
  if (raw.trim()) {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const config = parsed as Record<string, unknown>
        state.template_id = String(config.template_id ?? '')
        state.page = String(config.page ?? '')
        const fields = config.data_fields
        if (fields && typeof fields === 'object' && !Array.isArray(fields)) {
          state.mappings = Object.entries(fields as Record<string, unknown>).map(([field, variable]) => ({
            field,
            variable: String(variable ?? ''),
          }))
        }
      }
    } catch {
      // 历史数据不合法时按空配置处理
    }
  }
  channelConfigs[key] = state
}

const loadVariableRows = (raw: string) => {
  variableRows.value = []
  if (!raw.trim()) return
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return
    variableRows.value = parsed
      .map((item) => item as MessageTemplateVariable)
      .filter((item) => String(item.name ?? '').trim() !== '')
      .map((item) => ({ name: String(item.name), label: String(item.label ?? ''), requiredBool: item.required === 1 }))
  } catch {
    variableRows.value = []
  }
}

const addVariable = () => {
  variableRows.value.push({ name: '', label: '', requiredBool: false })
}

const removeVariable = (index: number) => {
  variableRows.value.splice(index, 1)
}

watch(
  () => props.modelValue,
  (value: boolean) => {
    if (!value) return
    Object.assign(form, empty(), props.data || {})
    loadVariableRows(props.data?.variables ?? '')
    for (const meta of miniappConfigMeta) {
      parseChannelConfig(meta.key, props.data?.[meta.key] ?? '')
    }
  },
)

/** 校验变量定义行并序列化为JSON：变量名必填且唯一；校验失败返回 null，未定义变量返回空串 */
const serializeVariables = (): string | null => {
  const seen = new Set<string>()
  for (const row of variableRows.value) {
    const name = row.name.trim()
    if (!name) {
      ElMessage.warning('变量定义缺少变量名')
      return null
    }
    if (seen.has(name)) {
      ElMessage.warning(`变量定义存在重复变量名：${name}`)
      return null
    }
    seen.add(name)
  }
  if (variableRows.value.length === 0) return ''
  return JSON.stringify(
    variableRows.value.map((row) => ({
      name: row.name.trim(),
      label: row.label.trim(),
      required: row.requiredBool ? 1 : 0,
    })),
  )
}

/** 渠道配置序列化回 miniapp_* JSON：整体为空存空串，缺 template_id 返回 null 表示校验失败 */
const serializeChannelConfig = (meta: (typeof miniappConfigMeta)[number]): string | null => {
  const state = channelConfigs[meta.key]
  if (!state.template_id.trim() && !state.page.trim() && state.mappings.length === 0) return ''
  if (!state.template_id.trim()) {
    ElMessage.warning(`请填写${meta.label}的订阅消息模板ID（template_id）`)
    return null
  }
  const payload: Record<string, unknown> = { template_id: state.template_id.trim() }
  if (state.page.trim()) {
    payload.page = state.page.trim()
  }
  if (state.mappings.length > 0) {
    const fields: Record<string, string> = {}
    for (const mapping of state.mappings) {
      const field = mapping.field.trim()
      if (field) {
        fields[field] = mapping.variable.trim()
      }
    }
    payload.data_fields = fields
  }
  return JSON.stringify(payload)
}

const submit = () => {
  if (!form.template_code.trim()) return ElMessage.warning('请填写模板编码')
  if (!form.name.trim()) return ElMessage.warning('请填写模板名称')
  if (!form.title_template.trim()) return ElMessage.warning('请填写标题模板')
  const variables = serializeVariables()
  if (variables === null) return
  const miniappPayload: Partial<Record<(typeof miniappConfigMeta)[number]['key'], string>> = {}
  for (const meta of enabledMiniappMeta.value) {
    const json = serializeChannelConfig(meta)
    if (json === null) return
    miniappPayload[meta.key] = json
  }
  emit('submit', { ...form, ...miniappPayload, variables })
}
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    :title="form.id ? '修改消息模板' : '新增消息模板'"
    size="860px"
    @close="emit('update:modelValue', false)"
  >
    <el-form label-width="110px">
      <div class="section-title">基础信息</div>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="模板编码" required>
            <el-input v-model="form.template_code" maxlength="64" placeholder="业务调用唯一标识" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="模板名称" required>
            <el-input v-model="form.name" maxlength="128" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="消息类型" required>
            <el-select v-model="form.msg_type" style="width: 100%">
              <el-option v-for="item in msgTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-switch v-model="form.status" :active-value="Status.Enabled" :inactive-value="Status.Disabled" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="标题模板" required>
        <el-input v-model="form.title_template" maxlength="200" placeholder="支持 {{变量名}} 占位符，如 您的订单 {{order_no}} 支付成功" />
      </el-form-item>
      <el-form-item label="内容模板">
        <el-input
          v-model="form.content_template"
          type="textarea"
          :rows="3"
          placeholder="支持 {{变量名}} 占位符"
        />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="封面图">
            <AvatarUpload v-model="form.cover_image" :preview-url="form.cover_url" :size="80" shape="square" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="跳转类型">
            <el-select v-model="form.jump_type" style="width: 100%">
              <el-option
                v-for="(label, value) in MsgJumpTypeLabels"
                :key="value"
                :label="label"
                :value="Number(value)"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item v-if="form.jump_type !== MsgJumpType.None" label="跳转地址模板">
        <el-input v-model="form.jump_url_template" maxlength="500" placeholder="站内页路径、网页地址或小程序页面路径，支持 {{变量名}}" />
      </el-form-item>

      <div class="section-title">推送配置</div>
      <el-form-item label="推送渠道">
        <el-checkbox-group v-model="form.push_channels">
          <el-checkbox v-for="item in pushChannelOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
        <div class="form-help">站内消息始终发送；勾选的小程序渠道将同时执行订阅消息推送，未完成模板配置的渠道发送时将记录推送失败</div>
      </el-form-item>
      <el-form-item
        v-for="meta in enabledMiniappMeta"
        :key="meta.key"
        :label="meta.label"
      >
        <div class="channel-config">
          <el-input v-model="channelConfigs[meta.key].template_id" placeholder="订阅消息模板ID（template_id）" />
          <el-input v-model="channelConfigs[meta.key].page" placeholder="跳转页面（page），如 pages/index/index，留空跳转首页" />
          <div
            v-for="(mapping, mappingIndex) in channelConfigs[meta.key].mappings"
            :key="mappingIndex"
            class="mapping-row"
          >
            <el-input v-model="mapping.field" placeholder="平台模板字段，如 thing1" />
            <span class="mapping-arrow">→</span>
            <el-select
              v-model="mapping.variable"
              filterable
              allow-create
              default-first-option
              clearable
              placeholder="选择或输入变量名"
            >
              <el-option v-for="name in variableOptions" :key="name" :label="name" :value="name" />
            </el-select>
            <el-icon class="row-remove" @click="channelConfigs[meta.key].mappings.splice(mappingIndex, 1)">
              <Delete />
            </el-icon>
          </div>
          <el-button
            class="row-add"
            :icon="Plus"
            @click="channelConfigs[meta.key].mappings.push({ field: '', variable: '' })"
          >
            添加字段映射
          </el-button>
          <div class="form-help">
            <span>字段映射：平台字段 → 模板变量；发送时按字段类型校验，thing 等文本类超长自动截断，number/amount 需为数字</span>
            <el-link :href="meta.doc" target="_blank" type="primary">官方下发文档</el-link>
          </div>
        </div>
      </el-form-item>

      <div class="section-title">变量定义</div>
      <el-form-item label-width="0">
        <div class="variable-editor">
          <div v-for="(row, index) in variableRows" :key="index" class="mapping-row">
            <el-input v-model="row.name" maxlength="64" placeholder="变量名，如 order_no" />
            <el-input v-model="row.label" maxlength="32" placeholder="标签，如 订单号" />
            <el-checkbox v-model="row.requiredBool">必填</el-checkbox>
            <el-icon class="row-remove" @click="removeVariable(index)"><Delete /></el-icon>
          </div>
          <el-button class="row-add" :icon="Plus" @click="addVariable">添加变量</el-button>
          <div class="form-help"><span>发送时可按变量定义逐项填写；勾选必填后未填写将无法发送。上方字段映射从这里选择变量</span></div>
        </div>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-drawer>
</template>

<style scoped>
/* 区块标题复用全局 .section-title（styles/index.css，自带单根主色竖线） */

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

.channel-config {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 8px;
}

.mapping-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mapping-row > .el-input,
.mapping-row > .el-select {
  flex: 1;
}

.mapping-arrow {
  color: var(--el-text-color-secondary);
}

.row-add {
  align-self: flex-start;
}

.row-remove {
  flex-shrink: 0;
  cursor: pointer;
  color: var(--el-color-danger);
}

.variable-editor {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 8px;
}
</style>
