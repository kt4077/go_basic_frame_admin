<script setup lang="ts">
// 操作日志：管理端全量接口调用记录（含请求/响应参数，点击查看详情）
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getOperationLogList } from '@/api/operation_log'
import type { OperationLogItem } from '@/types/operation_log'
import AppPagination from '@/components/AppPagination.vue'
import { formatDateTimeCell, formatDateTimesDeep } from '@/utils/datetime'

const loading = ref(false)
const total = ref(0)
const list = ref<OperationLogItem[]>([])
const query = reactive({
  username: '',
  time_range: undefined as [string, string] | undefined,
  page: 1,
  page_size: 20,
})

const load = async () => {
  loading.value = true
  try {
    const res = await getOperationLogList({
      username: query.username || undefined,
      start_time: query.time_range?.[0],
      end_time: query.time_range?.[1],
      page: query.page,
      page_size: query.page_size,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const methodColor: Record<string, string> = {
  GET: 'info',
  POST: 'primary',
  PUT: 'warning',
  DELETE: 'danger',
}

// ---------- 参数/响应详情弹窗 ----------
const detailVisible = ref(false)
const detail = reactive({ title: '', path: '', content: '' })

/** JSON 内容格式化（便于阅读），非 JSON 原样展示 */
const pretty = (content: string): string => {
  try {
    return JSON.stringify(formatDateTimesDeep(JSON.parse(content)), null, 2)
  } catch {
    return content
  }
}

/** 复制详情内容到剪贴板 */
const copyDetail = async () => {
  try {
    await navigator.clipboard.writeText(detail.content)
    ElMessage.success('已复制到剪贴板')
  } catch {
    // 剪贴板 API 不可用时的兜底：选中文本走 execCommand
    const pre = document.querySelector('.detail-pre')
    if (pre) {
      const range = document.createRange()
      range.selectNodeContents(pre)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      document.execCommand('copy')
      selection?.removeAllRanges()
      ElMessage.success('已复制到剪贴板')
    }
  }
}

const showDetail = (title: string, row: OperationLogItem, content: string) => {
  if (!content) return
  detail.title = `${title} - ${row.method} ${row.path}`
  detail.path = row.path
  detail.content = pretty(content)
  detailVisible.value = true
}

onMounted(load)
</script>

<template>
  <div class="page-card">
    <div class="toolbar">
      <div class="toolbar-left">
        <h4>操作日志</h4>
        <el-input
          v-model="query.username"
          placeholder="操作人账号"
          clearable
          style="width: 200px"
          @change="query.page = 1; load()"
        />
        <el-date-picker
          v-model="query.time_range"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 360px"
          @change="query.page = 1; load()"
        />
        <el-button type="primary" :icon="Search" @click="query.page = 1; load()">搜索</el-button>
      </div>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column prop="created_at" label="操作时间" width="170" :formatter="formatDateTimeCell" />
      <el-table-column prop="username" label="操作人" width="110" />
      <el-table-column label="请求方式" width="90">
        <template #default="{ row }">
          <el-tag size="small" :type="(methodColor[row.method] ?? 'info') as any" effect="plain">{{ row.method }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="请求地址" min-width="200" show-overflow-tooltip />
      <el-table-column label="请求参数" min-width="160">
        <template #default="{ row }">
          <span
            class="ellipsis"
            :class="{ clickable: row.request_params }"
            @click="showDetail('请求参数', row, row.request_params)"
          >{{ row.request_params || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="响应结果" min-width="160">
        <template #default="{ row }">
          <span
            class="ellipsis"
            :class="{ clickable: row.response_params }"
            @click="showDetail('响应结果', row, row.response_params)"
          >{{ row.response_params || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="IP" width="130" />
      <el-table-column label="耗时" width="90">
        <template #default="{ row }">{{ row.cost_ms }}ms</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.code === 0 ? 'success' : 'danger'" size="small">
            {{ row.code === 0 ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <AppPagination v-model:page="query.page" v-model:page-size="query.page_size" :total="total" @change="load" />

    <!-- 参数/响应详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="detail.title" width="680px">
      <pre class="detail-pre">{{ detail.content }}</pre>
      <template #footer>
        <el-button @click="copyDetail">复 制</el-button>
        <el-button type="primary" @click="detailVisible = false">关 闭</el-button>
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
.ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
}
.ellipsis.clickable {
  cursor: pointer;
}
.ellipsis.clickable:hover {
  color: var(--el-color-primary);
  text-decoration: underline;
}
.detail-pre {
  max-height: 480px;
  overflow: auto;
  padding: 12px;
  background: var(--page-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
  color: var(--el-text-color-regular);
}
</style>
