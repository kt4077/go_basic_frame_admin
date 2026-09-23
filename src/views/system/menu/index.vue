<script setup lang="ts">
// 菜单按钮管理：目录/菜单/按钮多级配置，按钮需绑定后端接口地址
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { getMenuList, getMenuTree, createMenu, updateMenu, deleteMenu } from '@/api/menu'
import type { MenuItem } from '@/types/menu'
import type { TreeNode } from '@/types/common'
import { MenuType, MenuTypeLabels, MenuStatus, MenuStatusLabels } from '@/enums/menu'
import { getViewOptions } from '@/utils/views'
import IconSelector from '@/components/IconSelector.vue'

interface MenuRow extends MenuItem {
  children?: MenuRow[]
}

const loading = ref(false)
const list = ref<MenuRow[]>([])
const keyword = ref('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
// 前端路由选项：构建期从 views 目录自动扫描
const viewOptions = getViewOptions()

const form = reactive({
  name: '', type: MenuType.Page as number, parent_id: undefined as number | undefined, path: '', api_path: '',
  icon: '', sort: 0, status: MenuStatus.Show, remark: '',
})

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

const openCreate = (parent?: MenuItem) => {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, {
    name: '', type: parent ? MenuType.Button : MenuType.Page, parent_id: parent?.id,
    path: '', api_path: '', icon: '', sort: 0, status: MenuStatus.Show, remark: '',
  })
  dialogVisible.value = true
}

const openEdit = (row: MenuItem) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    name: row.name, type: row.type, parent_id: row.parent_id || undefined, path: row.path,
    api_path: row.api_path, icon: row.icon, sort: row.sort, status: row.status, remark: row.remark,
  })
  dialogVisible.value = true
}

const submit = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  if (form.type === MenuType.Button && !form.api_path.trim()) {
    ElMessage.warning('按钮权限必须绑定后端接口地址')
    return
  }
  if (isEdit.value) {
    await updateMenu({ ...form, id: editId.value, parent_id: form.parent_id ?? 0 })
  } else {
    await createMenu({ ...form, parent_id: form.parent_id ?? 0 })
  }
  ElMessage.success('保存成功')
  dialogVisible.value = false
  await load()
}

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
      </div>
      <el-button v-perm="'POST:/admin/menu/add'" type="primary" @click="openCreate()">新增菜单</el-button>
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
      <el-table-column prop="api_path" label="后端接口" min-width="240" />
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
              <el-icon v-perm="'POST:/admin/menu/add'" class="op-icon" @click="openCreate(row)"><Plus /></el-icon>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-icon v-perm="'POST:/admin/menu/update'" class="op-icon is-edit" @click="openEdit(row)"><Edit /></el-icon>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-icon v-perm="'POST:/admin/menu/delete'" class="op-icon is-danger" @click="onDelete(row)"><Delete /></el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '修改菜单' : '新增菜单'" width="520px">
      <el-form label-position="left" label-width="90px">
        <el-form-item label="上级节点">
          <el-tree-select
            v-model="form.parent_id"
            :data="list"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            node-key="id"
            value-key="id"
            check-strictly
            clearable
            placeholder="不选则为顶级"
            default-expand-all
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-radio-group v-model="form.type">
            <el-radio-button :value="MenuType.Dir">目录</el-radio-button>
            <el-radio-button :value="MenuType.Page">菜单</el-radio-button>
            <el-radio-button :value="MenuType.Button">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.name" maxlength="32" />
        </el-form-item>
        <el-form-item v-if="form.type !== MenuType.Button" label="前端路由">
          <el-select
            v-model="form.path"
            filterable
            clearable
            allow-create
            default-first-option
            placeholder="从页面文件目录选择"
            style="width: 100%"
          >
            <el-option v-for="opt in viewOptions" :key="opt.path" :label="opt.path" :value="opt.path">
              <span>{{ opt.path }}</span>
              <span class="opt-file">{{ opt.file.replace('/src/views', '') }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="后端接口" :required="form.type === MenuType.Button">
          <el-input v-model="form.api_path" placeholder="如 GET:/admin/user/list，多个用英文逗号分隔" />
        </el-form-item>
        <el-form-item v-if="form.type !== MenuType.Button" label="图标">
          <IconSelector v-model="form.icon" placeholder="点击右侧按钮选择图标" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item v-if="form.type !== MenuType.Button" label="状态">
          <el-radio-group v-model="form.status">
            <el-radio-button :value="MenuStatus.Show">显示</el-radio-button>
            <el-radio-button :value="MenuStatus.Hidden">隐藏</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.opt-file {
  float: right;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
