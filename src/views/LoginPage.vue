<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const form = reactive({
  username: '',
  password: '',
  remember: false,
})

const showPassword = ref(false)
const loading = ref(false)
const submitted = ref(false)

const usernameError = computed(() => {
  if (!submitted.value) return ''
  if (!form.username.trim()) return '请输入用户名'
  return ''
})

const passwordError = computed(() => {
  if (!submitted.value) return ''
  if (!form.password) return '请输入密码'
  if (form.password.length < 6) return '密码至少 6 位'
  return ''
})

const canSubmit = computed(
  () =>
    form.username.trim().length > 0 &&
    form.password.length >= 6 &&
    !loading.value,
)

async function onSubmit() {
  submitted.value = true
  if (usernameError.value || passwordError.value) return

  loading.value = true
  try {
    await userStore.login(form.username.trim(), form.password)
    ElMessage.success('登录成功')
    const redirect =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/threeDModelView'
    await router.replace(redirect)
  } catch (error) {
    const message = error instanceof Error ? error.message : '登录失败'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-bg" aria-hidden="true">
      <div class="orb orb-a" />
      <div class="orb orb-b" />
      <div class="grain" />
    </div>

    <main class="login-card">
      <header class="login-header">
        <p class="eyebrow">lys · last dance</p>
        <h1>欢迎回来</h1>
        <p class="subtitle">登录以继续你的旅程</p>
        <p class="demo-hint">演示账号：admin / 123456</p>
      </header>

      <form class="login-form" @submit.prevent="onSubmit">
        <div class="field" :class="{ invalid: usernameError }">
          <label for="username">用户名</label>
          <input id="username" v-model="form.username" type="text" name="username" autocomplete="username"
            placeholder="请输入用户名" />
          <span v-if="usernameError" class="error">{{ usernameError }}</span>
        </div>

        <div class="field" :class="{ invalid: passwordError }">
          <label for="password">密码</label>
          <div class="password-wrap">
            <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" name="password"
              autocomplete="current-password" placeholder="请输入密码" />
            <button type="button" class="toggle-pwd" :aria-label="showPassword ? '隐藏密码' : '显示密码'"
              @click="showPassword = !showPassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </button>
          </div>
          <span v-if="passwordError" class="error">{{ passwordError }}</span>
        </div>

        <div class="row">
          <label class="checkbox">
            <input v-model="form.remember" type="checkbox" />
            <span>记住我</span>
          </label>
          <a href="#" class="link" @click.prevent>忘记密码？</a>
        </div>

        <button type="submit" class="submit" :disabled="!canSubmit">
          <span v-if="loading" class="spinner" aria-hidden="true" />
          {{ loading ? '登录中…' : '登录' }}
        </button>
      </form>

      <p class="footer-hint">
        还没有账号？
        <a href="#" class="link" @click.prevent>注册</a>
      </p>
    </main>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  box-sizing: border-box;
}

.login-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(145deg, #0f0c14 0%, #1a1228 45%, #0d1520 100%);
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  animation: drift 18s ease-in-out infinite alternate;
}

.orb-a {
  width: 420px;
  height: 420px;
  background: #7c3aed;
  top: -8%;
  right: -5%;
}

.orb-b {
  width: 360px;
  height: 360px;
  background: #db2777;
  bottom: -10%;
  left: -8%;
  animation-delay: -6s;
}

.grain {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@keyframes drift {
  from {
    transform: translate(0, 0) scale(1);
  }

  to {
    transform: translate(-30px, 24px) scale(1.08);
  }
}

.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  padding: 2.25rem 2rem 2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  text-align: left;
}

.login-header {
  margin-bottom: 1.75rem;
}

.eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.login-header h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  line-height: 1.2;
  color: #f8fafc;
}

.subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.55);
}

.demo-hint {
  margin: 0.75rem 0 0;
  font-size: 0.75rem;
  color: rgba(167, 139, 250, 0.85);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
}

.field input[type='text'],
.field input[type='password'] {
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 0.875rem;
  font-size: 0.9375rem;
  font-family: inherit;
  color: #f1f5f9;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.field input:focus {
  border-color: rgba(167, 139, 250, 0.7);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.25);
}

.field.invalid input {
  border-color: rgba(248, 113, 113, 0.65);
}

.password-wrap {
  position: relative;
}

.password-wrap input {
  padding-right: 3.5rem;
}

.toggle-pwd {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.toggle-pwd:hover {
  color: #c4b5fd;
  border-color: transparent;
}

.error {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #fca5a5;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
}

.checkbox input {
  width: 1rem;
  height: 1rem;
  accent-color: #7c3aed;
}

.link {
  font-size: 0.8125rem;
  color: #a78bfa;
  text-decoration: none;
}

.link:hover {
  color: #c4b5fd;
}

.submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.25rem;
  padding: 0.85rem 1rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #7c3aed 0%, #be185d 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition:
    opacity 0.2s,
    transform 0.15s;
}

.submit:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
  border-color: transparent;
}

.submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.footer-hint {
  margin: 1.5rem 0 0;
  text-align: center;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.5);
}
</style>
