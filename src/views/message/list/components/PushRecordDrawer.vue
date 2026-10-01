<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'
import { getMessagePushRecords } from '@/api/message'
import { PushChannelLabels, PushStatusLabels } from '@/enums/message'
import { formatDateTime } from '@/utils/datetime'
import type { MessagePushRecord } from '@/types/message'
import AppPagination from '@/components/AppPagination.vue'

const props = defineProps<{ modelValue: boolean; messageId: number; receiverSn: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

/** 渠道展示元信息：标识字与品牌色，直观区分渠道 */
const channelMeta: Record<number, { short: string; color: string }> = {
  1: { short: '微', color: '#07c160' },
  6: { short: '支', color: '#1677ff' },
  7: { short: '百', color: '#2932e1' },
  8: { short: '抖', color: '#325ab4' },
  9: { short: 'Q', color: '#12b7f5' },
  10: { short: '快', color: '#ff4906' },
}

const loading = ref(false)
const rows = ref<MessagePushRecord[]>([])
const total = ref(0)
const query = reactive({ page: 1, page_size: 20 })

const loadData = async () => {
  loading.value = true
  try {
    const result = await getMessagePushRecords({
      message_id: props.messageId,
      page: query.page,
      page_size: query.page_size,
    })
    rows.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (value: boolean) => {
    if (!value) return
    query.page = 1
    void loadData()
  },
)

const channelShort = (channel: number) => channelMeta[channel]?.short ?? '?'
const channelColor = (channel: number) => channelMeta[channel]?.color ?? 'var(--el-color-info)'
const statusTagType = (status: number) => {
  if (status === 2) return 'success'
  if (status === 3) return 'danger'
  return 'info'
}

const summary = computed(() => ({
  success: rows.value.filter((row) => row.status === 2).length,
  failed: rows.value.filter((row) => row.status === 3).length,
}))

/** 模板数据快照格式化为缩进 JSON，便于逐字段核对 */
const prettyTemplateData = (raw: string): string => {
  if (!raw.trim()) return ''
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}

const copyText = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    ElMessage.success('已复制')
  } catch {
    ElMessage.warning('复制失败，请手动选择复制')
  }
}
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    :title="`推送记录 · ${receiverSn}`"
    size="960px"
    @close="emit('update:modelValue', false)"
  >
    <div class="push-summary">
      <span>共 <b>{{ total }}</b> 个渠道</span>
      <span class="is-success">成功 <b>{{ summary.success }}</b></span>
      <span class="is-failed">失败 <b>{{ summary.failed }}</b></span>
    </div>

    <div v-loading="loading" class="push-list">
      <div
        v-for="row in rows"
        :key="row.id"
        class="push-card"
        :class="{ 'is-failed': row.status === 3 }"
      >
        <div class="push-card__head">
          <span
            class="push-card__badge"
            :style="{ background: channelColor(row.channel) }"
          >
            {{ channelShort(row.channel) }}
          </span>
          <span class="push-card__channel">{{ PushChannelLabels[row.channel] ?? row.channel }}</span>
          <el-tag :type="statusTagType(row.status)" size="small" effect="light">
            {{ PushStatusLabels[row.status] }}
          </el-tag>
          <span class="push-card__time">{{ row.sent_at ? formatDateTime(row.sent_at) : '未发送' }}</span>
        </div>
        <div class="push-card__body">
          <div v-if="row.fail_reason" class="push-card__fail">
            失败原因：{{ row.fail_reason }}
          </div>
          <div v-if="row.openid" class="push-card__field">
            <span class="push-card__label">openid</span>
            <span class="push-card__value is-mono">{{ row.openid }}</span>
            <el-icon class="push-card__copy" title="复制" @click="copyText(row.openid)"><CopyDocument /></el-icon>
          </div>
          <div v-if="row.third_party_msg_id" class="push-card__field">
            <span class="push-card__label">第三方消息ID</span>
            <span class="push-card__value is-mono">{{ row.third_party_msg_id }}</span>
            <el-icon class="push-card__copy" title="复制" @click="copyText(row.third_party_msg_id)"><CopyDocument /></el-icon>
          </div>
          <div v-if="prettyTemplateData(row.template_data)" class="push-card__field is-column">
            <span class="push-card__label">模板数据</span>
            <pre class="push-card__json">{{ prettyTemplateData(row.template_data) }}</pre>
          </div>
        </div>
      </div>
      <el-empty
        v-if="!loading && rows.length === 0"
        description="该消息暂无推送记录"
        :image-size="80"
      />
    </div>
    <AppPagination v-model:page="query.page" v-model:page-size="query.page_size" :total="total" @change="loadData" />
  </el-drawer>
</template>

<style scoped>
.push-summary {
  display: flex;
  gap: 18px;
  margin-bottom: 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.push-summary b {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.push-summary .is-success b {
  color: var(--el-color-success);
}

.push-summary .is-failed b {
  color: var(--el-color-danger);
}

.push-list {
  display: flex;
  min-height: 140px;
  flex-direction: column;
  gap: 12px;
}

.push-card {
  padding: 12px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-left: 3px solid var(--el-color-info-light-5);
  border-radius: 10px;
  background: var(--el-bg-color);
}

.push-card.is-failed {
  border-left-color: var(--el-color-danger);
}

.push-card__head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.push-card__badge {
  display: inline-flex;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
}

.push-card__channel {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.push-card__time {
  margin-left: auto;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.push-card__body {
  display: flex;
  margin-top: 10px;
  flex-direction: column;
  gap: 6px;
}

.push-card__fail {
  color: var(--el-color-danger);
  font-size: 13px;
  line-height: 1.6;
}

.push-card__field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.push-card__field.is-column {
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
}

.push-card__label {
  flex-shrink: 0;
  width: 96px;
  color: var(--el-text-color-secondary);
}

.push-card__value {
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.push-card__value.is-mono {
  font-family: Consolas, Monaco, 'Courier New', monospace;
}

.push-card__copy {
  flex-shrink: 0;
  cursor: pointer;
  color: var(--el-color-primary);
}

.push-card__json {
  margin: 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
