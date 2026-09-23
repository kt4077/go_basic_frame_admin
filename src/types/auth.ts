// 认证模块类型

/** 登录请求 */
export interface LoginReq {
  username: string
  password: string
}

/** 登录响应 */
export interface LoginRes {
  token: string
}

/** 用户角色（简要信息） */
export interface RoleBrief {
  id: number
  name: string
  code: string
}

/** 用户信息 */
export interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  mobile: string
  email: string
  dept_id: number
  status: number
  is_super: number
  roles: RoleBrief[]
}

/** 修改密码请求 */
export interface ChangePasswordReq {
  old_password: string
  new_password: string
}

export interface ProfileUpdateReq {
  nickname: string
  avatar: string
  mobile: string
  email: string
}
