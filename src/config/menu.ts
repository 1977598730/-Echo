import type { Component } from 'vue'
import { Box, MapLocation } from '@element-plus/icons-vue'

export interface AppMenuItem {
  path: string
  title: string
  icon: Component
}

/** 侧边栏菜单（path 需与 router/routes 中业务页一致） */
export const appMenuItems: AppMenuItem[] = [
  { path: '/mapView', title: '地图可视化', icon: MapLocation },
  { path: '/threeDModelView', title: '3D模型可视化', icon: Box },
]
