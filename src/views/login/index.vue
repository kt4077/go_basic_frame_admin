<script setup lang="ts">
// 登录页
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Platform, Check, Moon, Sunny, Right } from '@element-plus/icons-vue'
import { login } from '@/api/auth'
import { setToken } from '@/utils/auth'
import { useUserStore } from '@/store/user'
import { useAppStore } from '@/store/app'
import { usePlatformStore } from '@/store/platform'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()
const platformStore = usePlatformStore()
const themeIcon = computed(() => (appStore.theme === 'light' ? Moon : Sunny))

const form = reactive({ username: 'admin', password: '' })
const loading = ref(false)
const formRef = ref()

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const onSubmit = async () => {
  await formRef.value?.validate()
  loading.value = true
  try {
    const res = await login({ username: form.username, password: form.password })
    setToken(res.token)
    await userStore.loadProfile()
    ElMessage.success('登录成功')
    router.push((route.query.redirect as string) || '/')
  } finally {
    loading.value = false
  }
}

const toggleTheme = () => appStore.setTheme(appStore.theme === 'light' ? 'dark' : 'light')

onMounted(() => platformStore.loadAdminConfig())
</script>

<template>
  <div class="login-page">
    <div class="orb orb-one" />
    <div class="orb orb-two" />
    <button class="theme-toggle" type="button" :title="appStore.theme === 'light' ? '切换暗色' : '切换亮色'" @click="toggleTheme">
      <el-icon :size="18"><component :is="themeIcon" /></el-icon>
    </button>

    <div class="login-shell">
      <section class="brand-panel">
        <div class="brand-row">
          <div class="brand-badge" :class="{ 'has-logo': platformStore.adminConfig.logo }">
            <img v-if="platformStore.adminConfig.logo" :src="platformStore.adminConfig.logo" alt="系统Logo" />
            <el-icon v-else :size="22"><Platform /></el-icon>
          </div>
          <span>{{ platformStore.adminConfig.system_name }}</span>
        </div>
        <div class="brand-copy">
          <span class="eyebrow">企业级管理基础框架</span>
          <h1>让后台管理<br /><em>清晰、高效、安全</em></h1>
          <p>基于 Go 与 Vue 3 构建，提供完整的权限、配置、文件和审计能力。</p>
        </div>
        <div class="feature-list">
          <div><span><el-icon><Check /></el-icon></span>多级角色与接口权限控制</div>
          <div><span><el-icon><Check /></el-icon></span>多渠道存储与业务配置</div>
          <div><span><el-icon><Check /></el-icon></span>登录会话与操作审计</div>
        </div>
        <div class="brand-foot">Go · Gin · GORM · Vue 3</div>
      </section>

      <section class="form-panel">
        <div class="login-head">
          <span class="welcome">欢迎回来</span>
          <h2 class="title">登录管理后台</h2>
          <p class="subtitle">请输入账号信息以继续访问系统</p>
        </div>
        <el-form ref="formRef" :model="form" :rules="rules" size="large" @keyup.enter="onSubmit">
          <label class="field-label">登录账号</label>
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="请输入用户名" autocomplete="username" :prefix-icon="User" />
          </el-form-item>
          <label class="field-label">登录密码</label>
          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" autocomplete="current-password" :prefix-icon="Lock" />
          </el-form-item>
          <el-button type="primary" class="submit" size="large" :loading="loading" @click="onSubmit">
            <span>登录系统</span><el-icon><Right /></el-icon>
          </el-button>
        </el-form>
        <p class="copyright">© 2026 {{ platformStore.adminConfig.system_name }}<template v-if="platformStore.adminConfig.version"> · {{ platformStore.adminConfig.version }}</template></p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  overflow: hidden;
  background: var(--login-bg);
}
.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: .24;
  background-image: linear-gradient(rgba(59, 110, 246, .08) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 110, 246, .08) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: linear-gradient(to bottom, #000, transparent 80%);
}
.orb { position: absolute; border-radius: 50%; filter: blur(2px); pointer-events: none; }
.orb-one { width: 420px; height: 420px; left: -160px; top: -180px; background: rgba(59, 110, 246, .16); }
.orb-two { width: 360px; height: 360px; right: -120px; bottom: -170px; background: rgba(139, 92, 246, .15); }
.theme-toggle {
  position: absolute;
  z-index: 2;
  right: 24px;
  top: 22px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--card-border);
  border-radius: 12px;
  color: var(--el-text-color-regular);
  background: var(--card-bg);
  box-shadow: 0 6px 20px rgba(16, 24, 40, .08);
  cursor: pointer;
}
.login-shell {
  position: relative;
  z-index: 1;
  width: min(960px, 100%);
  min-height: 570px;
  display: grid;
  grid-template-columns: 1.05fr .95fr;
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: 24px;
  background: var(--card-bg);
  box-shadow: 0 28px 80px rgba(25, 45, 90, .16);
}
.brand-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 42px 48px;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(145deg, #245de5 0%, #4f46e5 55%, #6d3cce 100%);
}
.brand-panel::before,
.brand-panel::after { content: ''; position: absolute; border: 1px solid rgba(255,255,255,.13); border-radius: 50%; }
.brand-panel::before { width: 340px; height: 340px; right: -160px; top: -130px; }
.brand-panel::after { width: 240px; height: 240px; left: -120px; bottom: -100px; }
.brand-row { position: relative; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 700; letter-spacing: 1.4px; }
.brand-badge {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,.24);
  border-radius: 12px;
  background: rgba(255,255,255,.14);
  backdrop-filter: blur(8px);
  overflow: hidden;
}
.brand-badge img { display: block; width: 100%; height: 100%; object-fit: contain; border-radius: inherit; }
.brand-badge.has-logo { border-color: transparent; background: transparent; backdrop-filter: none; }
.brand-copy { position: relative; margin-top: 76px; }
.eyebrow { display: inline-block; margin-bottom: 18px; padding: 6px 11px; border-radius: 20px; background: rgba(255,255,255,.13); font-size: 12px; }
.brand-copy h1 { margin: 0; font-size: 35px; line-height: 1.35; letter-spacing: 1px; }
.brand-copy h1 em { color: #dbeafe; font-style: normal; }
.brand-copy p { max-width: 390px; margin-top: 18px; color: rgba(255,255,255,.72); font-size: 14px; line-height: 1.8; }
.feature-list { position: relative; display: grid; gap: 13px; margin-top: 38px; color: rgba(255,255,255,.88); font-size: 13px; }
.feature-list > div { display: flex; align-items: center; gap: 10px; }
.feature-list span { width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: rgba(255,255,255,.15); }
.brand-foot { position: relative; margin-top: auto; color: rgba(255,255,255,.5); font-size: 11px; letter-spacing: .8px; }
.form-panel { display: flex; flex-direction: column; justify-content: center; padding: 54px 54px 38px; }
.login-head { margin-bottom: 34px; }
.welcome { color: var(--el-color-primary); font-size: 13px; font-weight: 600; }
.title { margin-top: 8px; color: var(--el-text-color-primary); font-size: 26px; font-weight: 650; letter-spacing: .5px; }
.subtitle { margin-top: 8px; color: var(--el-text-color-secondary); font-size: 13px; }
.field-label { display: block; margin-bottom: 8px; color: var(--el-text-color-regular); font-size: 13px; font-weight: 500; }
.form-panel :deep(.el-form-item) { margin-bottom: 21px; }
.form-panel :deep(.el-input__wrapper) { min-height: 46px; border-radius: 10px; box-shadow: 0 0 0 1px var(--el-border-color) inset; }
.form-panel :deep(.el-input__wrapper.is-focus) { box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px rgba(59, 110, 246, .1); }
.submit {
  width: 100%;
  height: 46px;
  display: flex;
  gap: 8px;
  margin-top: 24px;
  margin-bottom: 18px;
  border-radius: 10px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(59, 110, 246, .25);
}
.copyright { margin-top: auto; padding-top: 40px; text-align: center; color: var(--el-text-color-placeholder); font-size: 11px; }
@media (max-width: 760px) {
  .login-page { padding: 18px; align-items: flex-start; overflow-y: auto; }
  .login-shell { grid-template-columns: 1fr; min-height: auto; margin: auto 0; }
  .brand-panel { min-height: 210px; padding: 28px; }
  .brand-copy { margin-top: 30px; }
  .brand-copy h1 { font-size: 26px; }
  .brand-copy p, .feature-list, .brand-foot { display: none; }
  .form-panel { padding: 38px 30px 30px; }
  .theme-toggle { right: 14px; top: 14px; }
}
</style>
