// axios 实例与拦截器：统一携带 token、处理 401 主动过期与业务错误码。
import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/common'
import { getToken, clearToken } from '@/utils/auth'
import router from '@/router'

const http = axios.create({
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 相同错误信息 2 秒内只弹一次，避免并发请求失败时重复弹窗
let lastErrMsg = ''
let lastErrMsgAt = 0
const showError = (msg: string) => {
  const now = Date.now()
  if (msg === lastErrMsg && now - lastErrMsgAt < 2000) return
  lastErrMsg = msg
  lastErrMsgAt = now
  ElMessage.error(msg)
}

http.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse
    if (res.code !== 0) {
      // 登录失效：清除本地状态并跳转登录页
      if (res.code === 401) {
        clearToken()
        if (router.currentRoute.value.path !== '/login') {
          showError(res.msg || '登录已失效')
          router.push('/login')
        }
      } else {
        showError(res.msg || '请求失败')
      }
      return Promise.reject(new Error(res.msg))
    }
    return response
  },
  (error) => {
    // HTTP 层 401（后端 auth 中间件直接返回 401 状态码）
    if (error.response?.status === 401) {
      clearToken()
      if (router.currentRoute.value.path !== '/login') {
        showError('登录已失效，请重新登录')
        router.push('/login')
      }
    } else {
      showError(error.message || '网络异常')
    }
    return Promise.reject(error)
  },
)

/** 统一请求方法：返回业务 data */
export const request = async <T>(config: Parameters<typeof http.request>[0]): Promise<T> => {
  const response = await http.request<ApiResponse<T>>(config)
  return response.data.data as T
}

export default http
