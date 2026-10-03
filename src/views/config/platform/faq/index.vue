<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Delete, Edit, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppPagination from '@/components/AppPagination.vue'
import FAQForm from './components/FAQForm.vue'
import FAQGroupForm from './components/FAQGroupForm.vue'
import { deleteFAQ, deleteFAQGroup, getFAQGroups, getFAQs, saveFAQ, saveFAQGroup } from '@/api/faq'
import type { FAQ, FAQGroup, FAQGroupSave, FAQQuery, FAQSave } from '@/types/faq'
import { Status, StatusLabels } from '@/enums/common'
import { formatDateTime } from '@/utils/datetime'

const activeTab = ref('faq')
const loading = ref(false)
const groupLoading = ref(false)
const submitting = ref(false)
const rows = ref<FAQ[]>([])
const groups = ref<FAQGroup[]>([])
const total = ref(0)
const faqVisible = ref(false)
const groupVisible = ref(false)
const editingFAQ = ref<FAQ | null>(null)
const editingGroup = ref<FAQGroup | null>(null)
const query = reactive<FAQQuery>({ page: 1, page_size: 20, keyword: '', group_id: undefined, status: undefined })
const groupQuery = reactive({ keyword: '', status: undefined as number | undefined })

const loadGroups = async () => { groupLoading.value = true; try { groups.value = await getFAQGroups(groupQuery) } finally { groupLoading.value = false } }
const loadFAQs = async () => { loading.value = true; try { const data = await getFAQs(query); rows.value = data.list || []; total.value = data.total || 0 } finally { loading.value = false } }
const searchFAQs = () => { query.page = 1; void loadFAQs() }
const resetFAQs = () => { query.keyword = ''; query.group_id = undefined; query.status = undefined; searchFAQs() }
const resetGroups = () => { groupQuery.keyword = ''; groupQuery.status = undefined; void loadGroups() }

const openFAQ = (row?: FAQ) => {
  if (!row && groups.value.length === 0) { ElMessage.warning('请先新增问题分组'); activeTab.value = 'group'; return }
  editingFAQ.value = row || null; faqVisible.value = true
}
const openGroup = (row?: FAQGroup) => { editingGroup.value = row || null; groupVisible.value = true }
const submitFAQ = async (data: FAQSave) => { submitting.value = true; try { await saveFAQ(data); ElMessage.success('保存成功'); faqVisible.value = false; await Promise.all([loadFAQs(), loadGroups()]) } finally { submitting.value = false } }
const submitGroup = async (data: FAQGroupSave) => { submitting.value = true; try { await saveFAQGroup(data); ElMessage.success('保存成功'); groupVisible.value = false; await loadGroups() } finally { submitting.value = false } }
const removeFAQ = async (row: FAQ) => { await ElMessageBox.confirm(`确认删除「${row.name}」吗？`, '删除确认', { type: 'warning' }); await deleteFAQ(row.id); ElMessage.success('删除成功'); await Promise.all([loadFAQs(), loadGroups()]) }
const removeGroup = async (row: FAQGroup) => { await ElMessageBox.confirm(`确认删除分组「${row.name}」吗？分组内存在问题时不能删除。`, '删除确认', { type: 'warning' }); await deleteFAQGroup(row.id); ElMessage.success('删除成功'); await loadGroups() }

onMounted(async () => { await loadGroups(); await loadFAQs() })
</script>

