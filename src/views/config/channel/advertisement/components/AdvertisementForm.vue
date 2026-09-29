<script setup lang="ts">
import { reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { advertisementFormats } from '@/enums/advertisement'
import { platformOptions } from '@/enums/content'
import type { Advertisement, AdvertisementPluginOption } from '@/types/advertisement'

const props = defineProps<{ modelValue: boolean; data?: Advertisement; plugins: AdvertisementPluginOption[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; submit: [value: Advertisement] }>()
const empty = (): Advertisement => ({ id: 0, name: '', ad_id: '', format: 1, status: 1, plugin_ids: [], plugin_names: [], platforms: [1], description: '' })
const form = reactive<Advertisement>(empty())

watch(() => props.modelValue, (visible) => {
  if (visible) Object.assign(form, empty(), props.data ? { ...props.data, plugin_ids: [...props.data.plugin_ids], platforms: [...props.data.platforms] } : {})
}, { immediate: true })

const submit = () => {
  if (!form.name.trim()) return ElMessage.warning('请填写广告名称')
  if (!form.ad_id.trim()) return ElMessage.warning('请填写广告ID')
  if (!form.plugin_ids.length) return ElMessage.warning('请至少选择一个业务插件')
  if (!form.platforms.length) return ElMessage.warning('请至少选择一个广告平台')
  emit('submit', { ...form, name: form.name.trim(), plugin_ids: [...form.plugin_ids], platforms: [...form.platforms] })
}
</script>

<template>
  <el-dialog :model-value="modelValue" :title="form.id ? '修改广告配置' : '新增广告配置'" width="680px" @update:model-value="emit('update:modelValue', $event)">
    <el-form label-width="100px">
      <el-form-item label="广告名称" required><el-input v-model="form.name" maxlength="128" show-word-limit /></el-form-item>
      <el-form-item label="广告ID" required><el-input v-model="form.ad_id" maxlength="255" placeholder="请输入广告平台提供的广告ID" /></el-form-item>
      <el-form-item label="广告形式" required><el-radio-group v-model="form.format"><el-radio-button v-for="item in advertisementFormats" :key="item.value" :value="item.value">{{ item.label }}</el-radio-button></el-radio-group></el-form-item>
      <el-form-item label="业务插件" required>
        <el-select v-model="form.plugin_ids" multiple filterable collapse-tags collapse-tags-tooltip placeholder="请选择可使用该广告的插件" style="width: 100%">
          <el-option v-for="plugin in plugins" :key="plugin.id" :label="`${plugin.name}（${plugin.plugin_id}）${plugin.status === 2 ? ' - 已停用' : ''}`" :value="plugin.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="广告平台" required><el-checkbox-group v-model="form.platforms"><el-checkbox v-for="item in platformOptions" :key="item.value" :value="item.value">{{ item.label }}</el-checkbox></el-checkbox-group></el-form-item>
      <el-form-item label="启用状态"><el-radio-group v-model="form.status"><el-radio-button :value="1">启用</el-radio-button><el-radio-button :value="2">停用</el-radio-button></el-radio-group></el-form-item>
      <el-form-item label="广告描述"><el-input v-model="form.description" type="textarea" :rows="4" maxlength="1000" show-word-limit /></el-form-item>
    </el-form>
    <template #footer><el-button @click="emit('update:modelValue', false)">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template>
  </el-dialog>
</template>
