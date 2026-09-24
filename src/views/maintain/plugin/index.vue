<script setup lang="ts">
// 插件管理：查看安装及迁移信息，维护下次服务启动时生效的启停状态。
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, InfoFilled, Refresh, Search, View } from '@element-plus/icons-vue'
import { getPluginDetail, getPluginList, updatePluginInfo, updatePluginStatus } from '@/api/plugin'
import AppPagination from '@/components/AppPagination.vue'
import AvatarUpload from '@/components/AvatarUpload.vue'
import {
  PluginMigrationStatus,
  PluginMigrationStatusLabels,
  PluginStatus,
  PluginStatusLabels,
} from '@/enums/plugin'
import type { PluginDetail, PluginItem } from '@/types/plugin'
import { formatDateTime, formatDateTimeCell } from '@/utils/datetime'

const loading = ref(false)
const total = ref(0)
const list = ref<PluginItem[]>([])
const query = reactive({
  keyword: '',
  status: undefined as number | undefined,
  page: 1,
  page_size: 20,
})

const load = async () => {
  loading.value = true
  try {
    const result = await getPluginList({
      keyword: query.keyword || undefined,
      status: query.status,
      page: query.page,
      page_size: query.page_size,
    })
    list.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}

const reset = () => {
  query.keyword = ''
  query.status = undefined
  query.page = 1
  load()
}

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<PluginDetail>()
const formattedManifest = computed(() => {
  if (!detail.value?.manifest) return '未记录安装清单'
  try {
    return JSON.stringify(JSON.parse(detail.value.manifest), null, 2)
  } catch {
    return detail.value.manifest
  }
})

const showDetail = async (row: PluginItem) => {
  detailVisible.value = true
  detailLoading.value = true
  detail.value = undefined
  try {
    detail.value = await getPluginDetail(row.plugin_id)
  } finally {
    detailLoading.value = false
  }
}

const infoVisible = ref(false)
const infoSaving = ref(false)
const infoForm = reactive({ plugin_id: '', name: '', logo: '', author: '', homepage: '', description: '' })

const editInfo = (row: PluginItem) => {
  infoForm.plugin_id = row.plugin_id
  infoForm.name = row.name
  infoForm.logo = row.logo_url || row.logo
  infoForm.author = row.author
  infoForm.homepage = row.homepage
  infoForm.description = row.description
  infoVisible.value = true
}

const saveInfo = async () => {
  infoSaving.value = true
  try {
    await updatePluginInfo({
      plugin_id: infoForm.plugin_id,
      logo: infoForm.logo,
      author: infoForm.author.trim(),
      homepage: infoForm.homepage.trim(),
      description: infoForm.description.trim(),
    })
    ElMessage.success('插件信息已保存')
    infoVisible.value = false
    await load()
  } finally {
    infoSaving.value = false
  }
}

const changeStatus = async (row: PluginItem) => {
  const enabling = row.status !== PluginStatus.Enabled
  const nextStatus = enabling ? PluginStatus.Enabled : PluginStatus.Disabled
  const action = enabling ? '启用' : '停用'
  await ElMessageBox.confirm(
    `${action}插件「${row.name}」后，需要重启管理端 API 和用户端 API 才会生效。确认继续吗？`,
    `${action}插件`,
    {
      type: 'warning',
      confirmButtonText: `确认${action}`,
      cancelButtonText: '取消',
    },
  )
  await updatePluginStatus({ plugin_id: row.plugin_id, status: nextStatus })
  ElMessage.success(`插件已${action}，请重启服务使配置生效`)
  await load()
}

onMounted(load)
</script>

<template>
  <div class="page-card plugin-page">
    <div class="toolbar">
      <div class="toolbar-left">
        <h4>插件管理</h4>
        <el-input
          v-model="query.keyword"
          placeholder="插件名称或标识"
          clearable
          style="width: 220px"
          @keyup.enter="query.page = 1; load()"
        />
        <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 130px">
          <el-option
            v-for="(label, value) in PluginStatusLabels"
            :key="value"
            :label="label"
            :value="Number(value)"
          />
        </el-select>
        <el-button type="primary" :icon="Search" @click="query.page = 1; load()">查询</el-button>
        <el-button :icon="Refresh" @click="reset">重置</el-button>
      </div>
    </div>

    <el-alert
      class="restart-alert"
      type="info"
      :closable="false"
      show-icon
      title="插件采用编译期注册，启用或停用后必须重启管理端 API 和用户端 API 才会生效。"
    />

    <el-table :data="list" v-loading="loading" stripe>
      <el-table-column label="插件" min-width="190">
        <template #default="{ row }">
          <div class="plugin-identity">
            <el-avatar :size="38" shape="square" :src="row.logo_url">
              {{ row.name.slice(0, 1) }}
            </el-avatar>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="author" label="插件作者" min-width="120">
        <template #default="{ row }">{{ row.author || '-' }}</template>
      </el-table-column>
      <el-table-column prop="plugin_id" label="插件标识" min-width="150">
        <template #default="{ row }"><code>{{ row.plugin_id }}</code></template>
      </el-table-column>
      <el-table-column prop="version" label="安装版本" width="110" />
      <el-table-column label="程序版本" width="120">
        <template #default="{ row }">
          <span v-if="row.compiled">{{ row.code_version }}</span>
          <el-tag v-else type="danger" size="small">未编译</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="版本检查" width="110">
        <template #default="{ row }">
          <el-tag
            :type="row.compiled && row.version === row.code_version ? 'success' : 'warning'"
            size="small"
            effect="plain"
          >
            {{ row.compiled && row.version === row.code_version ? '一致' : '需处理' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === PluginStatus.Enabled ? 'success' : 'info'" size="small">
            {{ PluginStatusLabels[row.status] ?? '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="updated_at" label="更新时间" width="170" :formatter="formatDateTimeCell" />
      <el-table-column label="操作" width="185" fixed="right">
        <template #default="{ row }">
          <div class="table-operations">
            <el-tooltip content="查看详情" placement="top">
              <el-icon class="op-icon" @click="showDetail(row)"><View /></el-icon>
            </el-tooltip>
            <el-tooltip content="编辑插件信息" placement="top">
              <el-icon
                v-perm="'POST:/admin/plugin/info'"
                class="op-icon is-edit"
                @click="editInfo(row)"
              ><Edit /></el-icon>
            </el-tooltip>
            <el-button
              v-perm="'POST:/admin/plugin/status'"
              link
              :type="row.status === PluginStatus.Enabled ? 'danger' : 'primary'"
              :disabled="!row.compiled && row.status !== PluginStatus.Enabled"
              @click="changeStatus(row)"
            >
              {{ row.status === PluginStatus.Enabled ? '停用' : '启用' }}
            </el-button>
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

    <el-drawer v-model="detailVisible" title="插件详情" size="680px">
      <div v-loading="detailLoading" class="detail-content">
        <template v-if="detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="插件名称">{{ detail.name }}</el-descriptions-item>
            <el-descriptions-item label="插件标识"><code>{{ detail.plugin_id }}</code></el-descriptions-item>
            <el-descriptions-item label="插件Logo" :span="2">
              <el-avatar :size="64" shape="square" :src="detail.logo_url">
                {{ detail.name.slice(0, 1) }}
              </el-avatar>
            </el-descriptions-item>
            <el-descriptions-item label="插件作者">{{ detail.author || '-' }}</el-descriptions-item>
            <el-descriptions-item label="插件地址">
              <el-link
                v-if="detail.homepage"
                :href="detail.homepage"
                target="_blank"
                type="primary"
                :underline="false"
              >
                {{ detail.homepage }}
              </el-link>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="安装版本">{{ detail.version }}</el-descriptions-item>
            <el-descriptions-item label="程序版本">{{ detail.code_version || '未编译' }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">{{ PluginStatusLabels[detail.status] }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ formatDateTime(detail.updated_at) }}</el-descriptions-item>
            <el-descriptions-item label="插件描述" :span="2">
              <div class="plugin-description">{{ detail.description || '暂无描述' }}</div>
            </el-descriptions-item>
          </el-descriptions>

          <section class="detail-section">
            <h5><el-icon><InfoFilled /></el-icon> 安装清单</h5>
            <pre class="manifest-pre">{{ formattedManifest }}</pre>
          </section>

          <section class="detail-section">
            <h5>迁移记录</h5>
            <el-table :data="detail.migrations" size="small" border empty-text="暂无迁移记录">
              <el-table-column prop="version" label="版本" width="100" />
              <el-table-column label="状态" width="80">
                <template #default="{ row }">
                  <el-tag
                    :type="row.status === PluginMigrationStatus.Success ? 'success' : 'danger'"
                    size="small"
                  >
                    {{ PluginMigrationStatusLabels[row.status] ?? '未知' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="checksum" label="SHA256" min-width="180" show-overflow-tooltip />
              <el-table-column label="耗时" width="90">
                <template #default="{ row }">{{ row.execution_ms }}ms</template>
              </el-table-column>
              <el-table-column prop="executed_at" label="执行时间" width="170" :formatter="formatDateTimeCell" />
              <el-table-column prop="error_message" label="失败原因" min-width="150" show-overflow-tooltip />
            </el-table>
          </section>
        </template>
      </div>
    </el-drawer>

    <el-dialog v-model="infoVisible" title="编辑插件信息" width="620px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="插件 Logo">
          <AvatarUpload v-model="infoForm.logo" :size="96" shape="square" />
        </el-form-item>
        <el-form-item label="插件名称">
          <el-input :model-value="infoForm.name" disabled />
        </el-form-item>
        <div class="info-form-grid">
          <el-form-item label="插件作者">
            <el-input v-model="infoForm.author" maxlength="100" show-word-limit placeholder="请输入插件作者" />
          </el-form-item>
          <el-form-item label="插件地址">
            <el-input v-model="infoForm.homepage" maxlength="500" placeholder="https://example.com/plugin" />
          </el-form-item>
        </div>
        <el-form-item label="插件描述">
          <el-input
            v-model="infoForm.description"
            type="textarea"
            :rows="6"
            maxlength="2000"
            show-word-limit
            resize="vertical"
            placeholder="请输入插件的功能、适用场景和维护说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="infoVisible = false">取消</el-button>
        <el-button type="primary" :loading="infoSaving" @click="saveInfo">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.toolbar-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.plugin-identity {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}
.restart-alert {
  margin-bottom: 16px;
}
.detail-content {
  min-height: 240px;
}
.detail-section {
  margin-top: 24px;
}
.plugin-description {
  min-height: 64px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
.info-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 720px) {
  .info-form-grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}
.detail-section h5 {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px;
  font-size: 15px;
}
.manifest-pre {
  max-height: 280px;
  overflow: auto;
  margin: 0;
  padding: 14px;
  border: 1px solid var(--card-border);
  border-radius: 8px;
  background: var(--page-bg);
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
