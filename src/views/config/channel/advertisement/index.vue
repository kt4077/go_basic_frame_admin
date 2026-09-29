<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Refresh, Search } from '@element-plus/icons-vue'
import { deleteAdvertisement, getAdvertisementPluginOptions, getAdvertisements, saveAdvertisement } from '@/api/advertisement'
import { advertisementFormats } from '@/enums/advertisement'
import { getOptionLabel, platformOptions } from '@/enums/content'
import type { Advertisement, AdvertisementPluginOption } from '@/types/advertisement'
import AdvertisementForm from './components/AdvertisementForm.vue'

const loading = ref(false)
const rows = ref<Advertisement[]>([])
const plugins = ref<AdvertisementPluginOption[]>([])
const visible = ref(false)
const current = ref<Advertisement>()
const filters = reactive({ name: '', format: undefined as number | undefined, status: undefined as number | undefined })
const loadData = async () => { loading.value = true; try { rows.value = await getAdvertisements(filters) } finally { loading.value = false } }
const loadPlugins = async () => { plugins.value = await getAdvertisementPluginOptions() }
const reset = async () => { Object.assign(filters, { name: '', format: undefined, status: undefined }); await loadData() }
const openCreate = () => { current.value = undefined; visible.value = true }
const openEdit = (row: Advertisement) => { current.value = { ...row, plugin_ids: [...row.plugin_ids], platforms: [...row.platforms] }; visible.value = true }
const submit = async (value: Advertisement) => { await saveAdvertisement(value); ElMessage.success('保存成功'); visible.value = false; await loadData() }
const remove = async (row: Advertisement) => { await ElMessageBox.confirm(`确认删除广告“${row.name}”吗？`, '删除确认', { type: 'warning' }); await deleteAdvertisement(row.id); ElMessage.success('删除成功'); await loadData() }
onMounted(async () => { await Promise.all([loadData(), loadPlugins()]) })
</script>

<template>
  <div class="page-container"><el-card shadow="never">
    <div class="toolbar"><div class="filters">
      <el-input v-model="filters.name" clearable placeholder="广告名称" @keyup.enter="loadData" />
      <el-select v-model="filters.format" clearable placeholder="广告形式"><el-option v-for="item in advertisementFormats" :key="item.value" :label="item.label" :value="item.value" /></el-select>
      <el-select v-model="filters.status" clearable placeholder="启用状态"><el-option label="启用" :value="1" /><el-option label="停用" :value="2" /></el-select>
      <el-button type="primary" :icon="Search" @click="loadData">查询</el-button><el-button :icon="Refresh" @click="reset">重置</el-button>
    </div><el-button v-perm="'POST:/admin/advertisement/save'" type="primary" @click="openCreate">新增广告</el-button></div>
    <el-table v-loading="loading" :data="rows" row-key="id">
      <el-table-column prop="name" label="广告名称" min-width="150" />
      <el-table-column prop="ad_id" label="广告ID" min-width="180" show-overflow-tooltip />
      <el-table-column label="广告形式" width="110"><template #default="{ row }">{{ getOptionLabel(advertisementFormats, row.format) }}</template></el-table-column>
      <el-table-column label="业务插件" min-width="200"><template #default="{ row }"><div class="tag-list"><el-tag v-for="(name, index) in row.plugin_names" :key="row.plugin_ids[index]" effect="plain">{{ name }}</el-tag></div></template></el-table-column>
      <el-table-column label="广告平台" min-width="260"><template #default="{ row }"><div class="tag-list"><el-tag v-for="platform in row.platforms" :key="platform" effect="plain">{{ getOptionLabel(platformOptions, platform) }}</el-tag></div></template></el-table-column>
      <el-table-column prop="description" label="广告描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '启用' : '停用' }}</el-tag></template></el-table-column>
      <el-table-column label="操作" width="110" fixed="right"><template #default="{ row }"><div class="table-operations"><el-tooltip content="编辑广告" placement="top"><el-icon v-perm="'POST:/admin/advertisement/save'" class="op-icon is-edit" @click="openEdit(row)"><Edit /></el-icon></el-tooltip><el-tooltip content="删除广告" placement="top"><el-icon v-perm="'POST:/admin/advertisement/delete'" class="op-icon is-danger" @click="remove(row)"><Delete /></el-icon></el-tooltip></div></template></el-table-column>
    </el-table>
  </el-card><AdvertisementForm v-model="visible" :data="current" :plugins="plugins" @submit="submit" /></div>
</template>

<style scoped>
.toolbar,.filters,.tag-list{display:flex;align-items:center;gap:12px}.toolbar{justify-content:space-between;margin-bottom:16px}.filters .el-input{width:180px}.filters .el-select{width:140px}.tag-list{flex-wrap:wrap;gap:6px}
</style>
