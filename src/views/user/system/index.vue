<script setup lang="ts">
// 系统用户：会员用户信息展示、账号启用/禁用
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, SwitchButton, CircleCheck } from '@element-plus/icons-vue'
import { getMemberList, setMemberStatus } from '@/api/member'
import { formatDateTimeCell } from '@/utils/datetime'
import { Status, StatusLabels } from '@/enums/common'
import { Gender, RegisterSourceLabels } from '@/enums/member'
import type { MemberItem } from '@/types/member'

const loading = ref(false)
const total = ref(0)
const list = ref<MemberItem[]>([])
const query = reactive({
  keyword: '',
  status: undefined as number | undefined,
  register_source: undefined as number | undefined,
  page: 1,
  page_size: 20,
})

const load = async () => {
  loading.value = true
  try {
    const res = await getMemberList({
      keyword: query.keyword || undefined,
      status: query.status,
      register_source: query.register_source,
      page: query.page,
      page_size: query.page_size,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

const onToggleStatus = async (row: MemberItem) => {
  const disabling = row.status === Status.Enabled
  const name = row.nickname || row.real_name || row.mobile
  await ElMessageBox.confirm(`确认${disabling ? '禁用' : '启用'}用户「${name}」吗？`, '提示', { type: 'warning' })
  await setMemberStatus(row.id, disabling ? Status.Disabled : Status.Enabled)
  ElMessage.success('操作成功')
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page-card">
    <div class="toolbar">
      <div class="toolbar-left">
        <h4>系统用户</h4>
        <el-input v-model="query.keyword" placeholder="昵称/姓名/账号/手机号" clearable style="width: 210px" @change="query.page = 1; load()" />
        <el-select v-model="query.status" placeholder="账号状态" clearable style="width: 120px" @change="query.page = 1; load()">
          <el-option label="启用" :value="Status.Enabled" />
          <el-option label="禁用" :value="Status.Disabled" />
        </el-select>
        <el-select v-model="query.register_source" placeholder="注册来源" clearable style="width: 140px" @change="query.page = 1; load()">
          <el-option v-for="(label, value) in RegisterSourceLabels" :key="value" :label="label" :value="Number(value)" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="query.page = 1; load()">搜索</el-button>
      </div>
    </div>

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column label="用户" min-width="190">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="34" :src="row.avatar">
              {{ (row.nickname || row.real_name || row.mobile).slice(0, 1) }}
            </el-avatar>
            <div><div>{{ row.nickname || row.mobile }}</div><small>{{ row.account || '未设置账号' }}</small></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="real_name" label="姓名" width="120" />
      <el-table-column prop="mobile" label="手机号" width="150" />
      <el-table-column label="性别" width="90">
        <template #default="{ row }">
          <el-tag v-if="row.gender === Gender.Male">男</el-tag>
          <el-tag v-else-if="row.gender === Gender.Female" type="danger">女</el-tag>
          <el-tag v-else type="info">未知</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="年龄" width="80">
        <template #default="{ row }">{{ row.age > 0 ? row.age : '-' }}</template>
      </el-table-column>
      <el-table-column label="出生日期" width="130">
        <template #default="{ row }">{{ row.birthday || '-' }}</template>
      </el-table-column>
      <el-table-column prop="balance" label="账户余额" width="130" />
      <el-table-column label="注册来源" width="130">
        <template #default="{ row }">{{ RegisterSourceLabels[row.register_source] ?? '-' }}</template>
      </el-table-column>
      <el-table-column label="账号状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === Status.Enabled ? 'success' : 'danger'">
            {{ StatusLabels[row.status] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" min-width="170">
        <template #default="{ row }">
          <div class="cell-two-line">
            <div>{{ formatDateTimeCell(row, null, row.registered_at) || '-' }}</div>
            <small>{{ row.register_ip }}</small>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="最近登录" min-width="170">
        <template #default="{ row }">
          <div class="cell-two-line">
            <div>{{ formatDateTimeCell(row, null, row.logged_at) || '从未登录' }}</div>
            <small>{{ row.login_ip }}</small>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right">
        <template #default="{ row }">
          <div class="table-operations">
            <el-tooltip v-if="row.status === Status.Enabled" content="禁用" placement="top">
              <el-icon v-perm="'POST:/admin/member/set_status'" class="op-icon is-warning" @click="onToggleStatus(row)"><SwitchButton /></el-icon>
            </el-tooltip>
            <el-tooltip v-else content="启用" placement="top">
              <el-icon v-perm="'POST:/admin/member/set_status'" class="op-icon" @click="onToggleStatus(row)"><CircleCheck /></el-icon>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <AppPagination
      v-model:page="query.page"
      v-model:page-size="query.page_size"
      :total="total"
      @change="load"
    />
  </div>
</template>

<style scoped>
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.user-cell { display: flex; align-items: center; gap: 10px; }
.user-cell small { color: var(--el-text-color-secondary); }
.cell-two-line small { color: var(--el-text-color-secondary); font-size: 12px; }
</style>
