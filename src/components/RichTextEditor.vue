<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import '@wangeditor/editor/dist/css/style.css'
import { uploadFile } from '@/api/upload'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  minHeight?: number
  disabled?: boolean
}>(), {
  placeholder: '请输入正文内容',
  minHeight: 420,
  disabled: false,
})

const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
const editorRef = shallowRef<IDomEditor>()
const content = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
const toolbarConfig: Partial<IToolbarConfig> = {}
const editorConfig = computed<Partial<IEditorConfig>>(() => ({
  placeholder: props.placeholder,
  readOnly: props.disabled,
  MENU_CONF: {
    uploadImage: {
      async customUpload(file: File, insertFn: (url: string, alt?: string, href?: string) => void) {
        const result = await uploadFile(file)
        insertFn(result.url, result.file_name, result.url)
      },
    },
  },
}))

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
}

onBeforeUnmount(() => editorRef.value?.destroy())
</script>

<template>
  <div class="rich-text-editor" :class="{ 'is-disabled': disabled }">
    <Toolbar :editor="editorRef" :default-config="toolbarConfig" mode="default" class="rich-text-toolbar" />
    <Editor
      v-model="content"
      :default-config="editorConfig"
      :style="{ minHeight: `${minHeight}px` }"
      mode="default"
      class="rich-text-content"
      @on-created="handleCreated"
    />
  </div>
</template>

<style scoped>
.rich-text-editor {
  --w-e-toolbar-bg-color: var(--card-bg);
  --w-e-toolbar-color: var(--el-text-color-primary);
  --w-e-toolbar-border-color: var(--card-border);
  --w-e-toolbar-active-bg-color: var(--el-fill-color-light);
  --w-e-toolbar-active-color: var(--el-color-primary);
  --w-e-toolbar-disabled-color: var(--el-text-color-disabled);
  --w-e-textarea-bg-color: var(--card-bg);
  --w-e-textarea-color: var(--el-text-color-primary);
  --w-e-textarea-border-color: var(--card-border);
  --w-e-textarea-slight-bg-color: var(--el-fill-color-light);
  --w-e-textarea-slight-color: var(--el-text-color-placeholder);
  --w-e-textarea-slight-border-color: var(--el-border-color-light);
  --w-e-textarea-selected-border-color: var(--el-color-primary);
  --w-e-textarea-handler-bg-color: var(--el-color-primary);
  --w-e-modal-button-bg-color: var(--el-fill-color-light);
  --w-e-modal-button-border-color: var(--el-border-color);
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--el-text-color-primary);
  transition: border-color var(--el-transition-duration), background-color var(--el-transition-duration);
}
.rich-text-editor:focus-within { border-color: var(--el-color-primary); }
.rich-text-toolbar { border-bottom: 1px solid var(--card-border); }
.rich-text-content { overflow-y: auto; background: var(--card-bg); }
.is-disabled { opacity: .72; }
:global(html.dark) .rich-text-editor {
  --w-e-toolbar-bg-color: #111827;
  --w-e-toolbar-color: #d7dfeb;
  --w-e-toolbar-border-color: #2a3748;
  --w-e-toolbar-active-bg-color: #1d2c4d;
  --w-e-toolbar-active-color: #8aacf9;
  --w-e-toolbar-disabled-color: #56657a;
  --w-e-textarea-bg-color: #111827;
  --w-e-textarea-color: #d7dfeb;
  --w-e-textarea-border-color: #2a3748;
  --w-e-textarea-slight-bg-color: #182235;
  --w-e-textarea-slight-color: #7f8da3;
  --w-e-textarea-slight-border-color: #344156;
  --w-e-textarea-selected-border-color: #6c93f8;
  --w-e-textarea-handler-bg-color: #6c93f8;
  --w-e-modal-button-bg-color: #182235;
  --w-e-modal-button-border-color: #344156;
}
:deep(.w-e-bar-item button) { border-radius: 5px; }
:deep(.w-e-select-list),
:deep(.w-e-drop-panel),
:deep(.w-e-modal),
:deep(.w-e-bar-item-menus-container) { box-shadow: var(--el-box-shadow-light); }
:deep(.w-e-modal input),
:deep(.w-e-modal textarea) { caret-color: var(--el-color-primary); }
:deep(.w-e-text-container [data-slate-editor] pre > code) {
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
}
:deep(.w-e-text-container [data-slate-editor] blockquote) {
  color: var(--el-text-color-regular);
  border-left-color: var(--el-border-color);
  background: var(--el-fill-color-lighter);
}
</style>
