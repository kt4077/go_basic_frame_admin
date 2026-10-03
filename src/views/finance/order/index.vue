<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Refresh, Search, View } from '@element-plus/icons-vue'
import AppPagination from '@/components/AppPagination.vue'
import OrderDetailDrawer from './components/OrderDetailDrawer.vue'
import { getFinanceOrders } from '@/api/financeOrder'
import type { FinanceOrderItem, FinanceOrderQuery, FinancePluginOption } from '@/types/financeOrder'
import { formatDateTime } from '@/utils/datetime'

const loading = ref(false)
const rows = ref<FinanceOrderItem[]>([])
const total = ref(0)
const payCounts = ref<Record<number, number>>({})
const pluginOptions = ref<FinancePluginOption[]>([])
const range = ref<[string, string] | null>(null)
const drawer = ref<InstanceType<typeof OrderDetailDrawer>>()
const query = reactive<FinanceOrderQuery>({ page: 1, page_size: 20, source_plugin_id: undefined, pay_status: undefined, keyword: '', start_at: '', end_at: '' })
const payTabs = [{ value: 0, label: '全部' }, { value: 1, label: '未支付' }, { value: 2, label: '已支付' }, { value: 3, label: '已退款' }]
const payStatusLabels: Record<number, string> = { 1: '未支付', 2: '已支付', 3: '已退款' }

const load = async () => {
  loading.value = true
  try {
    query.start_at = range.value?.[0] || ''
    query.end_at = range.value?.[1] || ''
    const result = await getFinanceOrders(query)
    rows.value = result.list || []
    total.value = result.total || 0
    payCounts.value = result.pay_counts || {}
    pluginOptions.value = result.plugin_options || []
  }
  finally { loading.value = false }
}
const search = () => { query.page = 1; void load() }
const reset = () => { Object.assign(query, { page: 1, source_plugin_id: undefined, pay_status: undefined, keyword: '', start_at: '', end_at: '' }); range.value = null; void load() }
const changePayStatus = (value: string | number) => { query.pay_status = Number(value) || undefined; query.page = 1; void load() }

onMounted(load)
</script>

<template>
  <div class="page-card">
    <div class="toolbar"><div><h4>系统订单</h4><p class="toolbar__description">汇总核心业务及各插件产生的订单，完整业务操作仍在来源模块中进行</p></div></div>
    <div class="filters">
      <el-select v-model="query.source_plugin_id" clearable placeholder="业务模块"><el-option v-for="item in pluginOptions" :key="item.plugin_id" :label="`${item.name} (${item.count})`" :value="item.plugin_id" /></el-select>
      <el-date-picker v-model="range" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" />
      <el-input v-model="query.keyword" clearable placeholder="订单号 / 用户 / 手机 / 商品" @keyup.enter="search" />
      <el-button type="primary" :icon="Search" @click="search">查询</el-button><el-button :icon="Refresh" @click="reset">重置</el-button>
    </div>
    <el-tabs :model-value="query.pay_status || 0" @tab-change="changePayStatus">
      <el-tab-pane v-for="tab in payTabs" :key="tab.value" :name="tab.value"><template #label>{{ tab.label }}<span v-if="tab.value && payCounts[tab.value]"> ({{ payCounts[tab.value] }})</span></template></el-tab-pane>
    </el-tabs>
    <el-table v-loading="loading" :data="rows" stripe>
      <el-table-column label="订单号 / 模块" min-width="220"><template #default="{row}"><strong>{{ row.order_no }}</strong><div class="muted"><el-tag size="small" effect="plain">{{ row.source_plugin_name }}</el-tag><span>{{ formatDateTime(row.created_at) }}</span></div></template></el-table-column>
      <el-table-column label="商品或服务" min-width="320"><template #default="{row}"><div v-if="row.products.length"><div v-for="product in row.products.slice(0,2)" :key="product.uid" class="product"><el-image v-if="product.cover" :src="product.cover" fit="cover" /><div v-else class="product-placeholder">无图</div><span>{{ product.name }}<small>{{ product.spec_text || '默认规格' }} × {{ product.quantity }}</small></span></div></div><span v-else>{{ row.order_title || '—' }}</span></template></el-table-column>
      <el-table-column label="用户信息" min-width="210"><template #default="{row}"><div class="user"><el-avatar :src="row.member_avatar">{{ (row.member_nickname || '用').slice(0,1) }}</el-avatar><span>{{ row.member_nickname || '用户' }}<small>{{ row.member_mobile || '—' }}</small></span></div></template></el-table-column>
      <el-table-column label="实际支付" width="130" align="center"><template #default="{row}"><strong>¥ {{ row.pay_amount }}</strong></template></el-table-column>
      <el-table-column label="支付方式" width="120" align="center"><template #default="{row}">{{ row.pay_method || '—' }}</template></el-table-column>
      <el-table-column label="支付状态" width="110" align="center"><template #default="{row}"><el-tag :type="row.pay_status===2?'success':row.pay_status===3?'danger':'warning'">{{ payStatusLabels[row.pay_status] || '未知' }}</el-tag></template></el-table-column>
      <el-table-column label="订单状态" width="110" align="center"><template #default="{row}">{{ row.status_text || '—' }}</template></el-table-column>
      <el-table-column label="操作" width="90" fixed="right" align="center"><template #default="{row}"><div class="table-operations"><el-tooltip content="查看详情" placement="top"><el-icon v-perm="'GET:/admin/finance/order/detail'" class="op-icon" @click="drawer?.open(row.uid)"><View /></el-icon></el-tooltip></div></template></el-table-column>
    </el-table>
    <AppPagination v-model:page="query.page" v-model:page-size="query.page_size" :total="total" @change="load" />
    <OrderDetailDrawer ref="drawer" />
  </div>
</template>

<style scoped>
.toolbar__description{margin:6px 0 0;color:var(--el-text-color-secondary);font-size:13px}.filters{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:14px 0 8px}.filters>.el-select{width:170px}.filters>.el-input{width:240px}.filters :deep(.el-date-editor){width:320px!important;flex:0 0 320px!important}.muted,small{display:flex;align-items:center;gap:8px;margin-top:5px;color:var(--el-text-color-secondary);font-size:12px}.product,.user{display:flex;align-items:center;gap:9px;margin:4px 0}.product .el-image,.product-placeholder{width:42px;height:42px;flex:none;border-radius:5px}.product-placeholder{display:flex;align-items:center;justify-content:center;background:var(--el-fill-color-light);color:var(--el-text-color-placeholder);font-size:11px}.product>span,.user>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.product small,.user small{display:block}
</style>
