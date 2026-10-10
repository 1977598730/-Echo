<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Expand, Fold, SwitchButton } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useAppStore } from '../../stores/app'
import { useUserStore } from '../../stores/user'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const pageTitle = computed(() => (route.meta.title as string) ?? '后台管理')

const displayName = computed(
  () => userStore.userInfo?.nickname ?? userStore.userInfo?.username ?? '用户',
)

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定退出登录吗？', '提示', {
      type: 'warning',
      confirmButtonText: '退出',
      cancelButtonText: '取消',
    })
    userStore.logout()
    router.push('/login')
  } catch {
    /* 用户取消 */
  }
}
</script>

<template>
  <header class="app-header">
    <div class="left">
      <el-button
        text
        class="collapse-btn"
        @click="appStore.toggleSidebar()"
      >
        <el-icon :size="18">
          <Fold v-if="!appStore.sidebarCollapsed" />
          <Expand v-else />
        </el-icon>
      </el-button>
      <h1 class="title">{{ pageTitle }}</h1>
    </div>

    <div class="right">
      <el-dropdown trigger="click">
        <span class="user-trigger">
          <el-avatar :size="32">{{ displayName.slice(0, 1) }}</el-avatar>
          <span class="name">{{ displayName }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleLogout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped lang="less">
.app-header {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.collapse-btn {
  color: #374151;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #374151;
}

.name {
  font-size: 14px;
}
</style>
