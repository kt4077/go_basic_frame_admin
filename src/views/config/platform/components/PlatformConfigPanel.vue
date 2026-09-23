<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import AvatarUpload from '@/components/AvatarUpload.vue'
import {
  getAdminPlatformConfig,
  getUserPlatformConfig,
  saveAdminPlatformConfig,
  saveUserPlatformConfig,
} from '@/api/platform'
import { PlatformType, type PlatformTypeValue } from '@/enums/platform'
import { usePlatformStore } from '@/store/platform'

const props = defineProps<{ type: PlatformTypeValue }>()
const platformStore = usePlatformStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const saving = ref(false)
const form = reactive({
  logo: '',
  system_name: '',
  default_nickname: '',
  default_avatar: '',
})

const isAdmin = computed(() => props.type === PlatformType.Admin)
const savePermission = computed(() => isAdmin.value
  ? 'POST:/admin/platform/admin/save'
  : 'POST:/admin/platform/user/save')

const rules: FormRules = {
  system_name: [{ required: true, message: '请输入系统名称', trigger: 'blur' }],
  default_nickname: [{ required: true, message: '请输入默认昵称', trigger: 'blur' }],
}

const load = async () => {
  loading.value = true
  try {
    if (isAdmin.value) {
      const result = await getAdminPlatformConfig()
      form.logo = result.logo
      form.system_name = result.system_name
      platformStore.setAdminConfig(result)
    } else {
      const result = await getUserPlatformConfig()
      form.default_nickname = result.default_nickname
      form.default_avatar = result.default_avatar
    }
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!await formRef.value?.validate()) return
  saving.value = true
  try {
    if (isAdmin.value) {
      const result = await saveAdminPlatformConfig({ logo: form.logo, system_name: form.system_name })
      form.logo = result.logo
      form.system_name = result.system_name
    } else {
      const result = await saveUserPlatformConfig({
        default_nickname: form.default_nickname,
        default_avatar: form.default_avatar,
      })
      form.default_nickname = result.default_nickname
      form.default_avatar = result.default_avatar
    }
    ElMessage.success('平台配置保存成功')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<template>
  <div v-loading="loading" class="platform-page">
    <section class="page-card config-card">
      <div class="section-heading">
        <div>
          <h4>基础信息</h4>
          <p>修改后保存即可生效，图片文件将按照当前默认存储渠道上传。</p>
        </div>
        <el-tag effect="plain" round>{{ isAdmin ? '管理后台' : '用户应用' }}</el-tag>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="config-form">
        <template v-if="isAdmin">
          <el-form-item label="系统 Logo">
            <AvatarUpload v-model="form.logo" :size="104" shape="square" />
          </el-form-item>
          <el-form-item label="系统名称" prop="system_name">
            <el-input v-model="form.system_name" maxlength="100" show-word-limit placeholder="请输入管理端系统名称" />
            <div class="field-help">用于管理后台左上角品牌区域展示。</div>
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="默认头像">
            <AvatarUpload v-model="form.default_avatar" :size="104" shape="circle" />
          </el-form-item>
          <el-form-item label="默认昵称" prop="default_nickname">
            <el-input v-model="form.default_nickname" maxlength="100" show-word-limit placeholder="请输入新用户默认昵称" />
            <div class="field-help">用户未设置昵称时，可使用该名称作为默认展示。</div>
          </el-form-item>
        </template>

        <div class="form-actions">
          <el-button v-perm="savePermission" type="primary" :loading="saving" @click="save">保存配置</el-button>
        </div>
      </el-form>
    </section>
  </div>
</template>

<style scoped>
.platform-page { min-height: 100%; display: flex; flex-direction: column; }
.section-heading p { margin: 0; color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.6; }
.config-card { flex: 1; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--card-border); }
.section-heading h4 { margin: 0 0 5px; color: var(--el-text-color-primary); font-size: 15px; }
.config-form { width: min(680px, 100%); padding-top: 22px; }
.config-form :deep(.el-form-item) { margin-bottom: 24px; }
.config-form :deep(.el-form-item__label) { font-weight: 600; color: var(--el-text-color-primary); }
.field-help { margin-top: 7px; color: var(--el-text-color-secondary); font-size: 12px; }
.form-actions { padding-top: 2px; border-top: 1px dashed var(--card-border); }
.form-actions .el-button { min-width: 104px; margin-top: 18px; }
@media (max-width: 640px) {
  .config-card { padding: 16px; }
  .section-heading { align-items: flex-start; }
}
</style>
