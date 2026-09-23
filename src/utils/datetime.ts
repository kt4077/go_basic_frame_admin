// 管理端日期时间统一显示到秒，后端仍可保留更高精度。
const DATE_TIME_PATTERN = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/

export const formatDateTime = (value: unknown): string => {
  if (typeof value !== 'string' || value === '') return value == null ? '' : String(value)
  const matched = value.match(DATE_TIME_PATTERN)
  return matched ? `${matched[1]} ${matched[2]}` : value
}

export const formatDateTimeCell = (_row: unknown, _column: unknown, value: unknown): string => {
  return formatDateTime(value)
}

export const formatDateTimesDeep = (value: unknown): unknown => {
  if (typeof value === 'string') return formatDateTime(value)
  if (Array.isArray(value)) return value.map((item) => formatDateTimesDeep(item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, formatDateTimesDeep(item)]),
    )
  }
  return value
}
