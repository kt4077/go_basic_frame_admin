<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Refresh, Search } from '@element-plus/icons-vue'
import {
  deleteContentMenu,
  getContentMenus,
  saveContentMenu,
} from '@/api/content'
import {
  contentPositions,
  displayTypes,
  getOptionLabel,
  linkTypes,
  platformOptions,
} from '@/enums/content'
import type { ContentMenu } from '@/types/content'
import MenuForm from './components/MenuForm.vue'

const loading = ref(false)
const rows = ref<ContentMenu[]>([])
const formVisible = ref(false)
const current = ref<ContentMenu>()
const filters = reactive({
  position: undefined as number | undefined,
  status: undefined as number | undefined,
})

const loadData = async () => {
  loading.value = true
  try {
    rows.value = await getContentMenus(filters)
  } finally {
    loading.value = false
  }
}

const resetFilters = async () => {
  filters.position = undefined
  filters.status = undefined
  await loadData()
}

const openCreate = () => {
  current.value = undefined
  formVisible.value = true
}

const openEdit = (row: ContentMenu) => {
  current.value = { ...row, platforms: [...row.platforms] }
  formVisible.value = true
}

const submit = async (value: ContentMenu) => {
  await saveContentMenu(value)
  ElMessage.success('保存成功')
  formVisible.value = false
  await loadData()
}

const remove = async (row: ContentMenu) => {
  await ElMessageBox.confirm(`确认删除菜单“${row.name}”吗？`, '删除确认', {
    type: 'warning',
  })
  await deleteContentMenu(row.id)
  ElMessage.success('删除成功')
  await loadData()
}

onMounted(loadData)
</script>

<template>
  <div class="page-container">
    <el-card shadow="never">
      <div class="toolbar">
        <div class="filters">
          <el-select v-model="filters.position" clearable placeholder="展示位置">
            <el-option
              v-for="item in contentPositions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <el-select v-model="filters.status" clearable placeholder="启用状态">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="2" />
          </el-select>
          <el-button type="primary" :icon="Search" @click="loadData">查询</el-button>
          <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
        </div>
        <el-button v-perm="'POST:/admin/content/menu/save'" type="primary" @click="openCreate">新增菜单</el-button>
      </div>

      <el-table v-loading="loading" :data="rows" row-key="id">
        <el-table-column label="展示" width="150">
          <template #default="{ row }">
            <el-image
              v-if="row.display_type === 2"
              class="menu-image"
              :src="row.image_url"
              fit="cover"
              :preview-src-list="row.image_url ? [row.image_url] : []"
              preview-teleported
            />
            <el-tag v-else class="icon-tag" effect="plain">{{ row.icon }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="菜单名称" width="170" />
        <el-table-column label="位置" width="100">
          <template #default="{ row }">
            {{ getOptionLabel(contentPositions, row.position) }}
          </template>
        </el-table-column>
        <el-table-column label="形式" width="90">
          <template #default="{ row }">
            {{ getOptionLabel(displayTypes, row.display_type) }}
          </template>
        </el-table-column>
        <el-table-column label="展示平台" min-width="620">
          <template #default="{ row }">
            <div class="tag-list">
              <el-tag v-for="platform in row.platforms" :key="platform" effect="plain">
                {{ getOptionLabel(platformOptions, platform) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="跳转类型" width="120">
          <template #default="{ row }">
            {{ getOptionLabel(linkTypes, row.link_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <div class="table-operations">
              <el-tooltip content="编辑菜单" placement="top">
                <el-icon v-perm="'POST:/admin/content/menu/save'" class="op-icon is-edit" @click="openEdit(row)">
                  <Edit />
                </el-icon>
              </el-tooltip>
              <el-tooltip content="删除菜单" placement="top">
                <el-icon v-perm="'POST:/admin/content/menu/delete'" class="op-icon is-danger" @click="remove(row)">
                  <Delete />
                </el-icon>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <MenuForm
      v-model="formVisible"
      :data="current"
      @submit="submit"
    />
  </div>
</template>

<style scoped>
.toolbar,
.filters,
.tag-list {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar {
  justify-content: space-between;
  margin-bottom: 16px;
}

.filters .el-select {
  width: 150px;
}

.tag-list {
  flex-wrap: wrap;
  gap: 6px;
}

.menu-image {
  width: 46px;
  height: 46px;
  border-radius: 10px;
}

.icon-tag {
  max-width: 128px;
}
</style>
