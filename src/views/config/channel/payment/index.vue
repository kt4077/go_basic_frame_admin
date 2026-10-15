<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AvatarUpload from '@/components/AvatarUpload.vue'
import { deletePaymentConfig, getPaymentConfigs, savePaymentConfig } from '@/api/payment'
import { PaymentChannel, PaymentChannelLabels, PaymentChannelScenes, PaymentSceneLabels } from '@/enums/channel'
import { Status, StatusLabels } from '@/enums/common'
import { RegisterSourceLabels } from '@/enums/member'
import type { PaymentConfig } from '@/types/payment'

const channel = ref<number>(PaymentChannel.Wechat)
const loading = ref(false)
const list = ref<PaymentConfig[]>([])
const visible = ref(false)
const form = reactive({
  id: 0,
  uid: '',
  name: '',
  logo: '',
  channel: PaymentChannel.Wechat as number,
  app_id: '',
  merchant_id: '',
  private_key: '',
  public_key: '',
  api_v3_key: '',
  cert_serial_no: '',
  notify_url: '',
  scenes: [] as number[],
  platforms: [] as number[],
  status: Status.Enabled,
  sort: 0,
  remark: '',
})

const sceneOptions = computed(() => PaymentChannelScenes[form.channel] || [])
const platformOptions = computed(() => Object.keys(RegisterSourceLabels).map(Number))

const load = async () => {
  loading.value = true
  try {
    list.value = await getPaymentConfigs(channel.value)
  }
  finally {
    loading.value = false
  }
}

const openCreate = () => {
  Object.assign(form, {
    id: 0,
    uid: '',
    name: '',
    logo: '',
    channel: channel.value,
    app_id: '',
    merchant_id: '',
    private_key: '',
    public_key: '',
    api_v3_key: '',
    cert_serial_no: '',
    notify_url: '',
    scenes: [...(PaymentChannelScenes[channel.value] || [])],
    platforms: [],
    status: Status.Enabled,
    sort: list.value.length,
    remark: '',
  })
  visible.value = true
}

const openEdit = (row: PaymentConfig) => {
  Object.assign(form, row, {
    scenes: [...(row.scenes || [])],
    platforms: [...(row.platforms || [])],
    private_key: '',
    public_key: '',
    api_v3_key: '',
  })
  visible.value = true
}

const submit = async () => {
  if (!form.name || !form.app_id || !form.merchant_id || !form.notify_url || form.scenes.length === 0 || form.platforms.length === 0 || (!form.id && !form.private_key)) {
    ElMessage.warning('请填写必填配置')
    return
  }
  await savePaymentConfig(form)
  ElMessage.success('保存成功')
  visible.value = false
  await load()
}

