<script setup lang="ts">
// 菜单按钮管理：目录/菜单/按钮多级配置，按钮需绑定后端接口地址
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search, Refresh } from '@element-plus/icons-vue'
import { getMenuList, getMenuTree, deleteMenu } from '@/api/menu'
import type { MenuItem } from '@/types/menu'
import type { TreeNode } from '@/types/common'
import { MenuType, MenuTypeLabels, MenuStatus, MenuStatusLabels } from '@/enums/menu'
import MenuForm from './components/MenuForm.vue'

interface MenuRow extends MenuItem {
  children?: MenuRow[]
}

const loading = ref(false)
const list = ref<MenuRow[]>([])
const keyword = ref('')
const formRef = ref<InstanceType<typeof MenuForm>>()

/** 树节点转表格行 */
const toRows = (nodes: TreeNode<MenuItem>[]): MenuRow[] => {
  return nodes.map((n) => ({
    ...n.data,
    children: n.children && n.children.length > 0 ? toRows(n.children) : undefined,
  }))
}

/** 无搜索关键词时展示树形，有关键词时展示平铺结果 */
const load = async () => {
  loading.value = true
  try {
    if (keyword.value) {
      const flat = await getMenuList({ name: keyword.value })
      list.value = flat.map((m) => ({ ...m }))
    } else {
      list.value = toRows(await getMenuTree())
    }
  } finally {
    loading.value = false
  }
}

const reset = async () => {
  keyword.value = ''
  await load()
}

const apiPaths = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean)

const onDelete = async (row: MenuItem) => {
  await ElMessageBox.confirm(`确认删除「${row.name}」吗？`, '提示', { type: 'warning' })
  await deleteMenu(row.id)
  ElMessage.success('删除成功')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page-card">
    <div class="toolbar">
      <div class="toolbar-left">
        <h4>菜单按钮管理</h4>
        <el-input v-model="keyword" placeholder="按名称搜索" clearable style="width: 220px" @keyup.enter="load" />
        <el-button type="primary" :icon="Search" @click="load()">搜索</el-button>
        <el-button :icon="Refresh" @click="reset">重置</el-button>
      </div>
      <el-button v-perm="'POST:/admin/menu/add'" type="primary" @click="formRef?.openCreate()">新增菜单</el-button>
    </div>

    <el-table :data="list" v-loading="loading" row-key="id"
      :tree-props="{ children: 'children' }">
      <el-table-column prop="name" label="名称" min-width="180" />
      <el-table-column label="类型" width="90">
        <template #default="{ row }">
          <el-tag :type="row.type === MenuType.Dir ? 'warning' : row.type === MenuType.Page ? 'primary' : 'info'">
            {{ MenuTypeLabels[row.type] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="前端路由" min-width="140" />
      <el-table-column label="后端接口" min-width="260">
        <template #default="{ row }">
          <div v-if="apiPaths(row.api_path).length" class="api-path-list">
            <span v-for="api in apiPaths(row.api_path)" :key="api" class="api-path-item">{{ api }}</span>
          </div>
          <span v-else class="empty-text">—</span>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === MenuStatus.Show ? 'success' : 'info'">
            {{ MenuStatusLabels[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <div class="table-operations">
            <el-tooltip v-if="row.type !== MenuType.Button" content="添加子级" placement="top">
              <el-icon v-perm="'POST:/admin/menu/add'" class="op-icon" @click="formRef?.openCreate(row)"><Plus /></el-icon>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-icon v-perm="'POST:/admin/menu/update'" class="op-icon is-edit" @click="formRef?.openEdit(row)"><Edit /></el-icon>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-icon v-perm="'POST:/admin/menu/delete'" class="op-icon is-danger" @click="onDelete(row)"><Delete /></el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <MenuForm ref="formRef" :tree-data="list" @success="load" />
  </div>
</template>

<style scoped>
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.api-path-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 4px 0;
}
.api-path-item {
  padding: 2px 7px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  line-height: 1.5;
}
.empty-text {
  color: var(--el-text-color-secondary);
}
</style>
