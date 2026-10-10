<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appMenuItems } from '../../config/menu'
import { useAppStore } from '../../stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)

function onSelect(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="app-sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="logo">
      <span class="logo-mark">L</span>
      <span v-show="!appStore.sidebarCollapsed" class="logo-text">lys 后台</span>
    </div>

    <el-menu
      :default-active="activeMenu"
      :collapse="appStore.sidebarCollapsed"
      background-color="#1f2937"
      text-color="#d1d5db"
      active-text-color="#ffffff"
      class="sidebar-menu"
      @select="onSelect"
    >
      <el-menu-item
        v-for="item in appMenuItems"
        :key="item.path"
        :index="item.path"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<style scoped lang="less">
@sidebar-width: 220px;
@sidebar-collapsed: 64px;

.app-sidebar {
  width: @sidebar-width;
  flex-shrink: 0;
  background: #1f2937;
  transition: width 0.2s ease;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.06);

  &.collapsed {
    width: @sidebar-collapsed;
  }
}

.logo {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  color: #f9fafb;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.logo-mark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #7c3aed, #db2777);
  display: grid;
  place-items: center;
  font-size: 14px;
  flex-shrink: 0;
}

.logo-text {
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-menu {
  border-right: none;
  flex: 1;
}
</style>