const remove = async (row: PaymentConfig) => {
  await ElMessageBox.confirm(`确认删除「${row.name}」吗？`, '提示', { type: 'warning' })
  await deletePaymentConfig(row.id)
  ElMessage.success('删除成功')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page-card">
    <div class="toolbar">
      <div>
        <h4>支付配置</h4>
        <p class="toolbar__description">同一支付渠道可按小程序、H5、APP维护不同商户配置和可用平台。</p>
      </div>
      <el-button v-perm="'POST:/admin/payment/config/save'" type="primary" :icon="Plus" @click="openCreate">
        新增配置
      </el-button>
    </div>
    <el-tabs v-model="channel" @tab-change="load">
      <el-tab-pane v-for="(label, value) in PaymentChannelLabels" :key="value" :label="label" :name="Number(value)" />
    </el-tabs>
    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="Logo" width="76">
        <template #default="{ row }"><el-avatar :size="38" shape="square" :src="row.logo">{{ row.name.slice(0, 1) }}</el-avatar></template>
      </el-table-column>
      <el-table-column prop="name" label="配置名称" min-width="140" />
      <el-table-column label="支付场景" min-width="220">
        <template #default="{ row }"><el-tag v-for="scene in row.scenes" :key="scene" size="small" effect="plain">{{ PaymentSceneLabels[scene] }}</el-tag></template>
      </el-table-column>
      <el-table-column label="用户端渠道" min-width="240">
        <template #default="{ row }"><span>{{ row.platforms.map((item: number) => RegisterSourceLabels[item]).join('、') }}</span></template>
      </el-table-column>
      <el-table-column prop="app_id" label="AppID" min-width="180" />
      <el-table-column prop="merchant_id" label="商户号" min-width="160" />
      <el-table-column label="状态" width="90" align="center"><template #default="{ row }"><el-tag :type="row.status === Status.Enabled ? 'success' : 'danger'">{{ StatusLabels[row.status] }}</el-tag></template></el-table-column>
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column label="操作" width="110" fixed="right" align="center">
        <template #default="{ row }">
          <div class="table-operations">
            <el-tooltip content="编辑" placement="top"><el-icon v-perm="'POST:/admin/payment/config/save'" class="op-icon is-edit" @click="openEdit(row)"><Edit /></el-icon></el-tooltip>
            <el-tooltip content="删除" placement="top"><el-icon v-perm="'POST:/admin/payment/config/delete'" class="op-icon is-danger" @click="remove(row)"><Delete /></el-icon></el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="visible" :title="form.id ? '修改支付配置' : '新增支付配置'" width="720px">
      <el-form label-width="120px">
        <el-form-item label="支付渠道"><el-tag>{{ PaymentChannelLabels[form.channel] }}</el-tag></el-form-item>
        <el-form-item label="配置名称" required><el-input v-model="form.name" maxlength="64" /></el-form-item>
        <el-form-item label="Logo"><AvatarUpload v-model="form.logo" :size="88" shape="square" /></el-form-item>
        <el-form-item label="支付场景" required><el-checkbox-group v-model="form.scenes"><el-checkbox v-for="scene in sceneOptions" :key="scene" :value="scene">{{ PaymentSceneLabels[scene] }}</el-checkbox></el-checkbox-group></el-form-item>
        <el-form-item label="用户端渠道" required><el-checkbox-group v-model="form.platforms"><el-checkbox v-for="platform in platformOptions" :key="platform" :value="platform">{{ RegisterSourceLabels[platform] }}</el-checkbox></el-checkbox-group></el-form-item>
        <el-form-item label="AppID" required><el-input v-model="form.app_id" /></el-form-item>
        <el-form-item label="商户号" required><el-input v-model="form.merchant_id" /></el-form-item>
        <el-form-item label="商户私钥" :required="!form.id"><el-input v-model="form.private_key" type="textarea" :rows="4" :placeholder="form.id ? '留空表示不修改' : '请输入PEM格式商户私钥'" /></el-form-item>
        <el-form-item label="平台公钥" required><el-input v-model="form.public_key" type="textarea" :rows="4" :placeholder="form.id ? '留空表示不修改' : '用于第三方支付回调验签'" /></el-form-item>
        <template v-if="form.channel === PaymentChannel.Wechat">
          <el-form-item label="APIv3 Key" :required="!form.id"><el-input v-model="form.api_v3_key" type="password" show-password :placeholder="form.id ? '留空表示不修改' : ''" /></el-form-item>
          <el-form-item label="商户证书序列号" required><el-input v-model="form.cert_serial_no" /></el-form-item>
        </template>
        <el-form-item label="回调地址" required><el-input v-model="form.notify_url" placeholder="https://api.example.com/api/payment/notify/{channel}/{config_uid}" /><div class="form-tip">新增时支持 {channel} 和 {config_uid} 占位符，保存后由系统替换。</div></el-form-item>
        <el-form-item label="状态"><el-radio-group v-model="form.status"><el-radio-button :value="Status.Enabled">启用</el-radio-button><el-radio-button :value="Status.Disabled">禁用</el-radio-button></el-radio-group></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="visible = false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped>
.toolbar__description { margin: 6px 0 0; color: var(--el-text-color-secondary); font-size: 13px; }
.el-tag + .el-tag { margin-left: 6px; }
.form-tip { margin-top: 6px; color: var(--el-text-color-secondary); font-size: 12px; }
</style>
