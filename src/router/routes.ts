import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    redirect: '/threeDModelView',
    children: [
      {
        path: 'mapView',
        name: 'MapView',
        component: () => import('../views/mapView/MapView.vue'),
        meta: { title: '地图可视化' },
      },
      {
        path: 'threeDModelView',
        name: 'ThreeDModelView',
        component: () => import('../views/threeDModelView/ThreeDModelView.vue'),
        meta: { title: '3D模型可视化' },
      }
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/error/NotFoundView.vue'),
    meta: { public: true, title: '页面不存在' },
  },
]
