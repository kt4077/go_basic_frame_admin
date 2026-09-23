<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'
import { deleteWechatConfig, getWechatConfigs, saveWechatConfig } from '@/api/wechat'
import type { WechatConfig } from '@/types/wechat'
import { WechatType, WechatTypeLabels } from '@/enums/channel'
import { Status, StatusLabels } from '@/enums/common'

const activeType = ref<number>(WechatType.Official)
const loading = ref(false)
const list = ref<WechatConfig[]>([])
const visible = ref(false)
const form = reactive({ id: 0, name: '', type: WechatType.Official as number, app_id: '', app_secret: '', token: '', aes_key: '', status: Status.Enabled, remark: '' })
const load = async () => { loading.value = true; try { list.value = await getWechatConfigs(activeType.value) } finally { loading.value = false } }
const openCreate = () => { Object.assign(form, { id: 0, name: '', type: activeType.value, app_id: '', app_secret: '', token: '', aes_key: '', status: Status.Enabled, remark: '' }); visible.value = true }
const openEdit = (row: WechatConfig) => { Object.assign(form, row, { app_secret: '', token: '', aes_key: '' }); visible.value = true }
const submit = async () => { if (!form.name || !form.app_id || (!form.id && !form.app_secret)) return ElMessage.warning('请填写必填配置'); await saveWechatConfig(form); ElMessage.success('保存成功'); visible.value = false; await load() }
const remove = async (row: WechatConfig) => { await ElMessageBox.confirm(`确认删除「${row.name}」吗？`, '提示', { type: 'warning' }); await deleteWechatConfig(row.id); ElMessage.success('删除成功'); await load() }
onMounted(load)
</script>
<template>
  <div class="page-card"><div class="toolbar"><h4>微信配置</h4><el-button v-perm="'POST:/admin/wechat/config/save'" type="primary" :icon="Plus" @click="openCreate">新增配置</el-button></div>
    <el-tabs v-model="activeType" @tab-change="load"><el-tab-pane v-for="(label, value) in WechatTypeLabels" :key="value" :label="label" :name="Number(value)" /></el-tabs>
    <el-table :data="list" v-loading="loading" stripe><el-table-column prop="name" label="配置名称" /><el-table-column prop="app_id" label="AppID" min-width="220" /><el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="row.status === Status.Enabled ? 'success' : 'danger'">{{ StatusLabels[row.status] }}</el-tag></template></el-table-column><el-table-column prop="remark" label="备注" /><el-table-column label="操作" width="110"><template #default="{ row }"><el-icon v-perm="'POST:/admin/wechat/config/save'" class="op-icon is-edit" @click="openEdit(row)"><Edit /></el-icon><el-icon v-perm="'POST:/admin/wechat/config/delete'" class="op-icon is-danger" @click="remove(row)"><Delete /></el-icon></template></el-table-column></el-table>
    <el-dialog v-model="visible" :title="form.id ? '修改微信配置' : '新增微信配置'" width="580px"><el-form label-width="110px"><el-form-item label="应用类型"><el-tag>{{ WechatTypeLabels[form.type] }}</el-tag></el-form-item><el-form-item label="配置名称" required><el-input v-model="form.name" /></el-form-item><el-form-item label="AppID" required><el-input v-model="form.app_id" /></el-form-item><el-form-item label="AppSecret" :required="!form.id"><el-input v-model="form.app_secret" type="password" show-password :placeholder="form.id ? '留空表示不修改' : ''" /></el-form-item><el-form-item label="Token"><el-input v-model="form.token" type="password" show-password :placeholder="form.id ? '留空表示不修改' : ''" /></el-form-item><el-form-item label="EncodingAESKey"><el-input v-model="form.aes_key" type="password" show-password :placeholder="form.id ? '留空表示不修改' : ''" /></el-form-item><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button :value="Status.Enabled">启用</el-radio-button><el-radio-button :value="Status.Disabled">禁用</el-radio-button></el-radio-group></el-form-item><el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item></el-form><template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template></el-dialog>
  </div>
</template>
