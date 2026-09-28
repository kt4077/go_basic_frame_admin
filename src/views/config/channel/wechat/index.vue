<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DeveloperConfigForm from './components/DeveloperConfigForm.vue'
import { deleteWechatConfig, getWechatConfigs, saveWechatConfig } from '@/api/wechat'
import type { WechatConfig, WechatConfigSave } from '@/types/wechat'
import { OpenPlatform, OpenPlatformLabels, WechatTypeLabels } from '@/enums/channel'
import { Status, StatusLabels } from '@/enums/common'

const activePlatform = ref<number>(OpenPlatform.Wechat)
const loading = ref(false)
const submitting = ref(false)
const list = ref<WechatConfig[]>([])
const formVisible = ref(false)
const editingConfig = ref<WechatConfig | null>(null)

const load = async () => {
  loading.value = true
  try {
    list.value = await getWechatConfigs(activePlatform.value)
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editingConfig.value = null
  formVisible.value = true
}

const openEdit = (row: WechatConfig) => {
  editingConfig.value = row
  formVisible.value = true
}

const submit = async (form: WechatConfigSave) => {
  submitting.value = true
  try {
    await saveWechatConfig(form)
    ElMessage.success('保存成功')
    formVisible.value = false
    await load()
  } finally {
    submitting.value = false
  }
}

const remove = async (row: WechatConfig) => {
  await ElMessageBox.confirm(`确认删除「${row.name}」吗？`, '删除确认', {
    type: 'warning',
  })
  await deleteWechatConfig(row.id)
  ElMessage.success('删除成功')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page-card">
    <div class="toolbar">
      <div>
        <h4>开放平台配置</h4>
        <p class="toolbar__description">集中维护各小程序和微信生态应用的服务端开发信息</p>
      </div>
      <el-button
        v-perm="'POST:/admin/wechat/config/save'"
        type="primary"
        :icon="Plus"
        @click="openCreate"
      >
        新增配置
      </el-button>
    </div>

    <el-tabs v-model="activePlatform" @tab-change="load">
      <el-tab-pane
        v-for="(label, value) in OpenPlatformLabels"
        :key="value"
        :label="label"
        :name="Number(value)"
      />
    </el-tabs>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="name" label="配置名称" min-width="160" />
      <el-table-column prop="app_id" label="应用 ID" min-width="220" />
      <el-table-column v-if="activePlatform === OpenPlatform.Wechat" label="应用类型" width="130">
        <template #default="{ row }">{{ WechatTypeLabels[row.type] }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === Status.Enabled ? 'success' : 'danger'">
            {{ StatusLabels[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="{ row }">
          <el-icon
            v-perm="'POST:/admin/wechat/config/save'"
            class="op-icon is-edit"
            @click="openEdit(row)"
          >
            <Edit />
          </el-icon>
          <el-icon
            v-perm="'POST:/admin/wechat/config/delete'"
            class="op-icon is-danger"
            @click="remove(row)"
          >
            <Delete />
          </el-icon>
        </template>
      </el-table-column>
    </el-table>

    <DeveloperConfigForm
      v-model="formVisible"
      :platform="activePlatform"
      :config="editingConfig"
      :submitting="submitting"
      @submit="submit"
    />
  </div>
</template>

<style scoped>
.toolbar__description {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
