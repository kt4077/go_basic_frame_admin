<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ContentMenu } from '@/types/content'
import AvatarUpload from '@/components/AvatarUpload.vue'
import { contentPositions, displayTypes, linkTypes, platformOptions } from '@/enums/content'

const props = defineProps<{ modelValue: boolean; data?: ContentMenu }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; 'submit': [value: ContentMenu] }>()
const empty = (): ContentMenu => ({ id: 0, name: '', position: 1, platforms: [1, 5], display_type: 1, icon: '', image_path: '', link_type: 1, link_url: '', status: 1, sort: 0, remark: '' })
const form = reactive<ContentMenu>(empty())
watch(() => props.modelValue, (value: boolean) => { if (value) Object.assign(form, empty(), props.data || {}) })
</script>
<template>
  <el-drawer :model-value="modelValue" :title="form.id ? '修改菜单' : '新增菜单'" size="560px" @close="emit('update:modelValue', false)">
    <el-form label-width="96px">
      <el-form-item label="菜单名称"><el-input v-model="form.name" maxlength="64" /></el-form-item>
      <el-form-item label="展示位置"><el-select v-model="form.position"><el-option v-for="item in contentPositions" :key="item.value" v-bind="item" /></el-select></el-form-item>
      <el-form-item label="展示平台"><el-checkbox-group v-model="form.platforms"><el-checkbox v-for="item in platformOptions" :key="item.value" :value="item.value">{{ item.label }}</el-checkbox></el-checkbox-group></el-form-item>
      <el-form-item label="展示形式"><el-radio-group v-model="form.display_type"><el-radio v-for="item in displayTypes" :key="item.value" :value="item.value">{{ item.label }}</el-radio></el-radio-group></el-form-item>
      <el-form-item v-if="form.display_type === 1" label="Wot 图标"><el-input v-model="form.icon" placeholder="例如：home、user-circle、star" /></el-form-item>
      <el-form-item v-else label="菜单图片">
        <AvatarUpload
          v-model="form.image_path"
          :preview-url="form.image_url"
          :size="104"
          shape="square"
        />
      </el-form-item>
      <el-form-item label="跳转类型"><el-select v-model="form.link_type"><el-option v-for="item in linkTypes" :key="item.value" v-bind="item" /></el-select></el-form-item>
      <el-form-item v-if="form.link_type !== 1" label="跳转地址"><el-input v-model="form.link_url" placeholder="应用内路径、网页 URL 或外部应用标识" /></el-form-item>
      <el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="2" /></el-form-item>
      <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" /></el-form-item>
      <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="emit('update:modelValue', false)">取消</el-button><el-button type="primary" @click="emit('submit', { ...form })">保存</el-button></template>
  </el-drawer>
</template>
