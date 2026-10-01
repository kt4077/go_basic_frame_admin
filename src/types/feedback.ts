import type { BaseEntity, PageQuery, PageResult } from './common'
export interface FeedbackItem extends BaseEntity { member_id:number; member_nickname:string; member_sn:string; member_avatar:string; contact_name:string; contact_mobile:string; feedback_type:string; images:string[]; description:string; status:number; processed_at:string|null; processed_by:number|null; processor_name:string }
export interface FeedbackQuery extends PageQuery { nickname?:string; description?:string; feedback_type?:string; status?:number; start_time?:string; end_time?:string }
export type FeedbackPage = PageResult<FeedbackItem>
