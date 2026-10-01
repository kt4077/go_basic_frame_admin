<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import {
  deleteMessageTemplate,
  getMessageTemplates,
  saveMessageTemplate,
} from '@/api/message'
import { MsgJumpTypeLabels, MsgTypeLabels, PushChannelLabels } from '@/enums/message'
import { Status, StatusLabels } from '@/enums/common'
import { formatDateTimeCell } from '@/utils/datetime'
import type { MessageTemplate, MessageTemplateSave } from '@/types/message'
import TemplateForm from './components/TemplateForm.vue'

const loading = ref(false)
const rows = ref<MessageTemplate[]>([])
const keyword = ref('')
const formVisible = ref(false)
const current = ref<MessageTemplate>()

const loadData = async () => {
  loading.value = true
  try {
    const list = await getMessageTemplates()
    rows.value = keyword.value.trim()
      ? list.filter(
          (row) =>
            row.template_code.includes(keyword.value.trim()) ||
            row.name.includes(keyword.value.trim()),
        )
      : list
  } finally {
    loading.value = false
  }
}

const resetFilters = async () => {
  keyword.value = ''
  await loadData()
}

const openCreate = () => {
  current.value = undefined
  formVisible.value = true
}

const openEdit = (row: MessageTemplate) => {
  current.value = { ...row, push_channels: [...row.push_channels] }
  formVisible.value = true
}

const submit = async (value: MessageTemplateSave) => {
  await saveMessageTemplate(value)
  ElMessage.success('保存成功')
  formVisible.value = false
  await loadData()
}

const remove = async (row: MessageTemplate) => {
  await ElMessageBox.confirm(`确认删除模板「${row.name}」吗？已产生消息或推送记录的模板无法删除。`, '删除确认', {
    type: 'warning',
  })
  await deleteMessageTemplate(row.id)
  ElMessage.success('删除成功')
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="filters">
          <el-input
            v-model="keyword"
            placeholder="模板编码 / 名称"
            clearable
            style="width: 220px"
            @keyup.enter="loadData"
          />
          <el-button type="primary" :icon="Search" @click="loadData">查询</el-button>
          <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
        </div>
        <el-button v-perm="'POST:/admin/message/template/save'" type="primary" :icon="Plus" @click="openCreate">
          新增模板
        </el-button>
      </div>

      <el-table v-loading="loading" :data="rows" stripe>
        <el-table-column prop="template_code" label="模板编码" min-width="160" show-overflow-tooltip />
        <el-table-column prop="name" label="模板名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="消息类型" width="100">
          <template #default="{ row }">{{ MsgTypeLabels[row.msg_type] ?? row.msg_type }}</template>
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
        <el-table-column prop="title_template" label="标题模板" min-width="180" show-overflow-tooltip />
        <el-table-column prop="content_template" label="内容模板" min-width="200" show-overflow-tooltip />
        <el-table-column label="跳转类型" width="100">
          <template #default="{ row }">{{ MsgJumpTypeLabels[row.jump_type] }}</template>
        </el-table-column>
        <el-table-column label="推送渠道" min-width="180">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag v-for="channel in row.push_channels" :key="channel" effect="plain">
                {{ PushChannelLabels[channel] ?? channel }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === Status.Enabled ? 'success' : 'danger'">
              {{ StatusLabels[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" width="120" show-overflow-tooltip>
          <template #default="{ row }">{{ row.remark || '—' }}</template>
        </el-table-column>
        <el-table-column label="更新时间" width="170" :formatter="formatDateTimeCell" prop="updated_at" />
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <div class="table-operations">
              <el-tooltip content="编辑模板" placement="top">
                <el-icon v-perm="'POST:/admin/message/template/save'" class="op-icon is-edit" @click="openEdit(row)">
                  <Edit />
                </el-icon>
              </el-tooltip>
              <el-tooltip content="删除模板" placement="top">
                <el-icon v-perm="'POST:/admin/message/template/delete'" class="op-icon is-danger" @click="remove(row)">
                  <Delete />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <TemplateForm v-model="formVisible" :data="current" @submit="submit" />
  </div>
</template>

<style scoped>
.toolbar,
.filters,
.tag-list {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar {
  justify-content: space-between;
  margin-bottom: 16px;
}

.tag-list {
  flex-wrap: wrap;
  gap: 6px;
}

.cover-thumb {
  width: 44px;
  height: 44px;
  border-radius: 8px;
}
</style>
