import type { Component } from 'vue'
import { Box, MapLocation, Odometer, User } from '@element-plus/icons-vue'

export interface AppMenuItem {
  path: string
  title: string
  icon: Component
}

/** 侧边栏菜单（path 需与 router/routes 中业务页一致） */
export const appMenuItems: AppMenuItem[] = [
  { path: '/dashboard', title: '工作台', icon: Odometer },
  { path: '/mapView', title: '地图可视化', icon: MapLocation },
  { path: '/threeDModelView', title: '3D模型可视化', icon: Box },
  { path: '/system/user', title: '用户管理', icon: User },
]
