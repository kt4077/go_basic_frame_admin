<script setup lang="ts">
// AppPagination 通用分页组件（全局注册，所有列表统一使用）
// 内置：总数、上下页、页码、每页条数切换、跳转到指定页（jumper）
// 用法：
//   <AppPagination v-model:page="query.page" v-model:page-size="query.page_size" :total="total" @change="load" />
const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })
defineProps<{ total: number }>()

const emit = defineEmits<{
  (e: 'change'): void
}>()

const onPageChange = (p: number) => {
  page.value = p
  emit('change')
}

const onSizeChange = (s: number) => {
  pageSize.value = s
  page.value = 1 // 每页条数变化后回到第一页
  emit('change')
}
</script>

<template>
  <el-pagination
    :current-page="page"
    :page-size="pageSize"
    :total="total"
    background
    layout="total, prev, pager, next, sizes, jumper"
    :page-sizes="[10, 20, 50, 100]"
    class="app-pagination"
    @current-change="onPageChange"
    @size-change="onSizeChange"
  />
</template>

<style scoped>
.app-pagination {
  margin-top: 14px;
  justify-content: flex-end;
}
</style>
