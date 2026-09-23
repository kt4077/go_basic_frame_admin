<script setup lang="ts">
// 部门管理：多级组织架构列表
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { getDeptTree, deleteDept } from '@/api/dept'
import type { DeptItem, DeptTreeRow } from '@/types/dept'
import type { TreeNode } from '@/types/common'
import DeptForm from './components/DeptForm.vue'

const loading = ref(false)
const list = ref<DeptTreeRow[]>([])
const formRef = ref()

/** 树节点转表格行（保留层级 children） */
const toRows = (nodes: TreeNode<DeptItem>[]): DeptTreeRow[] => {
  return nodes.map((n) => ({
    ...n.data,
    children: n.children && n.children.length > 0 ? toRows(n.children) : undefined,
  }))
}

const load = async () => {
  loading.value = true
  try {
    const tree = await getDeptTree()
    list.value = toRows(tree)
  } finally {
    loading.value = false
  }
}

const onDelete = async (row: DeptTreeRow) => {
  await ElMessageBox.confirm(`确认删除部门「${row.name}」吗？`, '提示', { type: 'warning' })
  await deleteDept(row.id)
  ElMessage.success('删除成功')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page-card">
    <div class="toolbar">
      <h4>部门管理</h4>
      <el-button v-perm="'POST:/admin/dept/add'" type="primary" @click="formRef?.openCreate()">新增部门</el-button>
    </div>

    <el-table :data="list" v-loading="loading" row-key="id" :tree-props="{ children: 'children' }">
      <el-table-column prop="name" label="部门名称" min-width="220" />
      <el-table-column prop="leader" label="负责人" width="140" />
      <el-table-column prop="sort" label="排序" width="90" />
      <el-table-column prop="remark" label="备注" min-width="160" />
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <div class="table-operations">
            <el-tooltip content="添加子部门" placement="top">
              <el-icon v-perm="'POST:/admin/dept/add'" class="op-icon" @click="formRef?.openCreate(row)"><Plus /></el-icon>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-icon v-perm="'POST:/admin/dept/update'" class="op-icon is-edit" @click="formRef?.openEdit(row)"><Edit /></el-icon>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-icon v-perm="'POST:/admin/dept/delete'" class="op-icon is-danger" @click="onDelete(row)"><Delete /></el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <DeptForm ref="formRef" :tree-data="list" @success="load" />
  </div>
</template>
