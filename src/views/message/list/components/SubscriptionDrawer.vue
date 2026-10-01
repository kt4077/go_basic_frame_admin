<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { getMessageSubscriptions } from '@/api/message'
import { PushChannelLabels, pushChannelOptions } from '@/enums/message'
import { formatDateTimeCell } from '@/utils/datetime'
import type { MessageSubscription } from '@/types/message'
import AppPagination from '@/components/AppPagination.vue'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const loading = ref(false)
const rows = ref<MessageSubscription[]>([])
const total = ref(0)
const filters = reactive({ template_code: '', channel: undefined as number | undefined })
const query = reactive({ page: 1, page_size: 20 })

const loadData = async () => {
  loading.value = true
  try {
    const result = await getMessageSubscriptions({
      template_code: filters.template_code.trim() || undefined,
      channel: filters.channel,
      page: query.page,
      page_size: query.page_size,
    })
    rows.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}

const resetFilters = async () => {
  filters.template_code = ''
  filters.channel = undefined
  query.page = 1
  await loadData()
}

watch(
  () => props.modelValue,
  (value: boolean) => {
    if (!value) return
    query.page = 1
    void loadData()
  },
)
</script>

<template>
  <el-drawer
    :model-value="modelValue"
    title="订阅记录"
    size="860px"
    @close="emit('update:modelValue', false)"
  >
    <div class="toolbar">
      <div class="filters">
        <el-input
          v-model="filters.template_code"
          placeholder="模板编码"
          clearable
          style="width: 180px"
          @keyup.enter="query.page = 1; loadData()"
        />
        <el-select v-model="filters.channel" clearable placeholder="订阅渠道" style="width: 150px">
          <el-option v-for="item in pushChannelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" @click="query.page = 1; loadData()">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="rows" stripe>
      <el-table-column label="会员" min-width="180">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="34" :src="row.member_avatar">
              {{ (row.member_nickname || row.member_sn).slice(0, 1) }}
            </el-avatar>
            <div>
              <div>{{ row.member_nickname || '—' }}</div>
              <small>{{ row.member_sn }}</small>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="订阅渠道" width="120">
        <template #default="{ row }">
          <el-tag effect="plain">{{ PushChannelLabels[row.channel] ?? row.channel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="template_code" label="模板编码" min-width="150" show-overflow-tooltip />
      <el-table-column label="累计订阅" width="90" prop="subscribe_count" />
      <el-table-column label="剩余可推送" width="100">
        <template #default="{ row }">
          <el-tag :type="row.remain_count > 0 ? 'success' : 'info'">{{ row.remain_count }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最近订阅时间" width="170" :formatter="formatDateTimeCell" prop="subscribed_at" />
    </el-table>
    <AppPagination v-model:page="query.page" v-model:page-size="query.page_size" :total="total" @change="loadData" />
  </el-drawer>
</template>

<style scoped>
.toolbar,
.filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar {
  margin-bottom: 14px;
}

/* 会员展示与用户管理页保持一致 */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-cell small {
  color: var(--el-text-color-secondary);
}
</style>
