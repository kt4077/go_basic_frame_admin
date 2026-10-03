<script setup lang="ts">
import { ref } from 'vue'
import { getFinanceOrderDetail } from '@/api/financeOrder'
import type { FinanceOrderItem } from '@/types/financeOrder'
import { formatDateTime } from '@/utils/datetime'

const visible = ref(false)
const loading = ref(false)
const order = ref<FinanceOrderItem | null>(null)
const payStatusLabels: Record<number, string> = { 1: '未支付', 2: '已支付', 3: '已退款' }

const open = async (uid: string) => {
  visible.value = true
  loading.value = true
  order.value = null
  try { order.value = await getFinanceOrderDetail(uid) } finally { loading.value = false }
}

defineExpose({ open })
</script>

<template>
  <el-drawer v-model="visible" title="系统订单详情" size="720px" destroy-on-close>
    <div v-loading="loading" class="detail-body">
      <template v-if="order">
        <div class="detail-head">
          <div><h3>{{ order.order_no }}</h3><p>{{ order.source_plugin_name }} · {{ order.status_text }}</p></div>
          <el-tag :type="order.pay_status === 2 ? 'success' : order.pay_status === 3 ? 'danger' : 'warning'">{{ payStatusLabels[order.pay_status] || '未知' }}</el-tag>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="业务模块">{{ order.source_plugin_name }}</el-descriptions-item>
          <el-descriptions-item label="来源订单UID">{{ order.source_order_uid }}</el-descriptions-item>
          <el-descriptions-item label="用户昵称">{{ order.member_nickname || '—' }}</el-descriptions-item>
          <el-descriptions-item label="用户手机">{{ order.member_mobile || '—' }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">{{ order.status_text || '—' }}</el-descriptions-item>
          <el-descriptions-item label="支付方式">{{ order.pay_method || '—' }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ formatDateTime(order.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="支付时间">{{ formatDateTime(order.paid_at) }}</el-descriptions-item>
        </el-descriptions>
        <h4 class="section-title">商品或服务</h4>
        <div class="product-list">
          <div v-for="product in order.products" :key="product.uid" class="product-row">
            <el-image v-if="product.cover" :src="product.cover" fit="cover" />
            <div v-else class="product-placeholder">无图</div>
            <div class="product-info"><strong>{{ product.name }}</strong><span>{{ product.spec_text || '默认规格' }}</span></div>
            <span>× {{ product.quantity }}</span>
          </div>
          <el-empty v-if="order.products.length === 0" description="暂无商品快照" :image-size="70" />
        </div>
        <h4 class="section-title">金额信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="商品金额">¥ {{ order.product_amount }}</el-descriptions-item>
          <el-descriptions-item label="配送金额">¥ {{ order.shipping_amount }}</el-descriptions-item>
          <el-descriptions-item label="优惠金额">¥ {{ order.discount_amount }}</el-descriptions-item>
          <el-descriptions-item label="实际支付"><strong class="pay-amount">¥ {{ order.pay_amount }}</strong></el-descriptions-item>
        </el-descriptions>
      </template>
    </div>
  </el-drawer>
</template>

<style scoped>
.detail-body{min-height:300px}.detail-head{display:flex;align-items:center;justify-content:space-between;padding:0 0 20px}.detail-head h3{margin:0 0 7px;font-size:18px}.detail-head p{margin:0;color:var(--el-text-color-secondary)}.section-title{margin:24px 0 12px;padding-left:10px;border-left:3px solid var(--el-color-primary)}.product-list{border:1px solid var(--el-border-color-lighter);border-radius:8px}.product-row{display:flex;align-items:center;gap:12px;padding:12px 14px}.product-row+.product-row{border-top:1px solid var(--el-border-color-lighter)}.product-row .el-image,.product-placeholder{width:48px;height:48px;flex:none;border-radius:6px}.product-placeholder{display:flex;align-items:center;justify-content:center;background:var(--el-fill-color-light);color:var(--el-text-color-placeholder);font-size:12px}.product-info{display:flex;min-width:0;flex:1;flex-direction:column;gap:6px}.product-info strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.product-info span{color:var(--el-text-color-secondary);font-size:12px}.pay-amount{color:var(--el-color-danger)}
</style>
