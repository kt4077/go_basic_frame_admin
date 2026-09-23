<script setup lang="ts">
// 存储配置：文件存储渠道列表（新增/修改弹窗见 components/StorageForm.vue）
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Star } from '@element-plus/icons-vue'
import { getStorageList, deleteStorage, setDefaultStorage } from '@/api/storage'
import type { StorageItem } from '@/types/storage'
import { StorageChannelLabels, StorageDefault } from '@/enums/storage'
import { Status, StatusLabels } from '@/enums/common'
import StorageForm from './components/StorageForm.vue'

const loading = ref(false)
const list = ref<StorageItem[]>([])
const formRef = ref()

const load = async () => {
  loading.value = true
  try {
    list.value = await getStorageList()
  } finally {
    loading.value = false
  }
}

const onSetDefault = async (row: StorageItem) => {
  await setDefaultStorage(row.id)
  ElMessage.success(`已将「${row.name}」设为默认渠道`)
  await load()
}

const onDelete = async (row: StorageItem) => {
  await ElMessageBox.confirm(`确认删除存储渠道「${row.name}」吗？`, '提示', { type: 'warning' })
  await deleteStorage(row.id)
  ElMessage.success('删除成功')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page-card">
    <div class="toolbar">
      <h4>存储配置</h4>
      <el-button v-perm="'POST:/admin/storage/add'" type="primary" @click="formRef?.openCreate(list.length)">新增渠道</el-button>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="name" label="渠道名称" min-width="160" />
      <el-table-column label="渠道类型" width="130">
        <template #default="{ row }">
          <el-tag effect="plain">{{ StorageChannelLabels[row.channel] ?? row.channel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认渠道" width="110">
        <template #default="{ row }">
          <el-tag v-if="row.is_default === StorageDefault.Yes" type="success" size="small">
            <el-icon style="vertical-align: -2px"><Star /></el-icon>
            默认
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === Status.Enabled ? 'success' : 'danger'" size="small">
            {{ StatusLabels[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="remark" label="备注" min-width="150" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <div class="table-operations">
            <el-tooltip v-if="row.is_default !== StorageDefault.Yes" content="设为默认" placement="top">
              <el-icon v-perm="'POST:/admin/storage/set_default'" class="op-icon" @click="onSetDefault(row)"><Star /></el-icon>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-icon v-perm="'POST:/admin/storage/update'" class="op-icon is-edit" @click="formRef?.openEdit(row)"><Edit /></el-icon>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-icon v-perm="'POST:/admin/storage/delete'" class="op-icon is-danger" @click="onDelete(row)"><Delete /></el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <StorageForm ref="formRef" :total-count="list.length" @success="load" />
  </div>
</template>
