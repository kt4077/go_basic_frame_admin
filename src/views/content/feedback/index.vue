<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getFeedbackList, processFeedback } from '@/api/feedback'
import type { FeedbackItem } from '@/types/feedback'

const labels:Record<string,string>={bug:'功能异常',suggestion:'产品建议',content:'内容问题',service:'服务问题',other:'其他'}
const loading=ref(false), processing=ref(0), rows=ref<FeedbackItem[]>([]), total=ref(0)
const query=reactive({page:1,page_size:20,nickname:'',description:'',feedback_type:'',status:undefined as number|undefined,start_time:'',end_time:''})
const feedbackTime=ref<[string,string]|null>(null)
const load=async()=>{loading.value=true;try{const res=await getFeedbackList(query);rows.value=res.list;total.value=res.total}finally{loading.value=false}}
const search=()=>{query.page=1;query.start_time=feedbackTime.value?.[0]?`${feedbackTime.value[0]} 00:00:00`:'';query.end_time=feedbackTime.value?.[1]?`${feedbackTime.value[1]} 23:59:59`:'';void load()}
const reset=()=>{query.nickname='';query.description='';query.feedback_type='';query.status=undefined;query.start_time='';query.end_time='';feedbackTime.value=null;search()}
const process=async(row:FeedbackItem)=>{await ElMessageBox.confirm('确认将这条反馈标记为已处理？处理后将记录当前管理员和处理时间。','处理反馈',{type:'warning',confirmButtonText:'确认处理',cancelButtonText:'取消'});processing.value=row.id;try{await processFeedback(row.id);ElMessage.success('反馈已处理');await load()}finally{processing.value=0}}
const format=(v:string|null)=>v?new Date(v).toLocaleString('zh-CN',{hour12:false}):'—'
onMounted(load)
</script>
<template>
  <div class="page-card">
    <div class="search-panel"><el-input v-model="query.nickname" clearable placeholder="用户昵称"/><el-input v-model="query.description" clearable placeholder="反馈描述"/><el-select v-model="query.feedback_type" clearable placeholder="反馈类型"><el-option v-for="(label,value) in labels" :key="value" :label="label" :value="value" /></el-select><el-select v-model="query.status" clearable placeholder="处理状态"><el-option label="待处理" :value="1"/><el-option label="已处理" :value="2"/></el-select><el-date-picker v-model="feedbackTime" class="feedback-date" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width:240px;flex:0 0 240px"/><div class="search-actions"><el-button type="primary" @click="search">查询</el-button><el-button @click="reset">重置</el-button></div></div>
    <el-table v-loading="loading" :data="rows">
      <el-table-column prop="id" label="ID" width="75"/><el-table-column label="用户" min-width="190"><template #default="{row}"><div class="user-cell"><el-avatar :size="34" :src="row.member_avatar">{{(row.member_nickname||row.member_sn||'用').slice(0,1)}}</el-avatar><div><div>{{row.member_nickname||'—'}}</div><small>{{row.member_sn||'—'}}</small></div></div></template></el-table-column><el-table-column prop="contact_name" label="联系名称" width="130"/><el-table-column prop="contact_mobile" label="联系电话" width="145"/>
      <el-table-column label="类型" width="110"><template #default="{row}">{{labels[row.feedback_type]||row.feedback_type}}</template></el-table-column>
      <el-table-column prop="description" label="反馈描述" min-width="260" show-overflow-tooltip/>
      <el-table-column label="图片" min-width="150"><template #default="{row}"><div class="images"><el-image v-for="image in row.images" :key="image" :src="image" :preview-src-list="row.images" preview-teleported fit="cover"/></div></template></el-table-column>
      <el-table-column label="提交时间" width="175"><template #default="{row}">{{format(row.created_at)}}</template></el-table-column>
      <el-table-column label="状态" width="100"><template #default="{row}"><el-tag :type="row.status===2?'success':'warning'">{{row.status===2?'已处理':'待处理'}}</el-tag></template></el-table-column>
      <el-table-column label="处理信息" width="190"><template #default="{row}"><div>{{row.processor_name||'—'}}</div><small>{{format(row.processed_at)}}</small></template></el-table-column>
      <el-table-column label="操作" width="110" fixed="right"><template #default="{row}"><el-button v-if="row.status===1" v-perm="'POST:/admin/feedback/process'" type="primary" link :loading="processing===row.id" @click="process(row)">标记处理</el-button><span v-else>—</span></template></el-table-column>
    </el-table>
    <el-pagination v-model:current-page="query.page" v-model:page-size="query.page_size" class="pagination" :total="total" layout="total, prev, pager, next" @current-change="load"/>
  </div>
</template>
<style scoped>.search-panel{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:18px;padding:16px;border:1px solid var(--card-border);border-radius:10px;background:var(--el-fill-color-extra-light)}.search-panel>.el-input,.search-panel>.el-select{width:170px;flex:0 0 170px}.search-panel :deep(.feedback-date){width:240px!important;max-width:240px;flex:0 0 240px!important}.search-actions{display:flex;flex:0 0 auto;gap:8px}.user-cell{display:flex;align-items:center;gap:10px}.images{display:flex;flex-wrap:wrap;gap:6px}.images :deep(.el-image){width:42px;height:42px;border-radius:6px}.pagination{justify-content:flex-end;margin-top:18px}small{color:var(--el-text-color-secondary)}</style>
