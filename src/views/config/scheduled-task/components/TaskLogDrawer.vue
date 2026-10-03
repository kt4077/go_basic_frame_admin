<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import AppPagination from '@/components/AppPagination.vue'
import { getScheduledTaskLogs } from '@/api/scheduled_task'
import { scheduledTaskResultLabels, scheduledTaskResultTagTypes } from '@/enums/scheduled_task'
import { formatDateTimeCell } from '@/utils/datetime'
import type { ScheduledTask, ScheduledTaskLog } from '@/types/scheduled_task'

const props = defineProps<{ modelValue: boolean; task?: ScheduledTask }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const loading = ref(false)
const rows = ref<ScheduledTaskLog[]>([])
const total = ref(0)
const query = reactive({ status: undefined as number | undefined, page: 1, page_size: 20 })

const load = async () => {
  if (!props.task) return
  loading.value = true
  try {
    const result = await getScheduledTaskLogs({ task_id: props.task.id, status: query.status, page: query.page, page_size: query.page_size })
    rows.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}
watch(() => props.modelValue, value => { if (value) { query.page = 1; load() } })
</script>

<template>
  <el-drawer :model-value="modelValue" :title="`${task?.name ?? ''} · 执行日志`" size="52%" @update:model-value="emit('update:modelValue', $event)">
    <div class="log-filter"><el-select v-model="query.status" clearable placeholder="执行状态" @change="query.page = 1; load()"><el-option label="成功" :value="1" /><el-option label="失败" :value="2" /><el-option label="已跳过" :value="3" /></el-select></div>
    <el-table v-loading="loading" :data="rows" stripe>
      <el-table-column prop="started_at" label="开始时间" width="170" :formatter="formatDateTimeCell" />
      <el-table-column prop="finished_at" label="结束时间" width="170" :formatter="formatDateTimeCell" />
      <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="scheduledTaskResultTagTypes[row.status]">{{ scheduledTaskResultLabels[row.status] }}</el-tag></template></el-table-column>
      <el-table-column label="耗时" width="110"><template #default="{ row }">{{ row.duration_ms }}ms</template></el-table-column>
      <el-table-column prop="handler" label="任务处理器" min-width="220" show-overflow-tooltip />
      <el-table-column prop="error_message" label="执行信息" min-width="260" show-overflow-tooltip><template #default="{ row }">{{ row.error_message || '-' }}</template></el-table-column>
    </el-table>
    <AppPagination v-model:page="query.page" v-model:page-size="query.page_size" :total="total" @change="load" />
  </el-drawer>
</template>

<style scoped>.log-filter{display:flex;justify-content:flex-end;margin-bottom:14px}.log-filter .el-select{width:140px}</style>

