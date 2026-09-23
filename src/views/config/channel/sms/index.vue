<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, Search } from '@element-plus/icons-vue'
import { deleteSMSConfig, deleteSMSSignature, deleteSMSTemplate, getSMSConfigs, getSMSLogs, getSMSSignatures, getSMSTemplates, saveSMSConfig, saveSMSSignature, saveSMSTemplate } from '@/api/sms'
import type { SMSConfig, SMSSignature, SMSTemplate, SMSSendLog } from '@/types/sms'
import { SMSProvider, SMSProviderLabels, SMSSendStatusLabels, SMSTemplateType, SMSTemplateTypeLabels } from '@/enums/channel'
import { Status, StatusLabels } from '@/enums/common'
import { formatDateTimeCell } from '@/utils/datetime'
import AppPagination from '@/components/AppPagination.vue'

type EditMode = 'config' | 'signature' | 'template'
const activeTab = ref('config')
const loading = ref(false)
const configs = ref<SMSConfig[]>([])
const signatures = ref<SMSSignature[]>([])
const templates = ref<SMSTemplate[]>([])
const logs = ref<SMSSendLog[]>([])
const logTotal = ref(0)
const logQuery = reactive({ mobile: '', status: undefined as number | undefined, page: 1, page_size: 20 })
const dialogVisible = ref(false)
const editMode = ref<EditMode>('config')
const form = reactive<Record<string, any>>({})

const configName = (id: number) => configs.value.find((item) => item.id === id)?.name ?? `#${id}`
const loadBase = async () => {
  loading.value = true
  try {
    ;[configs.value, signatures.value, templates.value] = await Promise.all([getSMSConfigs(), getSMSSignatures(), getSMSTemplates()])
  } finally { loading.value = false }
}
const loadLogs = async () => {
  loading.value = true
  try {
    const result = await getSMSLogs({ mobile: logQuery.mobile || undefined, status: logQuery.status, page: logQuery.page, page_size: logQuery.page_size })
    logs.value = result.list
    logTotal.value = result.total
  } finally { loading.value = false }
}
const onTabChange = (name: string | number) => { if (String(name) === 'logs') loadLogs() }
const openCreate = (mode: EditMode) => {
  editMode.value = mode
  const defaults = mode === 'config'
    ? { id: 0, name: '', provider: SMSProvider.Aliyun, access_key_id: '', access_key_secret: '', endpoint: '', status: Status.Enabled, remark: '' }
    : mode === 'signature'
      ? { id: 0, config_id: configs.value[0]?.id, name: '', sign_code: '', status: Status.Enabled, remark: '' }
      : { id: 0, config_id: configs.value[0]?.id, name: '', template_code: '', type: SMSTemplateType.VerifyCode, content: '', status: Status.Enabled, remark: '' }
  Object.keys(form).forEach((key) => delete form[key])
  Object.assign(form, defaults)
  dialogVisible.value = true
}
const openEdit = (mode: EditMode, row: SMSConfig | SMSSignature | SMSTemplate) => {
  editMode.value = mode
  Object.keys(form).forEach((key) => delete form[key])
  Object.assign(form, row, { access_key_secret: '' })
  dialogVisible.value = true
}
const submit = async () => {
  if (!form.name?.trim()) return ElMessage.warning('请填写名称')
  if (editMode.value === 'config') await saveSMSConfig(form as any)
  if (editMode.value === 'signature') await saveSMSSignature(form as any)
  if (editMode.value === 'template') await saveSMSTemplate(form as any)
  ElMessage.success('保存成功')
  dialogVisible.value = false
  await loadBase()
}
const remove = async (mode: EditMode, row: { id: number; name: string }) => {
  await ElMessageBox.confirm(`确认删除「${row.name}」吗？`, '提示', { type: 'warning' })
  if (mode === 'config') await deleteSMSConfig(row.id)
  if (mode === 'signature') await deleteSMSSignature(row.id)
  if (mode === 'template') await deleteSMSTemplate(row.id)
  ElMessage.success('删除成功')
  await loadBase()
}
onMounted(loadBase)
</script>

