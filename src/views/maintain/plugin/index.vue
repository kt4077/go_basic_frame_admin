<script setup lang="ts">
// 插件管理：查看安装及迁移信息，维护下次服务启动时生效的启停状态。
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock,
  Edit,
  InfoFilled,
  Link,
  Refresh,
  Search,
  User,
  VideoPause,
  VideoPlay,
  View,
} from '@element-plus/icons-vue'
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

const canChangeStatus = (row: PluginItem) => row.compiled || row.status === PluginStatus.Enabled
const statusActionText = (row: PluginItem) => {
  if (!canChangeStatus(row)) return '插件未编译，不能启用'
  return row.status === PluginStatus.Enabled ? '停用插件' : '启用插件'
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

    <div v-loading="loading" class="plugin-card-area">
      <div v-if="list.length" class="plugin-card-list">
        <article v-for="row in list" :key="row.plugin_id" class="plugin-card">
          <div class="plugin-card__header">
            <div class="plugin-card__identity">
              <el-avatar :size="56" shape="square" :src="row.logo_url" class="plugin-card__logo">
                {{ row.name.slice(0, 1) }}
              </el-avatar>
              <div class="plugin-card__heading">
                <div class="plugin-card__title-line">
                  <h5>{{ row.name }}</h5>
                  <el-tag
                    :type="row.status === PluginStatus.Enabled ? 'success' : 'info'"
                    size="small"
                    effect="light"
                    round
                  >
                    {{ PluginStatusLabels[row.status] ?? '未知' }}
                  </el-tag>
                </div>
                <code>{{ row.plugin_id }}</code>
              </div>
            </div>
          </div>

          <p class="plugin-card__description" :title="row.description">
            {{ row.description || '该插件暂未填写功能描述。' }}
          </p>

          <div class="plugin-card__information">
            <div class="plugin-card__info-item">
              <el-icon><User /></el-icon>
              <span>{{ row.author || '未填写作者' }}</span>
            </div>
            <a
              v-if="row.homepage"
              class="plugin-card__info-item plugin-card__link"
              :href="row.homepage"
              target="_blank"
              rel="noopener noreferrer"
              title="打开插件主页"
            >
              <el-icon><Link /></el-icon>
              <span>插件主页</span>
            </a>
            <div v-else class="plugin-card__info-item is-muted">
              <el-icon><Link /></el-icon>
              <span>未填写主页</span>
            </div>
          </div>

          <div class="plugin-card__versions">
            <div class="plugin-version-item">
              <span>安装版本</span>
              <strong>v{{ row.version }}</strong>
            </div>
            <div class="plugin-version-item">
              <span>程序版本</span>
              <strong v-if="row.compiled">v{{ row.code_version }}</strong>
              <strong v-else class="is-error">未编译</strong>
            </div>
            <div class="plugin-version-item">
              <span>版本检查</span>
              <strong
                :class="row.compiled && row.version === row.code_version ? 'is-success' : 'is-warning'"
              >
                {{ row.compiled && row.version === row.code_version ? '版本一致' : '需要处理' }}
              </strong>
            </div>
          </div>

          <div class="plugin-card__footer">
            <div class="plugin-card__updated">
              <el-icon><Clock /></el-icon>
              <span>{{ formatDateTime(row.updated_at) }}</span>
            </div>
            <div class="table-operations plugin-card__operations">
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
              <el-tooltip :content="statusActionText(row)" placement="top">
                <el-icon
                  v-perm="'POST:/admin/plugin/status'"
                  class="op-icon"
                  :class="{
                    'is-enable': row.status !== PluginStatus.Enabled,
                    'is-danger': row.status === PluginStatus.Enabled,
                    'is-disabled': !canChangeStatus(row),
                  }"
                  @click="canChangeStatus(row) && changeStatus(row)"
                >
                  <VideoPause v-if="row.status === PluginStatus.Enabled" />
                  <VideoPlay v-else />
                </el-icon>
              </el-tooltip>
            </div>
          </div>
        </article>
      </div>
      <el-empty v-else-if="!loading" description="暂无符合条件的插件" :image-size="108" />
    </div>

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
.restart-alert {
  margin-bottom: 16px;
}
.plugin-card-area {
  min-height: 260px;
}
.plugin-card-list {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 18px;
}
.plugin-card {
  position: relative;
  display: flex;
  flex: 1 1 360px;
  flex-direction: column;
  min-width: 0;
  max-width: calc(33.333% - 12px);
  overflow: hidden;
  padding: 20px;
  border: 1px solid var(--card-border);
  border-radius: 14px;
  background:
    radial-gradient(circle at 100% 0, var(--el-color-primary-light-9) 0, transparent 38%),
    var(--card-bg);
  box-shadow: 0 8px 24px rgb(15 23 42 / 5%);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}
