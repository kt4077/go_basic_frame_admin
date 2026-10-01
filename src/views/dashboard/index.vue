<script setup lang="ts">
// 系统总览：园区风格数据看板。后端接口未就绪，数据在页面内模拟（见 mock.ts），
// 图片中的顶部导航不属于本页范围，沿用系统现有布局壳。
import { onMounted, ref } from 'vue'
import { getPublicAdminPlatformConfig } from '@/api/platform'
import type { AdminPlatformConfig } from '@/types/platform'
import StatOverview from './components/StatOverview.vue'
import QuickPanel from './components/QuickPanel.vue'
import RoomSummary from './components/RoomSummary.vue'
import RateGauge from './components/RateGauge.vue'
import VacancyAlert from './components/VacancyAlert.vue'
import TrendPanel from './components/TrendPanel.vue'
import ApprovalCard from './components/ApprovalCard.vue'
import NoticeCard from './components/NoticeCard.vue'
import RemindCard from './components/RemindCard.vue'

// 底部系统信息与顶栏/登录页同源（公开品牌配置接口）
const platform = ref<AdminPlatformConfig>()

onMounted(async () => {
  try {
    platform.value = await getPublicAdminPlatformConfig()
  } catch {
    // 品牌信息加载失败不影响看板展示
  }
})
</script>

<template>
  <div class="dashboard">
    <div class="dash-row row-1">
      <StatOverview />
      <QuickPanel />
    </div>
    <div class="dash-row row-2">
      <RoomSummary />
      <RateGauge />
      <VacancyAlert />
    </div>
    <div class="dash-row row-3">
      <TrendPanel />
      <ApprovalCard />
      <NoticeCard />
      <RemindCard />
    </div>
    <footer class="dash-footer">
      <span>{{ platform?.system_name || '后台管理系统' }}</span>
      <span class="dash-footer__divider">·</span>
      <span>版本 {{ platform?.version || '-' }}</span>
    </footer>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.dash-row {
  display: grid;
  gap: 14px;
}

.row-1 {
  grid-template-columns: 2.05fr 1fr;
}

.row-2 {
  grid-template-columns: 1fr 1fr 1fr;
}

.row-3 {
  grid-template-columns: 1.15fr 1fr 1fr 1fr;
}

@media (max-width: 1500px) {
  .row-2 {
    grid-template-columns: 1fr 1fr;
  }

  .row-3 {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 1100px) {
  .row-1 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .row-2,
  .row-3 {
    grid-template-columns: 1fr;
  }
}

.dash-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 2px 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.dash-footer__divider {
  color: var(--el-border-color);
}
</style>
