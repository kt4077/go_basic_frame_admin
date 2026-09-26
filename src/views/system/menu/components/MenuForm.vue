<script setup lang="ts">
// 菜单新增/修改弹窗（组件化，父组件通过 ref 调用 openCreate / openEdit）
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { createMenu, updateMenu } from '@/api/menu'
import type { MenuItem, MenuTreeRow } from '@/types/menu'
import { MenuType, MenuStatus } from '@/enums/menu'
import { getViewOptions } from '@/utils/views'
import IconSelector from '@/components/IconSelector.vue'

const emit = defineEmits<{
  (e: 'success'): void
}>()

defineProps<{
  /** 上级节点下拉的树数据 */
  treeData: MenuTreeRow[]
}>()

// 前端路由选项：构建期从 views 目录自动扫描
const viewOptions = getViewOptions()

const visible = ref(false)
const isEdit = ref(false)
const editId = ref(0)
const apiPaths = ref<string[]>([''])

const form = reactive({
  name: '',
  type: MenuType.Page as number,
  parent_id: undefined as number | undefined,
  path: '',
  api_path: '',
  icon: '',
  sort: 0,
  status: MenuStatus.Show,
  remark: '',
})

const openCreate = (parent?: MenuItem) => {
  isEdit.value = false
  editId.value = 0
  Object.assign(form, {
    name: '',
    type: parent ? MenuType.Button : MenuType.Page,
    parent_id: parent?.id,
    path: '',
    api_path: '',
    icon: '',
    sort: 0,
    status: MenuStatus.Show,
    remark: '',
  })
  apiPaths.value = ['']
  visible.value = true
}

const openEdit = (row: MenuItem) => {
  isEdit.value = true
  editId.value = row.id
  Object.assign(form, {
    name: row.name,
    type: row.type,
    parent_id: row.parent_id || undefined,
    path: row.path,
    api_path: row.api_path,
    icon: row.icon,
    sort: row.sort,
    status: row.status,
    remark: row.remark,
  })
  apiPaths.value = splitAPIPaths(row.api_path)
  visible.value = true
}

const splitAPIPaths = (value: string) => {
  const paths = value.split(',').map((item) => item.trim()).filter(Boolean)
  return paths.length > 0 ? paths : ['']
}

const normalizedAPIPaths = () => Array.from(new Set(
  apiPaths.value
    .flatMap((item) => item.split(','))
    .map((item) => item.trim().replace(/^([a-z]+):/i, (_, method: string) => `${method.toUpperCase()}:`))
    .filter(Boolean),
))

const addAPIPath = () => apiPaths.value.push('')

const removeAPIPath = (index: number) => {
  apiPaths.value.splice(index, 1)
  if (apiPaths.value.length === 0) apiPaths.value.push('')
}

const submit = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请输入名称')
    return
  }
  const paths = normalizedAPIPaths()
  if (form.type === MenuType.Button && paths.length === 0) {
    ElMessage.warning('按钮权限必须绑定后端接口地址')
    return
  }
  const invalidPath = paths.find((item) => !/^(GET|POST|PUT|PATCH|DELETE):\/\S+$/i.test(item))
  if (invalidPath) {
    ElMessage.warning(`后端接口格式不正确：${invalidPath}`)
    return
  }
  form.api_path = paths.join(',')
  if (isEdit.value) {
    await updateMenu({ ...form, id: editId.value, parent_id: form.parent_id ?? 0 })
  } else {
    await createMenu({ ...form, parent_id: form.parent_id ?? 0 })
  }
  ElMessage.success('保存成功')
  visible.value = false
  emit('success')
}

defineExpose({ openCreate, openEdit })
</script>

<template>
  <el-dialog v-model="visible" :title="isEdit ? '修改菜单' : '新增菜单'" width="520px">
    <el-form label-position="left" label-width="90px">
      <el-form-item label="上级节点">
        <el-tree-select
          v-model="form.parent_id"
          :data="treeData"
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
        <div class="api-path-editor">
          <div v-for="(_, index) in apiPaths" :key="index" class="api-path-row">
            <el-input v-model="apiPaths[index]" placeholder="如 GET:/admin/user/list" clearable />
            <el-tooltip content="删除此接口" placement="top">
              <el-button :icon="Delete" circle plain type="danger" @click="removeAPIPath(index)" />
            </el-tooltip>
          </div>
          <el-button class="api-path-add" :icon="Plus" plain @click="addAPIPath">添加接口</el-button>
          <div class="api-path-tip">每行配置一个“请求方法:接口路径”，保存后仍以英文逗号存入数据库</div>
        </div>
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
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.opt-file {
  float: right;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.api-path-editor {
  width: 100%;
}
.api-path-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.api-path-add {
  width: 100%;
  border-style: dashed;
}
.api-path-tip {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}
</style>
