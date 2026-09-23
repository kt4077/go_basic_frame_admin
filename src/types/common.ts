// 通用类型定义

/** 后端统一响应结构 */
export interface ApiResponse<T = unknown> {
  code: number
  msg: string
  data?: T
}

/** 分页查询通用参数 */
export interface PageQuery {
  page: number
  page_size: number
}

/** 分页响应通用结构 */
export interface PageResult<T> {
  list: T[]
  total: number
}

/** 后端返回的树节点结构 */
export interface TreeNode<T> {
  data: T
  children?: TreeNode<T>[]
}

/** 基础实体字段 */
export interface BaseEntity {
  id: number
  created_at: string
  updated_at: string
}
