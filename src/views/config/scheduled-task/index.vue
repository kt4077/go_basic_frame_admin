<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock, Delete, Edit, Plus, Refresh, Search, Tickets } from '@element-plus/icons-vue'
import { deleteScheduledTask, getScheduledTaskOptions, getScheduledTasks, runScheduledTask, saveScheduledTask } from '@/api/scheduled_task'
import { Status } from '@/enums/common'
import { scheduledTaskResultLabels, scheduledTaskResultTagTypes } from '@/enums/scheduled_task'
import { formatDateTimeCell } from '@/utils/datetime'
import type { ScheduledTask, ScheduledTaskOptions } from '@/types/scheduled_task'
import TaskForm from './components/TaskForm.vue'
import TaskLogDrawer from './components/TaskLogDrawer.vue'

const loading = ref(false)
const rows = ref<ScheduledTask[]>([])
const options = ref<ScheduledTaskOptions>({ handlers: [], cron_examples: [] })
const filters = reactive({ keyword: '', status: undefined as number | undefined })
const formVisible = ref(false)
const current = ref<ScheduledTask>()
const logVisible = ref(false)
const logTask = ref<ScheduledTask>()

const handlerLabel = (value: string) => options.value.handlers.find(item => item.value === value)?.label ?? value
const load = async () => { loading.value = true; try { rows.value = await getScheduledTasks({ keyword: filters.keyword || undefined, status: filters.status }) } finally { loading.value = false } }
const reset = async () => { filters.keyword = ''; filters.status = undefined; await load() }
const openCreate = () => { current.value = undefined; formVisible.value = true }
const openEdit = (row: ScheduledTask) => { current.value = { ...row }; formVisible.value = true }
const submit = async (value: ScheduledTask) => { await saveScheduledTask(value); ElMessage.success('保存成功，调度配置已生效'); formVisible.value = false; await load() }
const remove = async (row: ScheduledTask) => { await ElMessageBox.confirm(`确认删除定时任务“${row.name}”吗？执行日志将保留。`, '删除确认', { type: 'warning' }); await deleteScheduledTask(row.id); ElMessage.success('删除成功'); await load() }
const runNow = async (row: ScheduledTask) => { await ElMessageBox.confirm(`确认立即执行“${row.name}”吗？任务将在后台运行。`, '立即执行', { type: 'warning' }); await runScheduledTask(row.id); ElMessage.success('任务已提交执行'); window.setTimeout(load, 1000) }
const showLogs = (row: ScheduledTask) => { logTask.value = row; logVisible.value = true }

onMounted(async () => { options.value = await getScheduledTaskOptions(); await load() })
</script>

<template>
  <div class="page-card">
    <div class="toolbar"><div class="filters"><h4>定时任务</h4><el-input v-model="filters.keyword" clearable placeholder="任务名称 / 处理器" @keyup.enter="load" /><el-select v-model="filters.status" clearable placeholder="启用状态"><el-option label="启用" :value="Status.Enabled" /><el-option label="停用" :value="Status.Disabled" /></el-select><el-button type="primary" :icon="Search" @click="load">查询</el-button><el-button :icon="Refresh" @click="reset">重置</el-button></div><el-button v-perm="'POST:/admin/scheduled_task/save'" type="primary" :icon="Plus" @click="openCreate">新增任务</el-button></div>
    <el-alert title="任务由管理端服务调度；修改后立即生效。同一任务在多实例部署时只会由一个实例执行。" type="info" :closable="false" show-icon class="task-alert" />
    <el-table v-loading="loading" :data="rows" stripe row-key="id">
      <el-table-column prop="name" label="任务名称" min-width="160" />
      <el-table-column label="任务处理器" min-width="190"><template #default="{ row }"><div>{{ handlerLabel(row.handler) }}</div><small class="muted">{{ row.handler }}</small></template></el-table-column>
      <el-table-column prop="cron_expression" label="Cron表达式" width="150"><template #default="{ row }"><code>{{ row.cron_expression }}</code></template></el-table-column>
      <el-table-column label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === Status.Enabled ? 'success' : 'info'">{{ row.status === Status.Enabled ? '启用' : '停用' }}</el-tag></template></el-table-column>
      <el-table-column prop="next_run_at" label="下次执行" width="170" :formatter="formatDateTimeCell" />
      <el-table-column prop="last_run_at" label="最近执行" width="170" :formatter="formatDateTimeCell" />
      <el-table-column label="最近结果" width="100"><template #default="{ row }"><el-tooltip :content="row.last_error || scheduledTaskResultLabels[row.last_status]" placement="top"><el-tag :type="scheduledTaskResultTagTypes[row.last_status]">{{ scheduledTaskResultLabels[row.last_status] }}</el-tag></el-tooltip></template></el-table-column>
      <el-table-column label="超时" width="90"><template #default="{ row }">{{ row.timeout_seconds }}秒</template></el-table-column>
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="170" fixed="right"><template #default="{ row }"><div class="table-operations"><el-tooltip content="立即执行"><el-icon v-perm="'POST:/admin/scheduled_task/run'" class="op-icon" @click="runNow(row)"><Clock /></el-icon></el-tooltip><el-tooltip content="执行日志"><el-icon class="op-icon" @click="showLogs(row)"><Tickets /></el-icon></el-tooltip><el-tooltip content="编辑"><el-icon v-perm="'POST:/admin/scheduled_task/save'" class="op-icon is-edit" @click="openEdit(row)"><Edit /></el-icon></el-tooltip><el-tooltip content="删除"><el-icon v-perm="'POST:/admin/scheduled_task/delete'" class="op-icon is-danger" @click="remove(row)"><Delete /></el-icon></el-tooltip></div></template></el-table-column>
    </el-table>
    <TaskForm v-model="formVisible" :data="current" :options="options" @submit="submit" />
    <TaskLogDrawer v-model="logVisible" :task="logTask" />
  </div>
</template>

<style scoped>
.toolbar,.filters{display:flex;align-items:center;gap:12px}.toolbar{justify-content:space-between;margin-bottom:14px}.filters .el-input{width:210px}.filters .el-select{width:120px}.task-alert{margin-bottom:14px}.muted{color:var(--el-text-color-secondary)}code{padding:3px 6px;border-radius:4px;background:var(--page-bg);color:var(--el-text-color-primary)}
</style>
