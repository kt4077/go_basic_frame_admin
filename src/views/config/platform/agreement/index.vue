<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AgreementForm from './components/AgreementForm.vue'
import { deleteAgreement, getAgreements, saveAgreement } from '@/api/agreement'
import type { Agreement, AgreementSave } from '@/types/agreement'
import { AgreementTypeLabels } from '@/enums/agreement'
import { Status, StatusLabels } from '@/enums/common'
import { formatDateTime } from '@/utils/datetime'

const loading = ref(false)
const submitting = ref(false)
const list = ref<Agreement[]>([])
const formVisible = ref(false)
const editingAgreement = ref<Agreement | null>(null)
const filters = reactive({
  type: undefined as number | undefined,
  status: undefined as number | undefined,
})

const load = async () => {
  loading.value = true
  try {
    list.value = await getAgreements(filters)
  } finally {
    loading.value = false
  }
}

const resetFilters = async () => {
  filters.type = undefined
  filters.status = undefined
  await load()
}

const openCreate = () => {
  editingAgreement.value = null
  formVisible.value = true
}

const openEdit = (row: Agreement) => {
  editingAgreement.value = row
  formVisible.value = true
}

const submit = async (form: AgreementSave) => {
  submitting.value = true
  try {
    await saveAgreement(form)
    ElMessage.success('保存成功')
    formVisible.value = false
    await load()
  } finally {
    submitting.value = false
  }
}

const remove = async (row: Agreement) => {
  await ElMessageBox.confirm(`确认删除「${row.title}」吗？删除后用户端将无法查看。`, '删除确认', {
    type: 'warning',
  })
  await deleteAgreement(row.id)
  ElMessage.success('删除成功')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page-card">
    <div class="toolbar">
      <div>
        <h4>协议配置</h4>
        <p class="toolbar__description">维护用户端展示的服务、隐私、支付及退款协议</p>
      </div>
      <el-button
        v-perm="'POST:/admin/agreement/save'"
        type="primary"
        :icon="Plus"
        @click="openCreate"
      >
        新增协议
      </el-button>
    </div>

    <div class="filter-bar">
      <el-select v-model="filters.type" clearable placeholder="协议类型">
        <el-option
          v-for="(label, value) in AgreementTypeLabels"
          :key="value"
          :label="label"
          :value="Number(value)"
        />
      </el-select>
      <el-select v-model="filters.status" clearable placeholder="启用状态">
        <el-option
          v-for="(label, value) in StatusLabels"
          :key="value"
          :label="label"
          :value="Number(value)"
        />
      </el-select>
      <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
    </div>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column prop="title" label="协议标题" min-width="200" />
      <el-table-column label="协议类型" width="130">
        <template #default="{ row }">{{ AgreementTypeLabels[row.type] }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === Status.Enabled ? 'success' : 'danger'">
            {{ StatusLabels[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="更新时间" width="180">
        <template #default="{ row }">{{ formatDateTime(row.updated_at) }}</template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="{ row }">
          <el-icon
            v-perm="'POST:/admin/agreement/save'"
            class="op-icon is-edit"
            @click="openEdit(row)"
          >
            <Edit />
          </el-icon>
          <el-icon
            v-perm="'POST:/admin/agreement/delete'"
            class="op-icon is-danger"
            @click="remove(row)"
          >
            <Delete />
          </el-icon>
        </template>
      </el-table-column>
    </el-table>

    <AgreementForm
      v-model="formVisible"
      :agreement="editingAgreement"
      :submitting="submitting"
      @submit="submit"
    />
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-bar .el-select {
  width: 160px;
}

.toolbar__description {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>
