<script setup lang="ts">
// IconSelector 图标选择器：输入框展示已选图标，右侧按钮打开弹窗，
// 弹窗内网格展示 Element Plus 全部图标，支持按名称搜索，点击选中。
import { computed, ref } from 'vue'
import * as ElementPlusIcons from '@element-plus/icons-vue'
import { Search, CircleClose, Grid } from '@element-plus/icons-vue'

defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const visible = ref(false)
const keyword = ref('')

// 全部图标：名称 + 组件
const allIcons = Object.entries(ElementPlusIcons).map(([name, comp]) => ({ name, comp }))

const filtered = computed(() =>
  allIcons.filter((i) => i.name.toLowerCase().includes(keyword.value.trim().toLowerCase()))
)

const open = () => {
  keyword.value = ''
  visible.value = true
}

const pick = (name: string) => {
  emit('update:modelValue', name)
  visible.value = false
}

const clear = () => {
  emit('update:modelValue', '')
}
</script>

<template>
  <el-input :model-value="modelValue" readonly :placeholder="placeholder">
    <template #prefix>
      <el-icon v-if="modelValue"><component :is="modelValue" /></el-icon>
    </template>
    <template #suffix>
      <el-icon v-if="modelValue" class="icon-action" title="清除" @click.stop="clear"><CircleClose /></el-icon>
      <el-icon class="icon-action icon-open" title="选择图标" @click.stop="open"><Grid /></el-icon>
    </template>
  </el-input>

  <el-dialog v-model="visible" title="选择图标" width="620px" append-to-body>
    <el-input v-model="keyword" placeholder="搜索图标名称，如 setting" :prefix-icon="Search" clearable style="margin-bottom: 12px" />
    <div class="icon-grid">
      <div
        v-for="icon in filtered"
        :key="icon.name"
        class="icon-cell"
        :class="{ active: icon.name === modelValue }"
        @click="pick(icon.name)"
      >
        <el-icon :size="20"><component :is="icon.comp" /></el-icon>
        <span class="icon-name">{{ icon.name }}</span>
      </div>
    </div>
    <div v-if="filtered.length === 0" class="icon-empty">未找到匹配的图标</div>
  </el-dialog>
</template>

<style scoped>
.icon-action {
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: color 0.2s;
}
.icon-action:hover {
  color: var(--el-color-primary);
}
.icon-open {
  margin-left: 4px;
}
.icon-grid {
  max-height: 380px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 8px;
}
.icon-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 6px 8px;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background-color 0.2s;
}
.icon-cell:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}
.icon-cell.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.icon-name {
  max-width: 84px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.icon-empty {
  padding: 30px 0;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