<template>
  <div class="page-card">
    <div class="toolbar">
      <div><h4>常见问题</h4><p class="toolbar__description">维护常见问题分组及用户端展示的问题内容</p></div>
    </div>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="问题管理" name="faq">
        <div class="section-actions"><div class="filter-bar"><el-input v-model="query.keyword" clearable placeholder="问题名称" @keyup.enter="searchFAQs" /><el-select v-model="query.group_id" clearable placeholder="所属分组"><el-option v-for="item in groups" :key="item.id" :label="item.name" :value="item.id" /></el-select><el-select v-model="query.status" clearable placeholder="启用状态"><el-option v-for="(label,value) in StatusLabels" :key="value" :label="label" :value="Number(value)" /></el-select><el-button type="primary" :icon="Search" @click="searchFAQs">查询</el-button><el-button :icon="Refresh" @click="resetFAQs">重置</el-button></div><el-button v-perm="'POST:/admin/faq/save'" type="primary" :icon="Plus" @click="openFAQ()">新增问题</el-button></div>
        <el-table v-loading="loading" :data="rows" stripe>
          <el-table-column prop="name" label="问题名称" min-width="260" show-overflow-tooltip />
          <el-table-column prop="group_name" label="所属分组" min-width="140" show-overflow-tooltip />
          <el-table-column label="状态" width="90"><template #default="{row}"><el-tag :type="row.status===Status.Enabled?'success':'danger'">{{ StatusLabels[row.status] }}</el-tag></template></el-table-column>
          <el-table-column prop="sort" label="排序" width="90" />
          <el-table-column label="更新时间" width="180"><template #default="{row}">{{ formatDateTime(row.updated_at) }}</template></el-table-column>
          <el-table-column label="操作" width="100" fixed="right"><template #default="{row}"><div class="table-operations"><el-tooltip content="修改" placement="top"><el-icon v-perm="'POST:/admin/faq/save'" class="op-icon is-edit" @click="openFAQ(row)"><Edit /></el-icon></el-tooltip><el-tooltip content="删除" placement="top"><el-icon v-perm="'POST:/admin/faq/delete'" class="op-icon is-danger" @click="removeFAQ(row)"><Delete /></el-icon></el-tooltip></div></template></el-table-column>
        </el-table>
        <AppPagination v-model:page="query.page" v-model:page-size="query.page_size" :total="total" @change="loadFAQs" />
      </el-tab-pane>
      <el-tab-pane label="问题分组" name="group">
        <div class="section-actions"><div class="filter-bar"><el-input v-model="groupQuery.keyword" clearable placeholder="分组名称" @keyup.enter="loadGroups" /><el-select v-model="groupQuery.status" clearable placeholder="启用状态"><el-option v-for="(label,value) in StatusLabels" :key="value" :label="label" :value="Number(value)" /></el-select><el-button type="primary" :icon="Search" @click="loadGroups">查询</el-button><el-button :icon="Refresh" @click="resetGroups">重置</el-button></div><el-button v-perm="'POST:/admin/faq/group/save'" type="primary" :icon="Plus" @click="openGroup()">新增分组</el-button></div>
        <el-table v-loading="groupLoading" :data="groups" stripe>
          <el-table-column prop="name" label="分组名称" min-width="260" />
          <el-table-column prop="faq_count" label="问题数量" width="120" />
          <el-table-column label="状态" width="90"><template #default="{row}"><el-tag :type="row.status===Status.Enabled?'success':'danger'">{{ StatusLabels[row.status] }}</el-tag></template></el-table-column>
          <el-table-column prop="sort" label="排序" width="90" />
          <el-table-column label="更新时间" width="180"><template #default="{row}">{{ formatDateTime(row.updated_at) }}</template></el-table-column>
          <el-table-column label="操作" width="100" fixed="right"><template #default="{row}"><div class="table-operations"><el-tooltip content="修改" placement="top"><el-icon v-perm="'POST:/admin/faq/group/save'" class="op-icon is-edit" @click="openGroup(row)"><Edit /></el-icon></el-tooltip><el-tooltip content="删除" placement="top"><el-icon v-perm="'POST:/admin/faq/group/delete'" class="op-icon is-danger" @click="removeGroup(row)"><Delete /></el-icon></el-tooltip></div></template></el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <FAQForm v-model="faqVisible" :faq="editingFAQ" :groups="groups" :submitting="submitting" @submit="submitFAQ" />
    <FAQGroupForm v-model="groupVisible" :group="editingGroup" :submitting="submitting" @submit="submitGroup" />
  </div>
</template>

<style scoped>
.toolbar__description{margin:6px 0 0;color:var(--el-text-color-secondary);font-size:13px}.section-actions{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:10px 0 16px}.filter-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.filter-bar .el-input,.filter-bar .el-select{width:170px}.table-operations{display:flex;align-items:center;gap:12px}
</style>
