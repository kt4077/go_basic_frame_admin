export const contentPositions = [
  { label: '首页', value: 1 },
  { label: '我的页面', value: 2 },
]

export const displayTypes = [
  { label: '图标', value: 1 },
  { label: '图片', value: 2 },
]

export const linkTypes = [
  { label: '不跳转', value: 1 },
  { label: '应用内页面', value: 2 },
  { label: 'WebView 网页', value: 3 },
  { label: '外部应用', value: 4 },
]

export const platformOptions = [
  { label: '微信小程序', value: 1 },
  { label: '微信公众号', value: 2 },
  { label: 'iOS', value: 3 },
  { label: 'Android', value: 4 },
  { label: 'H5', value: 5 },
  { label: '支付宝小程序', value: 6 },
  { label: '百度小程序', value: 7 },
  { label: '抖音小程序', value: 8 },
  { label: 'QQ小程序', value: 9 },
  { label: '快手小程序', value: 10 },
]

export const getOptionLabel = (
  options: Array<{ label: string; value: number }>,
  value: number,
) => options.find((item) => item.value === value)?.label || '-'