.plugin-card::before {
  position: absolute;
  top: 0;
  right: 24px;
  left: 24px;
  height: 2px;
  border-radius: 0 0 2px 2px;
  background: linear-gradient(90deg, transparent, var(--el-color-primary), transparent);
  content: '';
  opacity: 0;
  transition: opacity 0.2s ease;
}
.plugin-card:hover {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 14px 34px rgb(15 23 42 / 10%);
  transform: translateY(-2px);
}
.plugin-card:hover::before {
  opacity: 1;
}
.plugin-card__header,
.plugin-card__identity,
.plugin-card__title-line,
.plugin-card__information,
.plugin-card__info-item,
.plugin-card__footer,
.plugin-card__updated {
  display: flex;
  align-items: center;
}
.plugin-card__identity {
  min-width: 0;
  gap: 14px;
}
.plugin-card__logo {
  flex: 0 0 auto;
  border: 1px solid var(--card-border);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-size: 20px;
  font-weight: 700;
}
.plugin-card__heading {
  min-width: 0;
}
.plugin-card__title-line {
  min-width: 0;
  gap: 8px;
}
.plugin-card__title-line h5 {
  overflow: hidden;
  margin: 0;
  color: var(--el-text-color-primary);
  font-size: 17px;
  font-weight: 650;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.plugin-card__heading code {
  display: block;
  overflow: hidden;
  margin-top: 3px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.plugin-card__description {
  display: -webkit-box;
  min-height: 44px;
  overflow: hidden;
  margin: 17px 0 14px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  line-height: 1.7;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.plugin-card__information {
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 16px;
}
.plugin-card__info-item {
  min-width: 0;
  gap: 5px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-decoration: none;
}
.plugin-card__info-item .el-icon {
  flex: 0 0 auto;
  color: var(--el-color-primary);
  font-size: 14px;
}
.plugin-card__info-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.plugin-card__link:hover {
  color: var(--el-color-primary);
}
.plugin-card__info-item.is-muted .el-icon {
  color: var(--el-text-color-placeholder);
}
.plugin-card__versions {
  display: flex;
  margin-top: auto;
  padding: 13px 0;
  border: 1px solid var(--card-border);
  border-radius: 10px;
  background: var(--page-bg);
}
.plugin-version-item {
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  min-width: 0;
  padding: 0 10px;
  text-align: center;
}
.plugin-version-item + .plugin-version-item {
  border-left: 1px solid var(--card-border);
}
.plugin-version-item span {
  color: var(--el-text-color-secondary);
  font-size: 11px;
}
.plugin-version-item strong {
  overflow: hidden;
  margin-top: 5px;
  color: var(--el-text-color-primary);
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.plugin-version-item strong.is-success {
  color: var(--el-color-success);
}
.plugin-version-item strong.is-warning {
  color: var(--el-color-warning);
}
.plugin-version-item strong.is-error {
  color: var(--el-color-danger);
}
.plugin-card__footer {
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--card-border);
}
.plugin-card__updated {
  min-width: 0;
  gap: 5px;
  color: var(--el-text-color-placeholder);
  font-size: 11px;
}
.plugin-card__updated span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.plugin-card__operations {
  flex: 0 0 auto;
}
.op-icon.is-enable {
  color: var(--el-color-success);
}
.op-icon.is-enable:hover {
  background: var(--el-color-success-light-9);
}
.op-icon.is-disabled {
  color: var(--el-text-color-placeholder);
  cursor: not-allowed;
}
.op-icon.is-disabled:hover {
  background: transparent;
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
@media (max-width: 1280px) {
  .plugin-card {
    max-width: calc(50% - 9px);
  }
}
@media (max-width: 760px) {
  .plugin-card-list {
    gap: 14px;
  }
  .plugin-card {
    flex-basis: 100%;
    max-width: 100%;
    padding: 17px;
  }
  .plugin-card__versions {
    padding: 11px 0;
  }
}
</style>
