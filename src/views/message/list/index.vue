<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Bell, ChatDotRound, Promotion, Refresh, Search } from '@element-plus/icons-vue'
import { getMessageRecords, getMessageTemplates, sendMessage } from '@/api/message'
import { MsgJumpTypeLabels, MsgSendSourceLabels, MsgTypeLabels, msgTypeOptions, PushChannelLabels, ReadStatusLabels } from '@/enums/message'
import { formatDateTime, formatDateTimeCell } from '@/utils/datetime'
import type { MessageRecord, MessageSend, MessageTemplate } from '@/types/message'
import SendForm from './components/SendForm.vue'
import PushRecordDrawer from './components/PushRecordDrawer.vue'
import SubscriptionDrawer from './components/SubscriptionDrawer.vue'

const loading = ref(false)
const sending = ref(false)
const rows = ref<MessageRecord[]>([])
const total = ref(0)
const filters = reactive({ receiver_sn: '', msg_type: '' })
const query = reactive({ page: 1, page_size: 20 })

const sendVisible = ref(false)
const templates = ref<MessageTemplate[]>([])
const pushVisible = ref(false)
const pushMessageId = ref(0)
const pushReceiverSn = ref('')
const subscriptionVisible = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const result = await getMessageRecords({
      receiver_sn: filters.receiver_sn.trim() || undefined,
      msg_type: filters.msg_type || undefined,
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
  filters.receiver_sn = ''
  filters.msg_type = ''
  query.page = 1
  await loadData()
}

const openSend = async () => {
  templates.value = (await getMessageTemplates()).filter((item) => item.status === 1)
  sendVisible.value = true
}

const submitSend = async (value: MessageSend) => {
  sending.value = true
  try {
    const result = await sendMessage(value)
    const failed = result.pushes.filter((item) => item.failed > 0)
    if (result.pushes.length === 0) {
      ElMessage.success(`已发送 ${result.total} 条站内消息`)
    } else if (failed.length === 0) {
      ElMessage.success(`已发送 ${result.total} 条站内消息，各渠道推送完成`)
    } else {
      const detail = failed.map((item) => `${PushChannelLabels[item.channel] ?? item.channel}失败 ${item.failed} 条`).join('、')
      ElMessage.warning(`已发送 ${result.total} 条站内消息；${detail}，明细见推送记录`)
    }
    sendVisible.value = false
    await loadData()
  } finally {
    sending.value = false
  }
}

const openPushRecords = (row: MessageRecord) => {
  pushMessageId.value = row.id
  pushReceiverSn.value = row.receiver_sn
  pushVisible.value = true
}

const openSubscriptions = () => {
  subscriptionVisible.value = true
}

onMounted(loadData)
</script>

<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="filters">
          <el-input
            v-model="filters.receiver_sn"
            placeholder="接收会员编号"
            clearable
            style="width: 220px"
            @keyup.enter="query.page = 1; loadData()"
          />
          <el-select v-model="filters.msg_type" clearable placeholder="消息类型" style="width: 150px">
            <el-option v-for="item in msgTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <el-button type="primary" :icon="Search" @click="query.page = 1; loadData()">查询</el-button>
          <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
        </div>
        <div class="toolbar-actions">
          <el-button v-perm="'GET:/admin/message/subscription/list'" :icon="Bell" @click="openSubscriptions">
            订阅记录
          </el-button>
          <el-button v-perm="'POST:/admin/message/send'" type="primary" :icon="Promotion" @click="openSend">
            发送消息
          </el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="rows" stripe>
        <el-table-column label="发送时间" width="170" :formatter="formatDateTimeCell" prop="created_at" />
        <el-table-column label="接收会员" min-width="170">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="34" :src="row.receiver_avatar">
                {{ (row.receiver_nickname || row.receiver_sn).slice(0, 1) }}
              </el-avatar>
              <div>
                <div>{{ row.receiver_nickname || '—' }}</div>
                <small>{{ row.receiver_sn }}</small>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="消息类型" width="100">
          <template #default="{ row }">
            <el-tag effect="plain">{{ MsgTypeLabels[row.msg_type] ?? row.msg_type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="封面" width="90">
          <template #default="{ row }">
            <el-image
              v-if="row.cover_url"
              :src="row.cover_url"
              :preview-src-list="[row.cover_url]"
              preview-teleported
              fit="cover"
              class="cover-thumb"
            />
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="跳转" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ MsgJumpTypeLabels[row.jump_type] }}{{ row.jump_url ? `：${row.jump_url}` : '' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="已读" width="90">
          <template #default="{ row }">
            <el-tooltip
              :content="row.is_read === 1 && row.read_at ? `已读时间 ${formatDateTime(row.read_at)}` : '未读'"
              placement="top"
            >
              <el-tag :type="row.is_read === 1 ? 'success' : 'info'" effect="plain">
                {{ ReadStatusLabels[row.is_read] }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="用户状态" width="105">
          <template #default="{ row }">
            <el-tooltip :content="row.user_deleted_at ? `用户删除时间 ${formatDateTime(row.user_deleted_at)}` : '用户端正常显示'" placement="top">
              <el-tag :type="row.user_deleted_at ? 'info' : 'success'" effect="plain">
                {{ row.user_deleted_at ? '用户已删除' : '正常' }}
              </el-tag>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="发送来源" width="110">
          <template #default="{ row }">{{ MsgSendSourceLabels[row.send_source] ?? row.send_source }}</template>
        </el-table-column>
        <el-table-column label="业务关联" width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.biz_type">{{ row.biz_type }}{{ row.biz_id ? ` #${row.biz_id}` : '' }}</span>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="模板" min-width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.template_name">{{ row.template_name }}</span>
            <span v-else-if="row.template_id">#{{ row.template_id }}</span>
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="推送记录" placement="top">
              <el-icon
                v-perm="'GET:/admin/message/push_record/list'"
                class="op-icon"
                @click="openPushRecords(row)"
              >
                <ChatDotRound />
              </el-icon>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <AppPagination v-model:page="query.page" v-model:page-size="query.page_size" :total="total" @change="loadData" />
    </el-card>

    <SendForm v-model="sendVisible" :templates="templates" :loading="sending" @submit="submitSend" />
    <PushRecordDrawer v-model="pushVisible" :message-id="pushMessageId" :receiver-sn="pushReceiverSn" />
    <SubscriptionDrawer v-model="subscriptionVisible" />
  </div>
</template>

<style scoped>
.toolbar,
.filters,
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar {
  justify-content: space-between;
  margin-bottom: 16px;
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

.cover-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
}
</style>
