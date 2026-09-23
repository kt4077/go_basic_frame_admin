// 系统总览模块类型

/** 数量统计项 */
export interface TrendItem {
  name: string
  value: number
}

/** 部门人数统计项 */
export interface DeptUserItem {
  dept_id: number
  name: string
  total: number
}

/** 登录流水记录 */
export interface LoginRecord {
  id: number
  login_id: string
  user_id: number
  username: string
  client: string
  login_ip: string
  user_agent: string
  login_at: string
  logout_at: string | null
  status: number
}

/** 系统总览响应 */
export interface OverviewRes {
  user_count: number
  role_count: number
  menu_count: number
  dept_count: number
  online_count: number
  login_trend: TrendItem[]
  recent_login: LoginRecord[]
  dept_users: DeptUserItem[]
}
