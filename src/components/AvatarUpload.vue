<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Camera } from '@element-plus/icons-vue'
import type { UploadRequestOptions } from 'element-plus'
import { uploadFile } from '@/api/upload'

const props = withDefaults(defineProps<{
  modelValue: string
  size?: number
  shape?: 'square' | 'circle'
  showTip?: boolean
  editBadge?: boolean
  showRemove?: boolean
  afterUpload?: (relativePath: string) => Promise<void>
}>(), {
  size: 88,
  shape: 'square',
  showTip: true,
  editBadge: false,
  showRemove: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const loading = ref(false)
const uploadedPreview = ref('')
const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderRadius: props.shape === 'circle' ? '50%' : '14px',
}))
const previewURL = computed(() => uploadedPreview.value || props.modelValue)

const upload = async (options: UploadRequestOptions) => {
  const file = options.file
  if (!file.type.startsWith('image/')) {
    ElMessage.warning('头像只能上传图片文件')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.warning('头像大小不能超过 2MB')
    return
  }
  loading.value = true
  const previousValue = props.modelValue
  try {
    const result = await uploadFile(file)
    uploadedPreview.value = result.url
    emit('update:modelValue', result.relative_path)
    await props.afterUpload?.(result.relative_path)
    options.onSuccess(result)
  } catch (error) {
    uploadedPreview.value = ''
    emit('update:modelValue', previousValue)
    throw error
  } finally {
    loading.value = false
  }
}

const remove = (event: MouseEvent) => {
  event.stopPropagation()
  uploadedPreview.value = ''
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="avatar-field">
    <el-upload
      class="avatar-uploader"
      :show-file-list="false"
      :http-request="upload"
      accept="image/jpeg,image/png,image/webp,image/gif"
    >
      <div v-loading="loading" class="avatar-box" :class="{ 'is-circle': shape === 'circle' }" :style="style">
        <img v-if="previewURL" :src="previewURL" alt="用户头像" />
        <el-icon v-else :size="24"><Plus /></el-icon>
        <button v-if="previewURL && showRemove" type="button" class="remove" title="移除头像" @click="remove">
          <el-icon><Delete /></el-icon>
        </button>
        <span v-if="editBadge" class="edit-badge" title="点击更换头像">
          <el-icon><Camera /></el-icon>
        </span>
      </div>
    </el-upload>
    <div v-if="showTip" class="avatar-tip">支持 JPG、PNG、WebP、GIF，最大 2MB</div>
  </div>
</template>

<style scoped>
.avatar-field { display: flex; align-items: center; gap: 14px; }
.avatar-box {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--el-border-color);
  border-radius: 14px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  cursor: pointer;
  transition: border-color .2s, color .2s;
}
.avatar-box:hover { border-color: var(--el-color-primary); color: var(--el-color-primary); }
.avatar-box img { width: 100%; height: 100%; object-fit: cover; }
.remove {
  position: absolute;
  right: 4px;
  top: 4px;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #fff;
  background: rgba(0, 0, 0, .55);
  cursor: pointer;
  transition: background-color .2s, transform .2s;
}
.remove:hover { background: var(--el-color-danger); transform: scale(1.06); }
.avatar-box.is-circle .remove { top: 9px; right: 9px; width: 22px; height: 22px; }
.edit-badge {
  position: absolute;
  right: 3px;
  bottom: 3px;
  z-index: 2;
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--card-bg);
  border-radius: 50%;
  color: #fff;
  background: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, .2);
  pointer-events: none;
}
.avatar-tip { max-width: 170px; color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.6; }
</style>
