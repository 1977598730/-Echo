<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <el-button type="primary" @click="router.push('/dashboard')">
      返回工作台
    </el-button>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #f9fafb;
}

h1 {
  margin: 0;
  font-size: 64px;
  color: #111827;
}

p {
  margin: 0 0 8px;
  color: #6b7280;
}
</style>
