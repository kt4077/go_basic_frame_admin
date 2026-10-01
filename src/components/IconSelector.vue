<script setup lang="ts">
import type { AppIconDefinition } from '@/utils/iconRegistry'
import { computed, ref, watch } from 'vue'
import { CircleClose, Grid, Search } from '@element-plus/icons-vue'
import AppIcon from '@/components/AppIcon.vue'
import { getAppIcons } from '@/utils/iconRegistry'

type IconSource = 'element-plus' | 'iconpark'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const MAX_VISIBLE_ICONS = 300
const visible = ref(false)
const keyword = ref('')
const source = ref<IconSource>('element-plus')
const loading = ref(false)
const icons = ref<AppIconDefinition[]>([])

const matchedIcons = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()
  return icons.value.filter(icon =>
    !normalizedKeyword || icon.label.toLowerCase().includes(normalizedKeyword)
  )
})
const visibleIcons = computed(() => matchedIcons.value.slice(0, MAX_VISIBLE_ICONS))

const open = () => {
  keyword.value = ''
  source.value = props.modelValue.startsWith('iconpark:') ? 'iconpark' : 'element-plus'
  visible.value = true
}

const pick = (name: string) => {
  emit('update:modelValue', name)
  visible.value = false
}

const clear = () => emit('update:modelValue', '')

let loadSequence = 0
watch(source, async (value) => {
  const sequence = ++loadSequence
  loading.value = true
  try {
    const result = await getAppIcons(value)
    if (sequence === loadSequence) icons.value = result
  } finally {
    if (sequence === loadSequence) loading.value = false
  }
}, { immediate: true })
</script>

<template>
  <el-input :model-value="modelValue" readonly :placeholder="placeholder">
    <template #prefix>
      <AppIcon v-if="modelValue" :name="modelValue" :size="16" />
    </template>
    <template #suffix>
      <el-icon v-if="modelValue" class="icon-action" title="清除" @click.stop="clear"><CircleClose /></el-icon>
      <el-icon class="icon-action icon-open" title="选择图标" @click.stop="open"><Grid /></el-icon>
    </template>
  </el-input>

  <el-dialog v-model="visible" title="选择图标" width="680px" append-to-body>
    <el-tabs v-model="source" class="icon-source-tabs">
      <el-tab-pane label="Element Plus" name="element-plus" />
      <el-tab-pane label="IconPark" name="iconpark" />
    </el-tabs>
    <el-input
      v-model="keyword"
      :placeholder="source === 'iconpark' ? '搜索 IconPark 图标名称，如 Home' : '搜索 Element Plus 图标名称，如 Setting'"
      :prefix-icon="Search"
      clearable
      class="icon-search"
    />
    <div v-loading="loading" class="icon-grid">
      <button
        v-for="icon in visibleIcons"
        :key="icon.name"
        type="button"
        class="icon-cell"
        :class="{ active: icon.name === modelValue }"
        @click="pick(icon.name)"
      >
        <AppIcon :name="icon.name" :size="22" />
        <span class="icon-name">{{ icon.label }}</span>
      </button>
    </div>
    <div v-if="matchedIcons.length > MAX_VISIBLE_ICONS" class="icon-hint">
      当前展示前 {{ MAX_VISIBLE_ICONS }} 个图标，请输入名称缩小范围
    </div>
    <div v-if="matchedIcons.length === 0" class="icon-empty">未找到匹配的图标</div>
  </el-dialog>
</template>

<style scoped>
.icon-action {
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: color 0.2s;
}
.icon-action:hover { color: var(--el-color-primary); }
.icon-open { margin-left: 4px; }
.icon-source-tabs { margin-top: -12px; }
.icon-search { margin-bottom: 12px; }
.icon-grid {
  display: grid;
  max-height: 420px;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 8px;
  overflow-y: auto;
}
.icon-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 12px 6px 8px;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  background: transparent;
  color: var(--el-text-color-regular);
  cursor: pointer;
  font: inherit;
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
  max-width: 92px;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.icon-hint,
.icon-empty {
  padding: 14px 0 2px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  text-align: center;
}
.icon-empty { padding: 30px 0; }
</style>
