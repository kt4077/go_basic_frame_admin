<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'
import { deletePaymentConfig, getPaymentConfigs, savePaymentConfig } from '@/api/payment'
import type { PaymentConfig } from '@/types/payment'
import { PaymentChannel, PaymentChannelLabels } from '@/enums/channel'
import { Status, StatusLabels } from '@/enums/common'

const channel = ref<number>(PaymentChannel.Wechat)
const loading = ref(false)
const list = ref<PaymentConfig[]>([])
const visible = ref(false)
const form = reactive({ id: 0, name: '', channel: PaymentChannel.Wechat as number, app_id: '', merchant_id: '', private_key: '', public_key: '', api_v3_key: '', cert_serial_no: '', notify_url: '', status: Status.Enabled, sort: 0, remark: '' })
const load = async () => { loading.value = true; try { list.value = await getPaymentConfigs(channel.value) } finally { loading.value = false } }
const openCreate = () => { Object.assign(form, { id: 0, name: '', channel: channel.value, app_id: '', merchant_id: '', private_key: '', public_key: '', api_v3_key: '', cert_serial_no: '', notify_url: '', status: Status.Enabled, sort: list.value.length, remark: '' }); visible.value = true }
const openEdit = (row: PaymentConfig) => { Object.assign(form, row, { private_key: '', public_key: '', api_v3_key: '' }); visible.value = true }
const submit = async () => { if (!form.name || !form.app_id || !form.notify_url || (!form.id && !form.private_key)) return ElMessage.warning('请填写必填配置'); await savePaymentConfig(form); ElMessage.success('保存成功'); visible.value = false; await load() }
const remove = async (row: PaymentConfig) => { await ElMessageBox.confirm(`确认删除「${row.name}」吗？`, '提示', { type: 'warning' }); await deletePaymentConfig(row.id); ElMessage.success('删除成功'); await load() }
onMounted(load)
</script>
<template>
  <div class="page-card"><div class="toolbar"><h4>支付配置</h4><el-button v-perm="'POST:/admin/payment/config/save'" type="primary" :icon="Plus" @click="openCreate">新增配置</el-button></div>
    <el-tabs v-model="channel" @tab-change="load"><el-tab-pane v-for="(label, value) in PaymentChannelLabels" :key="value" :label="label" :name="Number(value)" /></el-tabs>
    <el-alert title="同一种支付渠道可以维护多套商户配置，业务接入时按配置 ID 选择。" type="info" :closable="false" style="margin-bottom:14px" />
    <el-table :data="list" v-loading="loading" stripe><el-table-column prop="name" label="配置名称" /><el-table-column prop="app_id" label="AppID" min-width="180" /><el-table-column prop="merchant_id" label="商户号" min-width="160" /><el-table-column prop="notify_url" label="回调地址" min-width="220" show-overflow-tooltip /><el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="row.status === Status.Enabled ? 'success' : 'danger'">{{ StatusLabels[row.status] }}</el-tag></template></el-table-column><el-table-column prop="sort" label="排序" width="80" /><el-table-column label="操作" width="110"><template #default="{ row }"><el-icon v-perm="'POST:/admin/payment/config/save'" class="op-icon is-edit" @click="openEdit(row)"><Edit /></el-icon><el-icon v-perm="'POST:/admin/payment/config/delete'" class="op-icon is-danger" @click="remove(row)"><Delete /></el-icon></template></el-table-column></el-table>
    <el-dialog v-model="visible" :title="form.id ? '修改支付配置' : '新增支付配置'" width="680px"><el-form label-width="110px"><el-form-item label="支付渠道"><el-tag>{{ PaymentChannelLabels[form.channel] }}</el-tag></el-form-item><el-form-item label="配置名称" required><el-input v-model="form.name" /></el-form-item><el-form-item label="AppID" required><el-input v-model="form.app_id" /></el-form-item><el-form-item label="商户号"><el-input v-model="form.merchant_id" /></el-form-item><el-form-item label="私钥" :required="!form.id"><el-input v-model="form.private_key" type="textarea" :rows="3" :placeholder="form.id ? '留空表示不修改' : ''" /></el-form-item><el-form-item label="平台公钥"><el-input v-model="form.public_key" type="textarea" :rows="2" :placeholder="form.id ? '留空表示不修改' : ''" /></el-form-item><template v-if="form.channel === PaymentChannel.Wechat"><el-form-item label="APIv3 Key"><el-input v-model="form.api_v3_key" type="password" show-password :placeholder="form.id ? '留空表示不修改' : ''" /></el-form-item><el-form-item label="证书序列号"><el-input v-model="form.cert_serial_no" /></el-form-item></template><el-form-item label="回调地址" required><el-input v-model="form.notify_url" /></el-form-item><el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button :value="Status.Enabled">启用</el-radio-button><el-radio-button :value="Status.Disabled">禁用</el-radio-button></el-radio-group></el-form-item><el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item><el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item></el-form><template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template></el-dialog>
  </div>
</template>
