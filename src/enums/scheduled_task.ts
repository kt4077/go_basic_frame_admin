export const ScheduledTaskResult = {
  Never: 0,
  Success: 1,
  Failure: 2,
  Skipped: 3,
} as const

export const scheduledTaskResultLabels: Record<number, string> = {
  0: '未执行',
  1: '成功',
  2: '失败',
  3: '已跳过',
}

export const scheduledTaskResultTagTypes: Record<number, 'info' | 'success' | 'danger' | 'warning'> = {
  0: 'info',
  1: 'success',
  2: 'danger',
  3: 'warning',
}