<template>
  <div class="page-card">
    <div class="toolbar"><h4>短信配置</h4></div>
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="开发信息" name="config">
        <div class="tab-toolbar"><el-button v-perm="'POST:/admin/sms/config/save'" type="primary" :icon="Plus" @click="openCreate('config')">新增配置</el-button></div>
        <el-table :data="configs" v-loading="loading" stripe>
          <el-table-column prop="name" label="配置名称" /><el-table-column label="服务商"><template #default="{ row }">{{ SMSProviderLabels[row.provider] }}</template></el-table-column>
          <el-table-column prop="access_key_id" label="AccessKey ID" min-width="180" show-overflow-tooltip /><el-table-column prop="endpoint" label="Endpoint" min-width="180" show-overflow-tooltip />
          <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="row.status === Status.Enabled ? 'success' : 'danger'">{{ StatusLabels[row.status] }}</el-tag></template></el-table-column>
          <el-table-column label="操作" width="110"><template #default="{ row }"><el-icon v-perm="'POST:/admin/sms/config/save'" class="op-icon is-edit" @click="openEdit('config', row)"><Edit /></el-icon><el-icon v-perm="'POST:/admin/sms/config/delete'" class="op-icon is-danger" @click="remove('config', row)"><Delete /></el-icon></template></el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="签名模板" name="signature">
        <div class="tab-toolbar"><el-button v-perm="'POST:/admin/sms/signature/save'" type="primary" :icon="Plus" @click="openCreate('signature')">新增签名</el-button></div>
        <el-table :data="signatures" stripe><el-table-column prop="name" label="签名" /><el-table-column label="开发配置"><template #default="{ row }">{{ configName(row.config_id) }}</template></el-table-column><el-table-column prop="sign_code" label="平台签名编码" /><el-table-column label="状态"><template #default="{ row }">{{ StatusLabels[row.status] }}</template></el-table-column><el-table-column label="操作" width="110"><template #default="{ row }"><el-icon v-perm="'POST:/admin/sms/signature/save'" class="op-icon is-edit" @click="openEdit('signature', row)"><Edit /></el-icon><el-icon v-perm="'POST:/admin/sms/signature/delete'" class="op-icon is-danger" @click="remove('signature', row)"><Delete /></el-icon></template></el-table-column></el-table>
      </el-tab-pane>
      <el-tab-pane label="短信模板" name="template">
        <div class="tab-toolbar"><el-button v-perm="'POST:/admin/sms/template/save'" type="primary" :icon="Plus" @click="openCreate('template')">新增模板</el-button></div>
        <el-table :data="templates" stripe><el-table-column prop="name" label="模板名称" /><el-table-column label="开发配置"><template #default="{ row }">{{ configName(row.config_id) }}</template></el-table-column><el-table-column prop="template_code" label="模板编码" /><el-table-column label="类型"><template #default="{ row }">{{ SMSTemplateTypeLabels[row.type] }}</template></el-table-column><el-table-column prop="content" label="内容" show-overflow-tooltip /><el-table-column label="操作" width="110"><template #default="{ row }"><el-icon v-perm="'POST:/admin/sms/template/save'" class="op-icon is-edit" @click="openEdit('template', row)"><Edit /></el-icon><el-icon v-perm="'POST:/admin/sms/template/delete'" class="op-icon is-danger" @click="remove('template', row)"><Delete /></el-icon></template></el-table-column></el-table>
      </el-tab-pane>
      <el-tab-pane label="发送记录" name="logs">
        <div class="tab-toolbar"><el-input v-model="logQuery.mobile" placeholder="手机号" clearable style="width: 200px" /><el-select v-model="logQuery.status" placeholder="发送状态" clearable style="width: 140px"><el-option v-for="(label, value) in SMSSendStatusLabels" :key="value" :label="label" :value="Number(value)" /></el-select><el-button :icon="Search" @click="logQuery.page = 1; loadLogs()">查询</el-button></div>
        <el-table :data="logs" stripe><el-table-column prop="created_at" label="创建时间" width="170" :formatter="formatDateTimeCell" /><el-table-column prop="mobile" label="手机号" /><el-table-column prop="content" label="内容" min-width="220" show-overflow-tooltip /><el-table-column label="状态"><template #default="{ row }">{{ SMSSendStatusLabels[row.status] }}</template></el-table-column><el-table-column prop="provider_message_id" label="平台消息ID" /><el-table-column prop="error_message" label="错误信息" show-overflow-tooltip /></el-table>
        <AppPagination v-model:page="logQuery.page" v-model:page-size="logQuery.page_size" :total="logTotal" @change="loadLogs" />
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="dialogVisible" :title="form.id ? '修改配置' : '新增配置'" width="600px">
      <el-form label-width="120px">
        <el-form-item label="名称" required><el-input v-model="form.name" /></el-form-item>
        <template v-if="editMode === 'config'"><el-form-item label="服务商"><el-select v-model="form.provider"><el-option v-for="(label, value) in SMSProviderLabels" :key="value" :label="label" :value="Number(value)" /></el-select></el-form-item><el-form-item label="AccessKey ID" required><el-input v-model="form.access_key_id" /></el-form-item><el-form-item label="AccessKey Secret" :required="!form.id"><el-input v-model="form.access_key_secret" type="password" show-password :placeholder="form.id ? '留空表示不修改' : ''" /></el-form-item><el-form-item label="Endpoint"><el-input v-model="form.endpoint" /></el-form-item></template>
        <template v-else><el-form-item label="开发配置" required><el-select v-model="form.config_id"><el-option v-for="item in configs" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item></template>
        <template v-if="editMode === 'signature'"><el-form-item label="平台签名编码"><el-input v-model="form.sign_code" /></el-form-item></template>
        <template v-if="editMode === 'template'"><el-form-item label="模板编码" required><el-input v-model="form.template_code" /></el-form-item><el-form-item label="模板类型"><el-select v-model="form.type"><el-option v-for="(label, value) in SMSTemplateTypeLabels" :key="value" :label="label" :value="Number(value)" /></el-select></el-form-item><el-form-item label="模板内容"><el-input v-model="form.content" type="textarea" :rows="3" /></el-form-item></template>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button :value="Status.Enabled">启用</el-radio-button><el-radio-button :value="Status.Disabled">禁用</el-radio-button></el-radio-group></el-form-item><el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
      </el-form><template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>.tab-toolbar{display:flex;gap:10px;margin-bottom:14px}</style>
