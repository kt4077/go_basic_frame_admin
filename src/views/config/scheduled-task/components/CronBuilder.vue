<script setup lang="ts">
import { reactive, ref, watch } from 'vue'

type Cycle = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'custom'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const cycle = ref<Cycle>('day')
const interval = ref(1)
const dayInterval = ref(1)
const time = reactive({ hour: 2, minute: 0, second: 0 })
const weekdays = ref<number[]>([1])
const monthDays = ref<number[]>([1])
const months = ref<number[]>([])
const custom = reactive({ second: '0', minute: '0', hour: '2', day: '*', month: '*', week: '*' })
let syncing = false

const weekOptions = [
  { label: '周日', value: 0 }, { label: '周一', value: 1 }, { label: '周二', value: 2 },
  { label: '周三', value: 3 }, { label: '周四', value: 4 }, { label: '周五', value: 5 }, { label: '周六', value: 6 },
]
const monthOptions = Array.from({ length: 12 }, (_, index) => ({ label: `${index + 1}月`, value: index + 1 }))
const monthDayOptions = Array.from({ length: 31 }, (_, index) => index + 1)
const advancedFields = [
  { key: 'second', label: '秒' }, { key: 'minute', label: '分' }, { key: 'hour', label: '时' },
  { key: 'day', label: '日' }, { key: 'month', label: '月' }, { key: 'week', label: '周' },
] as const

const clampInterval = (value: number, max: number) => Math.min(Math.max(Number(value) || 1, 1), max)
const generate = () => {
  if (syncing) return
  let expression = ''
  switch (cycle.value) {
    case 'second': expression = `*/${clampInterval(interval.value, 59)} * * * * *`; break
    case 'minute': expression = `0 */${clampInterval(interval.value, 59)} * * * *`; break
    case 'hour': expression = `0 0 */${clampInterval(interval.value, 23)} * * *`; break
    case 'day': expression = `${time.second} ${time.minute} ${time.hour} */${clampInterval(dayInterval.value, 31)} * *`; break
    case 'week': expression = `${time.second} ${time.minute} ${time.hour} * * ${(weekdays.value.length ? weekdays.value : [1]).slice().sort().join(',')}`; break
    case 'month': expression = `${time.second} ${time.minute} ${time.hour} ${(monthDays.value.length ? monthDays.value : [1]).slice().sort((a, b) => a - b).join(',')} ${months.value.length ? months.value.slice().sort((a, b) => a - b).join(',') : '*'} *`; break
    case 'custom': expression = `${custom.second} ${custom.minute} ${custom.hour} ${custom.day} ${custom.month} ${custom.week}`; break
  }
  emit('update:modelValue', expression)
}

const parse = (value: string) => {
  const fields = value.trim().split(/\s+/)
  if (fields.length === 5) fields.unshift('0')
  if (fields.length !== 6) return
  syncing = true
  Object.assign(custom, { second: fields[0], minute: fields[1], hour: fields[2], day: fields[3], month: fields[4], week: fields[5] })
  let match: RegExpMatchArray | null
  if ((match = fields[0].match(/^\*\/(\d+)$/)) && fields.slice(1).every(field => field === '*')) {
    cycle.value = 'second'; interval.value = Number(match[1])
  } else if (fields[0] === '0' && (match = fields[1].match(/^\*\/(\d+)$/)) && fields.slice(2).every(field => field === '*')) {
    cycle.value = 'minute'; interval.value = Number(match[1])
  } else if (fields[0] === '0' && fields[1] === '0' && (match = fields[2].match(/^\*\/(\d+)$/)) && fields.slice(3).every(field => field === '*')) {
    cycle.value = 'hour'; interval.value = Number(match[1])
  } else if (/^\d+$/.test(fields[0]) && /^\d+$/.test(fields[1]) && /^\d+$/.test(fields[2])) {
    Object.assign(time, { second: Number(fields[0]), minute: Number(fields[1]), hour: Number(fields[2]) })
    if (fields[4] === '*' && fields[5] !== '*') {
      cycle.value = 'week'; weekdays.value = fields[5].split(',').map(Number).filter(value => value >= 0 && value <= 6)
    } else if (fields[5] === '*' && fields[3] !== '*' && !fields[3].startsWith('*/')) {
      cycle.value = 'month'
      monthDays.value = fields[3].split(',').map(Number).filter(value => value >= 1 && value <= 31)
      months.value = fields[4] === '*' ? [] : fields[4].split(',').map(Number).filter(value => value >= 1 && value <= 12)
    } else if (fields[4] === '*' && fields[5] === '*' && (fields[3] === '*' || fields[3].startsWith('*/'))) {
      cycle.value = 'day'; dayInterval.value = fields[3] === '*' ? 1 : Number(fields[3].slice(2))
    } else cycle.value = 'custom'
  } else cycle.value = 'custom'
  syncing = false
}

