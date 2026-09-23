<script setup lang="ts">
import { reactive, ref, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, Message, Phone, User } from '@element-plus/icons-vue'
import AvatarUpload from '@/components/AvatarUpload.vue'
import { changePassword, updateAvatar, updateProfile } from '@/api/auth'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const saving = ref(false)
const changingPassword = ref(false)

const profile = reactive({ nickname: '', avatar: '', mobile: '', email: '' })
const password = reactive({ old_password: '', new_password: '', confirm_password: '' })

watchEffect(() => {
  const user = userStore.userInfo
  if (!user) return
  profile.nickname = user.nickname
  profile.avatar = user.avatar
  profile.mobile = user.mobile
  profile.email = user.email
})

const saveProfile = async () => {
  saving.value = true
  try {
    const user = await updateProfile(profile)
    userStore.setUserInfo(user)
    ElMessage.success('个人资料已保存')
  } finally {
    saving.value = false
  }
}

const saveAvatar = async (avatar: string) => {
  const user = await updateAvatar({ avatar })
  userStore.setUserInfo(user)
  ElMessage.success('头像已更新')
}

const savePassword = async () => {
  if (password.new_password.length < 6) {
    ElMessage.warning('新密码至少6位')
    return
  }
  if (password.new_password !== password.confirm_password) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }
  changingPassword.value = true
  try {
    await changePassword({ old_password: password.old_password, new_password: password.new_password })
    ElMessage.success('密码已修改，请重新登录')
    await userStore.logout()
    await router.push('/login')
  } finally {
    changingPassword.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <section class="profile-summary page-card">
      <div class="summary-bg" />
      <div class="summary-content">
        <div class="summary-avatar">
          <AvatarUpload
            v-model="profile.avatar"
            :size="96"
            shape="circle"
            :show-tip="false"
            :show-remove="false"
            :after-upload="saveAvatar"
            edit-badge
          />
        </div>
        <h2>{{ userStore.userInfo?.nickname || '未设置姓名' }}</h2>
        <p class="username">@{{ userStore.userInfo?.username }}</p>
        <div class="role-list">
          <el-tag v-if="userStore.userInfo?.is_super === 1" type="danger" effect="light">超级管理员</el-tag>
          <el-tag v-for="role in userStore.userInfo?.roles" :key="role.id" effect="plain">{{ role.name }}</el-tag>
        </div>
        <div class="summary-lines">
          <div><el-icon><Phone /></el-icon><span>{{ userStore.userInfo?.mobile || '未设置手机号' }}</span></div>
          <div><el-icon><Message /></el-icon><span>{{ userStore.userInfo?.email || '未设置邮箱' }}</span></div>
          <div><el-icon><User /></el-icon><span>账号状态：正常</span></div>
        </div>
      </div>
    </section>

    <div class="profile-main">
      <section class="setting-card page-card">
        <div class="card-heading">
          <div><h3>基本资料</h3><p>维护头像和常用联系方式</p></div>
        </div>
        <el-form label-position="top" class="profile-form">
          <div class="form-grid">
            <el-form-item label="登录账号">
              <el-input :model-value="userStore.userInfo?.username" disabled />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input v-model="profile.nickname" maxlength="32" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="profile.mobile" maxlength="16" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="profile.email" maxlength="64" placeholder="请输入邮箱" />
            </el-form-item>
          </div>
          <div class="form-actions"><el-button type="primary" :loading="saving" @click="saveProfile">保存资料</el-button></div>
        </el-form>
      </section>

      <section class="setting-card page-card">
        <div class="card-heading">
          <div class="heading-icon"><el-icon><Lock /></el-icon></div>
          <div><h3>登录密码</h3><p>修改成功后，当前账号的全部登录会话将退出</p></div>
        </div>
        <el-form label-position="top" class="password-form">
          <div class="password-grid">
            <el-form-item label="当前密码"><el-input v-model="password.old_password" type="password" show-password autocomplete="current-password" /></el-form-item>
            <el-form-item label="新密码"><el-input v-model="password.new_password" type="password" show-password autocomplete="new-password" placeholder="至少6位" /></el-form-item>
            <el-form-item label="确认新密码"><el-input v-model="password.confirm_password" type="password" show-password autocomplete="new-password" /></el-form-item>
          </div>
          <div class="form-actions"><el-button type="primary" :loading="changingPassword" @click="savePassword">更新密码</el-button></div>
        </el-form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.profile-page { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 14px; align-items: stretch; }
.profile-summary { height: 100%; padding: 0; overflow: hidden; }
.summary-bg { height: 104px; background: linear-gradient(135deg, var(--el-color-primary), #7c3aed); opacity: .92; }
.summary-content { padding: 0 24px 26px; text-align: center; }
.summary-avatar { width: 104px; height: 104px; margin: -52px auto 0; padding: 4px; border-radius: 50%; background: var(--card-bg); }
.summary-avatar :deep(.avatar-box) { border: none; background: linear-gradient(135deg, var(--el-color-primary), #8b5cf6); color: #fff; }
.summary-avatar :deep(.avatar-tip) { display: none; }
.summary-content h2 { margin: 14px 0 2px; font-size: 19px; }
.username { margin: 0; color: var(--el-text-color-secondary); font-size: 13px; }
.role-list { min-height: 30px; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin: 18px 0; }
.summary-lines { padding-top: 14px; border-top: 1px solid var(--card-border); text-align: left; }
.summary-lines > div { display: flex; align-items: center; gap: 9px; padding: 7px 0; color: var(--el-text-color-regular); font-size: 13px; }
.profile-main { min-width: 0; display: grid; gap: 14px; }
.setting-card { padding: 22px 24px; }
.card-heading { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; margin-bottom: 18px; border-bottom: 1px solid var(--card-border); }
.card-heading h3 { margin: 0 0 4px; font-size: 16px; }
.card-heading p { margin: 0; color: var(--el-text-color-secondary); font-size: 12px; }
.heading-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 10px; color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
.profile-form { max-width: 860px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 18px; }
.password-form { width: 100%; }
.password-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 18px; }
.form-actions { display: flex; justify-content: flex-end; padding-top: 4px; }
@media (max-width: 1100px) { .password-grid { grid-template-columns: 1fr; } }
@media (max-width: 900px) { .profile-page { grid-template-columns: 1fr; } .profile-summary { height: auto; } .form-grid { grid-template-columns: 1fr; } }
</style>
