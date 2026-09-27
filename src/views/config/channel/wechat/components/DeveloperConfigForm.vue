<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { WechatConfig, WechatConfigSave } from '@/types/wechat'
import { OpenPlatform, OpenPlatformLabels, WechatType, WechatTypeLabels } from '@/enums/channel'
import { Status } from '@/enums/common'

const props = defineProps<{
  modelValue: boolean
  platform: number
  config?: WechatConfig | null
  submitting?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [value: WechatConfigSave]
}>()

const formRef = ref<FormInstance>()
const form = reactive<WechatConfigSave>({
  id: 0,
  platform: OpenPlatform.Wechat,
  name: '',
  type: WechatType.MiniApp,
  app_id: '',
  app_secret: '',
  token: '',
  aes_key: '',
  public_key: '',
  private_key: '',
  redirect_uri: '',
  status: Status.Enabled,
  remark: '',
})

const isWechat = computed(() => form.platform === OpenPlatform.Wechat)
const isAlipay = computed(() => form.platform === OpenPlatform.Alipay)
const title = computed(() => `${form.id ? '修改' : '新增'}${OpenPlatformLabels[form.platform]}配置`)

const rules: FormRules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  app_id: [{ required: true, message: '请输入应用 ID', trigger: 'blur' }],
  app_secret: [{
    validator: (_rule, value, callback) => {
      if (!form.id && !value && !isAlipay.value) {
        callback(new Error('请输入应用密钥'))
        return
      }
      callback()
    },
    trigger: 'blur',
  }],
  private_key: [{
    validator: (_rule, value, callback) => {
      if (!form.id && isAlipay.value && !value) {
        callback(new Error('请输入支付宝应用私钥'))
        return
      }
      callback()
    },
    trigger: 'blur',
  }],
}

const reset = () => {
  Object.assign(form, {
    id: props.config?.id || 0,
    platform: props.config?.platform || props.platform,
    name: props.config?.name || '',
    type: props.config?.type || WechatType.MiniApp,
    app_id: props.config?.app_id || '',
    app_secret: '',
    token: '',
    aes_key: '',
    public_key: '',
    private_key: '',
    redirect_uri: props.config?.redirect_uri || '',
    status: props.config?.status || Status.Enabled,
    remark: props.config?.remark || '',
  })
  formRef.value?.clearValidate()
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) reset()
  },
)

const submit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('submit', { ...form })
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    width="640px"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="112px">
      <el-form-item label="开放平台">
        <el-tag>{{ OpenPlatformLabels[form.platform] }}</el-tag>
      </el-form-item>
      <el-form-item v-if="isWechat" label="应用类型" prop="type">
        <el-select v-model="form.type" style="width: 100%">
          <el-option
            v-for="(label, value) in WechatTypeLabels"
            :key="value"
            :label="label"
            :value="Number(value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="配置名称" prop="name">
        <el-input v-model="form.name" maxlength="64" show-word-limit />
      </el-form-item>
      <el-form-item label="应用 ID" prop="app_id">
        <el-input v-model="form.app_id" maxlength="128" />
      </el-form-item>
      <el-form-item v-if="!isAlipay" label="应用密钥" prop="app_secret">
        <el-input
          v-model="form.app_secret"
          type="password"
          show-password
          :placeholder="form.id ? '留空表示不修改' : '请输入服务端应用密钥'"
        />
      </el-form-item>
      <template v-if="isAlipay">
        <el-form-item label="应用私钥" prop="private_key">
          <el-input
            v-model="form.private_key"
            type="textarea"
            :rows="5"
            :placeholder="form.id ? '留空表示不修改' : '请输入 PKCS1 或 PKCS8 PEM 私钥'"
          />
        </el-form-item>
        <el-form-item label="支付宝公钥">
          <el-input
            v-model="form.public_key"
            type="textarea"
            :rows="4"
            :placeholder="form.id ? '留空表示不修改' : '请输入支付宝平台公钥'"
          />
        </el-form-item>
      </template>
      <template v-if="isWechat">
        <el-form-item v-if="form.type === WechatType.Official" label="授权回调地址">
          <el-input
            v-model="form.redirect_uri"
            placeholder="https://example.com/subpackages/auth/wechat-callback/index"
          />
          <div class="form-tip">必须与微信公众号后台配置的网页授权域名一致</div>
        </el-form-item>
        <el-form-item label="消息 Token">
          <el-input
            v-model="form.token"
            type="password"
            show-password
            :placeholder="form.id ? '留空表示不修改' : '公众号消息校验可选'"
          />
        </el-form-item>
        <el-form-item label="EncodingAESKey">
          <el-input
            v-model="form.aes_key"
            type="password"
            show-password
            :placeholder="form.id ? '留空表示不修改' : '公众号消息加解密可选'"
          />
        </el-form-item>
      </template>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio-button :value="Status.Enabled">启用</el-radio-button>
          <el-radio-button :value="Status.Disabled">禁用</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="255" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">保存配置</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.form-tip {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}
</style>