watch(() => props.modelValue, parse, { immediate: true })
watch([cycle, interval, dayInterval, time, weekdays, monthDays, months, custom], generate, { deep: true })
</script>

<template>
  <div class="cron-builder">
    <el-radio-group v-model="cycle" size="small" class="cycle-tabs">
      <el-radio-button value="second">按秒</el-radio-button><el-radio-button value="minute">按分钟</el-radio-button>
      <el-radio-button value="hour">按小时</el-radio-button><el-radio-button value="day">按天</el-radio-button>
      <el-radio-button value="week">按周</el-radio-button><el-radio-button value="month">按月</el-radio-button>
      <el-radio-button value="custom">高级组合</el-radio-button>
    </el-radio-group>

    <div v-if="cycle === 'second' || cycle === 'minute' || cycle === 'hour'" class="builder-row">
      <span>每</span><el-input-number v-model="interval" :min="1" :max="cycle === 'hour' ? 23 : 59" />
      <span>{{ cycle === 'second' ? '秒' : cycle === 'minute' ? '分钟' : '小时' }}执行一次</span>
    </div>
    <div v-else-if="cycle === 'day'" class="builder-row">
      <span>每</span><el-input-number v-model="dayInterval" :min="1" :max="31" /><span>天，在</span>
      <el-input-number v-model="time.hour" :min="0" :max="23" /><span>时</span>
      <el-input-number v-model="time.minute" :min="0" :max="59" /><span>分</span>
      <el-input-number v-model="time.second" :min="0" :max="59" /><span>秒执行</span>
    </div>
    <div v-else-if="cycle === 'week'" class="builder-block">
      <el-checkbox-group v-model="weekdays"><el-checkbox-button v-for="item in weekOptions" :key="item.value" :value="item.value">{{ item.label }}</el-checkbox-button></el-checkbox-group>
      <div class="builder-row"><span>在</span><el-input-number v-model="time.hour" :min="0" :max="23" /><span>时</span><el-input-number v-model="time.minute" :min="0" :max="59" /><span>分</span><el-input-number v-model="time.second" :min="0" :max="59" /><span>秒执行</span></div>
    </div>
    <div v-else-if="cycle === 'month'" class="builder-block">
      <div class="select-row"><span>月份</span><el-select v-model="months" multiple collapse-tags collapse-tags-tooltip placeholder="每月"><el-option v-for="item in monthOptions" :key="item.value" :label="item.label" :value="item.value" /></el-select><span class="hint">不选表示每月</span></div>
      <div class="select-row"><span>日期</span><el-select v-model="monthDays" multiple collapse-tags collapse-tags-tooltip placeholder="请选择日期"><el-option v-for="day in monthDayOptions" :key="day" :label="`${day}日`" :value="day" /></el-select></div>
      <div class="builder-row"><span>在</span><el-input-number v-model="time.hour" :min="0" :max="23" /><span>时</span><el-input-number v-model="time.minute" :min="0" :max="59" /><span>分</span><el-input-number v-model="time.second" :min="0" :max="59" /><span>秒执行</span></div>
    </div>
    <div v-else class="advanced-grid">
      <label v-for="field in advancedFields" :key="field.key"><span>{{ field.label }}</span><el-input v-model="custom[field.key]" /></label>
      <div class="advanced-help">支持 <code>*</code>、逗号多选、范围（如 <code>1-5</code>）和步长（如 <code>*/10</code>）；日和周同时指定时按任一条件触发。</div>
    </div>
    <div class="expression-preview"><span>生成表达式</span><code>{{ modelValue }}</code></div>
  </div>
</template>

<style scoped>
.cron-builder{width:100%;padding:12px;border:1px solid var(--el-border-color);border-radius:8px;background:var(--page-bg)}.cycle-tabs{margin-bottom:14px;flex-wrap:wrap}.builder-row,.select-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.builder-block{display:flex;flex-direction:column;gap:12px}.select-row .el-select{width:280px}.builder-row :deep(.el-input-number){width:105px}.hint,.advanced-help{font-size:12px;color:var(--el-text-color-secondary)}.advanced-grid{display:grid;grid-template-columns:repeat(3,minmax(120px,1fr));gap:10px}.advanced-grid label{display:flex;align-items:center;gap:8px}.advanced-grid label>span{width:18px;color:var(--el-text-color-secondary)}.advanced-help{grid-column:1/-1}.expression-preview{display:flex;align-items:center;gap:12px;margin-top:14px;padding-top:10px;border-top:1px dashed var(--el-border-color)}.expression-preview span{font-size:12px;color:var(--el-text-color-secondary)}code{color:var(--el-color-primary);word-break:break-all}
</style>
